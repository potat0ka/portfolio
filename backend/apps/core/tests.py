from __future__ import annotations

import json
import shutil
import tempfile
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from .models import CVAsset, ProfileAsset, Testimonial


User = get_user_model()
PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc`\x00\x00"
    b"\x00\x02\x00\x01\xe2!\xbc3\x00\x00\x00\x00IEND\xaeB`\x82"
)


class PublicEndpointsTests(TestCase):
    def test_ping(self):
        resp = self.client.get("/__ping")
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(resp["Cache-Control"], "no-store")

    def test_robots(self):
        resp = self.client.get("/robots.txt")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("text/plain", resp["Content-Type"])
        self.assertIn("User-agent:", resp.content.decode("utf-8"))

    def test_sitemap(self):
        resp = self.client.get("/sitemap.xml")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("application/xml", resp["Content-Type"])
        body = resp.content.decode("utf-8")
        self.assertIn("<urlset", body)
        self.assertIn("/about/", body)

    def test_cv_api_returns_null_when_missing(self):
        resp = self.client.get("/api/cv/")
        self.assertEqual(resp.status_code, 200)
        payload = resp.json()
        self.assertIn("cv_pdf", payload)
        self.assertIsNone(payload["cv_pdf"])

    def test_health_endpoint_reports_database_status(self):
        resp = self.client.get("/api/health/")
        self.assertEqual(resp.status_code, 200)
        payload = resp.json()
        self.assertEqual(payload["status"], "ready")
        self.assertTrue(payload["db_alive"])

    def test_only_approved_testimonials_are_public(self):
        approved = Testimonial.objects.create(
            author_name="Approved User",
            author_email="approved@example.com",
            message="Approved testimonial for public display.",
            status=Testimonial.Status.APPROVED,
        )
        Testimonial.objects.create(
            author_name="Pending User",
            author_email="pending@example.com",
            message="Pending testimonial should stay hidden.",
            status=Testimonial.Status.PENDING,
        )
        Testimonial.objects.create(
            author_name="Rejected User",
            author_email="rejected@example.com",
            message="Rejected testimonial must never be shown.",
            status=Testimonial.Status.REJECTED,
        )

        resp = self.client.get("/api/testimonials/")

        self.assertEqual(resp.status_code, 200)
        payload = resp.json()
        self.assertEqual(len(payload), 1)
        self.assertEqual(payload[0]["author_name"], approved.author_name)
        self.assertNotIn("status", payload[0])

    def test_testimonial_submission_defaults_to_pending(self):
        resp = self.client.post(
            "/api/testimonials/",
            data=json.dumps(
                {
                    "author_name": "New Visitor",
                    "author_email": "visitor@example.com",
                    "message": "This is a valid testimonial message from a visitor.",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(resp.status_code, 201)
        body = resp.json()
        self.assertIn("message", body)
        created = Testimonial.objects.get(author_email="visitor@example.com")
        self.assertEqual(created.status, Testimonial.Status.PENDING)
        self.assertFalse(created.is_public)


class AssetLifecycleTests(TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.override = override_settings(MEDIA_ROOT=self.temp_dir)
        self.override.enable()

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_replacing_profile_and_cv_files_removes_old_storage_objects(self):
        profile = ProfileAsset.objects.create(
            profile_photo=SimpleUploadedFile("profile-old.png", PNG_BYTES, content_type="image/png"),
            hero_image=SimpleUploadedFile("hero-old.png", PNG_BYTES, content_type="image/png"),
        )
        cv = CVAsset.objects.create(cv_pdf=SimpleUploadedFile("resume-old.pdf", b"%PDF-1.4 old"))

        old_profile = Path(profile.profile_photo.path)
        old_hero = Path(profile.hero_image.path)
        old_cv = Path(cv.cv_pdf.path)

        profile.profile_photo = SimpleUploadedFile("profile-new.png", PNG_BYTES, content_type="image/png")
        profile.hero_image = SimpleUploadedFile("hero-new.png", PNG_BYTES, content_type="image/png")
        profile.save()
        cv.cv_pdf = SimpleUploadedFile("resume-new.pdf", b"%PDF-1.4 new")
        cv.save()

        profile.refresh_from_db()
        cv.refresh_from_db()

        self.assertFalse(old_profile.exists())
        self.assertFalse(old_hero.exists())
        self.assertFalse(old_cv.exists())
        self.assertTrue(Path(profile.profile_photo.path).exists())
        self.assertTrue(Path(profile.hero_image.path).exists())
        self.assertTrue(Path(cv.cv_pdf.path).exists())

    def test_deleting_assets_removes_bound_files(self):
        profile = ProfileAsset.objects.create(
            profile_photo=SimpleUploadedFile("profile-delete.png", PNG_BYTES, content_type="image/png"),
            hero_image=SimpleUploadedFile("hero-delete.png", PNG_BYTES, content_type="image/png"),
        )
        cv = CVAsset.objects.create(cv_pdf=SimpleUploadedFile("resume-delete.pdf", b"%PDF-1.4 delete"))

        profile_path = Path(profile.profile_photo.path)
        hero_path = Path(profile.hero_image.path)
        cv_path = Path(cv.cv_pdf.path)

        profile.delete()
        cv.delete()

        self.assertFalse(profile_path.exists())
        self.assertFalse(hero_path.exists())
        self.assertFalse(cv_path.exists())

    def test_creating_new_singleton_asset_rows_removes_older_duplicates_and_files(self):
        older_profile = ProfileAsset.objects.create(
            profile_photo=SimpleUploadedFile("profile-older.png", PNG_BYTES, content_type="image/png"),
            hero_image=SimpleUploadedFile("hero-older.png", PNG_BYTES, content_type="image/png"),
        )
        older_cv = CVAsset.objects.create(cv_pdf=SimpleUploadedFile("resume-older.pdf", b"%PDF-1.4 older"))

        older_profile_path = Path(older_profile.profile_photo.path)
        older_hero_path = Path(older_profile.hero_image.path)
        older_cv_path = Path(older_cv.cv_pdf.path)

        newest_profile = ProfileAsset.objects.create(
            profile_photo=SimpleUploadedFile("profile-latest.png", PNG_BYTES, content_type="image/png"),
            hero_image=SimpleUploadedFile("hero-latest.png", PNG_BYTES, content_type="image/png"),
        )
        newest_cv = CVAsset.objects.create(cv_pdf=SimpleUploadedFile("resume-latest.pdf", b"%PDF-1.4 latest"))

        self.assertEqual(ProfileAsset.objects.count(), 1)
        self.assertEqual(CVAsset.objects.count(), 1)
        self.assertEqual(ProfileAsset.objects.get().pk, newest_profile.pk)
        self.assertEqual(CVAsset.objects.get().pk, newest_cv.pk)
        self.assertFalse(older_profile_path.exists())
        self.assertFalse(older_hero_path.exists())
        self.assertFalse(older_cv_path.exists())


class TestimonialModerationModelTests(TestCase):
    def test_status_helpers_track_public_visibility_and_reviewer(self):
        reviewer = User.objects.create_user(username="moderator", password="StrongPass123!")
        testimonial = Testimonial.objects.create(
            author_name="Visitor",
            author_email="visitor@example.com",
            message="A testimonial that is waiting for moderation.",
        )

        testimonial.approve(reviewer=reviewer)
        testimonial.refresh_from_db()
        self.assertEqual(testimonial.status, Testimonial.Status.APPROVED)
        self.assertTrue(testimonial.is_public)
        self.assertEqual(testimonial.reviewed_by, reviewer)
        self.assertIsNotNone(testimonial.reviewed_at)

        testimonial.mark_pending()
        testimonial.refresh_from_db()
        self.assertEqual(testimonial.status, Testimonial.Status.PENDING)
        self.assertFalse(testimonial.is_public)
        self.assertIsNone(testimonial.reviewed_by)

        testimonial.reject(reviewer=reviewer)
        testimonial.refresh_from_db()
        self.assertEqual(testimonial.status, Testimonial.Status.REJECTED)
        self.assertFalse(testimonial.is_public)
        self.assertEqual(testimonial.reviewed_by, reviewer)

from __future__ import annotations

from django.conf import settings
from django.core.validators import FileExtensionValidator, MaxLengthValidator
from django.db import models
from django.utils import timezone

from .storage import certificates_storage, cv_files_storage, profile_assets_storage
from .validators import (
    IMAGE_EXTENSIONS,
    PDF_EXTENSIONS,
    validate_image_upload_size,
    validate_pdf_upload_size,
)


def _delete_other_singletons(model: type[models.Model], current_pk: int | None) -> None:
    if current_pk is None:
        return
    duplicates = list(model.objects.exclude(pk=current_pk))
    for duplicate in duplicates:
        duplicate.delete()


class SiteSettings(models.Model):
    full_name = models.CharField(max_length=255, default="Bigendra Shrestha")
    title = models.CharField(max_length=255, default="Python & AI Trainee | Data Science Intern Aspirant")
    bio = models.TextField(default="I am an enthusiastic beginner in Python and AI with recent certifications in Python 3.X and Generative AI. I enjoy building data science workflows, preprocessing pipelines, and backend applications using clean code practices.\n\nI am seeking a trainee or internship position where I can apply programming, data analysis, and model-building skills while continuing to learn and contribute with dedication.")
    location = models.CharField(max_length=255, default="Kathmandu, Nepal")
    phone = models.CharField(max_length=50, default="+977 9860297032")
    whatsapp = models.CharField(max_length=50, default="+977 9860297032")
    viber = models.CharField(max_length=50, default="+977 9860297032")
    email = models.EmailField(default="Bige.stha@gmail.com")
    github = models.URLField(default="https://github.com/potat0ka")
    linkedin = models.URLField(default="https://www.linkedin.com/in/bigendrashrestha/")
    
    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return "Global Site Settings"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        _delete_other_singletons(SiteSettings, self.pk)


class ProfileAsset(models.Model):
    profile_photo = models.ImageField(
        storage=profile_assets_storage,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(IMAGE_EXTENSIONS), validate_image_upload_size],
        help_text="Upload your main profile photo (jpg, jpeg, png, webp).",
    )
    hero_image = models.ImageField(
        storage=profile_assets_storage,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(IMAGE_EXTENSIONS), validate_image_upload_size],
        help_text="Upload your hero/banner image (jpg, jpeg, png, webp).",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profile & Hero Asset"
        verbose_name_plural = "Profile & Hero Assets"

    def __str__(self):
        return "Profile & Hero Asset"

    def save(self, *args, **kwargs):
        if self.pk:
            prior = ProfileAsset.objects.filter(pk=self.pk).first()
            if prior:
                if prior.profile_photo and (not self.profile_photo or self.profile_photo.name != prior.profile_photo.name):
                    prior.profile_photo.delete(save=False)
                if prior.hero_image and (not self.hero_image or self.hero_image.name != prior.hero_image.name):
                    prior.hero_image.delete(save=False)
        super().save(*args, **kwargs)
        _delete_other_singletons(ProfileAsset, self.pk)

    def delete(self, *args, **kwargs):
        if self.profile_photo:
            self.profile_photo.delete(save=False)
        if self.hero_image:
            self.hero_image.delete(save=False)
        super().delete(*args, **kwargs)


class CVAsset(models.Model):
    cv_pdf = models.FileField(
        storage=cv_files_storage,
        validators=[FileExtensionValidator(PDF_EXTENSIONS), validate_pdf_upload_size],
        blank=True,
        null=True,
        help_text="Upload your latest CV/Resume (PDF only).",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "CV Asset"
        verbose_name_plural = "CV Assets"

    def __str__(self):
        return "CV Document"

    def save(self, *args, **kwargs):
        if self.pk:
            prior = CVAsset.objects.filter(pk=self.pk).first()
            if prior:
                if prior.cv_pdf and (not self.cv_pdf or self.cv_pdf.name != prior.cv_pdf.name):
                    prior.cv_pdf.delete(save=False)
        super().save(*args, **kwargs)
        _delete_other_singletons(CVAsset, self.pk)

    def delete(self, *args, **kwargs):
        if self.cv_pdf:
            self.cv_pdf.delete(save=False)
        super().delete(*args, **kwargs)


class Certification(models.Model):
    title = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255)
    issue_date = models.CharField(max_length=100, help_text="e.g. Nov 2025")
    description = models.TextField()
    thumbnail_image = models.ImageField(
        storage=certificates_storage,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(IMAGE_EXTENSIONS), validate_image_upload_size],
        help_text="Optional preview image (jpg, jpeg, png, webp).",
    )
    certificate_pdf = models.FileField(
        storage=certificates_storage,
        validators=[FileExtensionValidator(PDF_EXTENSIONS), validate_pdf_upload_size],
        help_text="Upload certificate PDF.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.pk:
            prior = Certification.objects.filter(pk=self.pk).first()
            if prior:
                if prior.thumbnail_image and (not self.thumbnail_image or self.thumbnail_image.name != prior.thumbnail_image.name):
                    prior.thumbnail_image.delete(save=False)
                if prior.certificate_pdf and (not self.certificate_pdf or self.certificate_pdf.name != prior.certificate_pdf.name):
                    prior.certificate_pdf.delete(save=False)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.thumbnail_image:
            self.thumbnail_image.delete(save=False)
        if self.certificate_pdf:
            self.certificate_pdf.delete(save=False)
        super().delete(*args, **kwargs)


class Skill(models.Model):
    name = models.CharField(max_length=100, help_text="Skill name e.g. Python, Django, React")
    category = models.CharField(
        max_length=100,
        default="General",
        help_text="Category e.g. Languages, Frameworks, Tools",
    )
    class Proficiency(models.TextChoices):
        BEGINNER = "Familiar / Beginner", "Familiar / Beginner"
        PROFICIENT = "Proficient / Competent", "Proficient / Competent"
        EXPERT = "Expert / Advanced", "Expert / Advanced"

    level = models.CharField(
        max_length=50,
        choices=Proficiency.choices,
        default=Proficiency.BEGINNER,
        help_text="Proficiency level",
    )
    icon_slug = models.CharField(
        max_length=100,
        blank=True,
        help_text="devicon slug e.g. python, django, react (optional)",
    )
    order = models.PositiveSmallIntegerField(default=0, help_text="Sort order (lower = first)")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Skill"
        verbose_name_plural = "Skills"
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.name} ({self.category})"


class ProjectMatch(models.Model):
    class Outcome(models.TextChoices):
        VICTORY = "VICTORY", "Victory"
        DEFEAT = "DEFEAT", "Defeat"

    match_id = models.CharField(max_length=80, unique=True)
    title = models.CharField(max_length=255)
    hero_played = models.CharField(max_length=255, help_text="Tech stack or hero used for the watch entry")
    duration = models.CharField(max_length=100)
    outcome = models.CharField(max_length=16, choices=Outcome.choices, default=Outcome.VICTORY)
    gpm = models.PositiveIntegerField(default=0)
    role = models.CharField(max_length=100)
    tech_keywords = models.JSONField(default=list, blank=True)
    description = models.TextField()
    impact_metrics = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Project Watch"
        verbose_name_plural = "Project Watches"
        ordering = ["-updated_at", "title"]

    def __str__(self):
        return f"{self.match_id} — {self.title}"


class WorkPatch(models.Model):
    version = models.CharField(max_length=50, unique=True)
    date = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    changes = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Patch Note"
        verbose_name_plural = "Patch Notes"
        ordering = ["-created_at", "version"]

    def __str__(self):
        return f"{self.version} — {self.title}"


class Testimonial(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    class Relationship(models.TextChoices):
        MANAGER = "manager", "Current / Ex Bosses & Managers"
        CLIENT = "client", "Clients & Customers"
        COLLEGE = "college", "College & University Friends"
        COWORKER = "coworker", "Colleagues & Coworkers"
        FREELANCE = "freelance", "Freelance & Casual Projects"

    author_name = models.CharField(max_length=255)
    author_email = models.EmailField(blank=True, null=True)
    message = models.TextField(validators=[MaxLengthValidator(2000)])
    relationship = models.CharField(max_length=20, choices=Relationship.choices, default=Relationship.COWORKER)
    is_public = models.BooleanField(default=False)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING, db_index=True)
    admin_notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_testimonials",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author_name}: {self.message[:60]}"

    def _apply_visibility_from_status(self) -> None:
        self.is_public = self.status == self.Status.APPROVED

    def approve(self, *, reviewer=None, notes: str | None = None, save: bool = True) -> None:
        self.status = self.Status.APPROVED
        self.is_public = True
        self.reviewed_at = timezone.now()
        self.reviewed_by = reviewer
        if notes is not None:
            self.admin_notes = notes
        if save:
            self.save(update_fields=["status", "is_public", "reviewed_at", "reviewed_by", "admin_notes"])

    def reject(self, *, reviewer=None, notes: str | None = None, save: bool = True) -> None:
        self.status = self.Status.REJECTED
        self.is_public = False
        self.reviewed_at = timezone.now()
        self.reviewed_by = reviewer
        if notes is not None:
            self.admin_notes = notes
        if save:
            self.save(update_fields=["status", "is_public", "reviewed_at", "reviewed_by", "admin_notes"])

    def mark_pending(self, *, save: bool = True) -> None:
        self.status = self.Status.PENDING
        self.is_public = False
        self.reviewed_at = None
        self.reviewed_by = None
        if save:
            self.save(update_fields=["status", "is_public", "reviewed_at", "reviewed_by"])

    def save(self, *args, **kwargs):
        if self.status == self.Status.APPROVED and not self.reviewed_at:
            self.reviewed_at = timezone.now()
        if self.status == self.Status.PENDING:
            self.reviewed_at = None
            self.reviewed_by = None
        self._apply_visibility_from_status()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Testimonial"
        verbose_name_plural = "Testimonials"

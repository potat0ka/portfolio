from __future__ import annotations

from rest_framework import serializers

from .models import SiteSettings, ProfileAsset, CVAsset, Certification, Skill, Testimonial, ProjectMatch, WorkPatch


def build_file_url(file_field, request, obj=None) -> str | None:
    if not file_field:
        return None
    url = file_field.url
    if request and url.startswith("/"):
        url = request.build_absolute_uri(url)
    
    if obj and hasattr(obj, "updated_at") and obj.updated_at:
        timestamp = int(obj.updated_at.timestamp())
        separator = "&" if "?" in url else "?"
        url = f"{url}{separator}v={timestamp}"
        
    return url


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "id",
            "full_name",
            "title",
            "bio",
            "location",
            "phone",
            "whatsapp",
            "viber",
            "email",
            "github",
            "linkedin",
        ]


class ProfileAssetSerializer(serializers.ModelSerializer):
    profile_photo = serializers.SerializerMethodField()
    hero_image = serializers.SerializerMethodField()

    class Meta:
        model = ProfileAsset
        fields = ["id", "profile_photo", "hero_image", "updated_at"]

    def get_profile_photo(self, obj: ProfileAsset) -> str | None:
        return build_file_url(obj.profile_photo, self.context.get("request"), obj)

    def get_hero_image(self, obj: ProfileAsset) -> str | None:
        return build_file_url(obj.hero_image, self.context.get("request"), obj)


class CVAssetSerializer(serializers.ModelSerializer):
    cv_pdf = serializers.SerializerMethodField()

    class Meta:
        model = CVAsset
        fields = ["id", "cv_pdf", "updated_at"]

    def get_cv_pdf(self, obj: CVAsset) -> str | None:
        return build_file_url(obj.cv_pdf, self.context.get("request"), obj)


class CertificationSerializer(serializers.ModelSerializer):
    thumbnail_image = serializers.SerializerMethodField()
    certificate_pdf = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = [
            "id",
            "title",
            "issuer",
            "issue_date",
            "description",
            "thumbnail_image",
            "certificate_pdf",
            "updated_at",
        ]

    def get_thumbnail_image(self, obj: Certification) -> str | None:
        return build_file_url(obj.thumbnail_image, self.context.get("request"), obj)

    def get_certificate_pdf(self, obj: Certification) -> str | None:
        return build_file_url(obj.certificate_pdf, self.context.get("request"), obj)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category", "level", "icon_slug", "order", "updated_at"]


class ProjectMatchSerializer(serializers.ModelSerializer):
    matchId = serializers.CharField(source="match_id")
    heroPlayed = serializers.CharField(source="hero_played")
    techKeywords = serializers.ListField(source="tech_keywords")
    impactMetrics = serializers.ListField(source="impact_metrics")

    class Meta:
        model = ProjectMatch
        fields = [
            "id",
            "matchId",
            "title",
            "heroPlayed",
            "duration",
            "outcome",
            "gpm",
            "role",
            "techKeywords",
            "description",
            "impactMetrics",
            "updated_at",
        ]


class WorkPatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkPatch
        fields = ["id", "version", "date", "title", "category", "changes", "created_at", "updated_at"]


class TestimonialSerializer(serializers.ModelSerializer):
    relationship_title = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = ["id", "author_name", "author_email", "message", "relationship", "relationship_title", "created_at"]
        read_only_fields = fields

    def get_relationship_title(self, obj):
        mapping = {
            "manager": "STRATEGIC EXECUTION & ARCHITECTURE",
            "client": "DEPLOYMENT VELOCITY & RELIABILITY",
            "college": "ALGORITHMIC PRECISION & PROBLEM SOLVING",
            "coworker": "SYSTEM SYNERGY & TECHNICAL EXPERTISE",
            "freelance": "AGILE DEVELOPMENT & ADAPTABILITY",
        }
        return mapping.get(obj.relationship, "STRENGTH & SCHEMA")


class TestimonialCreateSerializer(serializers.ModelSerializer):
    website = serializers.CharField(required=False, write_only=True, allow_blank=True)

    class Meta:
        model = Testimonial
        fields = ["author_name", "author_email", "relationship", "message", "website"]

    def validate(self, attrs):
        if attrs.get("website"):
            raise serializers.ValidationError({"website": "Invalid request."})
        attrs.pop("website", None)
        return attrs

    def validate_author_name(self, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return normalized

    def validate_author_email(self, value: str | None) -> str:
        normalized = (value or "").strip()
        return normalized

    def validate_message(self, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters.")
        return normalized

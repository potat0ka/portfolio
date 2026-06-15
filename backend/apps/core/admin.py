from django.contrib import admin, messages
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html

from .models import SiteSettings, ProfileAsset, CVAsset, Certification, Skill, Testimonial, ProjectMatch, WorkPatch


class SingletonModelAdmin(admin.ModelAdmin):
    """Only one row allowed; changelist redirects straight to the edit form."""

    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

    def changelist_view(self, request, extra_context=None):
        if self.model.objects.exists():
            obj = self.model.objects.first()
            info = self.model._meta.app_label, self.model._meta.model_name
            return redirect(reverse(f"admin:{info[0]}_{info[1]}_change", args=[obj.pk]))
        return super().changelist_view(request, extra_context)


@admin.register(SiteSettings)
class SiteSettingsAdmin(SingletonModelAdmin):
    list_display = ("__str__", "full_name", "email")
    fieldsets = (
        ("Basic Info", {"fields": ("full_name", "title", "bio", "location")}),
        ("Contact & Social", {"fields": ("phone", "whatsapp", "viber", "email", "github", "linkedin")}),
    )


@admin.register(ProfileAsset)
class ProfileAssetAdmin(SingletonModelAdmin):
    list_display = ("__str__", "profile_preview", "hero_preview", "updated_at")
    readonly_fields = ("profile_preview", "hero_preview", "updated_at")
    fieldsets = (
        ("Profile Photo", {"fields": ("profile_photo", "profile_preview")}),
        ("Hero / Banner Image", {"fields": ("hero_image", "hero_preview")}),
        ("Metadata", {"fields": ("updated_at",)}),
    )

    @admin.display(description="Profile Preview")
    def profile_preview(self, obj):
        if not obj or not obj.profile_photo:
            return "No profile photo"
        return format_html(
            '<img src="{}" style="max-height:120px;border-radius:6px;border:1px solid #ccc;" />',
            obj.profile_photo.url,
        )

    @admin.display(description="Hero/Banner Preview")
    def hero_preview(self, obj):
        if not obj or not obj.hero_image:
            return "No hero image"
        return format_html(
            '<img src="{}" style="max-height:120px;border-radius:6px;border:1px solid #ccc;" />',
            obj.hero_image.url,
        )


@admin.register(CVAsset)
class CVAssetAdmin(SingletonModelAdmin):
    list_display = ("__str__", "cv_link", "updated_at")
    readonly_fields = ("cv_link", "updated_at")
    fieldsets = (
        ("CV Document", {"fields": ("cv_pdf", "cv_link")}),
        ("Metadata", {"fields": ("updated_at",)}),
    )

    @admin.display(description="Current CV")
    def cv_link(self, obj):
        if not obj or not obj.cv_pdf:
            return "No CV uploaded"
        return format_html(
            '<a href="{}" target="_blank" rel="noopener noreferrer">Open current CV</a>',
            obj.cv_pdf.url,
        )


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ("title", "issuer", "issue_date", "thumbnail_preview", "pdf_link", "updated_at")
    search_fields = ("title", "issuer", "description")
    list_filter = ("issuer", "updated_at")
    readonly_fields = ("thumbnail_preview", "pdf_link", "updated_at")
    save_on_top = True
    fieldsets = (
        ("Certificate Details", {"fields": ("title", "issuer", "issue_date", "description")}),
        ("Files", {"fields": ("thumbnail_image", "thumbnail_preview", "certificate_pdf", "pdf_link")}),
        ("Metadata", {"fields": ("updated_at",)}),
    )

    @admin.display(description="Thumbnail Preview")
    def thumbnail_preview(self, obj):
        if not obj or not obj.thumbnail_image:
            return "No thumbnail"
        return format_html(
            '<img src="{}" style="max-height:96px;border-radius:4px;border:1px solid #ccc;" />',
            obj.thumbnail_image.url,
        )

    @admin.display(description="Certificate PDF")
    def pdf_link(self, obj):
        if not obj or not obj.certificate_pdf:
            return "No PDF"
        return format_html(
            '<a href="{}" target="_blank" rel="noopener noreferrer">View PDF</a>',
            obj.certificate_pdf.url,
        )


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "level", "icon_slug", "order", "updated_at")
    list_editable = ("category", "level", "order")
    search_fields = ("name", "category", "icon_slug")
    list_filter = ("category",)
    ordering = ("order", "name")
    fieldsets = (
        ("Skill Details", {"fields": ("name", "category", "level", "order")}),
        ("Icon Setup", {"fields": ("icon_slug", "icon_slug_reference")}),
        ("Metadata", {"fields": ("updated_at",)}),
    )
    readonly_fields = ("icon_slug_reference", "updated_at")

    @admin.display(description="Supported icon slugs")
    def icon_slug_reference(self, obj):
        return format_html(
            """
            <div style="line-height:1.7">
                <div>Use a short icon slug that matches the skill. Supported examples:</div>
                <div style="margin-top:6px">
                    <code>python</code>, <code>django</code>, <code>react</code>, <code>javascript</code>,
                    <code>typescript</code>, <code>postgresql</code>, <code>database</code>,
                    <code>supabase</code>, <code>git</code>, <code>github</code>, <code>vercel</code>,
                    <code>api</code>, <code>ai</code>, <code>html</code>, <code>css</code>
                </div>
                <div style="margin-top:6px;color:#666">
                    The portfolio maps this slug to a matching platform icon and animates it when the skill is clicked.
                </div>
            </div>
            """
        )


@admin.register(ProjectMatch)
class ProjectMatchAdmin(admin.ModelAdmin):
    list_display = ("match_id", "title", "hero_played", "outcome", "gpm", "role", "updated_at")
    search_fields = ("match_id", "title", "hero_played", "role", "description")
    list_filter = ("outcome", "role")
    ordering = ("-updated_at", "match_id")
    fieldsets = (
        ("Watch Entry", {"fields": ("match_id", "title", "hero_played", "duration", "outcome", "gpm", "role", "tech_keywords", "description", "impact_metrics")} ),
        ("Metadata", {"fields": ("updated_at",)}),
    )
    readonly_fields = ("updated_at",)


@admin.register(WorkPatch)
class WorkPatchAdmin(admin.ModelAdmin):
    list_display = ("version", "title", "category", "date", "updated_at")
    search_fields = ("version", "title", "category")
    ordering = ("-created_at", "version")
    fieldsets = (
        ("Patch Note", {"fields": ("version", "title", "category", "date", "changes")} ),
        ("Metadata", {"fields": ("created_at", "updated_at")} ),
    )
    readonly_fields = ("created_at", "updated_at")


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = (
        "author_name",
        "author_email",
        "relationship",
        "status",
        "is_public",
        "created_at",
        "reviewed_at",
        "reviewed_by",
    )
    list_filter = ("status", "relationship", "is_public", "created_at", "reviewed_at")
    search_fields = ("author_name", "author_email", "message", "admin_notes")
    readonly_fields = ("created_at", "reviewed_at", "reviewed_by")
    actions = ("approve_selected", "reject_selected", "mark_pending")
    date_hierarchy = "created_at"
    fieldsets = (
        ("Submission", {"fields": ("author_name", "author_email", "relationship", "message")}),
        ("Moderation", {"fields": ("status", "admin_notes", "is_public", "reviewed_at", "reviewed_by")}),
        ("Metadata", {"fields": ("created_at",)}),
    )

    @admin.action(description="Approve selected testimonials")
    def approve_selected(self, request, queryset):
        updated = 0
        for testimonial in queryset:
            testimonial.approve(reviewer=request.user)
            updated += 1
        self.message_user(request, f"Approved {updated} testimonial(s).", level=messages.SUCCESS)

    @admin.action(description="Reject selected testimonials")
    def reject_selected(self, request, queryset):
        updated = 0
        for testimonial in queryset:
            testimonial.reject(reviewer=request.user)
            updated += 1
        self.message_user(request, f"Rejected {updated} testimonial(s).", level=messages.WARNING)

    @admin.action(description="Move selected testimonials back to pending")
    def mark_pending(self, request, queryset):
        updated = 0
        for testimonial in queryset:
            testimonial.mark_pending()
            updated += 1
        self.message_user(request, f"Moved {updated} testimonial(s) back to pending.", level=messages.INFO)

    def save_model(self, request, obj, form, change):
        from django.utils import timezone

        if obj.status == Testimonial.Status.APPROVED:
            obj.reviewed_by = request.user
            if not obj.reviewed_at:
                obj.reviewed_at = timezone.now()
        elif obj.status == Testimonial.Status.REJECTED:
            obj.reviewed_by = request.user
            if not obj.reviewed_at:
                obj.reviewed_at = timezone.now()
        else:
            obj.reviewed_by = None
            obj.reviewed_at = None
        super().save_model(request, obj, form, change)

    def has_module_permission(self, request):
        return request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return request.user.is_staff

    def has_add_permission(self, request):
        return request.user.is_staff

    def has_delete_permission(self, request, obj=None):
        return request.user.is_staff

    def has_change_permission(self, request, obj=None):
        return request.user.is_staff

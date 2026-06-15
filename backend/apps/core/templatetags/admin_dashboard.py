from django import template
from django.urls import reverse

from apps.core.models import CVAsset, Certification, ProfileAsset, Testimonial

register = template.Library()


@register.inclusion_tag("admin/dashboard_stats.html")
def render_dashboard_stats():
    total_testimonials = Testimonial.objects.count()
    pending_testimonials = Testimonial.objects.filter(status=Testimonial.Status.PENDING).count()
    approved_testimonials = Testimonial.objects.filter(status=Testimonial.Status.APPROVED).count()
    rejected_testimonials = Testimonial.objects.filter(status=Testimonial.Status.REJECTED).count()

    profile_asset = ProfileAsset.objects.first()
    profile_image_url = profile_asset.profile_photo.url if profile_asset and profile_asset.profile_photo else None

    cv_asset = CVAsset.objects.first()
    cv_url = cv_asset.cv_pdf.url if cv_asset and cv_asset.cv_pdf else None
    cv_updated_at = cv_asset.updated_at if cv_asset and cv_asset.cv_pdf else None

    certification_count = Certification.objects.count()
    pending_testimonials_url = reverse("admin:core_testimonial_changelist") + "?status__exact=pending"

    return {
        "total_testimonials": total_testimonials,
        "pending_testimonials": pending_testimonials,
        "approved_testimonials": approved_testimonials,
        "rejected_testimonials": rejected_testimonials,
        "profile_image_url": profile_image_url,
        "cv_url": cv_url,
        "cv_updated_at": cv_updated_at,
        "certification_count": certification_count,
        "pending_testimonials_url": pending_testimonials_url,
    }

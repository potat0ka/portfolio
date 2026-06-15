from django.urls import include, path

from apps.core import views as core_views
from apps.core.api import (
    SiteSettingsAPIView,
    ProfileAssetAPIView,
    CVAssetAPIView,
    CertificationListAPIView,
    SkillListAPIView,
    ProjectMatchListAPIView,
    WorkPatchListAPIView,
    TestimonialListCreateView,
    RunMigrationsAPIView,
)

urlpatterns = [
    path("auth/", include("apps.authentication.urls")),
    path("health/", core_views.health, name="api-health"),
    path("settings/", SiteSettingsAPIView.as_view(), name="settings"),
    path("profile/", ProfileAssetAPIView.as_view(), name="profile"),
    path("cv/", CVAssetAPIView.as_view(), name="cv"),
    path("certificates/", CertificationListAPIView.as_view(), name="certificates"),
    path("skills/", SkillListAPIView.as_view(), name="skills"),
    path("project-matches/", ProjectMatchListAPIView.as_view(), name="project-matches"),
    path("patches/", WorkPatchListAPIView.as_view(), name="patches"),
    path("testimonials/", TestimonialListCreateView.as_view(), name="testimonials"),
    path("run-migrations/", RunMigrationsAPIView.as_view(), name="run-migrations"),
]

from django.contrib import admin
from django.urls import include, path
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static

from apps.core import views as core_views


urlpatterns = [
    path("admin-panel/", admin.site.urls),
    path("admin/", lambda request: redirect("/admin-panel/", permanent=True)),
    path("__ping", core_views.ping, name="ping"),
    path("__healthz", core_views.healthz, name="healthz"),
    path("__readyz", core_views.readyz, name="readyz"),
    path("health/", core_views.health, name="health"),
    path("api/", include("api.urls")),
    # SPA routes (must be last so they don't swallow /api/*).
    path("", include("apps.frontend.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

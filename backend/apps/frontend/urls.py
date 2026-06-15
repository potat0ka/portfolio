from django.urls import path

from apps.core import views as core_views
from . import views


urlpatterns = [
    # Public SEO endpoints (keep paths identical).
    path("robots.txt", core_views.robots_txt, name="robots_txt"),
    path("sitemap.xml", core_views.sitemap_xml, name="sitemap_xml"),

    # SPA entry points (canonical URLs).
    path("", views.react_app, name="home"),
    path("about/", views.react_app, name="about"),
    path("projects/", views.react_app, name="projects"),
    path("stack/", views.react_app, name="stack"),
    path("patches/", views.react_app, name="patches"),
    path("certs/", views.react_app, name="certs"),
    path("django-source/", views.react_app, name="django_source"),
    path("contact/", views.react_app, name="contact"),
    path("resume/", views.react_app, name="resume"),
]

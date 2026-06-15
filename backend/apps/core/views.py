from __future__ import annotations

from datetime import date
from pathlib import Path

from django.http import FileResponse, Http404, HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import redirect
from django.db import connection
from django.db.utils import OperationalError


def ping(request: HttpRequest) -> HttpResponse:
    """
    Lightweight same-origin endpoint used for client-side latency measurement.
    """
    response = HttpResponse(status=204)
    response["Cache-Control"] = "no-store"
    return response


def healthz(request: HttpRequest) -> JsonResponse:
    return JsonResponse({"status": "ok"}, status=200)


def health(request: HttpRequest) -> JsonResponse:
    db_alive = False
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_alive = True
    except OperationalError:
        db_alive = False
    return JsonResponse({"status": "ready", "db_alive": db_alive})


def readyz(request: HttpRequest) -> JsonResponse:
    return health(request)


def robots_txt(request: HttpRequest) -> HttpResponse:
    site_url = request.build_absolute_uri("/").rstrip("/")
    body = "\n".join(
        [
            "User-agent: *",
            "Allow: /",
            "",
            f"Sitemap: {site_url}/sitemap.xml",
            "",
        ]
    )
    return HttpResponse(body, content_type="text/plain; charset=utf-8")


def sitemap_xml(request: HttpRequest) -> HttpResponse:
    site_url = request.build_absolute_uri("/").rstrip("/")
    today = date.today().isoformat()

    routes = [
        "/",
        "/about/",
        "/projects/",
        "/stack/",
        "/patches/",
        "/certs/",
        "/django-source/",
        "/contact/",
        "/resume/",
    ]

    items = "\n".join(
        "\n".join(
            [
                "  <url>",
                f"    <loc>{site_url}{path}</loc>",
                f"    <lastmod>{today}</lastmod>",
                "    <changefreq>monthly</changefreq>",
                "    <priority>0.7</priority>",
                "  </url>",
            ]
        )
        for path in routes
    )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{items}\n"
        "</urlset>\n"
    )
    return HttpResponse(xml, content_type="application/xml; charset=utf-8")

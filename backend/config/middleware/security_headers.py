from __future__ import annotations

from django.conf import settings
from django.http import HttpRequest, HttpResponse


class SecurityHeadersMiddleware:
    """
    Adds defense-in-depth headers (CSP, Permissions-Policy, etc.).
    Uses conservative defaults to avoid breaking the existing UI/UX.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        response = self.get_response(request)

        if "X-Content-Type-Options" not in response:
            response["X-Content-Type-Options"] = "nosniff"

        if "Referrer-Policy" not in response:
            response["Referrer-Policy"] = getattr(settings, "SECURE_REFERRER_POLICY", "same-origin")

        if "X-Frame-Options" not in response:
            response["X-Frame-Options"] = getattr(settings, "X_FRAME_OPTIONS", "DENY")

        if "Permissions-Policy" not in response:
            response["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        if "Content-Security-Policy" not in response:
            nonce = getattr(request, "csp_nonce", None)
            script_src = "'self'"
            if nonce:
                script_src = f"'self' 'nonce-{nonce}'"

            response["Content-Security-Policy"] = (
                "default-src 'self'; "
                f"script-src {script_src}; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com data:; "
                "img-src 'self' data: https:; "
                "connect-src 'self'; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "frame-ancestors 'none'; "
                "form-action 'self'"
            )

        return response


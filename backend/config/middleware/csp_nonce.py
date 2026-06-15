from __future__ import annotations

import base64
import secrets

from django.http import HttpRequest, HttpResponse


class CSPNonceMiddleware:
    """
    Generates a per-request CSP nonce for inline scripts (e.g. JSON-LD).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        nonce = base64.b64encode(secrets.token_bytes(16)).decode("ascii")
        request.csp_nonce = nonce  # type: ignore[attr-defined]
        return self.get_response(request)


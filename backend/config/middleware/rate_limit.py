from __future__ import annotations

import time
from dataclasses import dataclass

from django.conf import settings
from django.core.cache import caches
from django.http import HttpRequest, HttpResponse, JsonResponse


def _get_client_ip(request: HttpRequest) -> str:
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR") or "unknown"


@dataclass(frozen=True)
class _RateLimitConfig:
    window_seconds: int
    max_requests: int
    cache_alias: str = "default"


class RateLimitMiddleware:
    """
    Basic IP-based rate limiting for abuse-prone requests.

    This is intentionally conservative and fail-open to avoid breaking UX.
    For stronger protection, use a reverse proxy/WAF + Redis backed throttling.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.config = _RateLimitConfig(
            window_seconds=getattr(settings, "RATE_LIMIT_WINDOW_SECONDS", 60),
            max_requests=getattr(settings, "RATE_LIMIT_MAX_REQUESTS", 120),
            cache_alias=getattr(settings, "RATE_LIMIT_CACHE_ALIAS", "default"),
        )
        self.cache = caches[self.config.cache_alias]

    def __call__(self, request: HttpRequest) -> HttpResponse:
        if request.method not in ("POST", "PUT", "PATCH", "DELETE"):
            return self.get_response(request)

        path = request.path or ""
        if path.startswith("/admin/"):
            return self.get_response(request)

        client_ip = _get_client_ip(request)
        now = int(time.time())
        window = now // self.config.window_seconds
        key = f"rl:{client_ip}:{window}:{request.method}:{path}"

        try:
            current = int(self.cache.get(key, 0) or 0)
            if current >= self.config.max_requests:
                return JsonResponse({"detail": "Too many requests. Please try again later."}, status=429)
            self.cache.set(key, current + 1, timeout=self.config.window_seconds)
        except Exception:
            pass

        return self.get_response(request)


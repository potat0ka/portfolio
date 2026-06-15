from __future__ import annotations

from rest_framework.views import exception_handler


def drf_exception_handler(exc, context):
    """
    Central place to normalize DRF errors.

    Goal: predictable, frontend-friendly shapes without changing the UI/UX.
    """
    response = exception_handler(exc, context)
    if response is None:
        return response

    # Ensure we consistently return {"detail": "..."} for simple string errors.
    if isinstance(response.data, list):
        response.data = {"detail": response.data}

    return response


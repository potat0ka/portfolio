from __future__ import annotations

from django.conf import settings
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token
from django.utils.crypto import constant_time_compare
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer


User = get_user_model()


def _access_max_age_seconds() -> int:
    lifetime = settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"]
    return int(lifetime.total_seconds())


def _refresh_max_age_seconds() -> int:
    lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]
    return int(lifetime.total_seconds())


def _csrf_header_value(request) -> str | None:
    # Django's CsrfViewMiddleware uses X-CSRFToken.
    return request.headers.get("X-CSRFToken") or request.META.get("HTTP_X_CSRFTOKEN")


def _require_csrf_if_cookie_auth(request) -> None:
    """
    When JWT tokens are stored in cookies, requests become CSRF-relevant.
    Require a matching X-CSRFToken header (double-submit style).
    """
    csrf_cookie_name = getattr(settings, "CSRF_COOKIE_NAME", "csrftoken")
    csrf_cookie = request.COOKIES.get(csrf_cookie_name) or ""
    csrf_header = _csrf_header_value(request) or ""

    if not csrf_cookie or not csrf_header or not constant_time_compare(csrf_cookie, csrf_header):
        raise PermissionError("CSRF token missing or incorrect.")


def _set_jwt_cookies(response: Response, *, access: str, refresh: str) -> None:
    # Cookies are optional; API also returns the tokens in the response body.
    cookie_kwargs = {
        "httponly": True,
        "secure": getattr(settings, "JWT_COOKIE_SECURE", True),
        "samesite": getattr(settings, "JWT_COOKIE_SAMESITE", "Lax"),
        "path": "/",
    }
    response.set_cookie(
        getattr(settings, "JWT_COOKIE_NAME_ACCESS", "access_token"),
        access,
        max_age=_access_max_age_seconds(),
        **cookie_kwargs,
    )
    response.set_cookie(
        getattr(settings, "JWT_COOKIE_NAME_REFRESH", "refresh_token"),
        refresh,
        max_age=_refresh_max_age_seconds(),
        **cookie_kwargs,
    )


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not getattr(settings, "AUTH_ALLOW_PUBLIC_REGISTRATION", False):
            return Response({"detail": "Public registration is disabled."}, status=status.HTTP_403_FORBIDDEN)
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"user": {"id": user.id, "username": user.username, "email": user.email}}, status=201)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        use_cookies = bool(request.data.get("use_cookies"))

        if not username or not password:
            return Response({"detail": "username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        data = {"access": str(refresh.access_token), "refresh": str(refresh)}
        response = Response(data, status=200)
        if use_cookies:
            _set_jwt_cookies(response, access=data["access"], refresh=data["refresh"])
            # Provide CSRF cookie for subsequent cookie-authenticated requests.
            csrf_token = get_token(request)
            response.set_cookie(
                getattr(settings, "CSRF_COOKIE_NAME", "csrftoken"),
                csrf_token,
                httponly=False,
                secure=getattr(settings, "JWT_COOKIE_SECURE", True),
                samesite=getattr(settings, "JWT_COOKIE_SAMESITE", "Lax"),
                path="/",
            )
        return response


class RefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_from_body = request.data.get("refresh")
        refresh_from_cookie = request.COOKIES.get(getattr(settings, "JWT_COOKIE_NAME_REFRESH", "refresh_token"))
        refresh_token = refresh_from_body or refresh_from_cookie
        if not refresh_token:
            return Response({"detail": "refresh token is required"}, status=400)

        if not refresh_from_body and refresh_from_cookie:
            try:
                _require_csrf_if_cookie_auth(request)
            except PermissionError as exc:
                return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken(refresh_token)
        data = {"access": str(refresh.access_token)}
        response = Response(data, status=200)
        if request.data.get("use_cookies") or refresh_from_cookie:
            response.set_cookie(
                getattr(settings, "JWT_COOKIE_NAME_ACCESS", "access_token"),
                data["access"],
                httponly=True,
                secure=getattr(settings, "JWT_COOKIE_SECURE", True),
                samesite=getattr(settings, "JWT_COOKIE_SAMESITE", "Lax"),
                path="/",
                max_age=_access_max_age_seconds(),
            )
        return response


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # If a refresh token was provided, blacklist it (requires optional blacklist app).
        refresh_from_body = request.data.get("refresh")
        refresh_from_cookie = request.COOKIES.get(getattr(settings, "JWT_COOKIE_NAME_REFRESH", "refresh_token"))
        refresh_token = refresh_from_body or refresh_from_cookie
        if refresh_token:
            if not refresh_from_body and refresh_from_cookie:
                try:
                    _require_csrf_if_cookie_auth(request)
                except PermissionError as exc:
                    return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                # If blacklist is not installed, ignore.
                pass

        response = Response(status=204)
        response.delete_cookie(getattr(settings, "JWT_COOKIE_NAME_ACCESS", "access_token"), path="/")
        response.delete_cookie(getattr(settings, "JWT_COOKIE_NAME_REFRESH", "refresh_token"), path="/")
        response.delete_cookie(getattr(settings, "CSRF_COOKIE_NAME", "csrftoken"), path="/")
        return response

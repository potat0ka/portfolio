from __future__ import annotations

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url


BASE_DIR = Path(__file__).resolve().parent.parent  # .../backend
REPO_ROOT = BASE_DIR.parent  # .../ (contains src/, dist/, templates/, static/)


def _env_bool(name: str, default: bool) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "y", "on"}


def _env_list(name: str, default: list[str]) -> list[str]:
    raw = os.environ.get(name)
    if not raw:
        return default
    return [part.strip() for part in raw.split(",") if part.strip()]


# Default to DEBUG=true for local development unless explicitly disabled.
# On Vercel, set DEBUG=False in environment variables.
DEBUG = _env_bool("DEBUG", _env_bool("DJANGO_DEBUG", True))

_DEV_SECRET_KEY_FALLBACK = "django-insecure-change-me-in-prod"
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", _DEV_SECRET_KEY_FALLBACK)
if not DEBUG and SECRET_KEY == _DEV_SECRET_KEY_FALLBACK:
    raise RuntimeError("DJANGO_SECRET_KEY must be set when DEBUG=false")


ALLOWED_HOSTS = os.environ.get(
    'DJANGO_ALLOWED_HOSTS', 'localhost'
).split(',')

CSRF_TRUSTED_ORIGINS = [
    "https://www.bigendra.com.np",
    "https://bigendra.com.np",
    "https://potatoka.vercel.app",
]

SILENCED_SYSTEM_CHECKS = ['security.W008']

DATABASE_ROUTERS = []


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "storages",
    # Local apps
    "apps.core",
    "apps.frontend",
    "apps.authentication",
]


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "config.middleware.request_id.RequestIDMiddleware",
    "config.middleware.csp_nonce.CSPNonceMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.gzip.GZipMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "config.middleware.rate_limit.RateLimitMiddleware",
    "config.middleware.security_headers.SecurityHeadersMiddleware",
]


ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # Keep templates alongside the existing React build artifacts.
        "DIRS": [REPO_ROOT / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "config.context_processors.seo_defaults",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"


import dj_database_url
DATABASE_URL = os.environ.get('DATABASE_URL', '')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=0,
            ssl_require=True,
        )
    }
    DATABASES['default'].setdefault('OPTIONS', {})['options'] = '-c search_path=public'
    DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Katmandu"
USE_I18N = True
USE_TZ = True


STATIC_URL = "/static/"

# Reuse the existing static + Vite build outputs without touching the frontend.
STATICFILES_DIRS = [
    REPO_ROOT / "static",
    ("react", REPO_ROOT / "dist"),
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"
WHITENOISE_USE_FINDERS = True

MEDIA_URL = "/media/"
# Local MEDIA_ROOT is used only for DEBUG/test fallbacks when Supabase creds are absent.
MEDIA_ROOT = REPO_ROOT / "media"

LOGIN_URL = "/admin-panel/login/"
LOGIN_REDIRECT_URL = "/admin-panel/"


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

TEST_RUNNER = "config.test_runner.PortfolioDiscoverRunner"


# CORS (replace any existing CORS settings)
CORS_ALLOWED_ORIGINS = [
    "https://www.bigendra.com.np",
    "https://bigendra.com.np",
    "https://potatoka.vercel.app",
]
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
}

SIMPLE_JWT = {
    # Keep short-lived access tokens; refresh token rotation can be enabled later if needed.
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.environ.get("JWT_ACCESS_TOKEN_MINUTES", "5"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.environ.get("JWT_REFRESH_TOKEN_DAYS", "7"))),
    "ROTATE_REFRESH_TOKENS": _env_bool("JWT_ROTATE_REFRESH_TOKENS", False),
    "BLACKLIST_AFTER_ROTATION": True,
}


# Security hardening in production (keeps dev behavior unchanged).
if not DEBUG:
    # Vercel terminates TLS at the edge.
    SECURE_SSL_REDIRECT = False
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_SAMESITE = "Lax"

    SECURE_HSTS_SECONDS = int(os.environ.get("DJANGO_SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = _env_bool("DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS", True)
    SECURE_HSTS_PRELOAD = _env_bool("DJANGO_SECURE_HSTS_PRELOAD", True)

    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    SECURE_REFERRER_POLICY = "same-origin"

    SECURE_BROWSER_XSS_FILTER = True

    # Hardening defaults (should not affect SPA rendering).
    SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"


# Logging: JSON for production; readable console in dev.
LOG_LEVEL = os.environ.get("DJANGO_LOG_LEVEL", "INFO")
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "fmt": "%(asctime)s %(levelname)s %(name)s %(message)s %(request_id)s",
        },
        "console": {"format": "%(levelname)s %(name)s %(message)s"},
    },
    "filters": {
        "request_id": {"()": "config.logging_filters.RequestIDLogFilter"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "console" if DEBUG else "json",
            "filters": ["request_id"],
        }
    },
    "root": {"handlers": ["console"], "level": LOG_LEVEL},
}


# Rate limiting defaults (also used by config.middleware.rate_limit).
RATE_LIMIT_WINDOW_SECONDS = int(os.environ.get("RATE_LIMIT_WINDOW_SECONDS", "60"))
RATE_LIMIT_MAX_REQUESTS = int(os.environ.get("RATE_LIMIT_MAX_REQUESTS", "120"))
RATE_LIMIT_CACHE_ALIAS = os.environ.get("RATE_LIMIT_CACHE_ALIAS", "default")


# JWT cookie settings (optional; API can still return tokens in the response body).
JWT_COOKIE_NAME_ACCESS = os.environ.get("JWT_COOKIE_NAME_ACCESS", "access_token")
JWT_COOKIE_NAME_REFRESH = os.environ.get("JWT_COOKIE_NAME_REFRESH", "refresh_token")
JWT_COOKIE_SECURE = _env_bool("JWT_COOKIE_SECURE", not DEBUG)
JWT_COOKIE_SAMESITE = os.environ.get("JWT_COOKIE_SAMESITE", "Lax")
AUTH_ALLOW_PUBLIC_REGISTRATION = _env_bool("AUTH_ALLOW_PUBLIC_REGISTRATION", False)

# Supabase Storage (S3-compatible) — used for all CMS uploads on Vercel.
SUPABASE_STORAGE_CONFIGURED = bool(os.environ.get("AWS_ACCESS_KEY_ID"))

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

if SUPABASE_STORAGE_CONFIGURED:
    AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME", "profile-assets")
    AWS_S3_ENDPOINT_URL = os.environ.get("AWS_S3_ENDPOINT_URL")
    AWS_S3_REGION_NAME = os.environ.get("AWS_S3_REGION_NAME", "auto")
    # Supabase S3 does not support ACL headers — buckets must be public via dashboard policy.
    AWS_DEFAULT_ACL = None
    AWS_S3_FILE_OVERWRITE = False
    AWS_QUERYSTRING_AUTH = False
    AWS_S3_ADDRESSING_STYLE = "path"
    AWS_S3_SIGNATURE_VERSION = "s3v4"

    if AWS_S3_ENDPOINT_URL:
        # custom domains are handled dynamically in storage_backends.py
        pass

    STORAGES["default"] = {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
    }
else:
    STORAGES["default"] = {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
        "OPTIONS": {"location": MEDIA_ROOT},
    }
    if not DEBUG:
        import logging

        logging.getLogger(__name__).warning(
            "AWS_ACCESS_KEY_ID is not set. Django will boot, but admin file uploads "
            "will fail until Supabase Storage env vars are configured on Vercel."
        )

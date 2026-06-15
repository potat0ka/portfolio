from __future__ import annotations

import logging
import os

from django.conf import settings
from django.core.files.storage import FileSystemStorage, Storage

logger = logging.getLogger(__name__)


def _local_fallback_storage() -> Storage:
    """Ephemeral/local fallback used when Supabase creds are absent (e.g. Vercel build)."""
    return FileSystemStorage(location=str(settings.MEDIA_ROOT))


def _resolve_storage(storage_class: type[Storage]) -> Storage:
    if os.environ.get("AWS_ACCESS_KEY_ID"):
        return storage_class()

    if not settings.DEBUG:
        logger.warning(
            "Supabase Storage env vars are missing. Using local fallback storage; "
            "admin uploads will not persist on Vercel until AWS_ACCESS_KEY_ID is configured."
        )
    return _local_fallback_storage()


def profile_assets_storage() -> Storage:
    from config.storage_backends import ProfileAssetsStorage

    return _resolve_storage(ProfileAssetsStorage)


def cv_files_storage() -> Storage:
    from config.storage_backends import CVFilesStorage

    return _resolve_storage(CVFilesStorage)


def certificates_storage() -> Storage:
    from config.storage_backends import CertificatesStorage

    return _resolve_storage(CertificatesStorage)

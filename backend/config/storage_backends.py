from __future__ import annotations

import os

from storages.backends.s3boto3 import S3Boto3Storage


class _SupabaseS3Storage(S3Boto3Storage):
    """Shared Supabase S3 settings for all portfolio upload buckets."""

    default_acl = None
    file_overwrite = False
    querystring_auth = False
    addressing_style = "path"
    signature_version = "s3v4"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from django.conf import settings
        import urllib.parse
        
        if getattr(settings, "AWS_S3_ENDPOINT_URL", None):
            parsed = urllib.parse.urlparse(settings.AWS_S3_ENDPOINT_URL)
            self.custom_domain = f"{parsed.netloc}/storage/v1/object/public/{self.bucket_name}"


class ProfileAssetsStorage(_SupabaseS3Storage):
    bucket_name = os.environ.get("SUPABASE_BUCKET_PROFILE", "profile-assets")


class CVFilesStorage(_SupabaseS3Storage):
    bucket_name = os.environ.get("SUPABASE_BUCKET_CV", "cv-files")


class CertificatesStorage(_SupabaseS3Storage):
    bucket_name = os.environ.get("SUPABASE_BUCKET_CERTIFICATES", "certificates")

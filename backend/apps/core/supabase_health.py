from __future__ import annotations

import os
from typing import Any


def _bucket_names() -> list[str]:
    return [
        os.environ.get("SUPABASE_BUCKET_PROFILE", "profile-assets"),
        os.environ.get("SUPABASE_BUCKET_CV", "cv-files"),
        os.environ.get("SUPABASE_BUCKET_CERTIFICATES", "certificates"),
    ]


def check_supabase_storage() -> dict[str, Any]:
    """
    Verify Supabase S3 credentials and bucket reachability.
    Returns a dict suitable for JSON health endpoints.
    """
    access_key = os.environ.get("AWS_ACCESS_KEY_ID")
    secret_key = os.environ.get("AWS_SECRET_ACCESS_KEY")
    endpoint = os.environ.get("AWS_S3_ENDPOINT_URL")
    region = os.environ.get("AWS_S3_REGION_NAME", "auto")

    if not access_key or not secret_key:
        return {
            "configured": False,
            "ok": False,
            "error": "Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY",
            "buckets": {},
        }

    if not endpoint:
        return {
            "configured": True,
            "ok": False,
            "error": "Missing AWS_S3_ENDPOINT_URL",
            "buckets": {},
        }

    try:
        import boto3
        from botocore.config import Config
        from botocore.exceptions import ClientError
    except ImportError:
        return {
            "configured": True,
            "ok": False,
            "error": "boto3 is not installed",
            "buckets": {},
        }

    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region,
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )

    bucket_results: dict[str, str] = {}
    for bucket in _bucket_names():
        try:
            client.head_bucket(Bucket=bucket)
            bucket_results[bucket] = "ok"
        except ClientError as exc:
            code = exc.response.get("Error", {}).get("Code", "Unknown")
            bucket_results[bucket] = str(code)

    ok = all(status == "ok" for status in bucket_results.values())
    error = None if ok else "One or more Supabase buckets are unreachable"

    return {
        "configured": True,
        "ok": ok,
        "error": error,
        "endpoint": endpoint,
        "buckets": bucket_results,
    }

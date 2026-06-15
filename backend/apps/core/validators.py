from __future__ import annotations

from django.core.exceptions import ValidationError

IMAGE_EXTENSIONS = ("jpg", "jpeg", "png", "webp")
PDF_EXTENSIONS = ("pdf",)

MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_PDF_BYTES = 12 * 1024 * 1024


def validate_image_upload_size(upload) -> None:
    if upload and upload.size > MAX_IMAGE_BYTES:
        raise ValidationError("Image must be 8 MB or smaller.")


def validate_pdf_upload_size(upload) -> None:
    if upload and upload.size > MAX_PDF_BYTES:
        raise ValidationError("PDF must be 12 MB or smaller.")

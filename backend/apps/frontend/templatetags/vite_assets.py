from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from django import template
from django.conf import settings
from django.templatetags.static import static


register = template.Library()


def _manifest_path() -> Path:
    # settings.REPO_ROOT is defined in config.settings
    repo_root = getattr(settings, "REPO_ROOT", Path(settings.BASE_DIR).parent)
    return Path(repo_root) / "dist" / ".vite" / "manifest.json"


@lru_cache(maxsize=1)
def _load_manifest() -> dict[str, Any]:
    path = _manifest_path()
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def _get_manifest() -> dict[str, Any]:
    if settings.DEBUG:
        _load_manifest.cache_clear()
    return _load_manifest()


@register.simple_tag
def vite_js(entry: str = "index.html") -> str:
    manifest = _get_manifest()
    if entry in manifest and isinstance(manifest[entry], dict) and "file" in manifest[entry]:
        return static(f"react/{manifest[entry]['file']}")
    return static("react/assets/index-BXl7tE3X.js")


@register.simple_tag
def vite_css(entry: str = "index.html") -> str:
    manifest = _get_manifest()
    css_files = None
    if entry in manifest and isinstance(manifest[entry], dict):
        css_files = manifest[entry].get("css")
    if isinstance(css_files, list) and css_files:
        return static(f"react/{css_files[0]}")
    return static("react/assets/index-BsM0wKGM.css")


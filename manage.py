#!/usr/bin/env python
"""Root manage.py shim so Vercel detects Django and can run collectstatic/migrate."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.management import execute_from_command_line  # noqa: E402


def main() -> None:
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Vercel build helper — collectstatic always; migrate only when DATABASE_URL is set."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANAGE = ROOT / "backend" / "manage.py"


def _require_postgres_driver() -> None:
    try:
        import psycopg2  # noqa: F401
    except ImportError as exc:
        raise SystemExit(
            "PostgreSQL driver missing. Install psycopg2-binary before running "
            "Django on Vercel (see requirements.txt)."
        ) from exc


def run(*args: str, extra_env: dict[str, str] | None = None) -> None:
    cmd = [sys.executable, str(MANAGE), *args]
    print("+", " ".join(cmd), flush=True)
    env = os.environ.copy()
    if extra_env:
        env.update(extra_env)
    subprocess.check_call(cmd, cwd=ROOT, env=env)


def main() -> int:
    _require_postgres_driver()
    run("collectstatic", "--noinput")

    # Supabase: use session/direct URL for migrations when provided (pooler 6543 is runtime-only).
    direct_url = os.environ.get("DIRECT_DATABASE_URL", "").strip()
    database_url = os.environ.get("DATABASE_URL", "").strip()
    migrate_url = direct_url or database_url

    if migrate_url:
        if direct_url:
            print("INFO: Running migrations via DIRECT_DATABASE_URL.", flush=True)
        try:
            run("migrate", "--noinput", extra_env={"DATABASE_URL": migrate_url})
        except subprocess.CalledProcessError as e:
            print(f"WARN: Migration failed during build (this is common on Vercel due to IPv6 network blocks). You may need to run migrations locally. Error: {e}", flush=True)
    else:
        print("WARN: DATABASE_URL is not set — skipping migrate during build.", flush=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

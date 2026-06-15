#!/usr/bin/env bash
set -euo pipefail

export UV_LINK_MODE="${UV_LINK_MODE:-copy}"

echo "Installing Python dependencies for Django build..."
if command -v uv >/dev/null 2>&1; then
  uv pip install --system -r requirements.txt
else
  python3 -m pip install --disable-pip-version-check -r requirements.txt
fi

python3 scripts/vercel_build.py

"""Safely replace site/ with a Neocities ZIP export, retaining a backup."""
from __future__ import annotations

import shutil
import sys
import zipfile
from pathlib import Path


repo = Path(__file__).resolve().parents[1]
archive = Path(sys.argv[1]).resolve()
site = repo / "site"
staging = repo / ".neocities-import-staging"
backup = repo / "backups" / "public-bootstrap-before-full-import"

if not archive.is_file():
    raise SystemExit(f"Archive not found: {archive}")

with zipfile.ZipFile(archive) as zf:
    members = zf.infolist()
    for member in members:
        name = Path(member.filename)
        if name.is_absolute() or ".." in name.parts:
            raise SystemExit(f"Unsafe archive path: {member.filename}")
    if "index.html" not in {member.filename for member in members}:
        raise SystemExit("The archive does not contain index.html")
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir()
    zf.extractall(staging)

if backup.exists():
    shutil.rmtree(backup)
if site.exists():
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(site), str(backup))
shutil.move(str(staging), str(site))

files = [path for path in site.rglob("*") if path.is_file()]
size = sum(path.stat().st_size for path in files)
print(f"Imported {len(files)} files ({size} bytes) into {site}")
print(f"Previous public bootstrap retained at {backup}")

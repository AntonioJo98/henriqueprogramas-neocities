"""Download the publicly reachable portion of the portfolio site.

This is a bootstrap only. It cannot retrieve private or unlinked remote files;
use an authenticated Neocities export before treating a complex site as complete.
"""
from __future__ import annotations

import hashlib
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urldefrag, urljoin, urlparse
from urllib.request import Request, urlopen

BASE = "https://henriqueprogramas.neocities.org/"
OUT = Path(__file__).resolve().parents[1] / "site"
MAX_FILES = 500


class Links(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.urls: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if value and name.lower() in {"href", "src", "poster", "data"}:
                self.urls.append(value)


def local_path(url: str) -> Path:
    parsed = urlparse(url)
    path = unquote(parsed.path)
    if not path or path.endswith("/"):
        path += "index.html"
    candidate = (OUT / path.lstrip("/")).resolve()
    if OUT.resolve() not in candidate.parents and candidate != OUT.resolve():
        raise ValueError(f"Unsafe path: {url}")
    return candidate


def same_site(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in {"http", "https"} and parsed.netloc == "henriqueprogramas.neocities.org"


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    queue = [BASE]
    seen: set[str] = set()
    manifest: list[str] = []

    while queue and len(seen) < MAX_FILES:
        raw = queue.pop(0)
        url, _ = urldefrag(raw)
        if url in seen or not same_site(url):
            continue
        seen.add(url)
        try:
            request = Request(url, headers={"User-Agent": "Hermes Neocities backup bootstrap"})
            with urlopen(request, timeout=30) as response:
                data = response.read()
                content_type = response.headers.get_content_type()
        except Exception as exc:
            print(f"ERROR {url}: {exc}", file=sys.stderr)
            continue

        target = local_path(url)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        digest = hashlib.sha256(data).hexdigest()[:12]
        manifest.append(f"{url}\t{target.relative_to(OUT).as_posix()}\t{len(data)}\t{digest}")
        print(f"SAVED {target.relative_to(OUT)}")

        if content_type in {"text/html", "application/xhtml+xml"}:
            parser = Links()
            parser.feed(data.decode("utf-8", errors="replace"))
            for link in parser.urls:
                absolute, _ = urldefrag(urljoin(url, link))
                if same_site(absolute) and absolute not in seen:
                    queue.append(absolute)

    (OUT / ".public-mirror-manifest.tsv").write_text(
        "remote_url\tlocal_path\tbytes\tsha256_12\n" + "\n".join(manifest) + "\n",
        encoding="utf-8",
    )
    print(f"Downloaded {len(manifest)} public files to {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

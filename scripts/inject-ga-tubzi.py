#!/usr/bin/env python3
"""Inject Tubzi GA4 (G-MSRCFHRBDK) after <head> on HTML pages that lack it."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {"node_modules", ".git"}

SNIPPET = """<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MSRCFHRBDK"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-MSRCFHRBDK');
</script>
"""

HEAD_RE = re.compile(r"(<head[^>]*>)", re.IGNORECASE)


def should_skip(path: Path) -> bool:
    parts = path.parts
    return any(p in SKIP_DIRS for p in parts)


def main() -> int:
    changed = 0
    prepended_no_head = 0
    skipped_has_tag = 0
    for path in sorted(ROOT.rglob("*.html")):
        if should_skip(path):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        if "G-MSRCFHRBDK" in text:
            skipped_has_tag += 1
            continue
        m = HEAD_RE.search(text)
        if not m:
            # Broken / fragment exports (no <head>): prepend so gtag still loads.
            new_text = SNIPPET + text
            prepended_no_head += 1
        else:
            new_text = HEAD_RE.sub(r"\1\n" + SNIPPET, text, count=1)
        path.write_text(new_text, encoding="utf-8")
        changed += 1
    print(
        f"Injected: {changed}, already had tag: {skipped_has_tag}, "
        f"prepended (no <head>): {prepended_no_head}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

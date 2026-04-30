#!/usr/bin/env python3
"""Remove embedded ad / popup-inject snippets from games/*.html (batch)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GAMES = ROOT / "games"

GTAG_UNITY_INJECT_RE = re.compile(
    r"<script async src=\"https://www\.googletagmanager\.com/gtag/js\?id=G-L7856P3VNT\"></script>\s*"
    r"<script>[\s\S]*?gtag\(\s*['\"]config['\"]\s*,\s*['\"]G-L7856P3VNT['\"]\s*\);\s*</script>\s*",
)

SIDEBAR_CSS_RE = re.compile(
    r"#sidebarad1,[\s\S]*?\.sidebar-frame\s*\{[\s\S]*?\}\s*",
)

SIDEBAR_DIVS_RE = re.compile(
    r"<div id=\"sidebarad1\">[\s\S]*?</div>\s*<div id=\"sidebarad2\">[\s\S]*?</div>\s*",
)

OBFUSCATED_INJECT_RE = re.compile(
    r"<script>\(function\(ykJYJgqRQvLQ[\s\S]*?</script>\s*",
)

SCRIPT_WITH_SRC_RE = re.compile(
    r"<script\b[^>]*\bsrc=[\"']([^\"']+)[\"'][^>]*>\s*</script>\s*",
    re.IGNORECASE,
)

AD_SRC_MARKERS = (
    "googlesyndication.com",
    "pagead2.googlesyndication",
    "doubleclick.net",
    "googleadservices.com",
    "fundingchoicesmessages",
    "adservice.google",
)


def strip_ad_network_scripts(content: str) -> str:
    def repl(m: re.Match[str]) -> str:
        src = m.group(1).lower()
        if any(x in src for x in AD_SRC_MARKERS):
            return ""
        return m.group(0)

    return SCRIPT_WITH_SRC_RE.sub(repl, content)


def strip_trailing_after_html(content: str) -> str:
    if "</html>" not in content:
        return content
    idx = content.rfind("</html>")
    suffix = content[idx + len("</html>") :]
    if not suffix.strip():
        return content
    return content[: idx + len("</html>")] + "\n"


def clean_html(content: str) -> str:
    out = content
    out = GTAG_UNITY_INJECT_RE.sub("", out, count=1)
    out = SIDEBAR_CSS_RE.sub("", out, count=1)
    out = SIDEBAR_DIVS_RE.sub("", out, count=1)
    while True:
        nxt = OBFUSCATED_INJECT_RE.sub("", out, count=1)
        if nxt == out:
            break
        out = nxt
    out = strip_ad_network_scripts(out)
    out = strip_trailing_after_html(out)
    return out


def main() -> None:
    modified = 0
    for path in sorted(GAMES.glob("*.html")):
        raw = path.read_text(encoding="utf-8", errors="replace")
        new = clean_html(raw)
        if new != raw:
            path.write_text(new, encoding="utf-8")
            modified += 1
            print(path.relative_to(ROOT))
    print(f"done: modified {modified} file(s)")


if __name__ == "__main__":
    main()

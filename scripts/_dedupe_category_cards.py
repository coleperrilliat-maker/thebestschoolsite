import re
from pathlib import Path

REPO = Path(r"C:\Users\colep\OneDrive\The tubzi SITE")
CATS = REPO / "categories"
FILES = ["action.html", "puzzle.html", "sports.html", "casual.html", "io.html", "racing.html"]


def dedupe_cards(html: str) -> str:
    m = re.search(r'(<div class="hub-grid" id="hubCategoryGrid">\s*)([\s\S]*?)(\s*</div>)', html)
    if not m:
        return html
    block = m.group(2)
    lines = [ln for ln in block.splitlines() if ln.strip()]
    seen = set()
    kept = []
    for ln in lines:
        m_href = re.search(r'href="([^"]+)"', ln)
        key = m_href.group(1) if m_href else ln.strip()
        if key in seen:
            continue
        seen.add(key)
        kept.append(ln)
    new_block = "\n" + "\n".join(kept) + "\n"
    return html[: m.start(2)] + new_block + html[m.end(2) :]


def main() -> None:
    for fn in FILES:
        path = CATS / fn
        html = path.read_text(encoding="utf-8", errors="ignore")
        out = dedupe_cards(html)
        if out != html:
            path.write_text(out, encoding="utf-8")
            print("deduped", fn)
        else:
            print("unchanged", fn)


if __name__ == "__main__":
    main()

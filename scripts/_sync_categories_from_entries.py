import re
from pathlib import Path
from urllib.parse import quote

REPO = Path(r"C:\Users\colep\OneDrive\The tubzi SITE")
ENTRIES = REPO / "js" / "tubzi-game-entries.js"
GAMES_DIR = REPO / "games"
CATS_DIR = REPO / "categories"

CATEGORY_GENRE = {
    "action.html": "action",
    "puzzle.html": "puzzle",
    "sports.html": "sports",
    "casual.html": "casual",
    "io.html": "io",
    "racing.html": "driving",
}

FILE_SLUG_OVERRIDES = {
    "johnytrigger": "johhnytrigger",
    "yohio": "yohoio",
    "0v0game": "OvOgame",
    "noobrushvspromonster": "noobrushvsproMonster",
}

IMAGE_SLUG_OVERRIDES = {
    "noobrushvspromonster": "noobrushvsproMonster",
}


def norm_name(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", name.lower())


def file_slug_from_name(name: str) -> str:
    base = name.replace(" ", "").lower()
    return FILE_SLUG_OVERRIDES.get(base, base)


def image_slug_from_name(name: str) -> str:
    base = name.replace(" ", "").lower()
    return IMAGE_SLUG_OVERRIDES.get(base, base)


def titleize(name: str) -> str:
    words = name.split()
    out = []
    for w in words:
        lw = w.lower()
        if lw in {"io", "btd", "fnaf"}:
            out.append(lw.upper())
        elif lw == "x3m":
            out.append("X3M")
        else:
            out.append(w[:1].upper() + w[1:])
    return " ".join(out)


def make_anchor(name: str) -> str:
    slug = file_slug_from_name(name)
    image_slug = image_slug_from_name(name)
    pretty = titleize(name)
    qp = quote(pretty, safe="")
    return (
        f'        <a class="hub-game" href="../play.html?game=games/{slug}.html&amp;name={qp}">'
        f'<div class="hub-game-thumb" style="background-image:url(../images/{image_slug}.png),'
        f'linear-gradient(135deg,rgba(255,106,0,.85),rgba(229,95,0,.8))"></div>'
        f"<span>{pretty}</span></a>"
    )


def main() -> None:
    text = ENTRIES.read_text(encoding="utf-8", errors="ignore")
    pairs = re.findall(r'\["([^"]+)",\s*"([^"]+)"\]', text)

    # Only include games that have actual game pages present.
    existing_html = {p.stem.lower() for p in GAMES_DIR.glob("*.html")}

    for cat_file, genre in CATEGORY_GENRE.items():
        path = CATS_DIR / cat_file
        html = path.read_text(encoding="utf-8", errors="ignore")

        m = re.search(
            r'(<div class="hub-grid" id="hubCategoryGrid">\s*)([\s\S]*?)(\s*</div>)',
            html,
        )
        if not m:
            continue

        current_block = m.group(2)
        existing_links = set(re.findall(r"games/([A-Za-z0-9]+)\.html", current_block))

        additions = []
        for name, g in pairs:
            if g != genre:
                continue
            slug = file_slug_from_name(name)
            if slug.lower() not in existing_html:
                continue
            if slug in existing_links:
                continue
            additions.append(make_anchor(name))

        if additions:
            new_block = current_block.rstrip() + "\n" + "\n".join(additions) + "\n"
            html = html[: m.start(2)] + new_block + html[m.end(2) :]
            path.write_text(html, encoding="utf-8")
            print(f"{cat_file}: +{len(additions)}")
        else:
            print(f"{cat_file}: +0")


if __name__ == "__main__":
    main()

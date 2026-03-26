import re
from pathlib import Path
from urllib.parse import quote

REPO = Path(r"C:\Users\colep\OneDrive\The tubzi SITE")
ENTRIES_PATH = REPO / "js" / "tubzi-game-entries.js"
GAMES_DIR = REPO / "games"
CATS_DIR = REPO / "categories"

CATEGORY_FILES = {
    "action": CATS_DIR / "action.html",
    "puzzle": CATS_DIR / "puzzle.html",
    "sports": CATS_DIR / "sports.html",
    "casual": CATS_DIR / "casual.html",
    "io": CATS_DIR / "io.html",
    "racing": CATS_DIR / "racing.html",
}

POPULARITY_ORDER = [
    "minecraft", "subway surfers", "geometry dash", "slope", "1v1 lol", "cookie clicker",
    "drivemad", "bitlife", "paper io", "among us", "shell shockers", "monkey mart",
    "tiny fishing", "retro bowl", "basketball random", "drift boss", "snow rider 3d",
    "run 3", "happywheels", "moto x3m", "plantsvszombies", "fnaf 1", "fnaf 2", "wordle",
    "2048", "crossyroad", "terraria", "polytrack", "soccerrandom", "rocket league",
]
POPULARITY_INDEX = {re.sub(r"[^a-z0-9]+", "", n.lower()): i for i, n in enumerate(POPULARITY_ORDER)}

FILE_SLUG_OVERRIDES = {
    "johnytrigger": "johhnytrigger",
    "yohio": "yohoio",
    "0v0game": "OvOgame",
    "noobrushvspromonster": "noobrushvsproMonster",
}

IMAGE_SLUG_OVERRIDES = {
    "noobrushvspromonster": "noobrushvsproMonster",
}


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def file_slug(name: str) -> str:
    base = name.replace(" ", "").lower()
    return FILE_SLUG_OVERRIDES.get(base, base)


def image_slug(name: str) -> str:
    base = name.replace(" ", "").lower()
    return IMAGE_SLUG_OVERRIDES.get(base, base)


def display_name(name: str) -> str:
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


def popularity_rank(name: str) -> int:
    return POPULARITY_INDEX.get(norm(name), 10_000)


def categories_for_game(name: str, genre: str) -> set[str]:
    n = name.lower()
    cats: set[str] = set()
    base_map = {
        "action": "action",
        "puzzle": "puzzle",
        "sports": "sports",
        "casual": "casual",
        "io": "io",
        "driving": "racing",
    }
    if genre in base_map:
        cats.add(base_map[genre])

    if any(k in n for k in ["basket", "soccer", "volley", "golf", "bowl", "boxing", "football"]):
        cats.add("sports")
    if any(k in n for k in ["moto", "drive", "driving", "car", "road", "rider", "track", "race", "parking", "truck", "boat"]):
        cats.add("racing")
    if (" io" in n) or n.endswith("io") or n.endswith(".io"):
        cats.add("io")
    if any(k in n for k in ["zombie", "shooter", "strike", "gun", "sniper", "craft", "fnaf", "backrooms", "ultrakill", "surviv"]):
        cats.add("action")
    if any(k in n for k in ["2048", "wordle", "alchemy", "papas", "tomb", "geometry", "block", "btd", "puzzle"]):
        cats.add("puzzle")
    if any(k in n for k in ["idle", "clicker", "mart", "restaurant", "bitlife", "crossy", "tiny fishing", "monkey mart"]):
        cats.add("casual")

    return cats


def make_card(name: str) -> str:
    fslug = file_slug(name)
    islug = image_slug(name)
    pretty = display_name(name)
    encoded = quote(pretty, safe="")
    return (
        f'        <a class="hub-game" href="../play.html?game=games/{fslug}.html&amp;name={encoded}">'
        f'<div class="hub-game-thumb" style="background-image:url(../images/{islug}.png),linear-gradient(135deg,rgba(255,106,0,.85),rgba(229,95,0,.8))"></div>'
        f"<span>{pretty}</span></a>"
    )


def main() -> None:
    text = ENTRIES_PATH.read_text(encoding="utf-8", errors="ignore")
    entries = re.findall(r'\["([^"]+)",\s*"([^"]+)"\]', text)
    existing_game_html = {p.stem.lower() for p in GAMES_DIR.glob("*.html")}

    grouped: dict[str, list[str]] = {k: [] for k in CATEGORY_FILES}
    seen_per_cat: dict[str, set[str]] = {k: set() for k in CATEGORY_FILES}

    # Stable order: popularity first, then alpha
    ordered = sorted(entries, key=lambda ng: (popularity_rank(ng[0]), ng[0].lower()))

    for name, genre in ordered:
        slug = file_slug(name).lower()
        if slug not in existing_game_html:
            continue
        cats = categories_for_game(name, genre)
        for cat in cats:
            if cat not in grouped:
                continue
            key = slug
            if key in seen_per_cat[cat]:
                continue
            seen_per_cat[cat].add(key)
            grouped[cat].append(name)

    for cat, path in CATEGORY_FILES.items():
        html = path.read_text(encoding="utf-8", errors="ignore")
        m = re.search(r'(<div class="hub-grid" id="hubCategoryGrid">\s*)([\s\S]*?)(\s*</div>)', html)
        if not m:
            continue
        cards = "\n".join(make_card(n) for n in grouped[cat])
        new_block = ("\n" + cards + "\n") if cards else "\n"
        html = html[: m.start(2)] + new_block + html[m.end(2):]
        path.write_text(html, encoding="utf-8")
        print(f"{path.name}: {len(grouped[cat])} cards")


if __name__ == "__main__":
    main()

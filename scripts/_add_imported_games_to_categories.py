import re
from pathlib import Path
from urllib.parse import quote

REPO = Path(r"C:\Users\colep\OneDrive\The tubzi SITE")
ENTRIES_PATH = REPO / "js" / "tubzi-game-entries.js"
GAMES_DIR = REPO / "games"
CATS_DIR = REPO / "categories"

NEW_ITEMS = [
    ("2048", "puzzle"),
    ("adventurecapitalist", "puzzle"),
    ("ahoysurvival", "action"),
    ("asmallworldcup", "sports"),
    ("backrooms", "action"),
    ("baldisbasics", "puzzle"),
    ("basketballbros", "sports"),
    ("basketrandom", "sports"),
    ("boxingrandom", "sports"),
    ("btd 1", "puzzle"),
    ("btd 2", "puzzle"),
    ("btd 3", "puzzle"),
    ("btd 4", "puzzle"),
    ("btd 5", "puzzle"),
    ("crazycattle 3 d", "action"),
    ("ducklife 1", "puzzle"),
    ("dumbwaystodie", "puzzle"),
    ("fallguys", "action"),
    ("fisquarium", "puzzle"),
    ("fivenightsatepsteins", "action"),
    ("fnaf 1", "action"),
    ("fnaf 2", "action"),
    ("fnaf 3", "action"),
    ("fnaf 4", "action"),
    ("geometry dash meltdown", "puzzle"),
    ("geometry dash subzero", "puzzle"),
    ("geometry dash world", "puzzle"),
    ("granny", "action"),
    ("happywheels", "action"),
    ("helixjump", "puzzle"),
    ("hole io", "io"),
    ("idlebreakout", "puzzle"),
    ("little alchemy 2", "puzzle"),
    ("melonsandbox", "puzzle"),
    ("moneyrush", "puzzle"),
    ("moto x3m", "driving"),
    ("moto x3m pool party", "driving"),
    ("moto x3m spooky land", "driving"),
    ("moto x3m winter", "driving"),
    ("papas donuteria", "puzzle"),
    ("papas freezeria", "puzzle"),
    ("papas hotdoggeria", "puzzle"),
    ("papas pastaria", "puzzle"),
    ("papas pizzeria", "puzzle"),
    ("plantsvszombies", "action"),
    ("polytrack", "driving"),
    ("ragdolldrop", "puzzle"),
    ("redball 4", "puzzle"),
    ("retro bowl college", "sports"),
    ("rocket league", "driving"),
    ("run 1", "action"),
    ("run 2", "action"),
    ("run 3", "action"),
    ("slicemaster", "puzzle"),
    ("smashyroad", "driving"),
    ("soccerrandom", "sports"),
    ("soundbuttons", "puzzle"),
    ("spacewaves", "puzzle"),
    ("survivor io", "io"),
    ("terraria", "puzzle"),
    ("tombofthemask", "puzzle"),
    ("ultrakill", "action"),
    ("volleyrandom", "sports"),
    ("wheelielife", "driving"),
    ("wordle", "puzzle"),
    ("worlds hardest game", "puzzle"),
]

CATEGORY_FILE_BY_GENRE = {
    "action": "action.html",
    "puzzle": "puzzle.html",
    "sports": "sports.html",
    "casual": "casual.html",
    "io": "io.html",
    "driving": "racing.html",
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


def slugify_name(name: str) -> str:
    return name.replace(" ", "").lower()


def file_slug(name: str) -> str:
    s = slugify_name(name)
    return FILE_SLUG_OVERRIDES.get(s, s)


def image_slug(name: str) -> str:
    s = slugify_name(name)
    return IMAGE_SLUG_OVERRIDES.get(s, s)


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


def add_entries_if_missing() -> None:
    text = ENTRIES_PATH.read_text(encoding="utf-8", errors="ignore")
    pairs = re.findall(r'\["([^"]+)",\s*"([^"]+)"\]', text)
    existing = {(n.lower(), g.lower()) for n, g in pairs}
    to_add = [(n, g) for n, g in NEW_ITEMS if (n.lower(), g.lower()) not in existing]
    if not to_add:
        return
    lines = "\n".join([f'    ["{n}", "{g}"],' for n, g in to_add])
    text = text.replace("\n];", "\n" + lines + "\n];")
    ENTRIES_PATH.write_text(text, encoding="utf-8")


def make_card(name: str) -> str:
    pretty = display_name(name)
    fslug = file_slug(name)
    islug = image_slug(name)
    encoded = quote(pretty, safe="")
    return (
        f'        <a class="hub-game" href="../play.html?game=games/{fslug}.html&amp;name={encoded}">'
        f'<div class="hub-game-thumb" style="background-image:url(../images/{islug}.png),'
        f'linear-gradient(135deg,rgba(255,106,0,.85),rgba(229,95,0,.8))"></div>'
        f"<span>{pretty}</span></a>"
    )


def add_to_categories() -> None:
    existing_game_files = {p.stem.lower() for p in GAMES_DIR.glob("*.html")}
    grouped = {}
    for name, genre in NEW_ITEMS:
        grouped.setdefault(genre, []).append(name)

    for genre, names in grouped.items():
        cat_file = CATEGORY_FILE_BY_GENRE.get(genre)
        if not cat_file:
            continue
        path = CATS_DIR / cat_file
        html = path.read_text(encoding="utf-8", errors="ignore")
        m = re.search(
            r'(<div class="hub-grid" id="hubCategoryGrid">\s*)([\s\S]*?)(\s*</div>)',
            html,
        )
        if not m:
            continue

        block = m.group(2)
        existing_links = set(re.findall(r"games/([A-Za-z0-9]+)\.html", block))
        additions = []
        for name in names:
            s = file_slug(name)
            if s.lower() not in existing_game_files:
                continue
            if s in existing_links:
                continue
            additions.append(make_card(name))

        if additions:
            new_block = block.rstrip() + "\n" + "\n".join(additions) + "\n"
            html = html[: m.start(2)] + new_block + html[m.end(2) :]
            path.write_text(html, encoding="utf-8")
            print(f"{cat_file}: +{len(additions)}")


def main() -> None:
    add_entries_if_missing()
    add_to_categories()
    print("done")


if __name__ == "__main__":
    main()

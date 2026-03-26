import re
from pathlib import Path

REPO = Path(r"C:\Users\colep\OneDrive\The tubzi SITE")
JS = REPO / "js" / "tubzi-game-entries.js"
IMG_DIR = REPO / "images"


def image_slug_from_game_name(name: str) -> str:
    base = name.replace(" ", "").lower()
    if base == "noobrushvspromonster":
        return "noobrushvsproMonster"
    return base


def main() -> None:
    js_text = JS.read_text(encoding="utf-8", errors="ignore")
    pairs = re.findall(r'\["([^"]+)",\s*"([^"]+)"\]', js_text)

    missing = []
    for name, _genre in pairs:
        slug = image_slug_from_game_name(name)
        if not (IMG_DIR / f"{slug}.png").exists():
            missing.append((name, slug))

    print("total games:", len(pairs))
    print("missing png:", len(missing))
    for name, slug in missing[:80]:
        print(f"- {name} -> {slug}.png")


if __name__ == "__main__":
    main()


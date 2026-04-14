"""One-off: match tubzi game layout keys to mathlesson zip mp4 slugs."""
import os
import re
import zipfile

ZIP = os.path.join(os.environ.get("USERPROFILE", ""), "Downloads", "mathlesson.github.io-main.zip")
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


def main() -> None:
    with open(os.path.join(SITE, "js", "tubzi-game-entries.js"), encoding="utf-8") as f:
        text = f.read()
    end = text.find("/* First entry")
    chunk = text[:end] if end > 0 else text
    games = re.findall(r'\[\s*"([^"]+)"\s*,', chunk)
    game_keys = {norm(g): g for g in games}

    with open(os.path.join(SITE, "js", "tubzi-hover-preview.js"), encoding="utf-8") as f:
        h = f.read()
    map_keys = set()
    for m in re.finditer(
        r'^\s*(?:"([^"]+)"|([a-z][a-z0-9]*))\s*:\s*"videos/hover_',
        h,
        re.M,
    ):
        map_keys.add(m.group(1) or m.group(2))

    z = zipfile.ZipFile(ZIP)
    vids: dict[str, tuple[str, str]] = {}
    for n in z.namelist():
        if not n.lower().endswith(".mp4"):
            continue
        stem = os.path.basename(n).rsplit(".", 1)[0]
        vn = norm(stem)
        prev = vids.get(vn)
        prefer = n.replace("\\", "/").startswith("mathlesson.github.io-main/v/")
        if prev:
            prev_prefer = prev[0].replace("\\", "/").startswith(
                "mathlesson.github.io-main/v/"
            )
            if prefer and not prev_prefer:
                vids[vn] = (n, stem)
        else:
            vids[vn] = (n, stem)

    exact: list[tuple[str, str, str]] = []
    for gk, gname in game_keys.items():
        if gk in vids:
            exact.append((gk, gname, vids[gk][0]))

    missing_map = [(gk, gn, vp) for gk, gn, vp in exact if gk not in map_keys]

    print("Games total", len(game_keys))
    print("Zip mp4 unique slugs", len(vids))
    print("Exact game<->video matches", len(exact))
    print("Matches missing from MAP", len(missing_map))
    for gk, gn, vp in sorted(missing_map, key=lambda x: x[1].lower()):
        print("ADD", gn, "->", vp)

    no_vid = [game_keys[k] for k in sorted(game_keys) if k not in vids]
    print("\nGames with NO exact slug match in zip:", len(no_vid))
    for name in no_vid:
        print(" ", name)

    in_map = [game_keys[k] for k in sorted(game_keys) if k in map_keys]
    no_hover = [game_keys[k] for k in sorted(game_keys) if k not in map_keys]
    print("\nGames with hover MAP entry:", len(in_map))
    print("Games still without MAP entry:", len(no_hover))
    for name in no_hover:
        print(" ", name)

    z.close()


if __name__ == "__main__":
    main()

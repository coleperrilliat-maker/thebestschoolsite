#!/usr/bin/env python3
"""
One-off: copy games from ~/Downloads/for_tubzi 2 into games/{slug}.html,
normalize names (TubZi slug = display name with spaces removed, lowercased).

Re-run is safe: skips if dest already exists (delete dest to overwrite).
"""
from __future__ import annotations

import pathlib
import shutil

ROOT = pathlib.Path(__file__).resolve().parents[1]
GAMES = ROOT / "games"
DOWNLOADS = pathlib.Path.home() / "Downloads" / "for_tubzi 2"


# (relative path under DOWNLOADS, slug stem for games/{slug}.html, display name, genre)
# Skipped duplicates already on site: bacon may die, baldis, half life, temple run 2
PLAN: list[tuple[str, str, str, str]] = [
    ("bad monday sim/Bad Monday Simulator.html", "badmondaysimulator", "Bad Monday Simulator", "casual"),
    ("anton blast/Antonblast.html", "antonblast", "Anton Blast", "action"),
    ("fifa soccer 11/FIFA 11.html", "fifa11", "FIFA 11", "sports"),
    ("gorilla tag/Gorilla Tag.html", "gorillatag", "Gorilla Tag", "action"),
    ("raft/Raft.html", "raft", "Raft", "casual"),
    ("getting over it/Getting Over It with Bennett Foddy.html", "gettingoverit", "Getting Over It", "puzzle"),
    ("repo/R.E.P.O.html", "repo", "repo", "action"),
    ("super monkey ball/Super Monkey Ball 1&2.html", "supermonkeyball", "Super Monkey Ball", "casual"),
    ("not my neighbor/That's Not My Neighbor.html", "notmyneighbor", "not my neighbor", "horror"),
    ("brotato/Brotato.html", "brotato", "Brotato", "action"),
    ("i have no mouth/I Have No Mouth, and I Must Scream.html", "ihavenomouth", "ihave no mouth", "horror"),
    ("apesvshelium/Apes vs Helium.html", "apesvshelium", "Apes vs Helium", "action"),
    ("shift at midnight/clshiftatmidnight.html", "shiftatmidnight", "Shift at Midnight", "horror"),
    ("shawarma/clscaryshawarma.html", "scaryshawarma", "Scary Shawarma", "horror"),
    ("scary teacher 3d/clscaryteacher3d.html", "scaryteacher3d", "Scary Teacher 3D", "horror"),
    ("tung sahur horror/cltungtunghorror.html", "tungtunghorror", "Tung Tung Horror", "horror"),
    ("tralale escape tung/cltralalerotralalaescapetungtungtungsahur.html", "tralaleescapetung", "Tralale Escape Tung", "casual"),
    ("we bcome what we behold/clwebecomewhatwebehold.html", "webecomewhatwebehold", "We Become What We Behold", "puzzle"),
    ("web fishing/clwebfishing.html", "webfishing", "Web Fishing", "casual"),
    ("dta-6/dta6.html", "dta6", "DTA 6", "action"),
    ("gta_vice_city/vicecity.html", "gtavicecity", "GTA Vice City", "driving"),
    ("zombieroad/clzombieroad.html", "zombieroad", "Zombie Road", "action"),
]


def main() -> None:
    if not DOWNLOADS.is_dir():
        raise SystemExit(f"Missing folder: {DOWNLOADS}")

    copied = 0
    for rel, slug, _display, _genre in PLAN:
        src = DOWNLOADS / rel
        dest = GAMES / f"{slug}.html"
        if not src.is_file():
            raise SystemExit(f"Missing source: {src}")
        if dest.exists():
            print("exists (skip):", dest.name)
            continue
        raw = src.read_text(encoding="utf-8", errors="replace")
        dest.write_text(raw, encoding="utf-8")
        print("wrote", dest.relative_to(ROOT))
        copied += 1
    print("done, copied", copied, "new files")


if __name__ == "__main__":
    main()

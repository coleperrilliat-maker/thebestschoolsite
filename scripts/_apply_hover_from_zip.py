"""
Extract hover_<layoutKey>.mp4 from mathlesson zip for site games missing from MAP.

Resolution order for each game layout key not already in tubzi-hover-preview.js:
1) MANUAL_ZIP (stem norm differs from layoutKey; paths verified in zip)
2) Any .mp4 in the archive whose basename normalizes to the layoutKey (prefers .../v/)
"""
import os
import re
import zipfile

ZIP = os.path.join(os.environ.get("USERPROFILE", ""), "Downloads", "mathlesson.github.io-main.zip")
SITE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEOS = os.path.join(SITE_ROOT, "videos")
HOVER_JS = os.path.join(SITE_ROOT, "js", "tubzi-hover-preview.js")

# layoutKey -> zip member when basename norm != layoutKey (paths verified in zip).
MANUAL_ZIP = {
    "shellshockers": "mathlesson.github.io-main/v/sh3llsh0ck.mp4",
    "holeio": "mathlesson.github.io-main/v/hole.io.mp4",
    "8ballclassic": "mathlesson.github.io-main/v/8-ball-pool-billiard.mp4",
    "0v0game": "mathlesson.github.io-main/v/ovo.mp4",
    "crossyroad": "mathlesson.github.io-main/v/cross-roads.mp4",
    "aquaparkio": "mathlesson.github.io-main/v/waterpark-slide-io.mp4",
}


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


def parse_games() -> list[str]:
    with open(os.path.join(SITE_ROOT, "js", "tubzi-game-entries.js"), encoding="utf-8") as f:
        text = f.read()
    end = text.find("/* First entry")
    chunk = text[:end] if end > 0 else text
    return re.findall(r'\[\s*"([^"]+)"\s*,', chunk)


def parse_map_keys() -> set[str]:
    with open(HOVER_JS, encoding="utf-8") as f:
        h = f.read()
    keys = set()
    for m in re.finditer(
        r'^\s*(?:"([^"]+)"|([a-z][a-z0-9]*))\s*:\s*"videos/hover_',
        h,
        re.M,
    ):
        keys.add(m.group(1) or m.group(2))
    return keys


def zip_norm_index(z: zipfile.ZipFile) -> dict[str, str]:
    buckets: dict[str, list[str]] = {}
    for n in z.namelist():
        if not n.lower().endswith(".mp4"):
            continue
        stem = os.path.basename(n).rsplit(".", 1)[0]
        key = norm(stem)
        buckets.setdefault(key, []).append(n)

    def score(path: str) -> tuple[int, int]:
        p = path.replace("\\", "/")
        in_v = 1 if "/v/" in p else 0
        return (in_v, -len(path))

    return {k: sorted(paths, key=score, reverse=True)[0] for k, paths in buckets.items()}


def key_literal(lk: str) -> str:
    if lk and (lk.isdigit() or not lk[0].isalpha()):
        return '"' + lk.replace("\\", "\\\\").replace('"', '\\"') + '"'
    return lk


def insert_map_entries(new_pairs: list[tuple[str, str]]) -> None:
    with open(HOVER_JS, encoding="utf-8") as f:
        lines = f.readlines()
    start = end = None
    for i, line in enumerate(lines):
        if start is None and "var MAP = {" in line:
            start = i
        if start is not None and end is None and line.strip() == "};":
            end = i
            break
    if start is None or end is None:
        raise RuntimeError("Could not find MAP block")

    body = lines[start + 1 : end]
    existing: dict[str, str] = {}
    for line in body:
        m = re.match(
            r'^\s*(?:"([^"]+)"|([a-z][a-z0-9]*))\s*:\s*"([^"]+)"\s*,?\s*$',
            line.strip(),
        )
        if m:
            k = m.group(1) or m.group(2)
            existing[k] = m.group(3)

    for lk, path in new_pairs:
        existing[lk] = path

    rendered = [
        f"        {key_literal(lk)}: \"{path}\",\n"
        for lk, path in sorted(existing.items(), key=lambda x: norm(x[0]))
    ]
    new_lines = lines[: start + 1] + rendered + lines[end:]
    with open(HOVER_JS, "w", encoding="utf-8", newline="\n") as f:
        f.writelines(new_lines)


def main() -> None:
    games = parse_games()
    map_keys = parse_map_keys()
    z = zipfile.ZipFile(ZIP)
    names = set(z.namelist())
    index = zip_norm_index(z)

    to_add: dict[str, str] = {}
    missing: list[str] = []

    for g in games:
        lk = norm(g)
        if lk in map_keys or lk in to_add:
            continue
        zip_path = None
        if lk in MANUAL_ZIP:
            cand = MANUAL_ZIP[lk]
            if cand in names:
                zip_path = cand
        if not zip_path and lk in index:
            zip_path = index[lk]
        if not zip_path or zip_path not in names:
            if lk in MANUAL_ZIP and MANUAL_ZIP[lk] not in names:
                missing.append(f"{g} ({lk}) manual missing")
            elif lk not in MANUAL_ZIP and lk not in index:
                missing.append(f"{g} ({lk})")
            continue

        out_name = f"hover_{lk}.mp4"
        out_path = os.path.join(VIDEOS, out_name)
        out_rel = f"videos/{out_name}"
        with z.open(zip_path) as src, open(out_path, "wb") as dst:
            dst.write(src.read())
        to_add[lk] = out_rel
        map_keys.add(lk)
        print("OK", g, "->", os.path.basename(zip_path))

    z.close()

    if missing:
        print("\n--- No matching mp4 in zip ---")
        for m in sorted(missing):
            print(m)

    if to_add:
        insert_map_entries(sorted(to_add.items(), key=lambda x: norm(x[0])))
        print(f"\nUpdated MAP (+{len(to_add)}).")


if __name__ == "__main__":
    main()

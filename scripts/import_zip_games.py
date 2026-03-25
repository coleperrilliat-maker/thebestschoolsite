"""One-off import from manifest.csv (shooter_and_car_games). JPG -> PNG, game HTML, prints index snippets."""
import csv
import html
import io
import urllib.request
from pathlib import Path

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

ROOT = Path(r"C:\Users\colep\OneDrive\The tubzi SITE")
CSV_PATH = Path(r"C:\Users\colep\Downloads\shooter_and_car_games_extracted\shooter_and_car_games\manifest.csv")
SKIP_EMBED_SLUGS = {"f6rxmv7pmquaa41fxg5vy64rn57cx2iu"}  # same as games/sniper3d.html

GAME_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MSRCFHRBDK"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-MSRCFHRBDK');
</script>
<meta charset="UTF-8">
<title>__TITLE__</title>
<style>
html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  background: black;
}
iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
</head>
<body>
<iframe src="__EMBED__" allowfullscreen></iframe>
</body>
</html>
"""


def file_slug(name: str) -> str:
    return name.replace(" ", "").lower()


def fetch_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return resp.read()


def save_thumb_png(out_png: Path, raw: bytes, Image) -> None:
    try:
        im = Image.open(io.BytesIO(raw))
        im = im.convert("RGBA")
        im.save(out_png, "PNG")
    except Exception as exc:
        print("WARN image decode, using placeholder:", out_png.stem, exc)
        im = Image.new("RGBA", (512, 384), (255, 106, 0, 255))
        im.save(out_png, "PNG")


def main() -> None:
    try:
        from PIL import Image  # type: ignore
    except ImportError:
        print("Installing Pillow...")
        import subprocess
        subprocess.check_call(["pip", "install", "Pillow", "-q"])
        from PIL import Image  # type: ignore

    rows = []
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            slug = row["slug"].strip()
            if slug in SKIP_EMBED_SLUGS:
                print("SKIP duplicate embed:", row["name"])
                continue
            rows.append(row)

    for row in rows:
        name = row["name"].strip()
        fs = file_slug(name)
        embed = row["embed_url"].strip()
        if not embed.endswith("/"):
            embed += "/"
        img_url = row["image_url"].strip()

        try:
            raw = fetch_bytes(img_url)
        except Exception as exc:
            print("WARN download:", name, exc)
            raw = b""
        out_png = ROOT / "images" / f"{fs}.png"
        if raw:
            save_thumb_png(out_png, raw, Image)
        else:
            save_thumb_png(out_png, b"", Image)

        out_html = ROOT / "games" / f"{fs}.html"
        out_html.write_text(
            GAME_HTML.replace("__TITLE__", html.escape(name)).replace(
                "__EMBED__", html.escape(embed)
            ),
            encoding="utf-8",
        )
        print("OK", name, "->", fs)

    # Snippets for manual paste / verification
    print("\n--- index games lines (genre) ---")
    for row in rows:
        name = row["name"].strip()
        g = "driving" if row["category"].strip() == "racing" else "action"
        key = name.lower()
        print(f'    ["{key}", "{g}"],')

    print("\nDone,", len(rows), "games")


if __name__ == "__main__":
    main()

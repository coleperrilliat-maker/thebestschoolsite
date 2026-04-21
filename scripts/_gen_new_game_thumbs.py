"""One-off: generate PNG thumbnails for games that only had gradient fallbacks."""
from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "images"

# (image stem, lines to draw: short lines read better at card size)
GAMES: list[tuple[str, list[str]]] = [
    ("aquaparkio", ["Aquapark", ".io"]),
    ("basketballstars", ["Basketball", "Stars"]),
    ("bowmasters", ["Bowmasters"]),
    ("bankrobbery", ["Bank Robbery"]),
    ("blockblast", ["Block Blast"]),
    ("attackhole", ["Attack Hole"]),
    ("amaze", ["Amaze"]),
    ("brawlsimulator3d", ["Brawl Sim", "3D"]),
]

W = H = 512
FONT_CANDIDATES = [
    Path(r"C:\Windows\Fonts\segoeuib.ttf"),
    Path(r"C:\Windows\Fonts\segoeui.ttf"),
    Path(r"C:\Windows\Fonts\arialbd.ttf"),
    Path(r"C:\Windows\Fonts\arial.ttf"),
]


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for p in FONT_CANDIDATES:
        if p.is_file():
            try:
                return ImageFont.truetype(str(p), size)
            except OSError:
                continue
    return ImageFont.load_default()


def draw_text_outline(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int],
    outline: tuple[int, int, int, int] = (0, 0, 0, 220),
) -> None:
    x, y = xy
    for ox in range(-2, 3):
        for oy in range(-2, 3):
            if ox == 0 and oy == 0:
                continue
            draw.text((x + ox, y + oy), text, font=font, fill=outline[:3])
    draw.text((x, y), text, font=font, fill=fill)


def make_thumb(stem: str, lines: list[str]) -> Image.Image:
    seed = sum(ord(c) for c in stem)
    h0 = (seed % 360) / 360.0
    c1 = tuple(int(x * 255) for x in colorsys.hsv_to_rgb(h0, 0.72, 0.98))
    c2 = tuple(int(x * 255) for x in colorsys.hsv_to_rgb((h0 + 0.08) % 1.0, 0.62, 0.88))
    c3 = tuple(int(x * 255) for x in colorsys.hsv_to_rgb((h0 + 0.04) % 1.0, 0.5, 0.4))

    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / max(H - 1, 1)
        r = int(c1[0] * (1 - t) + c2[0] * t)
        g = int(c1[1] * (1 - t) + c2[1] * t)
        b = int(c1[2] * (1 - t) + c2[2] * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for y in range(int(H * 0.5), H):
        t = (y - H * 0.5) / (H * 0.5)
        a = min(255, int(120 * t))
        sd.line([(0, y), (W, y)], fill=(c3[0], c3[1], c3[2], a))
    img = Image.alpha_composite(img.convert("RGBA"), shade).convert("RGB")
    draw = ImageDraw.Draw(img)

    font = load_font(54 if max(len(s) for s in lines) <= 13 else 44)
    gap = 12
    line_heights: list[int] = []
    for ln in lines:
        bbox = draw.textbbox((0, 0), ln, font=font)
        line_heights.append(bbox[3] - bbox[1])
    total_h = sum(line_heights) + gap * max(0, len(lines) - 1)
    y0 = (H - total_h) // 2
    y = y0
    for ln, th in zip(lines, line_heights):
        bbox = draw.textbbox((0, 0), ln, font=font)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2
        draw_text_outline(draw, (x, y), ln, font, (255, 255, 255))
        y += th + gap

    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for stem, lines in GAMES:
        path = OUT / f"{stem}.png"
        make_thumb(stem, lines).save(path, "PNG", optimize=True)
        print("wrote", path.relative_to(ROOT))


if __name__ == "__main__":
    main()

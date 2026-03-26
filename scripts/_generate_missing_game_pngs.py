import colorsys
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO = Path(r"C:\Users\colep\OneDrive\The tubzi SITE")
JS = REPO / "js" / "tubzi-game-entries.js"
IMG_DIR = REPO / "images"


def image_slug_from_game_name(name: str) -> str:
    base = name.replace(" ", "").lower()
    # Keep same override logic as site code.
    if base == "noobrushvspromonster":
        return "noobrushvsproMonster"
    return base


def wrap_title(name: str) -> list[str]:
    # Try to keep it readable at 512x512.
    words = name.split()
    if len(words) <= 2:
        return [name]
    # Make 2-3 lines depending on length.
    target_lines = 3 if len(words) >= 4 else 2
    lines: list[str] = []
    current: list[str] = []
    for w in words:
        current.append(w)
        # Flush when we have enough words per line.
        if len(lines) < target_lines - 1 and len(current) >= (len(words) // target_lines) + 1:
            lines.append(" ".join(current))
            current = []
    if current:
        lines.append(" ".join(current))
    return lines[:3]


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    # Common Windows fonts (try in order).
    candidates = [
        Path(r"C:\Windows\Fonts\segoeuib.ttf"),
        Path(r"C:\Windows\Fonts\segoeui.ttf"),
        Path(r"C:\Windows\Fonts\arialbd.ttf"),
        Path(r"C:\Windows\Fonts\arial.ttf"),
    ]
    for p in candidates:
        if p.exists():
            try:
                return ImageFont.truetype(str(p), size)
            except OSError:
                continue
    return ImageFont.load_default()


def text_outline(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, font, fill):
    # Thicker outline for legibility on bright gradients.
    x, y = xy
    outline = (0, 0, 0, 210)
    for ox in (-2, -1, 0, 1, 2):
        for oy in (-2, -1, 0, 1, 2):
            if ox == 0 and oy == 0:
                continue
            draw.text((x + ox, y + oy), text, font=font, fill=outline)
    draw.text((x, y), text, font=font, fill=fill)


def make_thumb(stem: str, title: str) -> Image.Image:
    seed = sum(ord(c) for c in stem)
    h0 = (seed % 360) / 360.0
    top = tuple(int(x * 255) for x in colorsys.hsv_to_rgb(h0, 0.72, 0.98))
    mid = tuple(int(x * 255) for x in colorsys.hsv_to_rgb((h0 + 0.08) % 1.0, 0.62, 0.88))
    bottom = tuple(int(x * 255) for x in colorsys.hsv_to_rgb((h0 + 0.04) % 1.0, 0.5, 0.4))

    W = H = 512
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)

    # Vertical gradient.
    for y in range(H):
        t = y / max(H - 1, 1)
        r = int(top[0] * (1 - t) + mid[0] * t)
        g = int(top[1] * (1 - t) + mid[1] * t)
        b = int(top[2] * (1 - t) + mid[2] * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Warm bottom shading.
    shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for y in range(int(H * 0.5), H):
        t = (y - H * 0.5) / (H * 0.5)
        a = min(255, int(140 * t))
        sd.line([(0, y), (W, y)], fill=(bottom[0], bottom[1], bottom[2], a))
    img = Image.alpha_composite(img.convert("RGBA"), shade).convert("RGB")
    draw = ImageDraw.Draw(img)

    lines = wrap_title(title)
    # Font sizing: pick based on total characters.
    max_chars = max(len(l) for l in lines)
    font_size = 54 if max_chars <= 14 else 42 if max_chars <= 20 else 34
    font = load_font(font_size)

    line_heights = []
    for l in lines:
        bbox = draw.textbbox((0, 0), l, font=font)
        line_heights.append(bbox[3] - bbox[1])
    gap = 10
    total_h = sum(line_heights) + gap * max(0, len(lines) - 1)
    y0 = (H - total_h) // 2

    draw_rgba = ImageDraw.Draw(img.convert("RGBA"))
    y = y0
    for l, th in zip(lines, line_heights):
        bbox = draw.textbbox((0, 0), l, font=font)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2
        text_outline(draw_rgba, (x, y), l, font, (255, 255, 255, 255))
        y += th + gap

    return img


def main() -> None:
    js_text = JS.read_text(encoding="utf-8", errors="ignore")
    pairs = re.findall(r'\["([^"]+)",\s*"([^"]+)"\]', js_text)

    missing: list[tuple[str, str]] = []
    for name, _genre in pairs:
        slug = image_slug_from_game_name(name)
        out = IMG_DIR / f"{slug}.png"
        if not out.exists():
            missing.append((name, slug))

    print("missing png:", len(missing))
    for name, slug in missing:
        out = IMG_DIR / f"{slug}.png"
        thumb = make_thumb(slug, name)
        thumb.save(out, "PNG", optimize=True)
        print("wrote", out.name)

    # Re-check (quick).
    still_missing = []
    for name, _genre in pairs:
        slug = image_slug_from_game_name(name)
        if not (IMG_DIR / f"{slug}.png").exists():
            still_missing.append(slug)
    print("still missing:", len(still_missing))


if __name__ == "__main__":
    main()


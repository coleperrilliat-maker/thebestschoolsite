import re
from pathlib import Path

REPO = Path(r"C:\Users\colep\OneDrive\The tubzi SITE")
CATS = REPO / "categories"

# Goal:
# - Prefer the real JPG thumbnail if it exists.
# - Only fall back to the PNG if JPG is missing.
# - This fixes the case where a PNG placeholder (orange) exists and was being loaded first.

# Case A (currently common):
#   background-image:url(../images/slug.png),url(../images/slug.jpg),linear-gradient
# Swap order to load JPG first:
#   background-image:url(../images/slug.jpg),url(../images/slug.png),linear-gradient
PATTERN_SWAP_PNG_FIRST_TO_JPG_FIRST = re.compile(
    r'background-image:url\(\.\./images/([A-Za-z0-9]+)\.png\),url\(\.\./images/\1\.jpg\),linear-gradient'
)

# Case B:
#   background-image:url(../images/slug.png),linear-gradient
# Insert JPG first (then PNG):
#   background-image:url(../images/slug.jpg),url(../images/slug.png),linear-gradient
PATTERN_INSERT_JPG_BEFORE_PNG = re.compile(
    r'background-image:url\(\.\./images/([A-Za-z0-9]+)\.png\),linear-gradient'
)


def main() -> None:
    changed = 0
    for cat_file in CATS.glob("*.html"):
        html = cat_file.read_text(encoding="utf-8", errors="ignore")

        new = PATTERN_SWAP_PNG_FIRST_TO_JPG_FIRST.sub(
            r'background-image:url(../images/\1.jpg),url(../images/\1.png),linear-gradient',
            html,
        )
        new = PATTERN_INSERT_JPG_BEFORE_PNG.sub(
            r'background-image:url(../images/\1.jpg),url(../images/\1.png),linear-gradient',
            new,
        )

        if new != html:
            cat_file.write_text(new, encoding="utf-8")
            changed += 1
            print("updated", cat_file.name)

    print("changed files:", changed)


if __name__ == "__main__":
    main()


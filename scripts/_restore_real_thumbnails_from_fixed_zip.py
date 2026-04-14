import zipfile
from pathlib import Path

REPO = Path(r"C:\Users\colep\OneDrive\The tubzi SITE")
ZIP_PATH = Path(r"C:\Users\colep\Downloads\tubzi_fixed_working_games.zip")
IMG_DIR = REPO / "images"

SLUGS = [
    "fisheatgettingbig",
    "grandhotelmania",
    "sniper3d",
    "brickrush3d",
    "noobrushvsproMonster",
    "hungrysharkevolution2",
    "fallrushfun3d",
    "golfbattle",
    "carmovegame",
    "dutycallmodernwarfate2",
    "speedboatchallengeracing",
    "mergefactoryidle",
    "idlerestauranttycoon",
    "restaurantrush",
    "squidsurvivalrunchallenge",
    "hotlinemiami",
    "savingdigitalcircus",
    "noobvsprobutanvilrain",
    "tapcuteanimals",
    "flappywitchfly",
    "pixeldriftretrotetris",
    "solveorsuffer",
    "hiddenhero",
    "aylaworldavatarcity",
    "policehere",
    "breakthroughteam",
    "asteroiddodge",
    "stellarassault",
    "riotvillage",
    "samuraivsyakuzabeatemup",
]


def main() -> None:
    missing_in_zip: list[str] = []
    with zipfile.ZipFile(ZIP_PATH) as z:
        for slug in SLUGS:
            name = f"{slug}.png"
            if name not in z.namelist():
                missing_in_zip.append(name)
                continue
            out = IMG_DIR / name
            out.write_bytes(z.read(name))
            print("restored", name)

    if missing_in_zip:
        print("MISSING_IN_ZIP", len(missing_in_zip))
        for x in missing_in_zip:
            print("-", x)
    else:
        print("all restored from zip")


if __name__ == "__main__":
    main()


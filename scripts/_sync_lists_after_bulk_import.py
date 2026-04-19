import re
from pathlib import Path

repo = Path(r"C:\Users\colep\OneDrive\The tubzi SITE")
js_path = repo / "js" / "tubzi-game-entries.js"
index_path = repo / "index.html"
play_path = repo / "play.html"

new_items = [
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
    ("wordle", "puzzle"),
    ("worlds hardest game", "puzzle"),
]

# 1) Sync JS entries first
js = js_path.read_text(encoding="utf-8", errors="ignore")
pairs = re.findall(r'\["([^"]+)",\s*"([^"]+)"\]', js)
existing = {name for name, _ in pairs}
for name, genre in new_items:
    if name not in existing:
        pairs.append((name, genre))
        existing.add(name)

js_lines = "\n".join([f'    ["{name}", "{genre}"],' for name, genre in pairs])
js_path.write_text("window.TUBZI_GAME_ENTRIES = [\n" + js_lines + "\n];\n", encoding="utf-8")

# 2) Rebuild index games[] from JS entries
index = index_path.read_text(encoding="utf-8", errors="ignore")
index_block = "\n".join([f'    ["{name}", "{genre}"],' for name, genre in pairs])
index = re.sub(
    r"const games = \[(.*?)\]\.map\(\(\[name, genre\]\) => \{",
    "const games = [\n" + index_block + "\n].map(([name, genre]) => {",
    index,
    flags=re.S,
)
index_path.write_text(index, encoding="utf-8")

# 3) Rebuild play GAMES[] from JS entry names
play = play_path.read_text(encoding="utf-8", errors="ignore")
play_names = ", ".join([f'"{name}"' for name, _ in pairs])
play = re.sub(
    r"const GAMES = \[(.*?)\]\.map\(name => \{",
    "const GAMES = [" + play_names + "].map(name => {",
    play,
    flags=re.S,
)
play_path.write_text(play, encoding="utf-8")

print("Synced lists with", len(pairs), "total games")

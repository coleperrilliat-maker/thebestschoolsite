"""Emit interleaved games[] lines for index.html (base + import batch, no placeholder games)."""
from pathlib import Path

base = [
    ("minecraft", "casual"),
    ("geometry dash", "puzzle"),
    ("among us", "io"),
    ("subway surfers", "action"),
    ("cookie clicker", "casual"),
    ("slope", "casual"),
    ("1v1 lol", "io"),
    ("paper io", "io"),
    ("aquapark io", "io"),
    ("basketball stars", "sports"),
    ("bowmasters", "action"),
    ("block blast", "puzzle"),
    ("attack hole", "casual"),
    ("amaze", "puzzle"),
    ("bank robbery", "action"),
    ("brawl simulator 3d", "action"),
    ("retro bowl", "sports"),
    ("bitlife", "casual"),
    ("drivemad", "driving"),
    ("basketball random", "sports"),
    ("crossyroad", "casual"),
    ("tiny fishing", "casual"),
    ("monkey mart", "casual"),
    ("drift boss", "driving"),
    ("0v0game", "io"),
    ("snow rider 3d", "driving"),
    ("time shooter", "action"),
    ("funny shooter", "action"),
    ("tank war simulator", "action"),
    ("jetpackjoyride", "action"),
    ("stick man hook", "action"),
    ("rag doll archers", "action"),
    ("soccer legends", "sports"),
    ("level devil", "puzzle"),
    ("house of hazards", "casual"),
    ("fish eat getting big", "casual"),
    ("grand hotel mania", "casual"),
    ("escape road", "driving"),
    ("escape road 2", "driving"),
    ("sniper 3d", "action"),
    ("johny trigger", "action"),
    ("get away shoot out", "action"),
    ("brick rush 3d", "puzzle"),
    ("noob rush vs pro monster", "action"),
    ("hungry shark evolution 2", "action"),
    ("fall rush fun 3d", "casual"),
    ("golf battle", "sports"),
    ("car move game", "driving"),
    ("duty call modern warfate 2", "action"),
    ("speed boat challenge racing", "driving"),
    ("yohio", "casual"),
    ("my idle mart empire tycoon", "casual"),
    ("merge factory idle", "casual"),
    ("idle restaurant tycoon", "casual"),
    ("restaurant rush", "casual"),
    ("squid survival run challenge", "action"),
    ("hotline miami", "action"),
    ("saving digital circus", "casual"),
    ("noob vs pro but anvil rain", "casual"),
    ("tap cute animals", "casual"),
    ("flappy witch fly", "casual"),
    ("pixel drift retro tetris", "puzzle"),
    ("solve or suffer", "puzzle"),
    ("hidden hero", "puzzle"),
    ("ayla world avatar city", "casual"),
    ("police here", "action"),
    ("breakthrough team", "action"),
    ("asteroid dodge", "action"),
    ("stellar assault", "action"),
    ("riot village", "action"),
    ("samurai vs yakuza beat em up", "action"),
    ("poppy office nightmare", "action"),
]
batch = [
    ("the gungame", "action"),
    ("sniper master", "action"),
    ("urban sniper 2", "action"),
    ("lone wolf strike", "action"),
    ("counter craft modern warfare 2", "action"),
    ("counter craft battle royale", "action"),
    ("super sergeant", "action"),
    ("cartoon clash", "action"),
    ("grand zombie swarm", "action"),
    ("counter craft", "action"),
    ("critical strike global ops", "action"),
    ("counter craft 3", "action"),
    ("wild west gun", "action"),
    ("special strike operations", "action"),
    ("backrooms assault 2", "action"),
    ("special strike zombies", "action"),
    ("dead zone sniper", "action"),
    ("poppy strike", "action"),
    ("super zombie shooter", "action"),
    ("super drive", "driving"),
    ("vice city mad driving", "driving"),
    ("evo city driving", "driving"),
    ("ferrari track driving", "driving"),
    ("city of vice driving", "driving"),
    ("supercars zombie driving", "driving"),
    ("super suv driving", "driving"),
    ("real city driving 2", "driving"),
    ("russian taz driving 3", "driving"),
    ("russian taz driving 2", "driving"),
    ("grand city car thief", "driving"),
    ("grand city driving 2", "driving"),
    ("speed car race madness", "driving"),
    ("dual control racing stunt 3d", "driving"),
    ("mountain truck simulator 3d", "driving"),
    ("car parking pro", "driving"),
    ("extreme toy race", "driving"),
]

n, m = len(base), len(batch)
out: list[tuple[str, str]] = []
i = j = 0
while i < n or j < m:
    if j >= m:
        out.append(base[i])
        i += 1
    elif i >= n:
        out.append(batch[j])
        j += 1
    elif i * m <= j * n:
        out.append(base[i])
        i += 1
    else:
        out.append(batch[j])
        j += 1

def main() -> None:
    out_path = Path(__file__).resolve().parent / "_games_out.txt"
    lines = [f'    ["{name}", "{genre}"],' for name, genre in out]
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("wrote", out_path, len(lines))


if __name__ == "__main__":
    main()

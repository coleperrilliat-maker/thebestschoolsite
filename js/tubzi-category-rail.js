/**
 * Curated rail-section membership for TubZi (see js/tubzi-game-entries.js).
 * Combines genre rules with hand-picked lists so sections stay meaningful:
 * - Car: wheels, tracks, aviation/vehicle stunts tied to racing games on TubZi
 * - 2 player: duel / couch-competitive / same-screen sports (not the same as .io “Online”)
 * - Online: .io lobby games + big online-party titles (Fall Guys, Gorilla Tag, etc.)
 * - Gun: arcade “gun toy” games (not full FPS rows — those live under Shooter)
 * - Shooter: aim/combat shooters & heavy action ranged combat
 * - Parkour: runners, obstacle skill, platform skill titles
 * - Horror: scares / FNAF-likes / analog horror-adjacent
 * - Brain / puzzle: logic, idle brain, classic puzzles
 * - Brainrot: viral / meme / “chicken banana” humor meta games
 */
(function () {
    const gk = n => String(n || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

    /** Head-to-head or party-couch competitive — distinct from server/browser .io “Online”. */
    const TWO_PLAYER_NAMES = [
        "UNO",
        "Mario vs Luigi",
        "0v0game",
        "basketballbros",
        "Baseball Bros",
        "Soccer Bros",
        "basketrandom",
        "volleyrandom",
        "boxingrandom",
        "soccerrandom",
        "basketball random",
        "bouncy basketball",
        "basket battle",
        "Rooftop Snipers",
        "Toasterball",
        "Tube Jumpers",
        "house of hazards",
        "Volleyball Challenge",
        "Table Tennis World Tour",
        "8 ball classic",
        "Chess Classic",
        "Tag",
        "asmallworldcup",
        "dunk shot",
        "Golf Battle",
        "Archery World Tour",
        "FIFA 11",
        "Basketball Superstars",
        "Speed Stars",
        "Shredsauce",
        "retro bowl",
        "retro bowl college",
        "basketball stars"
    ];

    /** Not genre io but plays as online / MMO-style on TubZi. */
    const ONLINE_EXTRA_NAMES = ["fallguys", "eaglercraft", "Fort Zone", "Gorilla Tag", "yohio"];

    /** Driving-adjacent or vehicle stunt titles not marked driving in the sheet. */
    const CAR_EXTRA_NAMES = ["Car Drawing", "Tap Road", "Snow Road", "Eagle Ride", "Car Ramp vs Police Chase"];

    const GUN_NAMES = ["Gun Spin", "get away shoot out"];

    /**
     * FPS/TPS, arena shooters, ranged combat action — researched against this repo’s catalog.
     * (Shell Shockers & 1v1 also appear under Online — both are valid for those filters.)
     */
    const SHOOTER_NAMES = [
        "Cannon Balls 3D",
        "Zombie Rush",
        "War the Knights",
        "Recoil",
        "ultrakill",
        "1v1 lol",
        "shell shockers",
        "stick man hook",
        "get away shoot out",
        "funny shooter",
        "time shooter",
        "rag doll archers",
        "bowmasters",
        "bank robbery",
        "Fort Zone",
        "Death Run 3D",
        "half life",
        "ahoysurvival",
        "bacon may die",
        "bank robbery 2",
        "bank robbery 3",
        "bob the robber 2",
        "clash of vikings",
        "crazycattle 3 d",
        "brawl simulator 3d",
        "Grand Escape Prison",
        "karlson",
        "repo",
        "Brotato",
        "Anton Blast",
        "DTA 6",
        "Zombie Road",
        "Enchain",
        "Iron Snout",
        "Apes vs Helium",
        "escape school duel",
        "Undertale Last Breath",
        "Time Warriors",
        "Tank Pixel",
        "Funny Shooter 2",
        "attack hole"
    ];

    const PARKOUR_EXTRA_NAMES = [
        "geometry dash",
        "geometry dash meltdown",
        "geometry dash subzero",
        "geometry dash world",
        "vex",
        "run 1",
        "run 2",
        "run 3",
        "temple run 2",
        "subway surfers",
        "Dreadhead Parkour",
        "Minecraft Parkour",
        "helixjump",
        "tall man run",
        "extreme run 3d",
        "spacewaves",
        "slope",
        "Lucky Block Obby",
        "tung tung obby",
        "happy wheels",
        "Cluster Truck",
        "Getting Over It",
        "elytra flight",
        "super mario bros",
        "Super Oliver World",
        "Brick Run",
        "Death Run 3D",
        "doodle jump",
        "jetpackjoyride",
        "redball 4",
        "crossyroad",
        "tombofthemask",
        "Rise Higher",
        "Dune Dash",
        "Bad Monday Simulator",
        "crazy plane landing",
        "Super Monkey Ball",
        "fruit ninja"
    ];

    const BRAINROT_NAMES = [
        "You vs 100 Skibidi",
        "steal a brainrot",
        "Lucky Block Obby",
        "tung tung obby",
        "Tralale Escape Tung",
        "Tung Tung Horror",
        "Scary Shawarma",
        "Cheese Chompers 3D",
        "Chicken Scream",
        "Crazy Chicken 3D",
        "Soda Simulator",
        "gobble",
        "Tower Crash 3D",
        "Toasterball",
        "elastic man",
        "Find the Alien",
        "Plinko",
        "Count Masters"
    ];

    /** Horror-adjacent meme or extra scares not tagged horror in data. */
    const HORROR_EXTRA_NAMES = [
        "You vs 100 Skibidi",
        "Haunted School",
        "baldisbasics",
        "Scary Shawarma",
        "Tung Tung Horror",
        "Tralale Escape Tung"
    ];

    /** Chill sims / card / physics casual that fit “Brain / puzzle” browsing better than other rails. */
    const PUZZLE_CASUAL_NAMES = [
        "bitlife",
        "monkey mart",
        "tiny fishing",
        "doge miner",
        "doge miner 2",
        "My Perfect Hotel",
        "Raft",
        "Web Fishing",
        "Angry Birds Online",
        "247 blackjack",
        "Deltarune"
    ];

    const members = {
        "car-games": new Set(),
        "two-player-games": new Set(TWO_PLAYER_NAMES.map(gk)),
        "online-games": new Set(ONLINE_EXTRA_NAMES.map(gk)),
        "gun-games": new Set(GUN_NAMES.map(gk)),
        "shooting-games": new Set(SHOOTER_NAMES.map(gk)),
        "skill-parkour-games": new Set(PARKOUR_EXTRA_NAMES.map(gk)),
        "horror-games": new Set(HORROR_EXTRA_NAMES.map(gk)),
        "puzzle-games": new Set(PUZZLE_CASUAL_NAMES.map(gk)),
        "brainrot-games": new Set(BRAINROT_NAMES.map(gk))
    };

    const entries = window.TUBZI_GAME_ENTRIES || [];

    for (const [name, genre] of entries) {
        const k = gk(name);
        if (genre === "driving" || CAR_EXTRA_NAMES.includes(name)) {
            members["car-games"].add(k);
        }
        if (genre === "io" && name !== "0v0game") {
            members["online-games"].add(k);
        }
        if (genre === "horror") {
            members["horror-games"].add(k);
        }
        if (genre === "puzzle") {
            members["puzzle-games"].add(k);
        }
        if (genre === "platformer" && name !== "Mario vs Luigi") {
            members["skill-parkour-games"].add(k);
        }
    }

    /* Puzzle sheet fixes: Baldi belongs with horror, not classroom puzzle-only. */
    members["puzzle-games"].delete(gk("baldisbasics"));
    members["horror-games"].add(gk("baldisbasics"));

    /* Brainrot takes precedence over puzzle row for overlapping keys. */
    members["brainrot-games"].forEach(k => {
        members["puzzle-games"].delete(k);
    });

    /* Dedupe shooting list keys that were also filler. */
    members["shooting-games"] = new Set([...members["shooting-games"]].filter(Boolean));

    window.TUBZI_RAIL_CATEGORY_MEMBERS = members;
})();

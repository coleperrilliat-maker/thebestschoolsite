const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "js", "tubzi-game-entries.js");
const s = fs.readFileSync(file, "utf8");
global.window = { TUBZI_GAME_ENTRIES: null };
eval(s);
const list = global.window.TUBZI_GAME_ENTRIES;
function normName(name) {
    return String(name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");
}
const block = s.split("var PRIORITY = [")[1].split("];")[0];
const priNames = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const keys = new Set(list.map((e) => normName(e[0])));
const priKeys = new Set(priNames.map(normName));
const missing = [...keys].filter((k) => !priKeys.has(k));
const extra = [...priKeys].filter((k) => !keys.has(k));
console.log("entries", list.length, "priority", priNames.length);
console.log("missing", missing);
console.log("extra", extra);
console.log("top10", list.slice(0, 10).map((e) => e[0]));

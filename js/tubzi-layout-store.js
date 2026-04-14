/**
 * Published layouts: v2 = level per tile; v3 = visual grid; v4 = 15 tile size steps (1–15).
 * Written by adminordercole.html; read by index, all-games, play.
 */
(function (global) {
    var KEY = "tubzi-published-layout";
    var LAYOUT_VERSION = 4;
    var TILE_LEVEL_MIN = 1;
    var TILE_LEVEL_MAX = 15;
    /** “Normal” cell — same as old level 4 */
    var TILE_LEVEL_DEFAULT = 8;
    var DEFAULT_BOARD_COLS = 12;
    var MAX_SPAN = 6;
    /** Smaller-than-cell: width % (levels 1–7), ~5% steps */
    var TILE_SMALL_WIDTHS = [32, 37, 42, 47, 52, 57, 62];
    /** Larger-than-cell: grid span + fill % within span (levels 9–15); max span 3 */
    var TILE_LARGE = [
        { span: 2, fill: 86 },
        { span: 2, fill: 91 },
        { span: 2, fill: 95 },
        { span: 2, fill: 100 },
        { span: 3, fill: 86 },
        { span: 3, fill: 93 },
        { span: 3, fill: 100 }
    ];

    function normName(name) {
        return String(name || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "");
    }

    function clampLevel(n) {
        var v = parseInt(n, 10);
        if (isNaN(v)) {
            return TILE_LEVEL_DEFAULT;
        }
        return Math.min(TILE_LEVEL_MAX, Math.max(TILE_LEVEL_MIN, v));
    }

    /** Map old 1–7 scale to new 1–15 scale (layouts saved before v4). */
    function migrateLegacyTileLevel(oldLv) {
        var map = { 1: 1, 2: 2, 3: 3, 4: 8, 5: 10, 6: 13, 7: 15 };
        var o = parseInt(oldLv, 10);
        if (isNaN(o)) {
            return TILE_LEVEL_DEFAULT;
        }
        if (o >= 1 && o <= 7 && map[o] != null) {
            return map[o];
        }
        return clampLevel(o);
    }

    function normalizeStoredLevel(raw, layoutV) {
        var n = parseInt(raw, 10);
        if (isNaN(n)) {
            return TILE_LEVEL_DEFAULT;
        }
        if (layoutV >= 2) {
            if (layoutV < 4 && n >= 1 && n <= 7) {
                return migrateLegacyTileLevel(n);
            }
            return clampLevel(n);
        }
        n = Math.min(4, Math.max(1, n));
        return migrateLegacyTileLevel(n + 3);
    }

    function clamp(n, lo, hi) {
        return Math.min(hi, Math.max(lo, n));
    }

    function clampTileSpec(t, boardCols) {
        var cols = boardCols || DEFAULT_BOARD_COLS;
        var w = clamp(parseInt(t.spanW, 10) || 1, 1, MAX_SPAN);
        var h = clamp(parseInt(t.spanH, 10) || 1, 1, MAX_SPAN);
        var col = clamp(parseInt(t.col, 10) || 0, 0, cols - 1);
        var row = clamp(parseInt(t.row, 10) || 0, 0, 500);
        if (col + w > cols) {
            col = Math.max(0, cols - w);
        }
        return {
            col: col,
            row: row,
            spanW: w,
            spanH: h,
            bgX: clamp(parseFloat(t.bgX), 0, 100) || 50,
            bgY: clamp(parseFloat(t.bgY), 0, 100) || 50
        };
    }

    /**
     * @param {HTMLElement} el
     * @param {number} level
     */
    function applyTileLevelToCard(el, level) {
        if (!el) {
            return;
        }
        el.classList.remove(
            "tubzi-tile--lv1",
            "tubzi-tile--lv2",
            "tubzi-tile--lv3"
        );
        el.style.gridColumn = "";
        el.style.gridRow = "";
        el.style.width = "";
        el.style.maxWidth = "";
        el.style.height = "";
        el.style.justifySelf = "";
        el.style.alignSelf = "";

        var lv = clampLevel(level);
        if (lv <= 7) {
            var pct = TILE_SMALL_WIDTHS[lv - 1] || 50;
            el.style.width = pct + "%";
            el.style.maxWidth = "100%";
            el.style.height = "auto";
            el.style.aspectRatio = "1 / 1";
            el.style.justifySelf = "center";
            el.style.alignSelf = "center";
            return;
        }
        if (lv === 8) {
            el.style.width = "94%";
            el.style.maxWidth = "100%";
            el.style.height = "auto";
            el.style.aspectRatio = "1 / 1";
            el.style.justifySelf = "center";
            el.style.alignSelf = "center";
            return;
        }
        if (lv >= 9) {
            var spec = TILE_LARGE[lv - 9];
            if (!spec) {
                return;
            }
            var sp = Math.min(MAX_SPAN, Math.max(2, spec.span));
            el.style.gridColumn = "span " + sp;
            el.style.gridRow = "span " + sp;
            el.style.width = spec.fill + "%";
            el.style.maxWidth = "100%";
            el.style.height = "auto";
            el.style.aspectRatio = "1 / 1";
            el.style.justifySelf = "center";
            el.style.alignSelf = "center";
        }
    }

    /**
     * @param {HTMLElement} el
     * @param {object} spec
     * @param {number} boardCols
     */
    function applyVisualTileToCard(el, spec, boardCols) {
        if (!el || !spec) {
            return;
        }
        el.classList.remove(
            "tubzi-tile--lv1",
            "tubzi-tile--lv2",
            "tubzi-tile--lv3"
        );
        el.style.width = "";
        el.style.maxWidth = "";
        el.style.height = "";
        el.style.justifySelf = "";
        el.style.alignSelf = "";
        var s = clampTileSpec(spec, boardCols);
        var c = boardCols || DEFAULT_BOARD_COLS;
        el.style.gridColumn = s.col + 1 + " / span " + s.spanW;
        el.style.gridRow = s.row + 1 + " / span " + s.spanH;
        el.style.backgroundPosition = s.bgX + "% " + s.bgY + "%";
    }

    function deriveOrderFromTiles(tiles) {
        if (!tiles || typeof tiles !== "object") {
            return [];
        }
        return Object.keys(tiles)
            .filter(function (k) {
                return k && tiles[k];
            })
            .sort(function (ka, kb) {
                var a = tiles[ka];
                var b = tiles[kb];
                var ra = parseInt(a.row, 10) || 0;
                var rb = parseInt(b.row, 10) || 0;
                if (ra !== rb) {
                    return ra - rb;
                }
                var ca = parseInt(a.col, 10) || 0;
                var cb = parseInt(b.col, 10) || 0;
                return ca - cb;
            });
    }

    function load() {
        try {
            var raw = localStorage.getItem(KEY);
            if (!raw) {
                return null;
            }
            var o = JSON.parse(raw);
            var tiles =
                o.tiles && typeof o.tiles === "object" ? o.tiles : null;
            var order = Array.isArray(o.order) ? o.order : [];
            if ((!order || order.length === 0) && tiles) {
                order = deriveOrderFromTiles(tiles);
            }
            if (!order || order.length === 0) {
                return null;
            }
            var normOrder = order
                .map(function (k) {
                    return String(k || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
                })
                .filter(Boolean);
            var normTiles = null;
            if (tiles) {
                normTiles = {};
                Object.keys(tiles).forEach(function (k) {
                    var nk = String(k).toLowerCase().replace(/[^a-z0-9]+/g, "");
                    if (nk && tiles[k]) {
                        normTiles[nk] = tiles[k];
                    }
                });
            }
            return {
                v: o.v || 1,
                order: normOrder,
                sizes: o.sizes && typeof o.sizes === "object" ? o.sizes : {},
                tiles: normTiles,
                boardCols: parseInt(o.boardCols, 10) || DEFAULT_BOARD_COLS
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * @param {Array<{name:string}>} allGames
     * @returns {{ index: Map, sizes: Object, tiles: Object|null, boardCols: number } | null}
     */
    function loadMergedPopularity(allGames) {
        var L = load();
        if (!L) {
            return null;
        }
        var layoutV = L.v || 1;
        var boardCols = L.boardCols || DEFAULT_BOARD_COLS;
        var index = new Map();
        L.order.forEach(function (k, i) {
            index.set(k, i);
        });
        var next = L.order.length;
        for (var i = 0; i < allGames.length; i++) {
            var k = normName(allGames[i].name);
            if (!index.has(k)) {
                index.set(k, next++);
            }
        }
        var sizes = {};
        if (L.sizes) {
            Object.keys(L.sizes).forEach(function (k) {
                var nk = String(k).toLowerCase().replace(/[^a-z0-9]+/g, "");
                var n = parseInt(L.sizes[k], 10);
                if (nk && !isNaN(n)) {
                    sizes[nk] = normalizeStoredLevel(n, layoutV);
                }
            });
        }
        var tiles = null;
        if (L.tiles && layoutV >= 3) {
            tiles = {};
            Object.keys(L.tiles).forEach(function (k) {
                var nk = String(k).toLowerCase().replace(/[^a-z0-9]+/g, "");
                if (nk && L.tiles[k]) {
                    tiles[nk] = clampTileSpec(L.tiles[k], boardCols);
                }
            });
        }
        return {
            index: index,
            sizes: sizes,
            tiles: Object.keys(tiles || {}).length ? tiles : null,
            boardCols: boardCols
        };
    }

    function save(payload) {
        var order = Array.isArray(payload.order) ? payload.order : [];
        var sizes = payload.sizes && typeof payload.sizes === "object" ? payload.sizes : {};
        var tiles = payload.tiles && typeof payload.tiles === "object" ? payload.tiles : null;
        var boardCols = parseInt(payload.boardCols, 10) || DEFAULT_BOARD_COLS;
        if (tiles && Object.keys(tiles).length) {
            order = deriveOrderFromTiles(tiles);
        }
        var obj = {
            v: LAYOUT_VERSION,
            boardCols: boardCols,
            order: order.map(function (k) {
                return String(k || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
            }).filter(Boolean),
            sizes: sizes,
            tiles: tiles || {}
        };
        localStorage.setItem(KEY, JSON.stringify(obj));
    }

    function clear() {
        localStorage.removeItem(KEY);
    }

    function sortGamesForVisualRender(list, tiles) {
        if (!tiles || !list || !list.length) {
            return list ? list.slice() : [];
        }
        var withT = [];
        var without = [];
        list.forEach(function (g) {
            var k = normName(g.name);
            if (tiles[k]) {
                withT.push(g);
            } else {
                without.push(g);
            }
        });
        withT.sort(function (a, b) {
            var ta = tiles[normName(a.name)];
            var tb = tiles[normName(b.name)];
            var ra = parseInt(ta.row, 10) || 0;
            var rb = parseInt(tb.row, 10) || 0;
            if (ra !== rb) {
                return ra - rb;
            }
            return (parseInt(ta.col, 10) || 0) - (parseInt(tb.col, 10) || 0);
        });
        return withT.concat(without);
    }

    function computeMaxTileRow(tiles) {
        if (!tiles) {
            return 0;
        }
        var m = 0;
        Object.keys(tiles).forEach(function (k) {
            var t = tiles[k];
            var bottom = (parseInt(t.row, 10) || 0) + (parseInt(t.spanH, 10) || 1);
            if (bottom > m) {
                m = bottom;
            }
        });
        return m;
    }

    global.TUBZI_LAYOUT = {
        KEY: KEY,
        LAYOUT_VERSION: LAYOUT_VERSION,
        DEFAULT_BOARD_COLS: DEFAULT_BOARD_COLS,
        MAX_SPAN: MAX_SPAN,
        TILE_LEVEL_DEFAULT: TILE_LEVEL_DEFAULT,
        TILE_LEVEL_MIN: TILE_LEVEL_MIN,
        TILE_LEVEL_MAX: TILE_LEVEL_MAX,
        normName: normName,
        clampLevel: clampLevel,
        normalizeStoredLevel: normalizeStoredLevel,
        clampTileSpec: clampTileSpec,
        applyTileLevelToCard: applyTileLevelToCard,
        applyVisualTileToCard: applyVisualTileToCard,
        deriveOrderFromTiles: deriveOrderFromTiles,
        load: load,
        save: save,
        clear: clear,
        loadMergedPopularity: loadMergedPopularity,
        sortGamesForVisualRender: sortGamesForVisualRender,
        computeMaxTileRow: computeMaxTileRow
    };
})(typeof window !== "undefined" ? window : this);

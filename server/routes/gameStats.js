const express = require("express");
const { getAuthenticatedSupabase } = require("../lib/supabaseServer");
const { recordGamePlayed, getMyGameStats } = require("../lib/gameStats");

function sendError(res, statusCode, message) {
    res.status(statusCode).json({ ok: false, error: message });
}

function createGameStatsHandlers(deps = {}) {
    const resolveAuthContext = deps.resolveAuthContext || getAuthenticatedSupabase;
    const recordGamePlayedFn = deps.recordGamePlayedFn || recordGamePlayed;
    const getMyGameStatsFn = deps.getMyGameStatsFn || getMyGameStats;

    return {
        record: async (req, res) => {
            const auth = await resolveAuthContext(req);
            if (!auth?.supabase) {
                return sendError(res, auth?.statusCode || 401, auth?.error || "Unauthorized");
            }

            try {
                const xpEarned = req.body?.xpEarned;
                const stats = await recordGamePlayedFn(auth.supabase, xpEarned);
                return res.json({ ok: true, stats });
            } catch (error) {
                return sendError(res, error?.statusCode || 500, error?.message || "Internal Server Error");
            }
        },
        me: async (req, res) => {
            const auth = await resolveAuthContext(req);
            if (!auth?.supabase) {
                return sendError(res, auth?.statusCode || 401, auth?.error || "Unauthorized");
            }

            try {
                const stats = await getMyGameStatsFn(auth.supabase);
                return res.json({ ok: true, stats });
            } catch (error) {
                return sendError(res, error?.statusCode || 500, error?.message || "Internal Server Error");
            }
        }
    };
}

function createGameStatsRouter(deps = {}) {
    const router = express.Router();
    const handlers = createGameStatsHandlers(deps);
    router.post("/record", handlers.record);
    router.get("/me", handlers.me);
    return router;
}

module.exports = {
    createGameStatsRouter,
    createGameStatsHandlers
};

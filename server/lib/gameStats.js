class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
        this.statusCode = 400;
    }
}

/**
 * @typedef {Object} GameStatsRow
 * @property {string} user_id
 * @property {number} total_xp
 * @property {number} games_played_total
 * @property {number} games_played_today
 * @property {number} current_streak_days
 * @property {number} longest_streak_days
 * @property {string|null} last_played_at
 * @property {string|null} last_played_day
 * @property {string} created_at
 * @property {string} updated_at
 */

function assertNonNegativeInteger(xpEarned) {
    if (!Number.isInteger(xpEarned) || xpEarned < 0) {
        throw new ValidationError("xpEarned must be a non-negative integer");
    }
}

/**
 * @param {{ rpc: (name: string, args?: any) => Promise<{ data: GameStatsRow|null, error: any }> }} supabase
 * @param {number} xpEarned
 * @returns {Promise<GameStatsRow>}
 */
async function recordGamePlayed(supabase, xpEarned) {
    assertNonNegativeInteger(xpEarned);

    const { data, error } = await supabase.rpc("record_game_played", { xp_earned: xpEarned });
    if (error) {
        const err = new Error(error.message || "Failed to record game played");
        err.statusCode = 500;
        throw err;
    }
    return data;
}

/**
 * @param {{ rpc: (name: string, args?: any) => Promise<{ data: GameStatsRow|null, error: any }> }} supabase
 * @returns {Promise<GameStatsRow>}
 */
async function getMyGameStats(supabase) {
    const { data, error } = await supabase.rpc("get_my_game_stats");
    if (error) {
        const err = new Error(error.message || "Failed to fetch game stats");
        err.statusCode = 500;
        throw err;
    }
    return data;
}

module.exports = {
    ValidationError,
    recordGamePlayed,
    getMyGameStats
};

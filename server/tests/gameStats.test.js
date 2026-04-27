const test = require("node:test");
const assert = require("node:assert/strict");

const { recordGamePlayed } = require("../lib/gameStats");
const { createGameStatsHandlers } = require("../routes/gameStats");

function createMockRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}

test("recordGamePlayed rejects negative xp", async () => {
    const fakeSupabase = { rpc: async () => ({ data: null, error: null }) };
    await assert.rejects(
        async () => recordGamePlayed(fakeSupabase, -1),
        /non-negative integer/
    );
});

test("recordGamePlayed calls record_game_played RPC with xp_earned", async () => {
    const calls = [];
    const fakeStats = { user_id: "u1", total_xp: 42 };
    const fakeSupabase = {
        rpc: async (name, args) => {
            calls.push({ name, args });
            return { data: fakeStats, error: null };
        }
    };

    const result = await recordGamePlayed(fakeSupabase, 7);
    assert.equal(result, fakeStats);
    assert.deepEqual(calls, [
        { name: "record_game_played", args: { xp_earned: 7 } }
    ]);
});

test("game stats handlers return 401 when unauthenticated", async () => {
    const handlers = createGameStatsHandlers({
        resolveAuthContext: async () => ({ error: "Unauthorized", statusCode: 401 })
    });
    const req = { headers: {}, body: { xpEarned: 5 } };
    const res = createMockRes();

    await handlers.record(req, res);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { ok: false, error: "Unauthorized" });
});

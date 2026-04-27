export type GameStatsRow = {
    user_id: string;
    total_xp: number;
    games_played_total: number;
    games_played_today: number;
    current_streak_days: number;
    longest_streak_days: number;
    last_played_at: string | null;
    last_played_day: string | null;
    created_at: string;
    updated_at: string;
};

export declare function recordGamePlayed(
    supabase: { rpc: (name: string, args?: unknown) => Promise<{ data: GameStatsRow | null; error: unknown }> },
    xpEarned: number
): Promise<GameStatsRow>;

export declare function getMyGameStats(
    supabase: { rpc: (name: string, args?: unknown) => Promise<{ data: GameStatsRow | null; error: unknown }> }
): Promise<GameStatsRow>;

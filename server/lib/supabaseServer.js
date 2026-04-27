const { createClient } = require("@supabase/supabase-js");

const EXPECTED_PROJECT_REF = "cheymdspanxzjjtzppat";

function getSupabaseEnv() {
    const url =
        process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        "https://cheymdspanxzjjtzppat.supabase.co";
    const anonKey =
        process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "sb_publishable_tAcqEpAgeI5NFhqg9AoH5Q_LtUdFt27";
    return { url, anonKey };
}

function warnIfUnexpectedProject(url) {
    if (!url) {
        return;
    }
    try {
        const parsed = new URL(url);
        const actualRef = parsed.hostname.split(".")[0];
        if (actualRef !== EXPECTED_PROJECT_REF) {
            console.warn(
                `[TubZi] Supabase project mismatch: expected ${EXPECTED_PROJECT_REF}, got ${actualRef}.`
            );
        }
    } catch (error) {
        console.warn("[TubZi] SUPABASE_URL is invalid:", error.message);
    }
}

function getBearerToken(req) {
    const raw = req?.headers?.authorization || "";
    const match = raw.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : "";
}

function createAuthedClient(url, anonKey, token) {
    return createClient(url, anonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
}

async function getAuthenticatedSupabase(req) {
    const token = getBearerToken(req);
    if (!token) {
        return { error: "Missing bearer token" };
    }

    const { url, anonKey } = getSupabaseEnv();
    if (!url || !anonKey) {
        return { error: "Server missing SUPABASE_URL or SUPABASE_ANON_KEY", statusCode: 500 };
    }

    const anonClient = createClient(url, anonKey);
    const { data, error } = await anonClient.auth.getUser(token);
    if (error || !data?.user) {
        return { error: "Unauthorized", statusCode: 401 };
    }

    const supabase = createAuthedClient(url, anonKey, token);
    return { supabase, user: data.user, token };
}

module.exports = {
    EXPECTED_PROJECT_REF,
    getSupabaseEnv,
    warnIfUnexpectedProject,
    getAuthenticatedSupabase
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
    window.__SUPABASE_URL ||
    document.querySelector('meta[name="supabase-url"]')?.content ||
    "https://cheymdspanxzjjtzppat.supabase.co";

const SUPABASE_ANON_KEY =
    window.__SUPABASE_ANON_KEY ||
    document.querySelector('meta[name="supabase-anon-key"]')?.content ||
    "sb_publishable_tAcqEpAgeI5NFhqg9AoH5Q_LtUdFt27";

function getStatsApiUrl() {
    const configuredOrigin =
        window.__TUBZI_STATS_API_ORIGIN ||
        window.__TUBZI_PRODUCTION_API__ ||
        "";
    if (!configuredOrigin) {
        return "/api/game-stats/me";
    }
    return configuredOrigin.replace(/\/+$/, "") + "/api/game-stats/me";
}

const PROFILE_ICON = `
<svg class="auth-profile-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"/>
</svg>`;
const GOOGLE_CLIENT_ID = "445218204515-evshemlmucki5etaqs4qp6npmn4vo5fo.apps.googleusercontent.com";

const authProfileBtn = document.getElementById("authProfileBtn");
const authPopover = document.getElementById("authPopover");

function renderFallbackProfile() {
    if (authProfileBtn) {
        authProfileBtn.innerHTML = PROFILE_ICON;
    }
}

if (!authProfileBtn || !authPopover) {
    console.warn("Auth UI placeholders not found on this page.");
} else if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    renderFallbackProfile();
} else {
    renderFallbackProfile();

    window.supabase =
        window.supabase ||
        createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });

    let currentUser = null;
    let currentSession = null;
    let popoverOpen = false;
    let authMode = "signin";
    let gisReady = false;
    let statsRequestId = 0;
    let profileStatsState = {
        userId: null,
        loading: false,
        error: "",
        stats: null
    };

    function getUserDisplayName(user) {
        return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "TubZi Player";
    }

    function getEmptyStats() {
        return {
            streak: 0,
            xp: 0,
            gamesToday: 0,
            gamesLifetime: 0
        };
    }

    function mapStatsRowToUi(statsRow) {
        const fallback = getEmptyStats();
        if (!statsRow || typeof statsRow !== "object") {
            return fallback;
        }
        return {
            streak: Number(statsRow.current_streak_days) || 0,
            xp: Number(statsRow.total_xp) || 0,
            gamesToday: Number(statsRow.games_played_today) || 0,
            gamesLifetime: Number(statsRow.games_played_total) || 0
        };
    }

    async function loadServerStatsForCurrentUser() {
        if (!currentUser?.id) {
            return;
        }
        const userId = currentUser.id;
        const requestId = ++statsRequestId;
        profileStatsState = {
            userId,
            loading: true,
            error: "",
            stats: profileStatsState.userId === userId ? profileStatsState.stats : null
        };
        if (popoverOpen) {
            renderPopover();
        }

        try {
            let accessToken = currentSession?.access_token || "";
            if (!accessToken) {
                const { data } = await window.supabase.auth.getSession();
                currentSession = data?.session || null;
                accessToken = currentSession?.access_token || "";
            }
            if (!accessToken) {
                throw new Error("Missing authenticated session");
            }

            const response = await fetch(getStatsApiUrl(), {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload?.ok) {
                throw new Error(payload?.error || "Failed to load game stats");
            }
            if (requestId !== statsRequestId) {
                return;
            }
            profileStatsState = {
                userId,
                loading: false,
                error: "",
                stats: mapStatsRowToUi(payload.stats)
            };
        } catch (error) {
            if (requestId !== statsRequestId) {
                return;
            }
            profileStatsState = {
                userId,
                loading: false,
                error: error?.message || "Failed to load game stats",
                stats: getEmptyStats()
            };
        }

        if (popoverOpen && currentUser?.id === userId) {
            renderPopover();
        }
    }

    async function onGoogleCredential(res) {
        const { error } = await window.supabase.auth.signInWithIdToken({
            provider: "google",
            token: res.credential
        });
        if (error) {
            alert("Sign-in failed: " + error.message);
            return;
        }
        window.TubZiAuth?.closePopover?.();
    }

    function prepareGoogleButtons() {
        document
            .querySelectorAll('[data-google-signin], .google-signin-btn, .sidebar-google-btn, #authGoogleBtn, .auth-google-btn')
            .forEach((el) => {
                if (el.matches("[data-gsi-button]")) {
                    return;
                }
                el.innerHTML = '<div class="auth-gsi-slot"><div data-gsi-button></div></div>';
            });
    }

    function renderGoogleButtons() {
        if (!gisReady || !window.google?.accounts?.id) {
            return;
        }
        document.querySelectorAll("[data-gsi-button]").forEach((el) => {
            el.innerHTML = "";
            window.google.accounts.id.renderButton(el, {
                theme: "outline",
                size: "large",
                text: "signin_with",
                shape: "rectangular",
                width: 252
            });
        });
    }

    function initGoogle() {
        if (!window.google?.accounts?.id) {
            setTimeout(initGoogle, 100);
            return;
        }
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            ux_mode: "popup",
            callback: onGoogleCredential
        });
        gisReady = true;
        prepareGoogleButtons();
        renderGoogleButtons();
    }

    function renderAuthCardSignedOut() {
        authPopover.innerHTML = `
            <div class="auth-card">
                <div class="auth-tabs" role="tablist" aria-label="Auth tabs">
                    <button type="button" class="auth-tab ${authMode === "signin" ? "auth-tab--active" : ""}" id="authSignInTab" role="tab" aria-selected="${authMode === "signin"}">Sign in</button>
                    <button type="button" class="auth-tab ${authMode === "signup" ? "auth-tab--active" : ""}" id="authCreateTab" role="tab" aria-selected="${authMode === "signup"}">Create account</button>
                </div>
                <div class="auth-gsi-slot"><div data-gsi-button></div></div>
                <div class="auth-or">or</div>
                <form data-tubzi-signin-form>
                    <input type="email" class="auth-field" id="authEmailInput" placeholder="Email" aria-label="Email">
                    <input type="password" class="auth-field" id="authPasswordInput" placeholder="Password" aria-label="Password">
                    <button type="submit" class="auth-primary-btn tubzi-signin-btn" id="authEmailSubmitBtn">${authMode === "signup" ? "Create account" : "Sign in"}</button>
                    <div class="auth-status tubzi-auth-msg" id="authStatus" aria-live="polite"></div>
                </form>
            </div>
        `;

        renderGoogleButtons();

        const signInTab = document.getElementById("authSignInTab");
        const createTab = document.getElementById("authCreateTab");
        const signInForm = authPopover.querySelector('[data-tubzi-signin-form]');

        if (signInTab) {
            signInTab.addEventListener("click", () => {
                authMode = "signin";
                renderAuthCardSignedOut();
            });
        }

        if (createTab) {
            createTab.addEventListener("click", () => {
                authMode = "signup";
                renderAuthCardSignedOut();
            });
        }

        if (signInForm) {
            signInForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const email = signInForm.querySelector('input[type="email"]').value.trim();
                const password = signInForm.querySelector('input[type="password"]').value;
                const msgEl =
                    signInForm.querySelector(".tubzi-auth-msg") ||
                    (() => {
                        const el = document.createElement("div");
                        el.className = "tubzi-auth-msg";
                        signInForm.appendChild(el);
                        return el;
                    })();
                const btn = signInForm.querySelector('button[type="submit"], .tubzi-signin-btn');

                if (!email || !password) {
                    msgEl.textContent = "Please enter email and password.";
                    msgEl.style.color = "#ff6b6b";
                    return;
                }

                if (btn) {
                    btn.disabled = true;
                }
                const originalText = btn ? btn.textContent : "";
                if (btn) {
                    btn.textContent = authMode === "signup" ? "Creating account..." : "Signing in...";
                }
                msgEl.textContent = "";

                let error = null;
                if (authMode === "signup") {
                    const result = await window.supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            emailRedirectTo: window.location.origin
                        }
                    });
                    error = result.error;
                    if (!error && !result.data?.session) {
                        const signInResult = await window.supabase.auth.signInWithPassword({ email, password });
                        error = signInResult.error;
                    }
                } else {
                    const result = await window.supabase.auth.signInWithPassword({ email, password });
                    error = result.error;
                }

                if (btn) {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }

                if (error) {
                    msgEl.textContent = error.message;
                    msgEl.style.color = "#ff6b6b";
                    return;
                }

                msgEl.textContent = authMode === "signup" ? "Account created and signed in!" : "Signed in!";
                msgEl.style.color = "#4ade80";
                window.TubZiAuth?.closePopover?.();
            });
        }
    }

    function renderAuthCardSignedIn() {
        const isStatsLoading = profileStatsState.loading && profileStatsState.userId === currentUser?.id;
        const stats = profileStatsState.userId === currentUser?.id
            ? mapStatsRowToUi(profileStatsState.stats)
            : getEmptyStats();
        const initial = String(getUserDisplayName(currentUser) || "U").trim().charAt(0).toLowerCase() || "u";
        const streakValue = isStatsLoading ? "..." : stats.streak;
        const xpValue = isStatsLoading ? "..." : stats.xp;
        const statsNote = isStatsLoading
            ? "Loading stats..."
            : (profileStatsState.error ? "Could not load latest stats" : "");
        authPopover.innerHTML = `
            <div class="auth-card auth-card--profile">
                <div class="auth-profile-head">
                    ${currentUser?.user_metadata?.avatar_url
                        ? `<img class="auth-profile-head-avatar-img" src="${currentUser.user_metadata.avatar_url}" alt="Profile avatar" referrerpolicy="no-referrer">`
                        : `<div class="auth-profile-head-avatar">${initial}</div>`
                    }
                    <div class="auth-profile-head-meta">
                        <div class="auth-user-name">${getUserDisplayName(currentUser)}</div>
                        <div class="auth-user-email">${currentUser?.email || ""}</div>
                    </div>
                </div>
                <div class="auth-stats-grid">
                    <div class="auth-stat-tile">
                        <div class="auth-stat-label">Streak</div>
                        <div class="auth-stat-value auth-stat-value--streak">🔥 ${streakValue}</div>
                        <div class="auth-stat-sub">day streak</div>
                    </div>
                    <div class="auth-stat-tile">
                        <div class="auth-stat-label">XP</div>
                        <div class="auth-stat-value auth-stat-value--xp">⚡ ${xpValue}</div>
                        <div class="auth-stat-sub">total XP</div>
                    </div>
                </div>
                <div class="auth-stats-mini">
                    <div class="auth-stats-mini-row">
                        <span class="auth-stats-mini-label">Played today</span>
                        <span class="auth-stats-mini-value">${isStatsLoading ? "..." : stats.gamesToday}</span>
                    </div>
                    <div class="auth-stats-mini-row">
                        <span class="auth-stats-mini-label">Lifetime plays</span>
                        <span class="auth-stats-mini-value">${isStatsLoading ? "..." : stats.gamesLifetime}</span>
                    </div>
                </div>
                ${statsNote ? `<div class="auth-status" style="margin-top:8px;">${statsNote}</div>` : ""}
                <button type="button" class="auth-signout-btn" id="authPopoverSignOutBtn">Sign out</button>
            </div>
        `;

        const popoverSignOutButton = document.getElementById("authPopoverSignOutBtn");
        if (popoverSignOutButton) {
            popoverSignOutButton.addEventListener("click", async () => {
                await window.supabase.auth.signOut();
                closePopover();
            });
        }
    }

    function renderPopover() {
        if (!currentUser) {
            renderAuthCardSignedOut();
            return;
        }
        renderAuthCardSignedIn();
    }

    function renderProfileButton() {
        if (currentUser?.user_metadata?.avatar_url) {
            authProfileBtn.innerHTML = `<img class="auth-profile-avatar" src="${currentUser.user_metadata.avatar_url}" alt="Profile avatar" referrerpolicy="no-referrer">`;
            return;
        }
        authProfileBtn.innerHTML = PROFILE_ICON;
    }

    function openPopover() {
        popoverOpen = true;
        authPopover.hidden = false;
        renderPopover();
    }

    function closePopover() {
        popoverOpen = false;
        authPopover.hidden = true;
    }

    function renderAuthUI(session) {
        const previousUserId = currentUser?.id || null;
        currentSession = session || null;
        currentUser = session?.user || null;
        const nextUserId = currentUser?.id || null;
        if (!nextUserId) {
            profileStatsState = { userId: null, loading: false, error: "", stats: null };
        } else if (previousUserId !== nextUserId) {
            profileStatsState = { userId: nextUserId, loading: false, error: "", stats: null };
            loadServerStatsForCurrentUser().catch(() => {});
        } else if (!profileStatsState.stats && !profileStatsState.loading) {
            loadServerStatsForCurrentUser().catch(() => {});
        }
        renderProfileButton();
        if (popoverOpen) {
            renderPopover();
        }
    }

    window.TubZiAuth = window.TubZiAuth || {};
    window.TubZiAuth.closePopover = closePopover;
    window.TubZiAuth.renderAuthUI = renderAuthUI;
    window.TubZiAuth.renderGoogleButtons = renderGoogleButtons;

    authProfileBtn.addEventListener("click", () => {
        if (popoverOpen) {
            closePopover();
        } else {
            openPopover();
        }
    });

    initGoogle();

    window.supabase.auth.onAuthStateChange((_event, session) => {
        window.TubZiAuth?.renderAuthUI?.(session);
    });

    window.supabase.auth.getSession().then(({ data }) => {
        window.TubZiAuth?.renderAuthUI?.(data.session);
    }).catch((error) => {
        console.error("Supabase session check failed", error);
        renderProfileButton();
    });

    renderPopover();
}

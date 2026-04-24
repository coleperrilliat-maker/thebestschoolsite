import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
    window.__SUPABASE_URL ||
    document.querySelector('meta[name="supabase-url"]')?.content ||
    "https://gvvowenjfiiruyzncigb.supabase.co";

const SUPABASE_ANON_KEY =
    window.__SUPABASE_ANON_KEY ||
    document.querySelector('meta[name="supabase-anon-key"]')?.content ||
    "sb_publishable_noeSDPOFwrIUXBpBiisrQg_tHtnN8aR";

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
    let popoverOpen = false;
    let authMode = "signin";
    let gisReady = false;

    function getUserDisplayName(user) {
        return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "TubZi Player";
    }

    function getPlaceholderStats() {
        return {
            streak: 7,
            xp: 1430,
            gamesToday: 5,
            gamesLifetime: 268
        };
    }

    function getStatsStorageKey(user) {
        const userKey = user?.id || user?.email || "guest";
        return `tubzi_local_stats_${userKey}`;
    }

    function randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getLocalVisualStats(user) {
        const fallback = getPlaceholderStats();
        const key = getStatsStorageKey(user);
        const today = new Date().toISOString().slice(0, 10);

        let stats = null;
        try {
            stats = JSON.parse(window.localStorage.getItem(key) || "null");
        } catch (error) {
            stats = null;
        }

        if (!stats || typeof stats !== "object") {
            stats = {
                streak: randomInRange(3, 14),
                xp: randomInRange(600, 3200),
                gamesToday: randomInRange(1, 6),
                gamesLifetime: randomInRange(80, 520),
                lastSeenDate: today
            };
        } else if (stats.lastSeenDate !== today) {
            stats.streak = randomInRange(1, Math.max(1, Number(stats.streak) + 1));
            stats.gamesToday = randomInRange(1, 4);
            stats.lastSeenDate = today;
        }

        stats.xp = Number(stats.xp) || fallback.xp;
        stats.gamesToday = Number(stats.gamesToday) || fallback.gamesToday;
        stats.gamesLifetime = Number(stats.gamesLifetime) || fallback.gamesLifetime;
        stats.streak = Number(stats.streak) || fallback.streak;

        try {
            window.localStorage.setItem(key, JSON.stringify(stats));
        } catch (error) {
            /* ignore storage failures */
        }

        return stats;
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
        const stats = getLocalVisualStats(currentUser);
        authPopover.innerHTML = `
            <div class="auth-card">
                <div class="auth-user-name">${getUserDisplayName(currentUser)}</div>
                <div class="auth-user-email">${currentUser?.email || ""}</div>
                <div class="auth-stats-grid">
                    <div class="auth-stat-tile">
                        <div class="auth-stat-label">🔥 Streak</div>
                        <div class="auth-stat-value">${stats.streak} days</div>
                    </div>
                    <div class="auth-stat-tile">
                        <div class="auth-stat-label">⭐ XP</div>
                        <div class="auth-stat-value">${stats.xp.toLocaleString()}</div>
                    </div>
                    <div class="auth-stat-tile">
                        <div class="auth-stat-label">🎮 Played today</div>
                        <div class="auth-stat-value">${stats.gamesToday}</div>
                    </div>
                    <div class="auth-stat-tile">
                        <div class="auth-stat-label">🏆 Lifetime plays</div>
                        <div class="auth-stat-value">${stats.gamesLifetime.toLocaleString()}</div>
                    </div>
                </div>
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
        currentUser = session?.user || null;
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

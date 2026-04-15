/**
 * TubZi game audio mute: shared by play.html and standalone games/*.html.
 * Uses localStorage key tubzi-game-audio-muted (same as play bar).
 */
(function (global) {
    "use strict";

    var GAME_AUDIO_MUTE_KEY = "tubzi-game-audio-muted";

    function readGameAudioMuted() {
        try {
            return localStorage.getItem(GAME_AUDIO_MUTE_KEY) === "1";
        } catch {
            return false;
        }
    }

    function writeGameAudioMuted(on) {
        try {
            localStorage.setItem(GAME_AUDIO_MUTE_KEY, on ? "1" : "0");
        } catch {
            /* ignore */
        }
    }

    function setMutedOnFrameElement(el, muted) {
        if (!el) {
            return;
        }
        try {
            el.muted = muted;
        } catch {
            /* ignore */
        }
        try {
            if (muted) {
                el.setAttribute("muted", "");
            } else {
                el.removeAttribute("muted");
            }
        } catch {
            /* ignore */
        }
    }

    function descendIframeTree(el, muted, depth) {
        if (!el || depth > 10) {
            return;
        }
        setMutedOnFrameElement(el, muted);
        var doc = null;
        try {
            doc = el.contentDocument || (el.contentWindow && el.contentWindow.document);
        } catch {
            doc = null;
        }
        if (!doc) {
            return;
        }
        doc.querySelectorAll("video, audio").forEach(function (m) {
            m.muted = muted;
            m.defaultMuted = muted;
            if (muted) {
                m.volume = 0;
            } else {
                try {
                    m.volume = 1;
                } catch {
                    /* ignore */
                }
            }
        });
        doc.querySelectorAll("iframe").forEach(function (child) {
            descendIframeTree(child, muted, depth + 1);
        });
    }

    function applyGameAudioMuted(muted, rootEl) {
        var root = rootEl;
        if (root && String(root.tagName || "").toUpperCase() === "IFRAME") {
            descendIframeTree(root, muted, 0);
            return;
        }
        var scope = root && root.nodeType === 1 ? root : document.body;
        if (!scope) {
            return;
        }
        scope.querySelectorAll("video, audio").forEach(function (m) {
            m.muted = muted;
            m.defaultMuted = muted;
            if (muted) {
                m.volume = 0;
            } else {
                try {
                    m.volume = 1;
                } catch {
                    /* ignore */
                }
            }
        });
        scope.querySelectorAll("iframe").forEach(function (frame) {
            descendIframeTree(frame, muted, 0);
        });
    }

    function scheduleGameAudioMutePasses(rootEl) {
        var muted = readGameAudioMuted();
        applyGameAudioMuted(muted, rootEl);
        [120, 500, 1500, 3200].forEach(function (ms) {
            setTimeout(function () {
                applyGameAudioMuted(readGameAudioMuted(), rootEl);
            }, ms);
        });
    }

    function syncGameMuteButton(btn) {
        btn = btn || document.getElementById("btnGameMute") || document.getElementById("tubziGameMuteFloat");
        if (!btn) {
            return;
        }
        var on = readGameAudioMuted();
        btn.classList.toggle("is-muted", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.setAttribute("aria-label", on ? "Unmute game audio" : "Mute game audio");
        btn.title = on ? "Unmute game" : "Mute game";
    }

    function injectFloatStyles() {
        if (document.getElementById("tubzi-game-audio-mute-styles")) {
            return;
        }
        var s = document.createElement("style");
        s.id = "tubzi-game-audio-mute-styles";
        s.textContent =
            "#tubziGameMuteFloat.tubzi-game-mute-float{position:fixed;z-index:2147483000;" +
            "bottom:max(14px,env(safe-area-inset-bottom,0px));right:max(14px,env(safe-area-inset-right,0px));" +
            "width:46px;height:46px;border:none;border-radius:12px;cursor:pointer;display:flex;" +
            "align-items:center;justify-content:center;background:transparent;color:#ff6a00;" +
            "box-shadow:0 2px 12px rgba(0,0,0,.35);transition:background .15s ease,opacity .15s ease}" +
            "#tubziGameMuteFloat.tubzi-game-mute-float:hover{background:rgba(255,106,0,.16)}" +
            "#tubziGameMuteFloat.tubzi-game-mute-float svg{width:24px;height:24px}" +
            "#tubziGameMuteFloat .mute-btn__slash{opacity:0;transition:opacity .15s ease}" +
            "#tubziGameMuteFloat.is-muted .mute-btn__slash{opacity:1}" +
            "#tubziGameMuteFloat.is-muted .mute-waves{opacity:.35}";
        document.head.appendChild(s);
    }

    var FLOAT_SVG =
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path stroke-linecap="round" stroke-linejoin="round" d="M11 5L6 9H2v6h4l5 4V5z"/>' +
        '<path class="mute-waves" stroke-linecap="round" stroke-linejoin="round" d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/>' +
        '<path class="mute-btn__slash" stroke-linecap="round" d="M3 3l18 18"/>' +
        "</svg>";

    function mountFloatingMute() {
        if (document.getElementById("btnGameMute")) {
            return;
        }
        if (document.getElementById("tubziGameMuteFloat")) {
            return;
        }
        if (!document.body) {
            return;
        }
        injectFloatStyles();
        var btn = document.createElement("button");
        btn.type = "button";
        btn.id = "tubziGameMuteFloat";
        btn.className = "tubzi-game-mute-float";
        btn.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-label", "Mute game audio");
        btn.title = "Mute game";
        btn.innerHTML = FLOAT_SVG;
        document.body.appendChild(btn);
        btn.addEventListener("click", function () {
            var next = !readGameAudioMuted();
            writeGameAudioMuted(next);
            scheduleGameAudioMutePasses(null);
            syncGameMuteButton(btn);
        });
        syncGameMuteButton(btn);
    }

    function wirePlayPage(gameFrame) {
        if (!gameFrame) {
            return;
        }
        gameFrame.addEventListener("load", function () {
            scheduleGameAudioMutePasses(gameFrame);
            syncGameMuteButton();
        });
        var btn = document.getElementById("btnGameMute");
        if (btn) {
            btn.addEventListener("click", function () {
                var next = !readGameAudioMuted();
                writeGameAudioMuted(next);
                scheduleGameAudioMutePasses(gameFrame);
                syncGameMuteButton(btn);
            });
        }
        syncGameMuteButton(btn);
    }

    function startMutationObserver() {
        if (!document.body || typeof MutationObserver === "undefined") {
            return;
        }
        try {
            var obs = new MutationObserver(function () {
                if (readGameAudioMuted()) {
                    var gf = document.getElementById("gameFrame");
                    applyGameAudioMuted(true, gf || null);
                }
            });
            obs.observe(document.body, { childList: true, subtree: true });
        } catch {
            /* ignore */
        }
    }

    function init() {
        var gameFrame = document.getElementById("gameFrame");
        var barBtn = document.getElementById("btnGameMute");
        if (gameFrame && barBtn) {
            wirePlayPage(gameFrame);
            startMutationObserver();
            return;
        }
        if (!document.body) {
            document.addEventListener("DOMContentLoaded", init, { once: true });
            return;
        }
        mountFloatingMute();
        startMutationObserver();
        function runPasses() {
            scheduleGameAudioMutePasses(null);
        }
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", runPasses);
        } else {
            runPasses();
        }
        global.addEventListener("load", runPasses);
    }

    global.TubziGameAudioMute = {
        key: GAME_AUDIO_MUTE_KEY,
        read: readGameAudioMuted,
        write: writeGameAudioMuted,
        apply: applyGameAudioMuted,
        schedule: scheduleGameAudioMutePasses,
        syncButton: syncGameMuteButton,
        init: init,
        wirePlayPage: wirePlayPage
    };

    init();
})(typeof window !== "undefined" ? window : this);

(function () {
    var STORAGE_KEY = "tubzi_tubchat_intro_seen_v1";
    var ALLOWED_PAGES = { home: true, "all-games": true };
    var page = document.body && document.body.getAttribute("data-tubzi-page");
    if (!ALLOWED_PAGES[page]) {
        return;
    }

    try {
        if (window.localStorage.getItem(STORAGE_KEY) === "1") {
            return;
        }
    } catch (_e) {
        return;
    }

    var layer = document.getElementById("tubchatIntroLayer");
    if (!layer) {
        return;
    }

    var dismissBtn = document.getElementById("tubchatIntroDismiss");
    var showBtn = document.getElementById("tubchatIntroShow");
    var prevOverflow = "";

    function rememberSeen() {
        try {
            window.localStorage.setItem(STORAGE_KEY, "1");
        } catch (_err) {
            /* ignore private mode */
        }
    }

    function close() {
        layer.hidden = true;
        document.body.style.overflow = prevOverflow;
        rememberSeen();
    }

    function open() {
        layer.hidden = false;
        prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        requestAnimationFrame(function () {
            if (dismissBtn) {
                dismissBtn.focus();
            }
        });
    }

    function highlightTubchatButton() {
        var target =
            document.querySelector('.rail-nav-item[data-nav-id="tubchat-dock"]') ||
            document.querySelector('.play-header-btn[data-play-action="tubchat"]');
        if (!target) {
            return;
        }
        target.classList.add("tubchat-intro-target");
        setTimeout(function () {
            target.classList.remove("tubchat-intro-target");
        }, 3200);
    }

    function showWhereTubchatIs() {
        close();
        var target =
            document.querySelector('.rail-nav-item[data-nav-id="tubchat-dock"]') ||
            document.querySelector('.play-header-btn[data-play-action="tubchat"]');
        if (target && typeof target.click === "function") {
            target.click();
        }
        setTimeout(highlightTubchatButton, 120);
    }

    if (dismissBtn) {
        dismissBtn.addEventListener("click", close);
    }
    if (showBtn) {
        showBtn.addEventListener("click", showWhereTubchatIs);
    }

    layer.querySelectorAll("[data-tubchat-intro-dismiss]").forEach(function (el) {
        el.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !layer.hidden) {
            close();
        }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", open);
    } else {
        open();
    }
})();

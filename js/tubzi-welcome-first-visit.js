(function () {
    var STORAGE_KEY = "tubzi_welcome_seen_v1";

    if (document.body.getAttribute("data-tubzi-page") !== "home") {
        return;
    }

    try {
        if (window.localStorage.getItem(STORAGE_KEY) === "1") {
            return;
        }
    } catch (e) {
        return;
    }

    var layer = document.getElementById("welcomeFirstLayer");
    var btn = document.getElementById("welcomeFirstDismiss");
    if (!layer || !btn) {
        return;
    }

    var prevOverflow = "";

    function close() {
        layer.hidden = true;
        document.body.style.overflow = prevOverflow;
        try {
            window.localStorage.setItem(STORAGE_KEY, "1");
        } catch (err) {
            /* ignore private mode */
        }
    }

    function open() {
        layer.hidden = false;
        prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        requestAnimationFrame(function () {
            btn.focus();
        });
    }

    btn.addEventListener("click", close);

    layer.querySelectorAll("[data-welcome-dismiss]").forEach(function (el) {
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

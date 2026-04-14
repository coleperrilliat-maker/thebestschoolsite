(function () {
    var layer = document.getElementById("tallyGameIssueLayer");
    var dialog = document.getElementById("tallyGameIssueDialog");
    var openBtn = document.getElementById("btnOpenTallyIssue");
    var iframe = document.getElementById("tallyIssueIframe");
    var titleEl = document.getElementById("tallyIssuePanelTitle");
    var dragHandle = layer && layer.querySelector("[data-tally-issue-drag]");

    var TALLY_FORM_ID = "eq7pKo";

    if (!layer || !dialog || !openBtn || !iframe || !dragHandle) {
        return;
    }

    var prevBodyOverflow = "";
    var dragging = false;
    var startX = 0;
    var startY = 0;
    var origLeft = 0;
    var origTop = 0;

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    function currentGameName() {
        var el = document.getElementById("actionTitle");
        var t = el && el.textContent ? el.textContent.trim() : "";
        return t || "Game";
    }

    function issueEmbedUrl() {
        var u = new URL("https://tally.so/embed/" + TALLY_FORM_ID);
        u.searchParams.set("alignLeft", "1");
        u.searchParams.set("dynamicHeight", "1");
        u.searchParams.set("transparentBackground", "1");
        u.searchParams.set("hideTitle", "1");
        var name = currentGameName();
        if (name) {
            u.searchParams.set("game_name", name);
        }
        return u.toString();
    }

    function withTallyReady(cb) {
        if (typeof Tally !== "undefined" && typeof Tally.loadEmbeds === "function") {
            cb();
            return;
        }
        var src = "https://tally.so/widgets/embed.js";
        var existing = document.querySelector('script[src="' + src + '"]');
        function run() {
            if (typeof Tally !== "undefined" && Tally.loadEmbeds) {
                cb();
            }
        }
        if (existing) {
            existing.addEventListener("load", run);
            run();
            return;
        }
        var s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = run;
        document.head.appendChild(s);
    }

    function centerDialog() {
        var w = dialog.offsetWidth;
        var h = dialog.offsetHeight;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var pad = 12;
        dialog.style.left = clamp((vw - w) / 2, pad, vw - w - pad) + "px";
        dialog.style.top = clamp((vh - h) / 2, pad, vh - h - pad) + "px";
    }

    function openPop() {
        var g = currentGameName();
        if (titleEl) {
            titleEl.textContent = "Report an issue — " + g;
        }
        iframe.removeAttribute("src");
        iframe.setAttribute("data-tally-src", issueEmbedUrl());
        iframe.setAttribute("height", "200");
        layer.hidden = false;
        prevBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        withTallyReady(function () {
            Tally.loadEmbeds();
            requestAnimationFrame(function () {
                centerDialog();
                dialog.focus();
            });
        });
    }

    function closePop() {
        layer.hidden = true;
        document.body.style.overflow = prevBodyOverflow;
        iframe.removeAttribute("data-tally-src");
        iframe.removeAttribute("src");
        openBtn.focus();
    }

    openBtn.addEventListener("click", function () {
        openPop();
    });

    layer.querySelectorAll("[data-tally-issue-close]").forEach(function (el) {
        el.addEventListener("click", function () {
            closePop();
        });
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !layer.hidden) {
            closePop();
        }
    });

    window.addEventListener("message", function (e) {
        if (layer.hidden || e.origin !== "https://tally.so") {
            return;
        }
        if (typeof e.data !== "string" || e.data.indexOf("Tally.") === -1) {
            return;
        }
        if (e.data.indexOf("Tally.FormLoaded") !== -1 || e.data.indexOf("Tally.FormPageView") !== -1) {
            requestAnimationFrame(centerDialog);
        }
    });

    window.addEventListener("resize", function () {
        if (!layer.hidden) {
            var rect = dialog.getBoundingClientRect();
            var pad = 8;
            var vw = window.innerWidth;
            var vh = window.innerHeight;
            var left = parseFloat(dialog.style.left) || rect.left;
            var top = parseFloat(dialog.style.top) || rect.top;
            dialog.style.left = clamp(left, pad, vw - rect.width - pad) + "px";
            dialog.style.top = clamp(top, pad, vh - rect.height - pad) + "px";
        }
    });

    dragHandle.addEventListener("pointerdown", function (e) {
        if (e.target.closest(".tally-mini-browser__close")) {
            return;
        }
        if (e.button !== 0) {
            return;
        }
        dragging = true;
        dialog.classList.add("tally-mini-browser--dragging");
        var rect = dialog.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        origLeft = rect.left;
        origTop = rect.top;
        dialog.style.left = origLeft + "px";
        dialog.style.top = origTop + "px";
        dragHandle.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    dragHandle.addEventListener("pointermove", function (e) {
        if (!dragging) {
            return;
        }
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        var rect = dialog.getBoundingClientRect();
        var w = rect.width;
        var h = rect.height;
        var pad = 8;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var left = origLeft + dx;
        var top = origTop + dy;
        dialog.style.left = clamp(left, pad, vw - w - pad) + "px";
        dialog.style.top = clamp(top, pad, vh - h - pad) + "px";
    });

    function endDrag(e) {
        if (!dragging) {
            return;
        }
        dragging = false;
        dialog.classList.remove("tally-mini-browser--dragging");
        try {
            dragHandle.releasePointerCapture(e.pointerId);
        } catch (err) {
            /* ignore */
        }
    }

    dragHandle.addEventListener("pointerup", endDrag);
    dragHandle.addEventListener("pointercancel", endDrag);
})();

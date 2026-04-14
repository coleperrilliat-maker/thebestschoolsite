(function () {
    var layer = document.getElementById("tallyGameRequestLayer");
    var dialog = document.getElementById("tallyGameRequestDialog");
    var openBtn = document.getElementById("btnOpenTallyRequest");
    var iframe = document.getElementById("tallyRequestIframe");
    var dragHandle = layer && layer.querySelector("[data-tally-drag-handle]");

    var TALLY_EMBED = "https://tally.so/embed/ob7l5X?alignLeft=1&dynamicHeight=1";

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
        layer.hidden = false;
        if (!iframe.getAttribute("src")) {
            iframe.src = TALLY_EMBED;
        }
        centerDialog();
        requestAnimationFrame(function () {
            dialog.focus();
        });
        prevBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }

    function closePop() {
        layer.hidden = true;
        document.body.style.overflow = prevBodyOverflow;
        openBtn.focus();
    }

    openBtn.addEventListener("click", function () {
        openPop();
    });

    layer.querySelectorAll("[data-tally-close]").forEach(function (el) {
        el.addEventListener("click", function () {
            closePop();
        });
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !layer.hidden) {
            closePop();
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

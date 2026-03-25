(function () {
    const input = document.getElementById("hubCategorySearch");
    const grid = document.getElementById("hubCategoryGrid");
    if (!input || !grid) {
        return;
    }

    function filterTextFor(el) {
        const span = el.querySelector(":scope > span");
        if (span && span.textContent) {
            return span.textContent.trim();
        }
        try {
            const u = new URL(el.getAttribute("href"), window.location.href);
            const name = u.searchParams.get("name");
            if (name) {
                return decodeURIComponent(name).trim();
            }
        } catch (e) {
            /* ignore */
        }
        return (el.getAttribute("aria-label") || el.textContent || "").trim();
    }

    grid.querySelectorAll(".hub-game").forEach((el) => {
        el.dataset.hubFilterText = filterTextFor(el).toLowerCase();
    });

    input.addEventListener("input", () => {
        const q = input.value.toLowerCase().trim();
        grid.querySelectorAll(".hub-game").forEach((el) => {
            const t = el.dataset.hubFilterText || "";
            el.classList.toggle("hub-game--hidden", q.length > 0 && !t.includes(q));
        });
    });
})();

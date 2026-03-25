/**
 * Build left rail on category hub pages (all links; hrefs resolved for ../ base).
 */
(function () {
    function tubziRailBase() {
        return document.body.getAttribute("data-tubzi-base") === "../" ? "../" : "";
    }

    function resolveRailHref(href) {
        if (!href || /^https?:\/\//i.test(href)) {
            return href;
        }
        const base = tubziRailBase();
        if (!base) {
            return href;
        }
        if (href.startsWith("categories/")) {
            return href.slice("categories/".length);
        }
        return base + href;
    }

    function mountStaticRail() {
        const nav = document.getElementById("gameRailNav");
        const TR = window.TUBZI_RAIL;
        if (!nav || !TR) {
            return;
        }

        const activeId = document.body.getAttribute("data-tubzi-active-rail") || "";
        const ICONS = TR.icons;

        nav.innerHTML = "";

        TR.structure.forEach(row => {
            if (row.kind === "label") {
                const d = document.createElement("div");
                d.className = "rail-section-label" + (row.compact ? " rail-section-label--compact" : "");
                d.textContent = row.text;
                nav.appendChild(d);
                return;
            }
            if (row.kind === "spacer") {
                const d = document.createElement("div");
                d.className = "rail-spacer";
                d.setAttribute("aria-hidden", "true");
                nav.appendChild(d);
                return;
            }

            const item = row;
            const paths = ICONS[item.icon] || ICONS.home;
            const inner = `
            <svg class="rail-icon" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>
            <span class="rail-label">${item.label}</span>
        `;

            let href;
            if (item.href) {
                href = resolveRailHref(item.href);
            } else if (item.genre) {
                href = `${resolveRailHref("index.html")}?genre=${encodeURIComponent(item.genre)}`;
            } else if (item.home) {
                href = resolveRailHref("index.html");
            }

            const a = document.createElement("a");
            a.className = "rail-nav-item" + (item.compact ? " rail-nav-item--compact" : "");
            a.dataset.navId = item.id;
            if (href) {
                a.href = href;
            }
            if (item.external) {
                a.target = "_blank";
                a.rel = "noopener noreferrer";
            }
            a.innerHTML = inner;

            const on = item.id === activeId;
            a.classList.toggle("is-active", on);

            nav.appendChild(a);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountStaticRail);
    } else {
        mountStaticRail();
    }
})();

/**
 * Builds the left rail on play.html (same structure as index / all-games).
 */
(function () {
    function tubchatToggle() {
        if (typeof window.togglePlayTubchatDock === "function") {
            window.togglePlayTubchatDock();
        } else if (typeof window.toggleTubchatDock === "function") {
            window.toggleTubchatDock();
        }
    }

    function buildRailNav() {
        const nav = document.getElementById("gameRailNav");
        if (!nav || !window.TUBZI_RAIL) {
            return;
        }
        const ICONS = window.TUBZI_RAIL.icons;
        const RAIL_NAV_STRUCTURE = window.TUBZI_RAIL.structure;
        nav.innerHTML = "";

        RAIL_NAV_STRUCTURE.forEach(row => {
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
            if (row.kind === "divider") {
                const d = document.createElement("div");
                d.className = "rail-divider";
                d.setAttribute("role", "presentation");
                nav.appendChild(d);
                return;
            }

            const item = row;
            const iconSvg =
                item.icon && ICONS[item.icon]
                    ? `<svg class="rail-icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[item.icon]}</svg>`
                    : "";
            const inner = `${iconSvg}<span class="rail-label">${item.label}</span>`;
            const navItemMods =
                (item.compact ? " rail-nav-item--compact" : "") + (!iconSvg ? " rail-nav-item--no-icon" : "");
            const groupCls = item.groupStart ? " rail-nav-item--group-start" : "";

            if (item.href) {
                const a = document.createElement("a");
                a.href = item.href;
                a.className = "rail-nav-item" + navItemMods + groupCls;
                a.dataset.navId = item.id;
                if (item.external) {
                    a.target = "_blank";
                    a.rel = "noopener noreferrer";
                }
                a.innerHTML = inner;
                nav.appendChild(a);
                return;
            }

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "rail-nav-item" + navItemMods + groupCls;
            btn.dataset.navId = item.id;
            btn.innerHTML = inner;

            btn.addEventListener("click", () => {
                if (item.id === "home") {
                    window.location.href = "index.html";
                } else if (item.action === "tubchat") {
                    tubchatToggle();
                } else if (item.categoryId) {
                    window.location.href = `index.html?category=${encodeURIComponent(item.categoryId)}`;
                } else if (item.genre) {
                    window.location.href = "index.html";
                }
            });

            nav.appendChild(btn);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", buildRailNav);
    } else {
        buildRailNav();
    }
})();

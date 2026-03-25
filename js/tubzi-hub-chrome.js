/**
 * Theme toggle for hub pages that use tubzi-shell.css
 */
(function () {
    const THEME_KEY = "tubzi-theme";

    function applyTheme(mode) {
        const isLight = mode === "light";
        document.body.classList.toggle("light", isLight);
        localStorage.setItem(THEME_KEY, mode);
    }

    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === "light") {
            applyTheme("light");
        } else {
            applyTheme("dark");
        }

        themeBtn.addEventListener("click", () => {
            const next = document.body.classList.contains("light") ? "dark" : "light";
            applyTheme(next);
        });
    }
})();

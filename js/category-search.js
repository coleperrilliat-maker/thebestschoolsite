(function () {
    const input = document.getElementById("hubCategorySearch");
    const grid = document.getElementById("hubCategoryGrid");
    if (!input || !grid) {
        return;
    }
    input.addEventListener("input", () => {
        const q = input.value.toLowerCase().trim();
        grid.querySelectorAll(".hub-game").forEach((el) => {
            const t = el.textContent.toLowerCase();
            el.classList.toggle("hub-game--hidden", q.length > 0 && !t.includes(q));
        });
    });
})();

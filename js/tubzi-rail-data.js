/**
 * Shared left-rail navigation for index.html and all-games.html.
 */
window.TUBZI_RAIL = {
    icons: {
        home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
        grid: '<rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="none" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="none" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="none" stroke-width="2"/>',
        io: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
        sports: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
        driving: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-.4-2.2-.9c-.5-.2-1.1-.1-1.5.2L12 11"/><path d="M5 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C3.7 10.6 1 10 1 10s1.3-.4 2.2-.9c.5-.2 1.1-.1 1.5.2L8 11"/><path d="M5 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/><path d="M15 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/>',
        action: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
        puzzle: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/><path d="M12 8h.01"/>',
        casual: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
        arcade: '<rect x="7" y="13" width="10" height="5" rx="1"/><path d="M10 13V9a2 2 0 0 1 4 0v4"/><circle cx="12" cy="6" r="2"/>',
        racing: '<path d="M5 15l2-5h10l2 5"/><path d="M6 15v3h12v-3"/><circle cx="8" cy="19" r="1.5"/><circle cx="16" cy="19" r="1.5"/>',
        multiplayer: '<circle cx="9" cy="7" r="2.5"/><circle cx="15" cy="7" r="2.5"/><path d="M4 20v-1a4 4 0 0 1 4-4h2"/><path d="M14 15h2a4 4 0 0 1 4 4v1"/>',
        runners: '<circle cx="12" cy="5" r="2"/><path d="M12 9l-2 6 2 3 2-3-2-6"/><path d="M9 18h6"/>',
        spotlight: '<polygon points="12 2 14.5 9 22 10 16 14.5 17.5 22 12 18 6.5 22 8 14.5 2 10 9.5 9 12 2"/>',
        school: '<path d="M4 10l8-4 8 4-8 4-8-4z"/><path d="M4 10v8l8 4v-8"/><path d="M20 10v8l-8 4v-8"/>',
        sandbox: '<path d="M12 2l7 3.5v7L12 16l-7-3.5v-7L12 2z"/><path d="M12 16v6"/>',
        mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
        blog: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
        megaphone: '<path d="M3 11v6a1 1 0 0 0 1 1h1l4-4V8L5 5H4a1 1 0 0 0-1 1z"/><path d="M18 8v8"/><path d="M22 12h-3"/>',
        info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
        terms: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
        lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        dmca: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        tiktok: '<path d="M10 8v8a4 4 0 1 0 4-4"/><path d="M14 4v6.5a5.5 5.5 0 0 0 5.5 5.5"/>',
        discord: '<path d="M7 10c2-1 4-1 6 0"/><path d="M6 8.5 7 18l2.5-2 2.5 2 2.5-2L18 8.5c-1.5-1-3.5-1.5-3.5-1.5S12 8 10 9"/><circle cx="10" cy="13" r="1"/><circle cx="14" cy="13" r="1"/>',
        external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'
    },
    structure: [
        { kind: "label", text: "Browse" },
        { kind: "item", id: "home", label: "Home", icon: "home", home: true },
        { kind: "item", id: "allgames", label: "All games", icon: "grid", href: "all-games.html" },
        { kind: "label", text: "Categories" },
        { kind: "item", id: "cat-action", label: "Action & combat", icon: "action", href: "categories/action.html" },
        { kind: "item", id: "cat-puzzle", label: "Puzzle & brain", icon: "puzzle", href: "categories/puzzle.html" },
        { kind: "item", id: "cat-arcade", label: "Arcade classics", icon: "arcade", href: "categories/arcade.html" },
        { kind: "item", id: "cat-racing", label: "Racing & driving", icon: "racing", href: "categories/racing.html" },
        { kind: "item", id: "cat-sports", label: "Sports arena", icon: "sports", href: "categories/sports.html" },
        { kind: "item", id: "cat-io", label: ".io & online", icon: "io", href: "categories/io.html" },
        { kind: "item", id: "cat-casual", label: "Casual & cozy", icon: "casual", href: "categories/casual.html" },
        { kind: "item", id: "cat-multi", label: "Party & multiplayer", icon: "multiplayer", href: "categories/multiplayer.html" },
        { kind: "item", id: "cat-runners", label: "Runners & endless", icon: "runners", href: "categories/runners.html" },
        { kind: "item", id: "cat-spotlight", label: "Fresh on TubZi", icon: "spotlight", href: "categories/spotlight.html" },
        { kind: "item", id: "cat-school", label: "School-friendly", icon: "school", href: "categories/school.html" },
        { kind: "item", id: "cat-sandbox", label: "Sandbox & sims", icon: "sandbox", href: "categories/sandbox.html" },
        { kind: "label", text: "Social", compact: true },
        { kind: "item", id: "tiktok", label: "TikTok", icon: "tiktok", href: "https://www.tiktok.com/@tubzi.io", external: true, compact: true },
        { kind: "item", id: "discord", label: "Discord", icon: "discord", href: "https://discord.gg/nj5YYgKBap", external: true, compact: true },
        { kind: "label", text: "Site" },
        { kind: "item", id: "contact", label: "Contact us", icon: "mail", href: "contact.html" },
        { kind: "item", id: "blog", label: "Blog", icon: "blog", href: "blog.html" },
        { kind: "item", id: "advertise", label: "Advertise", icon: "megaphone", href: "advertise.html" },
        { kind: "item", id: "about", label: "About us", icon: "info", href: "about.html" },
        { kind: "item", id: "terms", label: "Terms", icon: "terms", href: "terms.html" },
        { kind: "item", id: "privacy", label: "Privacy", icon: "lock", href: "privacy.html" },
        { kind: "item", id: "dmca", label: "DMCA", icon: "dmca", href: "dmca.html" }
    ],
    itemById(id) {
        return this.structure.find(r => r.kind === "item" && r.id === id) || null;
    }
};

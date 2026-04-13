(function () {
    /**
     * Hover preview videos (layoutKey = game name lowercased, non-alphanumeric stripped).
     * Files live in videos/hover_<layoutKey>.mp4 (from mathlesson-style sources).
     */
    var MAP = {
        "0v0game": "videos/hover_0v0game.mp4",
        "1v1lol": "videos/hover_1v1lol.mp4",
        "2048": "videos/hover_2048.mp4",
        "8ballclassic": "videos/hover_8ballclassic.mp4",
        amongus: "videos/hover_amongus.mp4",
        aquaparkio: "videos/hover_aquaparkio.mp4",
        asmallworldcup: "videos/hover_asmallworldcup.mp4",
        backrooms: "videos/hover_backrooms.mp4",
        baldisbasics: "videos/hover_baldisbasics.mp4",
        basketballbros: "videos/hover_basketballbros.mp4",
        basketballrandom: "videos/hover_basketballrandom.mp4",
        basketballstars: "videos/hover_basketballstars.mp4",
        basketrandom: "videos/hover_basketrandom.mp4",
        bitlife: "videos/hover_bitlife.mp4",
        blockblast: "videos/hover_blockblast.mp4",
        boxingrandom: "videos/hover_boxingrandom.mp4",
        brawlsimulator3d: "videos/hover_brawlsimulator3d.mp4",
        btd1: "videos/hover_btd1.mp4",
        btd2: "videos/hover_btd2.mp4",
        btd3: "videos/hover_btd3.mp4",
        btd5: "videos/hover_btd5.mp4",
        crazycars: "videos/hover_crazycars.mp4",
        crazycattle3d: "videos/hover_crazycattle3d.mp4",
        crossyroad: "videos/hover_crossyroad.mp4",
        doodlejump: "videos/hover_doodlejump.mp4",
        driftboss: "videos/hover_driftboss.mp4",
        drifthunters: "videos/hover_drifthunters.mp4",
        drivemad: "videos/hover_drivemad.mp4",
        ducklife1: "videos/hover_ducklife1.mp4",
        elasticman: "videos/hover_elasticman.mp4",
        elytraflight: "videos/hover_elytraflight.mp4",
        fallguys: "videos/hover_fallguys.mp4",
        fivenightsatfreddys: "videos/hover_fivenightsatfreddys.mp4",
        fnaf1: "videos/hover_fnaf1.mp4",
        fnaf2: "videos/hover_fnaf2.mp4",
        fnaf3: "videos/hover_fnaf3.mp4",
        fnaf4: "videos/hover_fnaf4.mp4",
        funnyshooter: "videos/hover_funnyshooter.mp4",
        geometrydash: "videos/hover_geometrydash.mp4",
        granny: "videos/hover_granny.mp4",
        happywheels: "videos/hover_happywheels.mp4",
        helixjump: "videos/hover_helixjump.mp4",
        holeio: "videos/hover_holeio.mp4",
        houseofhazards: "videos/hover_houseofhazards.mp4",
        idlebreakout: "videos/hover_idlebreakout.mp4",
        jetpackjoyride: "videos/hover_jetpackjoyride.mp4",
        littlealchemy2: "videos/hover_littlealchemy2.mp4",
        minecraft: "videos/hover_minecraft.mp4",
        monkeymart: "videos/hover_monkeymart.mp4",
        motox3m: "videos/hover_motox3m.mp4",
        motox3mpoolparty: "videos/hover_motox3mpoolparty.mp4",
        motox3mspookyland: "videos/hover_motox3mspookyland.mp4",
        motox3mwinter: "videos/hover_motox3mwinter.mp4",
        papasdonuteria: "videos/hover_papasdonuteria.mp4",
        papasfreezeria: "videos/hover_papasfreezeria.mp4",
        papashotdoggeria: "videos/hover_papashotdoggeria.mp4",
        papaspastaria: "videos/hover_papaspastaria.mp4",
        papaspizzeria: "videos/hover_papaspizzeria.mp4",
        plantsvszombies: "videos/hover_plantsvszombies.mp4",
        polytrack: "videos/hover_polytrack.mp4",
        ragdollarchers: "videos/hover_ragdollarchers.mp4",
        realflightsimulator: "videos/hover_realflightsimulator.mp4",
        redball4: "videos/hover_redball4.mp4",
        retrobowl: "videos/hover_retrobowl.mp4",
        retrobowlcollege: "videos/hover_retrobowlcollege.mp4",
        rocketleague: "videos/hover_rocketleague.mp4",
        run1: "videos/hover_run1.mp4",
        run2: "videos/hover_run2.mp4",
        run3: "videos/hover_run3.mp4",
        shellshockers: "videos/hover_shellshockers.mp4",
        slope: "videos/hover_slope.mp4",
        smashkarts: "videos/hover_smashkarts.mp4",
        snowrider3d: "videos/hover_snowrider3d.mp4",
        soccerrandom: "videos/hover_soccerrandom.mp4",
        spacewaves: "videos/hover_spacewaves.mp4",
        stealabrainrot: "videos/hover_stealabrainrot.mp4",
        subwaysurfers: "videos/hover_subwaysurfers.mp4",
        supermariobros: "videos/hover_supermariobros.mp4",
        survivorio: "videos/hover_survivorio.mp4",
        templerun2: "videos/hover_templerun2.mp4",
        timeshooter: "videos/hover_timeshooter.mp4",
        tinyfishing: "videos/hover_tinyfishing.mp4",
        ultrakill: "videos/hover_ultrakill.mp4",
        volleyrandom: "videos/hover_volleyrandom.mp4",
        wordle: "videos/hover_wordle.mp4",
        worldshardestgame: "videos/hover_worldshardestgame.mp4",
    };

    /**
     * Optional trim (seconds). Disables native loop; loops in JS.
     * Omit `end` to play from start through the rest of the file, then repeat from start.
     */
    var CLIP = {
        spacewaves: { start: 13, end: 23 },
        subwaysurfers: { start: 7 },
        /** Skip intro; loop from here through end of file. */
        elytraflight: { start: 1.6 }
    };

    /** object-position for object-fit: cover (fraction of leftover overflow). */
    var OBJECT_POS = {
        brawlsimulator3d: "center 32%"
    };

    /** Stretch to tile (no letterboxing); default CSS uses cover. */
    var OBJECT_FIT = {};

    function attach(card, layoutKey) {
        var src = MAP[layoutKey];
        if (!src) {
            return;
        }

        var clipRaw = CLIP[layoutKey];
        var clip = clipRaw ? { start: clipRaw.start, end: clipRaw.end } : null;

        card.classList.add("card--hover-preview");
        var vid = document.createElement("video");
        vid.className = "card-hover-preview-video";
        vid.muted = true;
        /* JS loop avoids native loop seam flicker in many browsers. */
        vid.loop = false;
        vid.playsInline = true;
        vid.preload = "metadata";
        vid.setAttribute("aria-hidden", "true");
        vid.src = src;
        if (OBJECT_FIT[layoutKey]) {
            vid.style.objectFit = OBJECT_FIT[layoutKey];
        }
        if (OBJECT_POS[layoutKey]) {
            vid.style.objectPosition = OBJECT_POS[layoutKey];
        }
        card.insertBefore(vid, card.firstChild);

        function seekIntoWindow() {
            if (!clip) {
                return;
            }
            if (vid.currentTime < clip.start) {
                vid.currentTime = clip.start;
            }
            if (typeof clip.end === "number" && vid.currentTime >= clip.end) {
                vid.currentTime = clip.start;
            }
            if (typeof clip.end !== "number" && vid.duration && !isNaN(vid.duration) && vid.currentTime >= vid.duration - 0.15) {
                vid.currentTime = clip.start;
            }
        }

        if (clip) {
            vid.addEventListener("loadedmetadata", function onMeta() {
                vid.removeEventListener("loadedmetadata", onMeta);
                if (typeof clip.end === "number" && vid.duration && isFinite(vid.duration) && vid.duration > 0) {
                    clip.end = Math.min(clip.end, vid.duration);
                }
                if (
                    typeof clip.start === "number" &&
                    typeof clip.end === "number" &&
                    clip.end - clip.start < 0.2
                ) {
                    clip.end = clip.start + 0.2;
                }
                seekIntoWindow();
            });
            if (typeof clip.end === "number") {
                var clipLoopSeeking = false;
                vid.addEventListener("timeupdate", function () {
                    if (clipLoopSeeking) {
                        return;
                    }
                    if (vid.currentTime >= clip.end - 0.05) {
                        clipLoopSeeking = true;
                        vid.currentTime = clip.start;
                        vid.addEventListener(
                            "seeked",
                            function onClipSeeked() {
                                vid.removeEventListener("seeked", onClipSeeked);
                                clipLoopSeeking = false;
                            },
                            { once: true }
                        );
                    }
                });
            } else {
                vid.addEventListener("ended", function onEnded() {
                    vid.currentTime = clip.start;
                    vid.play().catch(function () {});
                });
            }
        } else {
            vid.addEventListener("ended", function onLoop() {
                vid.currentTime = 0;
                vid.play().catch(function () {});
            });
        }

        function play() {
            seekIntoWindow();
            vid.play().catch(function () {});
        }
        function stop() {
            vid.pause();
            vid.currentTime = clip ? clip.start : 0;
        }
        card.addEventListener("mouseenter", play);
        card.addEventListener("mouseleave", function () {
            if (!card.contains(document.activeElement)) {
                stop();
            }
        });
        card.addEventListener("focusin", play);
        card.addEventListener("focusout", function (e) {
            if (!card.contains(e.relatedTarget)) {
                stop();
            }
        });
    }

    window.tubziAttachHoverGamePreview = attach;
})();

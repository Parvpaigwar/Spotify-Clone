// Search: your own songs + songs found with iTunes.
// iTunes only gives 30s previews; with a YouTube key, those play in full from YouTube instead.
// Both run in the browser (no backend; iTunes needs no key).
import { createSongCard } from "./homeSongsCards";
import { searchItunes as itunes } from "./onlineSongs";
import { youtubeEnabled } from "./youtube";

const LIMIT = 12;

const searchLocal = (allSongs, query) => {
    const q = query.toLowerCase();
    return allSongs.filter(
        (s) => s.name.toLowerCase().includes(q) || s.singer.toLowerCase().includes(q)
    );
};

const searchItunes = (query, signal) => itunes(query, LIMIT, signal);

// Remember results for this visit, so retyping a query doesn't call the API again
// (iTunes allows only ~20 searches per minute per user)
const cache = new Map();
const cached = (source, search) => async (query, signal) => {
    const key = `${source}:${query.toLowerCase()}`;
    if (cache.has(key)) return cache.get(key);
    const results = await search(query, signal);
    cache.set(key, results);
    return results;
};
const searchItunesCached = cached("itunes", searchItunes);

const SEARCHING = ["Digging through the graveyard…", "Rattling the crates…", "Asking the bones…", "Dusting off old records…"];
const EMPTY = ["Nothing here but bones 🦴", "Dug deep, found nothing. Try another name.", "Not even a rattle. Try a different spelling."];

// One labelled row of results, filled in when its source answers
const createGroup = (title, note) => {
    const group = document.createElement("div");
    group.className = "App__search-group";

    const header = document.createElement("div");
    header.className = "App__section-header";
    const h3 = document.createElement("h3");
    h3.textContent = title;
    const small = document.createElement("span");
    small.className = "App__search-note";
    small.textContent = note;
    header.append(h3, small);

    const row = document.createElement("div");
    row.className = "App__section-grid-container songRow";

    const status = document.createElement("p");
    status.className = "App__search-status";
    status.textContent = SEARCHING[Math.floor(Math.random() * SEARCHING.length)];

    group.append(header, row, status);
    return {
        group,
        show(songs) {
            songs.forEach((song) => row.append(createSongCard(song)));
            status.textContent = songs.length ? "" : EMPTY[Math.floor(Math.random() * EMPTY.length)];
            status.classList.toggle("is-empty", !songs.length); // shows the sleeping skull
            status.hidden = songs.length > 0;
        },
        fail() {
            status.textContent = "The crypt didn't answer. Try again in a few seconds.";
            status.classList.add("is-empty");
        },
    };
};

export const setupSearch = (allSongs) => {
    const form = document.querySelector(".App__search-form");
    const input = document.querySelector("#searchInput");
    const results = document.querySelector("#searchResults");
    let controller = null;
    let timer = null;

    const run = (rawQuery) => {
        const query = rawQuery.trim();
        controller?.abort(); // drop results of the previous (older) search
        results.textContent = "";

        if (query.length < 2) {
            results.hidden = true;
            return;
        }
        results.hidden = false;
        results.closest(".App__main-view")?.scrollTo({ top: 0, behavior: "smooth" }); // results sit at the top
        controller = new AbortController();
        const { signal } = controller;

        const local = createGroup("Your songs", "");
        const itunes = createGroup(
            "Songs",
            youtubeEnabled ? "" : "30-second previews from iTunes"
        );
        results.append(local.group, itunes.group);

        local.show(searchLocal(allSongs, query));

        for (const [group, search] of [[itunes, searchItunesCached]]) {
            search(query, signal)
                .then((songs) => !signal.aborted && group.show(songs))
                .catch((err) => {
                    if (err.name !== "AbortError") {
                        console.error(err);
                        group.fail();
                    }
                });
        }
    };

    // Search as you type (after a short pause) and on Enter
    input.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => run(input.value), 600); // wait until typing pauses
    });
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        clearTimeout(timer);
        run(input.value);
        input.blur(); // closes the phone keyboard
    });

    // Sidebar "Search" button jumps to the search box
    document.querySelector("#searchNavButton")?.addEventListener("click", () => {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        input.focus();
    });
};

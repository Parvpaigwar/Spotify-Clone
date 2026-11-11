// Extra home-page rows found with iTunes Search (played in full from YouTube), below the local songs.
// iTunes allows ~20 requests a minute, so keep this list short.
// Each row appears as soon as its source answers; a row whose source fails is removed.
// Cards are saved to songsLS like local ones, so play / like / forward / history work the same.
import { createSongCard } from "./homeSongsCards";
import { searchItunes } from "./onlineSongs";
import { saveSong } from "./saveData";
import { tasteRow } from "./taste";
import { youtubeEnabled } from "./youtube";

const ITUNES_NOTE = youtubeEnabled ? "" : "30-second previews";

const ROWS = [
    { title: "Bollywood hits", mood: "moonlit", query: "bollywood hits" },
    { title: "Punjabi hits", mood: "party", query: "punjabi hits" },
    { title: "Arijit Singh", mood: "moonlit", query: "arijit singh" },
    { title: "Hip-Hop & Rap", mood: "drive", query: "hip hop hits" },
    { title: "Lo-fi flips", mood: "rain", query: "lofi flip" },
    { title: "EDM & Dance", mood: "party", query: "edm hits" },
    { title: "Pop hits", mood: "drive", query: "pop hits" },
].map((row) => ({ ...row, note: ITUNES_NOTE, load: () => searchItunes(row.query, 20) }));

// Each online row gets one of the skeleton pictures next to its title (public/theme/pins)
const SKULLS = ["red-headphones", "headphones-rock", "flower-headphones", "real-headphones", "red-earphones", "gold-headphones", "hooded-headphones", "candle-turntable"];
let skullIndex = 0;

const createSection = (title, note) => {
    const section = document.createElement("section");
    section.className = "App__section App__your-shows";
    section.innerHTML = `
        <div class="App__section-header">
            <div class="App__section-title"><h2><img class="App__section-skull" alt="" aria-hidden="true" /><span></span></h2><span class="App__search-note"></span></div>
            <button class="seeall">Show all</button>
        </div>
        <div class="App__section-grid-container songRow"></div>`;
    section.querySelector("h2 span").textContent = title;
    section.querySelector(".App__section-skull").src = `/theme/pins/${SKULLS[skullIndex++ % SKULLS.length]}.webp`;
    section.querySelector(".App__search-note").textContent = note;
    return { section, row: section.querySelector(".songRow") };
};

// Add one row: { title, note, load, mood?, skull? }. Shown when its songs arrive, removed if none.
const addRow = (container, { title, note, load, mood, skull }, seenIds) => {
    const { section, row } = createSection(title, note);
    if (skull) section.querySelector(".App__section-skull").src = `/theme/pins/${skull}.webp`;
    section.hidden = true; // shown when its songs arrive
    container.append(section); // appended now so the row order stays fixed

    load()
        .then((songs) => {
            const fresh = songs
                .filter((song) => !seenIds.has(String(song.id)))
                .map((song) => (mood ? { ...song, mood } : song));
            fresh.forEach((song) => {
                seenIds.add(String(song.id));
                saveSong(song);
                row.append(createSongCard(song));
            });
            if (fresh.length) section.hidden = false;
            else section.remove();
        })
        .catch((error) => {
            console.warn(`Couldn't load "${title}":`, error.message);
            section.remove();
        });
};

// `seenIds`: IDs already on the page. A song shows only once, so "next song" (page order) never loops.
// `tasteContainer`: where the personal "Picked for your bones" row goes (above the other rows).
export const loadOnlineRows = (container, seenIds = new Set(), tasteContainer = null) => {
    const personal = tasteRow();
    if (personal && tasteContainer) addRow(tasteContainer, personal, seenIds);
    for (const row of ROWS) addRow(container, row, seenIds);
};

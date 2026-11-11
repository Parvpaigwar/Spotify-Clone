import { riderPicture, setVehicle, vehicleName } from "./vehicles";

// Vibes: every song gets a mood, and the site follows it — the vehicle driving along the progress bar
// (vehicles.js: convertible, party van, scooter, bicycle, chopper) plus a colour tint
// (body[data-mood] → CSS variables in style.css).
//
// Mood = the song's title keywords → its row's mood (homeSongsCards / onlineRows) → its genre → a stable pick.
// Clicking the ride pill in the Now Playing panel cycles the mood (and vehicle) for that song.

export const MOODS = {
    drive: { label: "Night Drive", icon: "fa-solid fa-car-side" },
    party: { label: "Bone Party", icon: "fa-solid fa-van-shuttle" },
    moonlit: { label: "Moonlit", icon: "fa-solid fa-moon" },
    rain: { label: "Lo-fi Rain", icon: "fa-solid fa-bicycle" },
    hellfire: { label: "Hellfire", icon: "fa-solid fa-motorcycle" },
};
const ORDER = Object.keys(MOODS);

const RULES = [
    [/lo-?fi|slowed|reverb|\brain|chill|sleep|study|ambient|jazz|classical|acoustic|alternative|indie/i, "rain"],
    [/rock|metal|punk|grunge|believer|thunder|devil|hell|fire|demon/i, "hellfire"],
    [/party|danc|club|disco|bass|edm|house|techno|dubstep|electronic|trap|punjabi|bhangra|reggaeton|boogie/i, "party"],
    [/love|dil\b|ishq|pyaa?r|moon|chand|heart|romantic|r&b|soul|ghazal|sufi|bollywood|indian/i, "moonlit"],
    [/drive|road|highway|night|car\b|ride|cruise|neon|synth|hip-?hop|rap|pop/i, "drive"],
];
const byRules = (text) => (text ? RULES.find(([re]) => re.test(text))?.[1] : undefined);

const hashPick = (key) => {
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return ORDER[h % ORDER.length];
};

const overrides = new Map(); // song id -> mood picked with the pill

export const moodFor = (song) =>
    overrides.get(String(song.id)) ||
    byRules(song.songName) ||
    (MOODS[song.mood] ? song.mood : undefined) ||
    byRules(song.genre) ||
    hashPick(String(song.id));

// ---------- applying ----------
const pill = document.querySelector("#nowVibe");
let currentSong = null;

const show = (mood) => {
    document.body.dataset.mood = mood;
    // The vibe's skull: marks the current lyric line (same face as the vehicle's rider)
    document.body.style.setProperty("--mood-skull", `url("${riderPicture(mood)}")`);
    setVehicle(mood);
    if (pill) {
        pill.innerHTML = `<i class="${MOODS[mood].icon}" aria-hidden="true"></i> `;
        pill.append(`${vehicleName(mood)} · ${MOODS[mood].label}`);
        pill.title = "Change the ride for this song";
    }
};

// song: an entry from songsLS
export const applyVibe = (song) => {
    currentSong = song;
    show(moodFor(song));
};

pill?.addEventListener("click", () => {
    if (!currentSong) return;
    const next = ORDER[(ORDER.indexOf(moodFor(currentSong)) + 1) % ORDER.length];
    overrides.set(String(currentSong.id), next);
    show(next);
});

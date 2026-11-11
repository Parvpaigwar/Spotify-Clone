// Lyrics in the Now Playing panel, from LRCLIB (https://lrclib.net): free, no key, CORS allowed.
// Synced lyrics (LRC "[mm:ss.xx] line") follow the song every animation frame: the current line fills up
// karaoke-style and stays in the middle, seeking re-syncs at once, clicking a line jumps there.
// Without timings (or for 30s previews) the plain lyrics are shown.
import { getPlaybackTime, onTimeUpdate, seek } from "./player";

const API = "https://lrclib.net/api";
const body = document.querySelector("#lyricsBody");

const cache = new Map(); // song key -> Promise<{ synced, plain, instrumental } | null>
let current = null; // { lines: [{ t, el }], synced: bool }
let token = 0;
let duration = 0;
let activeIndex = -1;
let userScrolledAt = 0;
let wantSynced = true; // false while a 30s preview plays
let lastTime = 0;

// ---------- fetching ----------
// "Soni Soni (From "Ishq Vishk Rebound")" -> "Soni Soni"; "Song_Name_www_site" -> "Song Name"
const cleanTitle = (name) =>
    name
        .replace(/[([][^)\]]*(from|feat|ft\.|official|lyric|video|audio|remaster|version|prod)[^)\]]*[)\]]/gi, "")
        .replace(/\s+(feat\.?|ft\.?)\s.*$/i, "")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();
// "Pritam, Arijit Singh & Neeti Mohan" -> "Pritam"
const firstArtist = (singer = "") => singer.split(/,|&| x | and |feat\.?|ft\./i)[0].trim();

const parseLrc = (lrc) => {
    const lines = [];
    for (const raw of lrc.split("\n")) {
        const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
        const text = raw.replace(/\[[^\]]*\]/g, "").trim();
        for (const [, m, s] of stamps) lines.push({ t: Number(m) * 60 + Number(s), text });
    }
    return lines.sort((a, b) => a.t - b.t);
};

const toResult = (d) =>
    d && (d.syncedLyrics || d.plainLyrics || d.instrumental)
        ? { synced: d.syncedLyrics ? parseLrc(d.syncedLyrics) : null, plain: d.plainLyrics || null, instrumental: !!d.instrumental }
        : null;

const getJson = async (url) => {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`LRCLIB error ${res.status}`);
    return res.json();
};

const pickBest = (list) => list?.find((d) => d.syncedLyrics) || list?.find((d) => d.plainLyrics) || null;

const fetchLyrics = async (name, singer) => {
    const track = cleanTitle(name);
    const artist = firstArtist(singer);
    const q = (params) => new URLSearchParams(params).toString();

    // 1. exact match, 2. search by track + artist, 3. free-text search
    const exact = await getJson(`${API}/get?${q({ track_name: track, artist_name: artist })}`);
    if (toResult(exact)) return toResult(exact);
    const byFields = await getJson(`${API}/search?${q({ track_name: track, artist_name: artist })}`);
    if (pickBest(byFields)) return toResult(pickBest(byFields));
    const byText = await getJson(`${API}/search?${q({ q: `${track} ${artist}` })}`);
    return toResult(pickBest(byText));
};

// ---------- rendering ----------
const showMessage = (kind, title, text) => {
    current = null;
    body.className = `App__lyrics-body is-${kind}`;
    body.innerHTML = `<div class="App__lyrics-message"><div class="App__lyrics-art"></div><p class="App__lyrics-title"></p><p class="App__lyrics-text"></p></div>`;
    body.querySelector(".App__lyrics-title").textContent = title;
    body.querySelector(".App__lyrics-text").textContent = text;
};

const render = (lyrics) => {
    body.className = "App__lyrics-body";
    body.textContent = "";
    activeIndex = -1;
    const synced = wantSynced && lyrics.synced?.length > 0;

    const lines = synced
        ? lyrics.synced
        : (lyrics.plain || lyrics.synced?.map((l) => l.text).join("\n") || "").split("\n").map((text) => ({ t: null, text }));

    current = { synced, lines: [] };
    for (const [i, { t, text }] of lines.entries()) {
        const el = document.createElement("p");
        el.className = "App__lyrics-line";
        el.textContent = text || "♪";
        if (!text) el.classList.add("is-gap");
        if (synced) {
            el.addEventListener("click", () => {
                if (!duration) return;
                userScrolledAt = 0; // follow the song again
                seek(t / duration);
            });
            el.title = "Jump here";
        }
        body.append(el);
        // `end`: when the next line starts (used for the karaoke fill)
        current.lines.push({ t, el, end: synced ? (lines[i + 1]?.t ?? t + 5) : null });
    }
    body.scrollTop = 0;
};

// Load lyrics for a song from songsLS ({ id, songName, songSinger }). synced=false for 30s previews.
export const showLyrics = async (song, { synced = true } = {}) => {
    const myToken = ++token;
    wantSynced = synced;
    activeIndex = -2; // force a refresh
    showMessage("loading", "Digging up the lyrics…", "The skeleton is flipping through its notebook");
    const key = String(song.id);
    if (!cache.has(key)) {
        cache.set(key, fetchLyrics(song.songName, song.songSinger).catch((error) => {
            cache.delete(key); // try again next time
            throw error;
        }));
    }
    try {
        const lyrics = await cache.get(key);
        if (myToken !== token) return;
        if (!lyrics) return showMessage("none", "No lyrics for this one", "The skeleton is just vibing along. Enjoy the music.");
        if (lyrics.instrumental && !lyrics.plain && !lyrics.synced) {
            return showMessage("none", "Instrumental", "No words, just bones and beats.");
        }
        render(lyrics);
    } catch (error) {
        if (myToken !== token) return;
        console.warn("Lyrics failed:", error.message);
        showMessage("none", "Couldn't reach the lyrics", "Check your connection and play the song again.");
    }
};

// Switch the current song's lyrics to plain (e.g. YouTube failed → 30s preview from the middle of the song)
// (also applies if the lyrics are still loading)
export const useUnsyncedLyrics = () => {
    wantSynced = false;
    if (current?.synced) {
        const lines = current.lines.map(({ el }) => el.textContent).join("\n");
        render({ plain: lines, synced: null });
    }
};

// ---------- syncing ----------
const userScrolled = () => {
    userScrolledAt = Date.now();
    cancelAnimationFrame(scrollAnim);
};
body.addEventListener("wheel", userScrolled, { passive: true });
body.addEventListener("touchmove", userScrolled, { passive: true });

onTimeUpdate(({ duration: d }) => (duration = d));

// Scroll the current line to the middle. Not instant = the skeleton pulls the chain and the lyrics
// glide up with it (our own eased scroll, so both move together).
const puller = document.querySelector("#lyricsPuller");
let scrollAnim = 0;
const centre = (el, instant) => {
    const bodyBox = body.getBoundingClientRect();
    const elBox = el.getBoundingClientRect();
    const max = body.scrollHeight - body.clientHeight;
    const from = body.scrollTop;
    const to = Math.min(max, Math.max(0, from + (elBox.top - bodyBox.top) - body.clientHeight / 2 + elBox.height / 2));
    cancelAnimationFrame(scrollAnim);
    if (instant || Math.abs(to - from) < 2) {
        body.scrollTop = to;
        return;
    }
    puller.classList.remove("is-pulling");
    void puller.offsetWidth; // restart the pull
    puller.classList.add("is-pulling");
    // The skeleton drops first; the lyrics follow a moment later, as if the rope dragged them
    const start = performance.now() + 220;
    const DURATION = 650;
    const step = (now) => {
        const p = Math.min(1, Math.max(0, (now - start) / DURATION));
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        body.scrollTop = from + (to - from) * eased;
        if (p < 1) scrollAnim = requestAnimationFrame(step);
    };
    scrollAnim = requestAnimationFrame(step);
};

const frame = () => {
    requestAnimationFrame(frame);
    if (!current?.synced) return;
    const time = getPlaybackTime().time;
    const jumped = Math.abs(time - lastTime) > 1.5; // seek, or a new song
    lastTime = time;
    if (jumped) userScrolledAt = 0;

    const lines = current.lines;
    let index = -1;
    for (let i = 0; i < lines.length && lines[i].t <= time + 0.15; i++) index = i;

    if (index !== activeIndex) {
        const previous = activeIndex;
        activeIndex = index;
        lines.forEach(({ el }, i) => {
            el.classList.toggle("is-active", i === index);
            el.classList.toggle("is-past", i < index);
            if (i !== index) el.style.removeProperty("--fill");
        });
        // Keep the current line in the middle, unless the user is scrolling the lyrics themselves
        if (index >= 0 && Date.now() - userScrolledAt > 4000) {
            centre(lines[index].el, jumped || previous < 0 || Math.abs(index - previous) > 2);
        }
    }
    // Karaoke fill of the current line, from its start to when the next line starts
    if (index >= 0) {
        const { t, end, el } = lines[index];
        const fill = Math.min(1, Math.max(0, (time - t) / Math.max(0.5, end - t)));
        el.style.setProperty("--fill", `${(fill * 100).toFixed(1)}%`);
    }
};
requestAnimationFrame(frame);

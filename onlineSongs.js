// Songs found online (called straight from the browser, no keys): iTunes Search gives the song list
// (name, artist, cover, 30s preview); playSong plays them in full from YouTube when the key is set.
// Every function returns songs in the same shape as api/*.json: { id, name, singer, image, song, ... }.
import { FALLBACK_IMAGE } from "./media";
import { youtubeEnabled } from "./youtube";

const ITUNES_COUNTRY = "IN"; // Indian store, so Bollywood songs show up

const itunesToSong = (r) => ({
    id: `itunes:${r.trackId}`,
    name: r.trackName,
    singer: r.artistName,
    image: r.artworkUrl100 ? r.artworkUrl100.replace("100x100bb", "400x400bb") : FALLBACK_IMAGE,
    song: r.previewUrl, // 30s; used when YouTube isn't available
    badge: youtubeEnabled ? "Full song · YouTube" : "30s preview",
    youtubeQuery: `${r.trackName} ${r.artistName}`,
    genre: r.primaryGenreName,
    duration: r.trackTimeMillis ? Math.round(r.trackTimeMillis / 1000) : undefined, // official track length, seconds
});

// ---------- iTunes Search ----------
// Two things to cope with:
//  - Apple sometimes answers a search with a redirect to its Music app ("musics://…"), which a web page
//    can't follow. `redirect: "manual"` lets us notice that and ask again with differently-worded
//    parameters (same results, different URL), which usually gets a normal answer.
//  - Apple allows only ~20 requests a minute per visitor. Results are kept in localStorage for 6 hours,
//    so reloading the page or repeating a search doesn't ask again.
const CACHE_KEY = "itunesCacheLS2"; // v2: entries include the track length
const CACHE_HOURS = 6;
const CACHE_MAX = 40; // queries kept

const readCache = () => {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch {
        return {};
    }
};
const writeCache = (cache) => {
    const newest = Object.entries(cache).sort((a, b) => b[1].at - a[1].at).slice(0, CACHE_MAX);
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(newest)));
    } catch {
        localStorage.removeItem(CACHE_KEY); // storage full: start over
    }
};

const itunesUrls = (query, limit) => {
    const base = { term: query, limit: String(limit), country: ITUNES_COUNTRY };
    return [
        { ...base, media: "music", entity: "song" },
        { ...base, entity: "song" },
        { ...base, entity: "musicTrack", lang: "en_us" },
    ].map((params) => `https://itunes.apple.com/search?${new URLSearchParams(params)}`);
};

export const searchItunes = async (query, limit, signal) => {
    const key = `${query.trim().toLowerCase()}|${limit}`;
    const cache = readCache();
    const hit = cache[key];
    if (hit && Date.now() - hit.at < CACHE_HOURS * 3600 * 1000) return hit.songs.map(itunesToSong);

    let lastError = new Error("iTunes search failed");
    for (const url of itunesUrls(query, limit)) {
        try {
            const res = await fetch(url, { signal, redirect: "manual" });
            if (res.type === "opaqueredirect") throw new Error("iTunes redirected to the Music app");
            if (!res.ok) throw new Error(`iTunes error ${res.status}`);
            const { results = [] } = await res.json();
            const songs = results.filter((r) => r.previewUrl && r.trackId);
            // keep only the fields itunesToSong needs
            const slim = songs.map(({ trackId, trackName, artistName, artworkUrl100, previewUrl, primaryGenreName, trackTimeMillis }) => ({
                trackId, trackName, artistName, artworkUrl100, previewUrl, primaryGenreName, trackTimeMillis,
            }));
            const latest = readCache();
            latest[key] = { at: Date.now(), songs: slim };
            writeCache(latest);
            return slim.map(itunesToSong);
        } catch (error) {
            if (error.name === "AbortError") throw error;
            lastError = error; // try the next wording
        }
    }
    if (hit) return hit.songs.map(itunesToSong); // out of date is better than nothing
    throw lastError;
};

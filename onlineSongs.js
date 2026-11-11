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
});

const getJson = async (url, signal) => {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`${new URL(url).host} error ${res.status}`);
    return res.json();
};

// iTunes allows only ~20 requests per minute per user, so keep calls few
export const searchItunes = async (query, limit, signal) => {
    const { results = [] } = await getJson(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=${limit}&country=${ITUNES_COUNTRY}`,
        signal
    );
    return results.filter((r) => r.previewUrl).map(itunesToSong);
};

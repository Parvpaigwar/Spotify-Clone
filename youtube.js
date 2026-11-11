// Finds the YouTube video for a song (used to play full versions of iTunes search results).
// Needs VITE_YOUTUBE_API_KEY in .env. This key ends up in the website's code, so restrict it
// in Google Cloud Console to your site's URLs (HTTP referrers) and to "YouTube Data API v3".
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CACHE_KEY = "youtubeLyricIdsLS"; // song id -> YouTube video id, so each song costs quota only once

export const youtubeEnabled = Boolean(API_KEY);

const readCache = () => {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch {
        return {};
    }
};

// Prefer lyric videos (words on screen), then official label channels; otherwise keep YouTube's order
const OFFICIAL_CHANNEL = /vevo|t-series|sony|zee music|saregama|tips|speed records|yrf|universal|warner|atlantic|official/i;
const pickBestVideo = (items) => {
    const score = ({ snippet = {} }) =>
        (/lyric/i.test(snippet.title || "") ? 2 : 0) + (OFFICIAL_CHANNEL.test(snippet.channelTitle || "") ? 1 : 0);
    let best = null;
    for (const item of items) {
        if (item.id?.videoId && (!best || score(item) > score(best))) best = item;
    }
    return best?.id?.videoId ?? null;
};

export const findYouTubeVideo = async (song) => {
    const cache = readCache();
    if (cache[song.id]) return cache[song.id];

    const params = new URLSearchParams({
        part: "snippet",
        type: "video",
        maxResults: "5", // same quota cost as 1; we pick the best of 5 below
        videoEmbeddable: "true", // skip videos that can't play on other sites
        regionCode: "IN",
        q: `${song.youtubeQuery} lyrics`, // prefer lyric videos, so the words show on screen
        key: API_KEY,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || `YouTube error ${res.status}`);
    }
    const videoId = pickBestVideo((await res.json()).items || []);
    if (videoId) {
        cache[song.id] = videoId;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
    return videoId;
};

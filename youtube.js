// Finds the YouTube video for a song (used to play full versions of iTunes search results).
// Needs VITE_YOUTUBE_API_KEY in .env. This key ends up in the website's code, so restrict it
// in Google Cloud Console to your site's URLs (HTTP referrers) and to "YouTube Data API v3".
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CACHE_KEY = "youtubeVideoIdsLS2"; // song id -> YouTube video id, so each song costs quota only once (v2: length-matched picks)
localStorage.removeItem("youtubeLyricIdsLS"); // old picks ignored the video length

export const youtubeEnabled = Boolean(API_KEY);

const readCache = () => {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch {
        return {};
    }
};

// Which of the found videos to play:
//  1. one whose length matches the official track (within 3 seconds): the timed lyrics then fit it.
//     Film clips, videos with intros or dialogue, extended cuts… are longer and would leave the lyrics unsynced.
//  2. among those (or among all, if none matches): lyric videos first, then official label channels,
//     otherwise YouTube's own order.
const OFFICIAL_CHANNEL = /vevo|t-series|sony|zee music|saregama|tips|speed records|yrf|universal|warner|atlantic|official/i;
const MAX_DIFF = 3; // seconds
const pickBestVideo = (items, lengths = {}, trackLength = 0) => {
    const score = ({ snippet = {} }) =>
        (/lyric/i.test(snippet.title || "") ? 2 : 0) + (OFFICIAL_CHANNEL.test(snippet.channelTitle || "") ? 1 : 0);
    const videos = items.filter((item) => item.id?.videoId);
    const sameLength = trackLength
        ? videos.filter((item) => Math.abs((lengths[item.id.videoId] ?? Infinity) - trackLength) <= MAX_DIFF)
        : [];
    let best = null;
    for (const item of sameLength.length ? sameLength : videos) {
        if (!best || score(item) > score(best)) best = item;
    }
    return best?.id?.videoId ?? null;
};

const getJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || `YouTube error ${res.status}`);
    }
    return res.json();
};

// "PT4M13S" -> 253
const isoSeconds = (iso = "") => {
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || [];
    return (Number(m[1]) || 0) * 3600 + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0);
};

// Lengths of the found videos (one extra request, 1 quota unit). Empty if it fails: we then pick without lengths.
const videoLengths = async (ids) => {
    try {
        const params = new URLSearchParams({ part: "contentDetails", id: ids.join(","), key: API_KEY });
        const { items = [] } = await getJson(`https://www.googleapis.com/youtube/v3/videos?${params}`);
        return Object.fromEntries(items.map((v) => [v.id, isoSeconds(v.contentDetails?.duration)]));
    } catch {
        return {};
    }
};

export const findYouTubeVideo = async (song) => {
    const cache = readCache();
    if (cache[song.id]) return cache[song.id];

    const params = new URLSearchParams({
        part: "snippet",
        type: "video",
        maxResults: "10", // same quota cost as 1; we pick the best one below
        videoEmbeddable: "true", // skip videos that can't play on other sites
        regionCode: "IN",
        q: `${song.youtubeQuery} lyrics`, // prefer lyric videos, so the words show on screen
        key: API_KEY,
    });
    const { items = [] } = await getJson(`https://www.googleapis.com/youtube/v3/search?${params}`);
    const ids = items.map((item) => item.id?.videoId).filter(Boolean);
    const lengths = song.duration && ids.length ? await videoLengths(ids) : {};
    const videoId = pickBestVideo(items, lengths, song.duration);
    if (videoId) {
        cache[song.id] = videoId;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
    return videoId;
};

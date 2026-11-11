// Marrow's own "for you": learns what this listener likes, on this device only (localStorage `tasteLS`,
// no login, no server, no IP address), and builds a row of matching songs.
//   play +1 · finished the song +2 · liked +3 · skipped in the first 20 seconds −1.5
// Scores are kept per artist and per genre. YouTube's own recommendations aren't available to apps,
// so the picks are found with iTunes (top artists + top genre) and played from YouTube like other rows.
import { getSongsFromLS } from "./getSongsFromLS";
import { searchItunes } from "./onlineSongs";

const KEY = "tasteLS";
const POINTS = { play: 1, finish: 2, like: 3, skip: -1.5 };

const read = () => {
    try {
        const t = JSON.parse(localStorage.getItem(KEY)) || {};
        return { artists: t.artists || {}, genres: t.genres || {} };
    } catch {
        return { artists: {}, genres: {} };
    }
};

// "Pritam, Arijit Singh & Neeti Mohan" -> "Pritam"
const firstArtist = (singer = "") => singer.split(/,|&| x | and |feat\.?|ft\./i)[0].trim();

// song: an entry from songsLS ({ songSinger, genre? }); event: play | finish | like | skip
export const recordTaste = (song, event) => {
    if (!song || !POINTS[event]) return;
    const taste = read();
    const bump = (map, key) => {
        if (!key) return;
        map[key] = Math.round(((map[key] || 0) + POINTS[event]) * 10) / 10;
        if (map[key] <= 0) delete map[key];
    };
    bump(taste.artists, firstArtist(song.songSinger));
    bump(taste.genres, song.genre);
    localStorage.setItem(KEY, JSON.stringify(taste));
};

// How much this listener likes a song's artist and genre (0 = unknown)
export const tasteScore = (song) => {
    const taste = read();
    return (taste.artists[firstArtist(song.songSinger)] || 0) + (taste.genres[song.genre] || 0) / 2;
};
export { firstArtist };

const top = (map, n, min) =>
    Object.entries(map)
        .filter(([, score]) => score >= min)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([name]) => name);

// The row for onlineRows.js, or null while there isn't enough listening to go on
export const tasteRow = () => {
    const taste = read();
    const artists = top(taste.artists, 3, 2);
    const genres = top(taste.genres, 1, 3);
    if (artists.length === 0 && genres.length === 0) return null;

    const load = async () => {
        const lists = await Promise.all([
            ...artists.map((artist) =>
                searchItunes(artist, 12)
                    // keep only songs really by that artist (made-up names in the local list find nothing)
                    .then((songs) => songs.filter((s) => s.singer.toLowerCase().includes(artist.toLowerCase())))
                    .catch(() => [])
            ),
            ...genres.map((genre) => searchItunes(`${genre} hits`, 10).catch(() => [])),
        ]);
        // Take turns between the lists so the row is a mix; skip songs already in the local library
        const owned = new Set(
            getSongsFromLS().filter((song) => typeof song.id === "number").map((song) => song.songName.trim().toLowerCase())
        );
        const mixed = [];
        for (let i = 0; mixed.length < 24 && lists.some((l) => l[i]); i++) {
            for (const list of lists) if (list[i] && !owned.has(list[i].name.trim().toLowerCase())) mixed.push(list[i]);
        }
        return mixed;
    };

    const because = [...artists, ...genres].slice(0, 2).join(" and ");
    return { title: "Picked for your bones", note: `because you play ${because}`, load, skull: "sunglasses-headphones" };
};

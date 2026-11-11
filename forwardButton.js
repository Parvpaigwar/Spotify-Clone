import { getPlaysongData } from "./getPlaysongData";
import { getSongsFromLS } from "./getSongsFromLS";
import { nextInQueue } from "./playQueue";
import { playSong } from "./playSong";
import { firstArtist, tasteScore } from "./taste";

const RECENT = 12; // don't repeat any of the last 12 songs

// Next song:
//  1. the next one in the active queue (e.g. Liked Songs), if there is one
//  2. after one of your own songs: any song on the page, fully at random
//  3. after a YouTube song: Marrow's own "up next" — YouTube songs that fit best
//     (same artist, same genre, artists you like), with some randomness so it isn't always the same
export const forwardButton = () => {
    const queued = nextInQueue();
    if (queued !== undefined) {
        playSong(queued);
        return;
    }

    const cardIds = [...new Set([...document.querySelectorAll(".App__section-grid-item")].map((card) => card.dataset.songId))];
    if (cardIds.length === 0) return;

    const history = getPlaysongData().map(String);
    const currentId = history[history.length - 1];
    const recent = new Set(history.slice(-RECENT));
    let pool = cardIds.filter((id) => !recent.has(id));
    if (pool.length === 0) pool = cardIds.filter((id) => id !== currentId);
    if (pool.length === 0) pool = cardIds;

    const random = (list) => list[Math.floor(Math.random() * list.length)];
    const isYouTube = (id) => String(id).startsWith("itunes:");

    if (!isYouTube(currentId)) {
        playSong(random(pool));
        return;
    }

    const songs = new Map(getSongsFromLS().map((song) => [String(song.id), song]));
    const current = songs.get(currentId);
    const candidates = pool.filter(isYouTube).map((id) => songs.get(id)).filter(Boolean);
    if (!current || candidates.length === 0) {
        playSong(random(pool));
        return;
    }
    const artist = firstArtist(current.songSinger).toLowerCase();
    const scored = candidates
        .map((song) => ({
            id: song.id,
            score:
                (firstArtist(song.songSinger).toLowerCase() === artist ? 4 : 0) +
                (current.genre && song.genre === current.genre ? 3 : 0) +
                (current.mood && song.mood === current.mood ? 1 : 0) +
                Math.min(4, tasteScore(song) / 3) +
                Math.random() * 3,
        }))
        .sort((a, b) => b.score - a.score);
    playSong(random(scored.slice(0, 3)).id); // one of the three best fits
};

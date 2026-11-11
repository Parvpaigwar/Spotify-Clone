import { getSongsFromLS } from "./getSongsFromLS";
import { imageUrl, songUrl } from "./media";

// Stores a song in localStorage (songsLS) so playSong / likes / history can find it.
// `song` is { id, name, singer, image, song } — the same shape as api/*.json.
// Local IDs are numbers; search results use strings like "itunes:123".
export const saveSong = ({ id, name, singer, image, song, youtubeQuery, genre, mood }) => {
    const arrLocalStoragesong = getSongsFromLS();
    const songdata = {
        id,
        songName: name,
        songImage: imageUrl(image),
        songSinger: singer,
        songAudio: songUrl(song),
    };
    // iTunes results: text used to find the full song on YouTube
    if (youtubeQuery) songdata.youtubeQuery = youtubeQuery;
    // Used to pick the song's vibe scene (moods.js)
    if (genre) songdata.genre = genre;
    if (mood) songdata.mood = mood;

    // Replace any stored copy so URL changes (e.g. switching to Cloudinary) take effect
    const index = arrLocalStoragesong.findIndex((currsong) => String(currsong.id) === String(id));
    if (index === -1) {
        arrLocalStoragesong.push(songdata);
    } else {
        arrLocalStoragesong[index] = songdata;
    }
    localStorage.setItem('songsLS', JSON.stringify(arrLocalStoragesong));
};

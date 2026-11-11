import { FALLBACK_IMAGE, imageUrl } from "./media";
import { clearQueue } from "./playQueue";
import { playSong } from "./playSong";
import { saveSong } from "./saveData";

const songTemplate = document.querySelector("#songTemplate");

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Build one song card from the template. Clicking it saves + plays the song.
// `song` is { id, name, singer, image, song, badge?, youtubeQuery? }.
export const createSongCard = (song) => {
    const fragment = document.importNode(songTemplate.content, true);
    const card = fragment.querySelector(".App__section-grid-item");
    card.dataset.songId = String(song.id);
    card.querySelector(".songName").textContent = song.name;
    card.querySelector(".songSinger").textContent = song.singer;
    const img = card.querySelector(".songImage");
    img.src = imageUrl(song.image);
    img.alt = song.name;
    img.loading = "lazy";
    // Broken cover link (happens with some search results): show a placeholder instead
    img.addEventListener("error", () => { img.src = FALLBACK_IMAGE; }, { once: true });

    if (song.badge) {
        const badge = document.createElement("span");
        badge.className = "songBadge";
        badge.textContent = song.badge;
        card.append(badge);
    }

    card.addEventListener("click", () => {
        clearQueue(); // picking a song by hand ends any playlist queue
        saveSong(song);
        playSong(song.id);
    });
    return card;
};

// Shuffle a list and render it into a container. `mood`: the row's vibe (see moods.js)
const renderSongs = (songs, containerSelector, mood) => {
    const songContainer = document.querySelector(containerSelector);
    shuffleArray(songs);
    songs.forEach((rowSong) => {
        const song = { ...rowSong, mood };
        songContainer.append(createSongCard(song));
        saveSong(song); // so liked songs / startup song work before any click
    });
};

export const homeSongsCards = (songs, songs2, songs3, songs4, songs5) => {
    if (!songs) {
        return false;
    }
    renderSongs(songs, "#songContainer", "drive");
    renderSongs(songs2, "#songContainersecond", "party");
    renderSongs(songs3, "#songContainerThird", "moonlit");
    renderSongs(songs4, "#songContainerFourth", "rain");
    renderSongs(songs5, "#songContainerFivth", "drive");
};

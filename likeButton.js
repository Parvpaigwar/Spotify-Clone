import { getLikedsongData } from "./getLikedsongData";
import { getPlaysongData } from "./getPlaysongData";
import { getSongsFromLS } from "./getSongsFromLS";
import { showToast } from "./showToast";
import { recordTaste } from "./taste";

export const likeButton = () => {
    // The current song is the most recent entry in the play history
    const history = getPlaysongData();
    const id = history[history.length - 1];
    const song = getSongsFromLS().find((currsong) => String(currsong.id) === String(id));
    if (!song) {
        showToast("noSongPlaying");
        return;
    }

    const likedsongData = getLikedsongData();
    if (likedsongData.includes(id)) {
        showToast("repeat", song.songName);
    } else {
        likedsongData.push(id);
        localStorage.setItem('likedsongDataLS', JSON.stringify(likedsongData));
        showToast("add", song.songName);
        recordTaste(song, "like");
    }
};

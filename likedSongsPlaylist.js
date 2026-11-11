import { getLikedsongData } from "./getLikedsongData";
import { setQueue } from "./playQueue";
import { playSong } from "./playSong";
import { showToast } from "./showToast";

// Plays liked songs one after another: the first now, the rest as each one ends.
export const likedSongsPlaylist = () => {
    const likedsongData = getLikedsongData();
    if (likedsongData.length === 0) {
        showToast("noLikedSongs");
        return;
    }
    showToast("likedsongplaylist");
    setQueue(likedsongData);
    playSong(likedsongData[0]);
};

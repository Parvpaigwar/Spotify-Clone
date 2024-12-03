import { getLikedsongData } from "./getLikedsongData";
import { playSong } from "./playSong";
import { showToast } from "./showToast";

export const likedSongsPlaylist  = () => {
    const likedsongData = getLikedsongData();
    showToast("likedsongplaylist")
    likedsongData.forEach((id, index) => {
        playSong(id)
    });
    

}
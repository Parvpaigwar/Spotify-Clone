import { getLikedsongData } from "./getLikedsongData";
import { getSongsFromLS } from "./getSongsFromLS";
import { showToast } from "./showToast";

export const likeButton = (audioPlayer) => {
    const likedsongData = getLikedsongData();
    let arrLocalStoragesong = getSongsFromLS();
    let src = audioPlayer.src;
    let song = arrLocalStoragesong.find((currsong) => currsong.songAudio === `${src}`);
    const id = song.id
    // saving like 
    
    // console.log(existingsong);
    if (likedsongData.includes(id)){
        showToast("repeat",song.songName)

    }
    else{
        likedsongData.push(id)
        localStorage.setItem('likedsongDataLS', JSON.stringify(likedsongData));
        showToast("add",song.songName)
    }



}
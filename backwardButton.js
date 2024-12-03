import { getPlaysongData } from "./getPlaysongData";
import { playSong } from "./playSong";

export const backwardButton = () => {
    let previousSongIndex ;
    let playSongData = getPlaysongData(); 
    let curSongIndex = playSongData.length-1;
    console.log(curSongIndex);
    if(curSongIndex<1) previousSongIndex =  curSongIndex;
    else  previousSongIndex = curSongIndex-1;
    playSong(playSongData[previousSongIndex]);

}

import { getPlaysongData } from "./getPlaysongData";
import { playSong } from "./playSong";

export const forwardButton = () => {
    let nextSongIndex = 0 ;
    let playSongData = getPlaysongData(); 
    playSong(playSongData[nextSongIndex]);

}

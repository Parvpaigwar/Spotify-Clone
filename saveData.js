import { getSongsFromLS } from "./getSongsFromLS";

export const saveData = (id) => {
    let cursong = document.querySelector(`#song${id}`);    

    let arrLocalStoragesong = getSongsFromLS();

    let songName = cursong.querySelector("#songName").innerText;
    let songImage = cursong.querySelector(".songImage").src;
    let songSinger = cursong.querySelector("#songSinger").innerText;
    let songAudio = cursong.querySelector("#songAudio source").src;

    let songdata = {id,songName,songImage, songSinger,songAudio};


    let existingsong = arrLocalStoragesong.find((currsong) => currsong.id === id);
    if(!existingsong){
        arrLocalStoragesong.push(songdata);
    }
    localStorage.setItem('songsLS',JSON.stringify(arrLocalStoragesong));


};
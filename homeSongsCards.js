import { playSong } from "./playSong";
import { saveData } from "./savedata";

const songContainer = document.querySelector("#songContainer");
const songTemplate = document.querySelector("#songTemplate");

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}  


// ,songs3,songs4,songs5,songs6,songs7,songs8,songs9,songs10
export const homeSongsCards = (songs,songs2,songs3,songs4,songs5) => {
    if(!songs){
        return false;
    }

    shuffleArray(songs);
    shuffleArray(songs2);
    shuffleArray(songs3);
    shuffleArray(songs4);
    shuffleArray(songs5);
    // shuffleArray(songs6);
    // shuffleArray(songs7);
    // shuffleArray(songs8);
    // shuffleArray(songs9);
    // shuffleArray(songs10);


    songs.forEach(element => {
        const {id ,name,singer,image ,song} = element;

        const songClone = document.importNode(songTemplate.content,true);
        // # we copy the template as a clone now we just fill the values and append it
        songClone.querySelector("#songValue").setAttribute("id", `song${id}`);
        songClone.querySelector("#songName").textContent = name; // same as innertext
        songClone.querySelector(".songImage").src = image;
        songClone.querySelector(".songImage").alt = name;
        songClone.querySelector("#songSinger").textContent = singer;
        songClone.querySelector("#songAudio source").src = song;


        songClone.querySelector(".App__section-grid-item").addEventListener("click",(event) =>{
            
            playSong(id);
        });
        songContainer.append(songClone);
        saveData(id);

    });



    songs2.forEach(element => {
        const {id ,name,singer,image ,song} = element;

        const songClone = document.importNode(songTemplate.content,true);
        const songContainer = document.querySelector("#songContainersecond");
        // # we copy the template as a clone now we just fill the values and append it
        songClone.querySelector("#songValue").setAttribute("id", `song${id}`);
        songClone.querySelector("#songName").textContent = name; // same as innertext
        songClone.querySelector(".songImage").src = image;
        songClone.querySelector(".songImage").alt = name;
        songClone.querySelector("#songSinger").textContent = singer;
        songClone.querySelector("#songAudio source").src = song;


        songClone.querySelector(".App__section-grid-item").addEventListener("click",(event) =>{
            
            playSong(id);
        });
        songContainer.append(songClone);
        saveData(id);

    });

    songs3.forEach(element => {
        const {id ,name,singer,image ,song} = element;
        const songContainer = document.querySelector("#songContainerThird");
        const songClone = document.importNode(songTemplate.content,true);
        // # we copy the template as a clone now we just fill the values and append it
        songClone.querySelector("#songValue").setAttribute("id", `song${id}`);
        songClone.querySelector("#songName").textContent = name; // same as innertext
        songClone.querySelector(".songImage").src = image;
        songClone.querySelector(".songImage").alt = name;
        songClone.querySelector("#songSinger").textContent = singer;
        songClone.querySelector("#songAudio source").src = song;


        songClone.querySelector(".App__section-grid-item").addEventListener("click",(event) =>{
            
            playSong(id);
        });
        songContainer.append(songClone);
        saveData(id);

    });
    songs4.forEach(element => {
        const {id ,name,singer,image ,song} = element;
        const songContainer = document.querySelector("#songContainerFourth");
        const songClone = document.importNode(songTemplate.content,true);
        // # we copy the template as a clone now we just fill the values and append it
        songClone.querySelector("#songValue").setAttribute("id", `song${id}`);
        songClone.querySelector("#songName").textContent = name; // same as innertext
        songClone.querySelector(".songImage").src = image;
        songClone.querySelector(".songImage").alt = name;
        songClone.querySelector("#songSinger").textContent = singer;
        songClone.querySelector("#songAudio source").src = song;


        songClone.querySelector(".App__section-grid-item").addEventListener("click",(event) =>{
            
            playSong(id);
        });
        songContainer.append(songClone);
        saveData(id);

    });
    songs5.forEach(element => {
        const {id ,name,singer,image ,song} = element;
        const songContainer = document.querySelector("#songContainerFivth");
        const songClone = document.importNode(songTemplate.content,true);
        // # we copy the template as a clone now we just fill the values and append it
        songClone.querySelector("#songValue").setAttribute("id", `song${id}`);
        songClone.querySelector("#songName").textContent = name; // same as innertext
        songClone.querySelector(".songImage").src = image;
        songClone.querySelector(".songImage").alt = name;
        songClone.querySelector("#songSinger").textContent = singer;
        songClone.querySelector("#songAudio source").src = song;


        songClone.querySelector(".App__section-grid-item").addEventListener("click",(event) =>{
            
            playSong(id);
        });
        songContainer.append(songClone);
        saveData(id);

    });
    
};

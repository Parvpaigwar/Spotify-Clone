import './style.css';
import songs from "./api/songs.json";
import songs2 from "./api/songs2.json";
import songs3 from "./api/songs3.json";
import songs4 from "./api/songs4.json";
import songs5 from "./api/songs5.json";



import { homeSongsCards } from './homeSongsCards';
import { playSong } from './playSong';
import { pauseButton } from './pauseButton';
import { shuffleButton } from './shuffleButton';
import { backwardButton } from './backwardButton';
import { forwardButton } from './forwardButton';
import { firstSongset } from './firstSongset';
import { likeButton } from './likeButton';
import { progressBar } from './progressbar';
import { likedSongsPlaylist } from './likedSongsPlaylist';
import { showToast } from './showToast';
import { volume } from './volume';
// import { fetchData } from './fetchData';


// async function main() {
//     try {
//       const songs = await fetchData(); 
//       console.log("Fetched Data:", JSON.stringify(data, null, 2)); 
//     } catch (error) {
//       console.error("Error fetching data:", error); 
//     }
//   }
  
//   main(); 

// # for automatically night chanegs appers
playSong(1)
firstSongset(audioPlayer)
// let audio = document.getElementById(audioPlayer.id);
// if(audio.play()){
//     document.querySelector("#runPauseButton").setAttribute("class", "fa-solid fa-play");
// }
// else if(audio.pause()){
//     document.querySelector("#runPauseButton").setAttribute("class", "fa-solid fa-pause");
// }


// call the functions to display all the songs as a card
// Define a function named 'homeSongsCards' that takes an array of songs as input

homeSongsCards(songs,songs2,songs3,songs4,songs5);
volume();

document.querySelector(".pauseButton").addEventListener("click",(event) =>{
            
    pauseButton(audioPlayer);
});
document.querySelector(".shuffleButton").addEventListener("click",(event) =>{
            
    showToast("comingSoon", "name");
    console.log(audioPlayer);
});
document.querySelector(".backwardButton").addEventListener("click",(event) =>{
            
    backwardButton();
});
document.querySelector(".forwardButton").addEventListener("click",(event) =>{
            
    forwardButton();
});
document.querySelector(".likeButton").addEventListener("click",(event) =>{
            
    likeButton(audioPlayer);
});
document.querySelector("#progress-container").addEventListener("click",(event) =>{
            
    progressBar();
});

document.querySelector(".likedSongsPlaylist").addEventListener("click",(event) =>{
            
    likedSongsPlaylist();
});
document.querySelector("#likedSongsPlaylist").addEventListener("click",(event) =>{
            
    likedSongsPlaylist();
});


const buttons = document.querySelectorAll(".playlistButton"); 
buttons.forEach(button => {
    button.addEventListener("click", (event) => {
      showToast("comingSoon", "name");
    });
  });

// # automatically play next song 
// const curtime = document.querySelector("#current-time")
// if(curtime===audioPlayer.audio.length){
//     forwardButton();
// }

// Select all elements with the class "seeall"
const seeall = document.querySelectorAll(".seeall");

seeall.forEach(element => {
  element.addEventListener("click", (event) => {
    // Replace 'showToast' with your function logic
    showToast("comingSoon", "name");
  });
});

document.querySelector(".App__user").addEventListener("click",(event) =>{
            
    showToast("comingSoon", "name");
});
// navbuttons
const navbuttons = document.querySelectorAll("#navbuttons");

navbuttons.forEach(element => {
  element.addEventListener("click", (event) => {
    // Replace 'showToast' with your function logic
    showToast("comingSoon", "name");
  });
});
document.querySelector("#homebutton").addEventListener("click",(event) =>{
            
    location.reload();
});
const extra = document.querySelectorAll("#extra");

extra.forEach(element => {
  element.addEventListener("click", (event) => {
    // Replace 'showToast' with your function logic
    showToast("comingSoon", "name");
  });
});

const sidebuttons = document.querySelectorAll("#sidebuttons");

sidebuttons.forEach(element => {
  element.addEventListener("click", (event) => {
    // Replace 'showToast' with your function logic
    showToast("comingSoon", "name");
  });
});
document.querySelector(".repeatButton").addEventListener("click",(event) =>{
            
    showToast("comingSoon", "name");
});
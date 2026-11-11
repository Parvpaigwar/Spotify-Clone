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
import { likeButton } from './likeButton';
import { progressBar } from './progressBar';
import { likedSongsPlaylist } from './likedSongsPlaylist';
import { showToast } from './showToast';
import { volume } from './volume';
import { setupSearch } from './search';
import { loadOnlineRows } from './onlineRows';
import { renderBoneLounge } from './boneLounge';
import { getPlaybackTime, onEnded, onPlayStateChange, toggleNowPanel } from './player';
import { recordTaste } from './taste';
import { getPlaysongData } from './getPlaysongData';
import { getSongsFromLS } from './getSongsFromLS';
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

// Audius was removed (2026-11-12): drop its songs from saved songs, play history and likes
for (const key of ["songsLS", "playSongDataLS", "likedsongDataLS"]) {
  try {
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    const kept = list.filter((item) => !String(item?.id ?? item).startsWith("audius:"));
    if (kept.length !== list.length) localStorage.setItem(key, JSON.stringify(kept));
  } catch {
    // unreadable entry: leave it as it is
  }
}

// # for automatically night chanegs appers
// Render cards first: that saves every song, so song 1 can be found and played
homeSongsCards(songs,songs2,songs3,songs4,songs5);
setupSearch([...songs, ...songs2, ...songs3, ...songs4, ...songs5]);
renderBoneLounge(document.querySelector("#loungeTrack"));

// More rows below: songs found with iTunes, played in full from YouTube
const localSongs = [...songs, ...songs2, ...songs3, ...songs4, ...songs5];
loadOnlineRows(
  document.querySelector("#onlineRows"),
  new Set(localSongs.map((song) => String(song.id))),
  document.querySelector("#tasteRow")
);

// The song playing right now (last entry of the play history), for the taste tracker
const currentSong = () => {
  const history = getPlaysongData();
  const id = history[history.length - 1];
  return getSongsFromLS().find((song) => String(song.id) === String(id));
};
playSong(1, { autoplay: false }) // ready in the player bar, starts on Play
// let audio = document.getElementById(audioPlayer.id);
// if(audio.play()){
//     document.querySelector("#runPauseButton").setAttribute("class", "fa-solid fa-play");
// }
// else if(audio.pause()){
//     document.querySelector("#runPauseButton").setAttribute("class", "fa-solid fa-pause");
// }


// call the functions to display all the songs as a card
// Define a function named 'homeSongsCards' that takes an array of songs as input

volume();
progressBar();

// Play/pause icon follows the real player state (audio or YouTube)
onPlayStateChange((isPlaying) => {
    document.querySelector("#runPauseButton").setAttribute("class", isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play");
    document.body.classList.toggle("is-playing", isPlaying); // the skull logo nods along
});

// When a song ends, play the next one (same as the forward button):
// next in the queue (e.g. Liked Songs) if one is active, otherwise the next card on the page
onEnded(() => {
    recordTaste(currentSong(), "finish"); // listened to the end
    forwardButton();
});

document.querySelector(".pauseButton").addEventListener("click",(event) =>{
            
    pauseButton();
});
document.querySelector(".shuffleButton").addEventListener("click",(event) =>{
            
    showToast("comingSoon", "name");
    console.log(audioPlayer);
});
document.querySelector(".backwardButton").addEventListener("click",(event) =>{
            
    backwardButton();
});
document.querySelector(".forwardButton").addEventListener("click",(event) =>{
    // Skipped within the first 20 seconds: not their thing
    const { time, playing } = getPlaybackTime();
    if (playing && time < 20) recordTaste(currentSong(), "skip");

    forwardButton();
});
document.querySelector(".likeButton").addEventListener("click",(event) =>{
            
    likeButton();
});

document.querySelectorAll(".likedSongsPlaylist").forEach(button => {
  button.addEventListener("click", () => {
    likedSongsPlaylist();
  });
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

// "Show all" / "Show less": a row shows one line of cards until expanded
document.querySelector(".App__main-view").addEventListener("click", (event) => {
  const button = event.target.closest(".seeall");
  if (!button) return;
  const section = button.closest(".App__section");
  const expanded = section.classList.toggle("App__section--expanded");
  button.textContent = expanded ? "Show less" : "Show all";
});

// Footer "Dig up more songs" → search box
document.querySelector(".App__bottom-search").addEventListener("click", () => {
  document.querySelector("#searchInput").focus();
});

// Settings: the gear opens a small menu. Light mode can be tried, but never turns on.
const settingsButton = document.querySelector("#settingsButton");
const settingsMenu = document.querySelector("#settingsMenu");
settingsButton.addEventListener("click", (event) => {
  event.stopPropagation();
  settingsMenu.hidden = !settingsMenu.hidden;
  settingsButton.setAttribute("aria-expanded", String(!settingsMenu.hidden));
});
document.addEventListener("click", (event) => {
  if (!settingsMenu.hidden && !settingsMenu.contains(event.target)) {
    settingsMenu.hidden = true;
    settingsButton.setAttribute("aria-expanded", "false");
  }
});
const lightModeToggle = document.querySelector("#lightModeToggle");
lightModeToggle.addEventListener("click", () => {
  if (lightModeToggle.classList.contains("is-trying")) return;
  lightModeToggle.classList.add("is-trying"); // the switch slides on… and snaps back
  document.body.classList.add("is-sunburnt");
  showToast("lightMode");
  setTimeout(() => {
    lightModeToggle.classList.remove("is-trying");
    document.body.classList.remove("is-sunburnt");
  }, 900);
});

// Phones: tapping the song in the player bar opens / closes the full Now Playing view
document.querySelector(".function .music").addEventListener("click", (event) => {
  if (event.target.closest(".likeButton")) return;
  if (window.matchMedia("(max-width: 768px)").matches) toggleNowPanel();
});
document.querySelector(".App__now-panel-title").addEventListener("click", () => {
  if (window.matchMedia("(max-width: 768px)").matches) toggleNowPanel();
});

// Buttons that don't do anything yet
document.querySelectorAll(".comingSoon").forEach(element => {
  element.addEventListener("click", () => showToast("comingSoon", "name"));
});

document.querySelector(".App__user").addEventListener("click",(event) =>{
            
    showToast("comingSoon", "name");
});
// navbuttons
const navbuttons = document.querySelectorAll(".navbuttons:not(#homebutton):not(#searchNavButton)");

navbuttons.forEach(element => {
  element.addEventListener("click", (event) => {
    // Replace 'showToast' with your function logic
    showToast("comingSoon", "name");
  });
});
document.querySelector("#homebutton").addEventListener("click",(event) =>{
            
    location.reload();
});
// Player bar: "Now playing view" opens / closes the Now Playing panel
document.querySelector("#nowPanelToggle").addEventListener("click", toggleNowPanel);

const extra = document.querySelectorAll(".extra:not(#nowPanelToggle)");

extra.forEach(element => {
  element.addEventListener("click", (event) => {
    // Replace 'showToast' with your function logic
    showToast("comingSoon", "name");
  });
});

const sidebuttons = document.querySelectorAll(".sidebuttons:not(.likedSongsPlaylist)");

sidebuttons.forEach(element => {
  element.addEventListener("click", (event) => {
    // Replace 'showToast' with your function logic
    showToast("comingSoon", "name");
  });
});
document.querySelector(".repeatButton").addEventListener("click",(event) =>{
            
    showToast("comingSoon", "name");
});
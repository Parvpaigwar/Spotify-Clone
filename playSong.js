import { getPlaysongData } from "./getPlaysongData";
import { getSongsFromLS } from "./getSongsFromLS";
import { savingPlaySongData } from "./savingPlaySongData";

export const playSong = (id) => {
  let arrLocalStoragesong = getSongsFromLS();
  savingPlaySongData(id)
  // savingPlaySongData(id)

  // Find the song from local storage
  let existingsong = arrLocalStoragesong.find((currsong) => currsong.id === id);
  

  if (existingsong) {

    document.querySelector("#playingBarName").textContent = existingsong.songName;
    document.querySelector("#playingBarSinger").textContent = existingsong.songSinger;
    document.querySelector("#playingBarImage").src = existingsong.songImage;
    let cursong = existingsong.songAudio; // This is the song path
    
    // Create or find the audio element
    let audio = document.querySelector("#audioPlayer");

    if (!audio) {
      // If no audio element exists, create one
      audio = document.createElement("audio");
      audio.id = "audioPlayer"; // Give it an ID
      document.body.appendChild(audio); // Add it to the DOM
    }

    // Set the source dynamically
    audio.src = cursong; // Set the song's path to the audio element
    audio.load(); // Load the new audio

    // Play the audio
    audio.play();

    // Update the song's duration when metadata is loaded
    audio.addEventListener("loadedmetadata", () => {
      const totalDuration = formatTime(audio.duration);
      document.getElementById("song-duration").textContent = totalDuration;
    });

    // Update the current time and progress bar as the song plays
    audio.addEventListener("timeupdate", () => {
      const currentTime = formatTime(audio.currentTime);
      document.getElementById("current-time").textContent = currentTime;

      const progressBar = document.getElementById("progress-bar");
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
    });
  } else {
    console.error("Song not found in local storage.");
  }
  getPlaysongData()
};

// Utility function to format time in MM:SS
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

// const updateContext = (existingsong) => {
//   console.log(existingsong);
//   document.getElementById("#playingBarName").textContent = existingsong.songName;
//   document.getElementById("#playingBarSinger").textContent = existingsong.songSinger;
//   document.getElementById("#playingBarImage").src = existingsong.songImage;



// }
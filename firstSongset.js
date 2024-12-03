export const firstSongset = (audioPlayer) => {

    let audio = document.getElementById(audioPlayer.id);
    if (audio.paused) {
           
        audio.play();
    } else {
        audio.pause();
        document.querySelector("#runPauseButton").setAttribute("class", "fa-solid fa-play");

        
    }
}


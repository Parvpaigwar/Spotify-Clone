export const pauseButton = (audioPlayer) => {

    let audio = document.getElementById(audioPlayer.id);
    if (audio.paused) {
        document.querySelector("#runPauseButton").setAttribute("class", "fa-solid fa-pause");        
        audio.play();
    } else {
        audio.pause();
        document.querySelector("#runPauseButton").setAttribute("class", "fa-solid fa-play");
    }
}


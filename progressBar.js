export const progressBar = () =>{
    const audio = document.getElementById("audioPlayer");
    const progressContainer = document.getElementById("progress-container");
    const progressBar = document.getElementById("progress-bar");
    const progressDot = document.getElementById("progress-dot");

    // Update progress bar as the audio plays
    audio.addEventListener("timeupdate", () => {
    const { duration, currentTime } = audio;

    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;

        // Show and move the progress dot
        progressDot.style.display = "block";
        progressDot.style.left = `${progressPercent}%`;
    }
    });

    // Seek functionality: Update the audio current time when clicking on the progress bar
    progressContainer.addEventListener("click", (e) => {
    const containerWidth = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;

    // Calculate the new time based on where the user clicked
    const newTime = (clickX / containerWidth) * duration;

    audio.currentTime = newTime;
    });

}

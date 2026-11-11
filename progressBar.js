import { onTimeUpdate, seek } from "./player";

// Progress bar, time labels and seeking, for both the audio and YouTube players. Call once.
export const progressBar = () => {
    const progressContainer = document.getElementById("progress-container");
    const progressBar = document.getElementById("progress-bar");
    const progressDot = document.getElementById("progress-dot");
    const currentTimeLabel = document.getElementById("current-time");
    const durationLabel = document.getElementById("song-duration");

    onTimeUpdate(({ current, duration }) => {
        currentTimeLabel.textContent = formatTime(current);
        durationLabel.textContent = formatTime(duration);
        const progressPercent = duration ? (current / duration) * 100 : 0;
        progressBar.style.width = `${progressPercent}%`;
        progressDot.style.left = `${progressPercent}%`;
    });

    // Seek: jump to where the user clicked on the bar
    progressContainer.addEventListener("click", (e) => {
        const rect = progressContainer.getBoundingClientRect();
        seek((e.clientX - rect.left) / rect.width);
    });
};

// Format seconds as M:SS
const formatTime = (time) => {
    if (!Number.isFinite(time)) time = 0;
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

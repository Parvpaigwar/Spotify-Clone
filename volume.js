import { setVolume } from "./player";

// Volume slider + speaker icon. Clicking the icon mutes / restores the previous volume.
export const volume = () => {
    const volumeButton = document.querySelector("#volumeButton");
    const volumeToggle = volumeButton.closest("button");
    const volumeSlider = document.querySelector("#volumeSlider");
    let lastVolume = 1;

    const apply = (value) => {
        setVolume(value);
        volumeSlider.value = String(value);
        volumeSlider.style.setProperty("--fill", `${value * 100}%`);
        const icon = value === 0 ? "fa-volume-xmark" : value < 0.5 ? "fa-volume-low" : "fa-volume-high";
        volumeButton.className = `fa-solid ${icon}`;
        volumeToggle.setAttribute("aria-label", value === 0 ? "Unmute" : "Mute");
        volumeToggle.title = value === 0 ? "Unmute" : "Mute";
    };

    apply(1);

    volumeToggle.addEventListener("click", () => {
        const current = Number(volumeSlider.value);
        if (current > 0) {
            lastVolume = current;
            apply(0);
        } else {
            apply(lastVolume || 1);
        }
    });

    volumeSlider.addEventListener("input", (event) => {
        apply(Number(event.target.value));
    });
};

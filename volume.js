export const volume = () => {
    const audioPlayer = document.querySelector("#audioPlayer");
    const volumeButton = document.querySelector("#volumeButton");
    const volumeSlider = document.querySelector("#volumeSlider");
  
    audioPlayer.volume = 1; 
  
    volumeButton.addEventListener("click", () => {
      if (volumeSlider.style.display === "none" || !volumeSlider.style.display) {
        volumeSlider.style.display = "inline-block"; 
      } else {
        volumeSlider.style.display = "none"; // Hide slider
      }
    });
  
    
    volumeSlider.addEventListener("input", (event) => {
      audioPlayer.volume = event.target.value; // Set audio volume
    });
  };
  
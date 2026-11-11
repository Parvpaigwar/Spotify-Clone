// Shows text in an element; if it's too long to fit, it scrolls side to side
// (like Spotify's now-playing title) instead of being cut off.
const marqueeElements = new Set();

const updateMarquee = (el) => {
    const inner = el.querySelector(".scrollText");
    el.classList.remove("scrolling");
    const overflow = inner.scrollWidth - el.clientWidth;
    if (overflow > 0) {
        el.style.setProperty("--marquee-distance", `${overflow}px`);
        // ~40px per second, at least 4s each way
        el.style.setProperty("--marquee-duration", `${Math.max(4, overflow / 40)}s`);
        el.classList.add("scrolling");
    }
};

export const setMarqueeText = (el, text) => {
    el.textContent = "";
    const inner = document.createElement("span");
    inner.className = "scrollText";
    inner.textContent = text;
    el.append(inner);
    el.title = text;
    marqueeElements.add(el);
    updateMarquee(el);
};

// Re-check when the window size changes the available width
window.addEventListener("resize", () => marqueeElements.forEach(updateMarquee));

// "The Bone Lounge": every skeleton-listening-to-music picture (public/theme/pins) drifting past in a loop.
// Pure decoration; the list is drawn twice so the CSS loop has no gap.
const PINS = [
    "sunglasses-headphones", "vinyl-hands", "dancing", "coffee-headphones", "moon-guitar", "orange-headphones",
    "headphones-rock", "candle-turntable", "flower-headphones", "red-earphones", "vinyl-skull",
    "real-headphones", "dancing-earbuds", "hooded-headphones", "red-headphones", "ribcage-guitar", "headache-headphones",
    "flower-guitar", "gold-headphones", "vinyl-painting", "hoodie-coffee",
];

export const renderBoneLounge = (track) => {
    if (!track) return;
    for (const copy of [0, 1]) {
        for (const name of PINS) {
            const img = document.createElement("img");
            img.src = `/theme/pins/${name}.webp`;
            img.alt = "";
            img.decoding = "async";
            if (copy) img.setAttribute("aria-hidden", "true");
            track.append(img);
        }
    }
};

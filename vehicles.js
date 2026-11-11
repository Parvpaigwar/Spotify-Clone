// The ride: a small vehicle with a skeleton rider driving along the road lane between the page and the
// player bar (#rideLane). Its position = how far the song has played. Each vibe has its own vehicle.
//  - click it  → it does a trick (hop, wheelie, honk…)
//  - drag it   → seek: drop it anywhere on the road and the song jumps there
import { onTimeUpdate, seek } from "./player";

const INK = "#0d0714";
const BONE = "#ebe5f2";

// Wheel at (cx, cy), radius r. Spins while music plays (CSS .ride-wheel).
const wheel = (cx, cy, r, spokes = 2) => {
    let lines = "";
    for (let i = 0; i < spokes; i++) {
        const a = (Math.PI / spokes) * i;
        const dx = (Math.cos(a) * r * 0.8).toFixed(2);
        const dy = (Math.sin(a) * r * 0.8).toFixed(2);
        lines += `M${cx - dx} ${cy - dy} L${cx + +dx} ${cy + +dy} `;
    }
    return `<g class="ride-wheel" style="transform-origin:${cx}px ${cy}px">
<circle cx="${cx}" cy="${cy}" r="${r}" fill="${INK}" stroke="#3a3346" stroke-width="1.2"/>
<circle cx="${cx}" cy="${cy}" r="${(r * 0.62).toFixed(2)}" fill="#cfc9dc"/>
<path d="${lines}" stroke="#6d6480" stroke-width="1"/>
<circle cx="${cx}" cy="${cy}" r="1.3" fill="${INK}"/></g>`;
};

// A bone (rider's arm / leg / spine): ink outline + bone fill
const bone = (d, w = 2.2) =>
    `<path d="${d}" stroke="${INK}" stroke-width="${w + 1.6}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" stroke="${BONE}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

// Headlight: a soft beam fading out in front
const glow = (x, y) =>
    `<polygon class="ride-beam" points="${x},${y - 1} ${x + 18},${y - 6} ${x + 18},${y + 6} ${x},${y + 1}" fill="url(#rideBeam)"/>
<circle cx="${x}" cy="${y}" r="1.5" fill="#fff3b0"/>`;
const DEFS = `<defs><linearGradient id="rideBeam" x1="0" x2="1" y1="0" y2="0">
<stop offset="0" stop-color="#fff6c8" stop-opacity="0.75"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient></defs>`;

// viewBox 0 0 64 40, facing right, wheels touch y≈37
export const VEHICLES = {
    drive: {
        name: "Convertible",
        rider: "sunglasses-headphones",
        trick: "BEEP BEEP!",
        svg: (c) => `
${glow(61, 25)}
${bone("M27 20 L28 12")}
<path d="M3 29 Q3 23 10 22 L22 21 Q26 21 28 19 L38 19 L44 13 L46 13 L42 20 Q52 21 58 23 Q62 24 62 28 L62 30 Q62 32 60 32 L56.5 32 A6.5 6.5 0 0 0 43.5 32 L21.5 32 A6.5 6.5 0 0 0 8.5 32 L5 32 Q3 32 3 30 Z" fill="${c}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
<path d="M8 26.5 L58 27.5" stroke="#fff" stroke-width="0.9" opacity="0.65"/>
<path d="M21 21 L22 14 Q23 12 25 13 L26 20" fill="#2b1840" stroke="${INK}" stroke-width="1"/>
<path d="M38.5 19 L44 13" stroke="#9feaff" stroke-width="1.6"/>
${bone("M28 15 L33 18 L38 17")}
<ellipse cx="39" cy="17" rx="1.2" ry="2.6" fill="none" stroke="${INK}" stroke-width="1.3"/>
<rect x="3" y="24" width="2" height="3" rx="0.6" fill="#ff3b3b"/>
${wheel(15, 31, 6)}${wheel(50, 31, 6)}`,
    },

    party: {
        name: "Party Van",
        rider: "orange-headphones",
        trick: "PARTY!",
        svg: (c) => `
${glow(60, 25)}
<rect x="15" y="4" width="15" height="6" rx="1.5" fill="#2b1840" stroke="${INK}" stroke-width="1"/>
<circle cx="19" cy="7" r="1.8" fill="#ff3fa4"/><circle cx="26" cy="7" r="1.8" fill="#3ee0d0"/>
<path d="M4 30 L4 14 Q4 10 8 10 L44 10 Q48 10 51 14 L58 21 Q61 22 61 26 L61 30 Q61 32 59 32 L55.5 32 A6.5 6.5 0 0 0 42.5 32 L21.5 32 A6.5 6.5 0 0 0 8.5 32 L6 32 Q4 32 4 30 Z" fill="${c}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
<path d="M4 24 H61" stroke="#8c1eff" stroke-width="2"/>
<rect x="8" y="13" width="10" height="7" rx="1" fill="#2a1440"/><rect x="20" y="13" width="10" height="7" rx="1" fill="#2a1440"/><rect x="32" y="13" width="9" height="7" rx="1" fill="#2a1440"/>
<circle class="ride-light" cx="11" cy="16" r="1.4" fill="#ff3fa4"/><circle class="ride-light" cx="25" cy="17" r="1.4" fill="#3ee0d0"/><circle class="ride-light" cx="36" cy="15.5" r="1.4" fill="#ffe58a"/>
<path d="M44 13 L49 13 L55 21 L44 21 Z" fill="#9feaff" opacity="0.55" stroke="${INK}" stroke-width="0.8"/>
${wheel(15, 31, 6)}${wheel(49, 31, 6)}`,
    },

    moonlit: {
        name: "Scooter",
        rider: "red-headphones",
        trick: "♥ ♥ ♥",
        svg: (c) => `
${glow(52, 12)}
${bone("M24 18 L32 22 L35 28")}
${bone("M22 18 L24 9")}
<path d="M5 31 Q4 21 16 19 L33 19 Q36 19 35 23 L33 31 Z" fill="${c}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
<path d="M13 19 Q20 15 30 18 L30 19.5 L13 20 Z" fill="#2b1840" stroke="${INK}" stroke-width="1"/>
<rect x="30" y="28" width="16" height="3" rx="1" fill="#6b3fb0" stroke="${INK}" stroke-width="0.8"/>
<path d="M44 30 L47 12 L51 12 L50 30 Z" fill="${c}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>
<path d="M43.5 32 Q49 23 55.5 32 Z" fill="${c}" stroke="${INK}" stroke-width="1.1"/>
<path d="M47 12 L52 9" stroke="#cfc9dc" stroke-width="1.6" stroke-linecap="round"/>
${bone("M24 12 L36 13 L49 10")}
${wheel(13, 33, 5)}${wheel(50, 33, 5)}`,
    },

    rain: {
        name: "Bicycle",
        rider: "real-headphones",
        trick: "RING RING!",
        svg: (c) => `
<path d="M8 -2 Q25 -14 42 -2 Q36 -4 33 -1 Q29 -4 25 -1 Q21 -4 17 -1 Q13 -4 8 -2 Z" fill="#1d6f6a" stroke="${INK}" stroke-width="1"/>
<path d="M25 -1 L26 14" stroke="#cfc9dc" stroke-width="1"/>
${wheel(14, 29, 8.5, 4)}${wheel(50, 29, 8.5, 4)}
<path d="M14 29 L26 29 L21 15 Z M26 29 L41 17 L21 15 M41 17 L50 29 M41 17 L42 11 L46 10" stroke="${c}" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M18 14.5 L25 14.5" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
${bone("M22 14 L25 7")}
${bone("M25 9 L36 11 L44 10.5")}
${bone("M22 15 L30 22 L26 29")}`,
    },

    hellfire: {
        name: "Chopper",
        rider: "headphones-rock",
        trick: "VROOOM!",
        svg: (c) => `
<g class="ride-flames"><path d="M5 26 Q-4 24 -9 27 Q-3 28 -6 31 Q0 29 5 29 Z" fill="#ffb347"/><path d="M5 26.8 Q-1 25.8 -4 27.5 Q0 28 -1 29.5 Q2 28.6 5 28.6 Z" fill="#ff5a1f"/></g>
<path d="M18 28 L5 27.4" stroke="#cfc9dc" stroke-width="2.2" stroke-linecap="round"/>
<path d="M5 30 Q7 21 18 22.5 L18 25.5 Q10 25 8.5 30.5 Z" fill="#1a0a08" stroke="${INK}" stroke-width="1"/>
<rect x="21" y="22" width="14" height="7" rx="1.5" fill="#6b6b78" stroke="${INK}" stroke-width="1"/>
<path d="M23 22 V29 M26 22 V29 M29 22 V29 M32 22 V29" stroke="#3a3346" stroke-width="0.8"/>
${bone("M19 20.5 L27 24 L30 30")}
<path d="M14 20 Q19 17 24 19 L24 21 L14 22 Z" fill="#2b1a12" stroke="${INK}" stroke-width="1"/>
<path d="M24 18 Q30 13 38 16 L38 20.5 L24 21 Z" fill="#1a0a08" stroke="${c}" stroke-width="1.2" stroke-linejoin="round"/>
<path d="M26 19.5 Q29 16 31 18 Q32 15.5 35 17" stroke="${c}" stroke-width="1" fill="none"/>
<path d="M39 14 L54 31" stroke="#cfc9dc" stroke-width="1.8" stroke-linecap="round"/>
<path d="M39 14 L37 6 L42 6" stroke="#cfc9dc" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
${bone("M19 20 L22 10")}
${bone("M22 12 L30 9 L38 6.5")}
${glow(41, 13)}
${wheel(12, 31, 6.5, 3)}${wheel(54, 31, 6, 3)}`,
    },
};

// Where each rider's head sits (px inside the 64x40 vehicle) and how the picture is cropped
const RIDER_SPOTS = {
    drive: { x: 28, y: 12, size: 15 },
    party: { x: 48, y: 19, size: 12 },
    moonlit: { x: 24, y: 9, size: 14 },
    rain: { x: 25, y: 7, size: 14 },
    hellfire: { x: 22, y: 10, size: 15 },
};

const dot = document.querySelector("#rideCar");
const container = document.querySelector("#rideLane");
const driven = document.querySelector("#rideDriven");

const place = (fraction) => {
    const pct = `${(Math.min(1, Math.max(0, fraction)) * 100).toFixed(3)}%`;
    dot.style.left = pct;
    driven.style.width = pct;
};
onTimeUpdate(({ current, duration }) => {
    if (!container.dataset.dragging) place(duration ? current / duration : 0);
});
const accent = () => getComputedStyle(document.body).getPropertyValue("--mood-accent").trim() || "#a45bff";
let current = null;

export const setVehicle = (mood) => {
    const v = VEHICLES[mood] || VEHICLES.drive;
    if (current === mood) return;
    current = mood;
    const spot = RIDER_SPOTS[mood] || RIDER_SPOTS.drive;
    dot.dataset.vehicle = mood;
    dot.title = `${v.name}: click for a trick, drag to jump in the song`;
    dot.innerHTML = `
<span class="ride" aria-hidden="true">
  <span class="ride-bubble"></span>
  <span class="ride-body">
    <svg class="ride-svg" viewBox="0 0 64 40" overflow="visible">${DEFS}${v.svg(accent())}</svg>
    <span class="ride-rider" style="--rx:${spot.x};--ry:${spot.y};--rs:${spot.size};background-image:url('/theme/pins/${v.rider}.webp')"></span>
  </span>
  <span class="ride-puffs"><i></i><i></i><i></i></span>
</span>`;
    dot.setAttribute("role", "slider");
    dot.setAttribute("aria-label", `Song position (${v.name})`);
};

export const vehicleName = (mood) => (VEHICLES[mood] || VEHICLES.drive).name;
export const riderPicture = (mood) => `/theme/pins/${(VEHICLES[mood] || VEHICLES.drive).rider}.webp`;

// ---------- click = trick, drag = seek ----------
const trick = () => {
    const v = VEHICLES[current] || VEHICLES.drive;
    const ride = dot.querySelector(".ride");
    if (!ride) return;
    ride.querySelector(".ride-bubble").textContent = v.trick;
    ride.classList.remove("is-trick");
    void ride.offsetWidth; // restart the animation
    ride.classList.add("is-trick");
};
dot.addEventListener("animationend", (e) => {
    if (e.animationName.startsWith("trick")) dot.querySelector(".ride")?.classList.remove("is-trick");
});

let drag = null;
dot.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dot.setPointerCapture(e.pointerId);
    drag = { startX: e.clientX, moved: false, fraction: null };
});
dot.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.startX) > 4) drag.moved = true;
    if (!drag.moved) return;
    const rect = container.getBoundingClientRect();
    drag.fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    container.dataset.dragging = "true"; // song-time updates don't move the vehicle while dragging
    place(drag.fraction);
});
const endDrag = (e) => {
    if (!drag) return;
    const { moved, fraction } = drag;
    drag = null;
    delete container.dataset.dragging;
    if (moved && fraction !== null) seek(fraction);
    else if (e.type === "pointerup") trick();
};
dot.addEventListener("pointerup", endDrag);
dot.addEventListener("pointercancel", endDrag);
// Clicking the lane (not the vehicle) also jumps there
container.addEventListener("click", (e) => {
    if (dot.contains(e.target)) return;
    const rect = container.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width);
});

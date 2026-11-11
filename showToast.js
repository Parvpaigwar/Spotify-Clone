// Pop-up messages, in the skeleton voice. Each kind has a few pictures and lines; one is picked at random
// (never the same line twice in a row). {name} is replaced by the song name.
const pin = (n) => `/theme/pins/${n}.webp`;
const theme = (n) => `/theme/${n}.png`;

const KINDS = {
    comingSoon: {
        art: [pin("candle-turntable"), pin("hoodie-coffee"), theme("walkman"), pin("coffee-headphones")],
        lines: [
            ["Still digging this one up", "Give the skeleton a few more nights with the shovel."],
            ["Not risen yet", "This feature is still six feet under. Soon."],
            ["Bones under construction", "We're still putting this one together, rib by rib."],
            ["The coffin's still closed", "Knock again later. Something is stirring in there."],
            ["Buried for now", "It comes out at midnight. Just not this midnight."],
        ],
    },
    add: {
        art: [pin("red-headphones"), theme("pinkskull")],
        lines: [
            ["Saved to your bones", "{name} is now in Liked Songs."],
            ["Straight to the heart you don't have", "{name} added to Liked Songs."],
            ["The skeleton approves", "{name} is in Liked Songs."],
        ],
    },
    repeat: {
        art: [pin("sunglasses-headphones")],
        lines: [
            ["Already in the crypt", "{name} is in Liked Songs already."],
            ["Loved it once, love it still", "{name} was already liked."],
        ],
    },
    likedsongplaylist: {
        art: [pin("dancing-earbuds"), theme("boombox")],
        lines: [
            ["Raising your favourites", "Playing Liked Songs."],
            ["The bones remember", "Playing everything you liked."],
        ],
    },
    noLikedSongs: {
        art: [pin("headache-headphones"), theme("walkman")],
        lines: [
            ["An empty grave", "No liked songs yet. Tap the heart on a song you love."],
            ["The skeleton is lonely", "Like a song and it will wait for you here."],
        ],
    },
    noSongPlaying: {
        art: [pin("real-headphones")],
        lines: [
            ["Dead silence", "Nothing is playing. Pick a song first."],
            ["Not a rattle", "Play something, then try again."],
        ],
    },
    youtubeFallback: {
        art: [pin("headache-headphones"), pin("hooded-headphones")],
        lines: [
            ["The full song stayed buried", "YouTube didn't answer, so here's a 30-second preview."],
            ["Only a bone of it", "Couldn't get the full song. Playing a 30-second preview."],
        ],
    },
    lightMode: {
        art: [pin("hooded-headphones"), pin("moon-guitar"), theme("skeleton")],
        lines: [
            ["Skeletons only come out at night", "Light mode would turn us to dust. It stays off, forever."],
            ["Nice try, sunshine", "We burn in daylight. Dark mode is the only mode."],
            ["The sun is not welcome here", "Light mode is permanently disabled, for our safety."],
            ["Hiss!", "Put that light away. The dead are trying to listen to music."],
        ],
    },
    error: {
        art: [pin("headache-headphones"), pin("vinyl-skull")],
        lines: [
            ["Something snapped", "A bone came loose. Try that again."],
            ["The crypt didn't answer", "Check your connection and try again."],
        ],
    },
};

const last = {};
const pick = (kind, list, key) => {
    let i = Math.floor(Math.random() * list.length);
    if (list.length > 1 && i === last[kind + key]) i = (i + 1) % list.length;
    last[kind + key] = i;
    return list[i];
};

export const showToast = (operation, name = "") => {
    const kind = KINDS[operation] ? operation : "repeat";
    const { art, lines } = KINDS[kind];
    const [title, text] = pick(kind, lines, "line");

    document.querySelector(".toast")?.remove(); // one message at a time

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    const img = document.createElement("img");
    img.src = pick(kind, art, "art");
    img.alt = "";
    const copy = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = title;
    const span = document.createElement("span");
    span.textContent = text.replace("{name}", name || "This song");
    copy.append(strong, span);
    toast.append(img, copy);
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3600);
};

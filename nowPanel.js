// Now Playing panel content: cover / title / singer / "playing from" label.
// Which media shows (YouTube video or cover + record) and open/close live in player.js.
const stage = document.querySelector(".App__now-stage");
const cover = document.querySelector("#nowCover");
const nameEl = document.querySelector("#nowPanelName");
const singerEl = document.querySelector("#nowPanelSinger");
const sourceEl = document.querySelector("#nowSource");

const SOURCES = {
    youtube: ["fa-brands fa-youtube", "Full song from YouTube"],
    preview: ["fa-brands fa-apple", "30s preview"],
    library: ["fa-solid fa-bone", "Your library"],
};

// song: an entry from songsLS ({ songName, songSinger, songImage })
export const setNowSong = (song) => {
    cover.src = song.songImage;
    cover.alt = song.songName;
    stage.style.setProperty("--now-cover", `url(${JSON.stringify(song.songImage)})`);
    nameEl.textContent = song.songName;
    singerEl.textContent = song.songSinger;
};

export const setNowSource = (kind) => {
    const [icon, text] = SOURCES[kind] || SOURCES.library;
    sourceEl.dataset.source = kind;
    sourceEl.hidden = kind === "youtube"; // no label for YouTube songs (user's choice)
    sourceEl.innerHTML = `<i class="${icon}" aria-hidden="true"></i> `;
    sourceEl.append(text);
};

// One player interface over two engines:
//  - "audio":   the <audio id="audioPlayer"> element (local / Cloudinary songs, iTunes previews)
//  - "youtube": the YouTube IFrame player, shown in the Now Playing panel (#youtubeBox) (YouTube requires it to be visible, ≥200×200)
// Controls (play/pause, progress, seek, volume, "ended") go through here, so they work for both.
const audio = document.querySelector("#audioPlayer");
const youtubeBox = document.querySelector("#youtubeBox"); // the Now Playing panel (video or cover + lyrics)
let panelClosedByUser = false; // closed with ✕ → stays closed for non-YouTube songs until reopened

// Phone layout places the video just above the player bar, so keep its height in a CSS variable
const playingBar = document.querySelector("#playingBar");
new ResizeObserver(() => {
    document.documentElement.style.setProperty("--player-bar-height", `${playingBar.offsetHeight}px`);
}).observe(playingBar);

let engine = "audio";
let playToken = 0; // bumps on every new track, so late async work for an old track is ignored
let volume = 1;
let youtubeFallback = null;
let pollTimer = null;

const listeners = { time: new Set(), state: new Set(), ended: new Set() };
const emit = (type, value) => listeners[type].forEach((cb) => cb(value));

export const onTimeUpdate = (cb) => listeners.time.add(cb); // cb({ current, duration })
export const onPlayStateChange = (cb) => listeners.state.add(cb); // cb(isPlaying)
export const onEnded = (cb) => listeners.ended.add(cb);

// ---------- <audio> engine ----------
const emitAudioTime = () => {
    if (engine === "audio") emit("time", { current: audio.currentTime || 0, duration: audio.duration || 0 });
};
audio.addEventListener("timeupdate", emitAudioTime);
audio.addEventListener("loadedmetadata", emitAudioTime);
audio.addEventListener("play", () => engine === "audio" && emit("state", true));
audio.addEventListener("pause", () => engine === "audio" && emit("state", false));
audio.addEventListener("ended", () => engine === "audio" && emit("ended"));

// ---------- YouTube engine ----------
let youtubeApi = null;
const loadYouTubeApi = () =>
    (youtubeApi ??= new Promise((resolve, reject) => {
        if (window.YT?.Player) return resolve(window.YT);
        const previous = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previous?.();
            resolve(window.YT);
        };
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.onerror = () => {
            youtubeApi = null;
            reject(new Error("YouTube player failed to load"));
        };
        document.head.append(script);
    }));

let ytPlayer = null;
let ytPlayerReady = null;
const getYouTubePlayer = () => {
    ytPlayerReady ??= loadYouTubeApi().then(
        (YT) =>
            new Promise((resolve) => {
                ytPlayer = new YT.Player("ytPlayer", {
                    width: 356,
                    height: 200,
                    // controls: 0 hides YouTube's own buttons (our player bar has them);
                    // iv_load_policy: 3 hides annotations; cc_load_policy: 1 turns on the
                    // video's captions (often the lyrics). The video itself stays visible.
                    playerVars: { playsinline: 1, rel: 0, controls: 0, disablekb: 1, iv_load_policy: 3, cc_load_policy: 1 },
                    events: {
                        onReady: () => resolve(ytPlayer),
                        onStateChange: (e) => {
                            if (engine !== "youtube") return;
                            if (e.data === YT.PlayerState.PLAYING) emit("state", true);
                            if (e.data === YT.PlayerState.PAUSED) emit("state", false);
                            if (e.data === YT.PlayerState.ENDED) {
                                emit("state", false);
                                emit("ended");
                            }
                        },
                        // e.g. the video owner blocked embedding → play the preview instead
                        onError: () => engine === "youtube" && youtubeFallback?.(),
                    },
                });
            })
    );
    ytPlayerReady.catch(() => (ytPlayerReady = null));
    return ytPlayerReady;
};

const stopYouTube = () => {
    clearInterval(pollTimer);
    ytPlayer?.stopVideo?.();
};

// The panel shows the YouTube video ("youtube") or the cover + spinning record ("audio")
const setPanelMode = (mode) => {
    youtubeBox.dataset.mode = mode;
};

// ---------- public API ----------
export const playAudio = (url, { autoplay = true } = {}) => {
    playToken++;
    stopYouTube();
    engine = "audio";
    setPanelMode("audio");
    if (!panelClosedByUser) youtubeBox.hidden = false;
    emit("time", { current: 0, duration: 0 });
    audio.src = url;
    audio.volume = volume;
    audio.load();
    if (autoplay) {
        audio.play().catch((error) => {
            // Browsers block autoplay until the user interacts with the page
            console.warn("Playback was blocked:", error.message);
        });
    }
};

export const playYouTube = async (videoId, { fallback } = {}) => {
    const token = ++playToken;
    audio.pause();
    engine = "youtube";
    youtubeFallback = fallback;
    setPanelMode("youtube");
    panelClosedByUser = false;
    youtubeBox.hidden = false; // YouTube's rule: the video must be visible while it plays
    emit("time", { current: 0, duration: 0 });
    try {
        const yt = await getYouTubePlayer();
        if (token !== playToken) return; // another song was picked meanwhile
        yt.setVolume(volume * 100);
        yt.loadVideoById(videoId);
        clearInterval(pollTimer);
        pollTimer = setInterval(() => {
            if (engine === "youtube") {
                emit("time", { current: yt.getCurrentTime() || 0, duration: yt.getDuration() || 0 });
            }
        }, 500);
    } catch (error) {
        console.warn(error);
        if (token === playToken) fallback?.();
    }
};

// Stop everything (used while looking up a YouTube video)
export const stop = () => {
    playToken++;
    audio.pause();
    stopYouTube();
    emit("state", false);
    emit("time", { current: 0, duration: 0 });
};

export const toggle = () => {
    if (engine === "youtube" && ytPlayer) {
        if (ytPlayer.getPlayerState() === window.YT.PlayerState.PLAYING) {
            ytPlayer.pauseVideo();
        } else {
            youtubeBox.hidden = false; // the video must be visible while it plays
            ytPlayer.playVideo();
        }
    } else if (audio.src) {
        audio.paused ? audio.play().catch(() => {}) : audio.pause();
    }
};

// Exact position right now (read every animation frame by the lyrics)
export const getPlaybackTime = () => {
    if (engine === "youtube" && ytPlayer?.getCurrentTime) {
        return { time: ytPlayer.getCurrentTime() || 0, playing: ytPlayer.getPlayerState?.() === window.YT?.PlayerState?.PLAYING };
    }
    return { time: audio.currentTime || 0, playing: !audio.paused && !audio.ended };
};

// fraction: 0..1 of the song
export const seek = (fraction) => {
    if (engine === "youtube" && ytPlayer) {
        ytPlayer.seekTo(fraction * (ytPlayer.getDuration() || 0), true);
    } else if (audio.duration) {
        audio.currentTime = fraction * audio.duration;
    }
};

// value: 0..1
export const setVolume = (value) => {
    volume = value;
    audio.volume = value;
    ytPlayer?.setVolume?.(value * 100);
};

// Close the Now Playing panel. A YouTube song pauses (it can't keep playing hidden); other songs keep playing.
const isPhone = () => window.matchMedia("(max-width: 768px)").matches;

// Phones: the panel is a full-screen sheet when "is-expanded"; collapsed, YouTube songs keep a small
// floating video (it must stay visible) and other songs show nothing.
export const closeNowPanel = () => {
    if (isPhone() && youtubeBox.classList.contains("is-expanded")) {
        youtubeBox.classList.remove("is-expanded"); // back to the small view; nothing pauses
        return;
    }
    if (engine === "youtube") {
        ytPlayer?.pauseVideo?.();
        emit("state", false);
    }
    panelClosedByUser = true;
    youtubeBox.hidden = true;
};

export const openNowPanel = () => {
    panelClosedByUser = false;
    youtubeBox.hidden = false;
    if (isPhone()) youtubeBox.classList.add("is-expanded");
};

export const toggleNowPanel = () => {
    const open = isPhone() ? youtubeBox.classList.contains("is-expanded") && !youtubeBox.hidden : !youtubeBox.hidden;
    return open ? closeNowPanel() : openNowPanel();
};

document.querySelector("#youtubeClose")?.addEventListener("click", closeNowPanel);

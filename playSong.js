import { getSongsFromLS } from "./getSongsFromLS";
import { setMarqueeText } from "./marquee";
import { playAudio, playYouTube, stop } from "./player";
import { savingPlaySongData } from "./savingPlaySongData";
import { showToast } from "./showToast";
import { findYouTubeVideo, youtubeEnabled } from "./youtube";
import { setNowSong, setNowSource } from "./nowPanel";
import { showLyrics, useUnsyncedLyrics } from "./lyrics";
import { applyVibe } from "./moods";
import { recordTaste } from "./taste";

let request = 0; // latest playSong call; older YouTube lookups are ignored

export const playSong = async (id, { autoplay = true } = {}) => {
  const arrLocalStoragesong = getSongsFromLS();
  // IDs: numbers for local songs, strings like "itunes:123" for search results
  const existingsong = arrLocalStoragesong.find((currsong) => String(currsong.id) === String(id));

  if (!existingsong) {
    console.error(`Song ${id} not found in local storage.`);
    return;
  }

  const myRequest = ++request;
  savingPlaySongData(existingsong.id);

  // Long names scroll side to side instead of being cut off
  setMarqueeText(document.querySelector("#playingBarName"), existingsong.songName);
  setMarqueeText(document.querySelector("#playingBarSinger"), existingsong.songSinger);
  document.querySelector("#playingBarImage").src = existingsong.songImage;
  setNowSong(existingsong);
  applyVibe(existingsong); // vehicle + colours for this song's mood
  if (autoplay) recordTaste(existingsong, "play");

  // Where it plays from + lyrics (30s previews start mid-song, so their lyrics can't be synced)
  const key = String(existingsong.id);
  const isPreview = key.startsWith("itunes:") && !(youtubeEnabled && existingsong.youtubeQuery && autoplay);
  setNowSource(key.startsWith("itunes:") ? (isPreview ? "preview" : "youtube") : "library");
  showLyrics(existingsong, { synced: !isPreview });

  // iTunes results: play the full song from YouTube, fall back to the 30s preview
  if (existingsong.youtubeQuery && youtubeEnabled && autoplay) {
    const playPreview = () => {
      if (myRequest !== request) return;
      showToast("youtubeFallback");
      setNowSource("preview");
      useUnsyncedLyrics();
      playAudio(existingsong.songAudio);
    };
    stop(); // silence the previous song while we look up the video
    try {
      const videoId = await findYouTubeVideo(existingsong);
      if (myRequest !== request) return;
      if (videoId) {
        playYouTube(videoId, { fallback: playPreview });
      } else {
        playPreview();
      }
    } catch (error) {
      console.warn("YouTube lookup failed:", error.message);
      playPreview();
    }
    return;
  }

  playAudio(existingsong.songAudio, { autoplay });
};

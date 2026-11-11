# Git / GitHub account rules (MANDATORY)

This repo must ALWAYS use the **Parvpaigwar** GitHub account (`parvpaigwar@gmail.com`).

- Commit identity for this repo is set in the **repo-local** git config only:
  - `user.name = Parvpaigwar`
  - `user.email = parvpaigwar@gmail.com`
- Before any commit/push, verify with `git config user.email` → must print `parvpaigwar@gmail.com`. If not, fix it with `git config user.email "parvpaigwar@gmail.com"` (local, no `--global`).
- Push/pull only over SSH: `git@github.com:Parvpaigwar/Spotify-Clone.git` (authenticates via `~/.ssh/id_ed25519_abc`, the Parvpaigwar key). `ssh -T git@github.com` should greet "Hi Parvpaigwar!".
- NEVER use the `epparvpaigwar` account (`parv@engineerphilosophy.com`) for this repo — not for commits, author/committer, pushes, or PRs.
- NEVER modify the global git config (`git config --global ...`), `~/.gitconfig`, `~/.ssh/config`, SSH keys, or GitHub Desktop settings. The epparvpaigwar setup used by GitHub Desktop must stay untouched.
- Do not pass `--author` or set `GIT_AUTHOR_*` / `GIT_COMMITTER_*` env vars to any other identity.

---
# Project overview

**Marrow** ("music you feel in your bones"; renamed from "Parv's Spotify" → "Nocturne" → "Marrow" on 2026-11-11; logo + favicon = purple skeleton with earphones (user's image, background removed with macOS Vision): skull crop = `public/icons/nocturne-{32,64}.png` (tab) + `nocturne-logo.png` (`.App__logo-mark`); full skeleton = `nocturne-{180,512}.png` (apple-touch / large). Replaced the earlier cassette artwork): Spotify-style music player in **vanilla JS + HTML + CSS**, bundled with **Vite** (`npm run dev` / `npm run build` / `npm run preview`; since 2026-11-11 the dev server runs on **port 5180** (`npm run dev -- --port 5180 --strictPort`) because another local project uses 5173). Live site: https://parvspotify.netlify.app/. No backend: all state lives in browser `localStorage`.

## How it runs
- `index.html` → `<script type="module" src="main.js">`. `main.js` imports the 5 song lists, calls `homeSongsCards(...)` to render cards from `<template id="songTemplate">`, auto-plays song 1 (`playSong(1)` + `firstSongset`), sets up `volume()`, and wires every button.
- Song data: `api/songs.json` … `songs5.json` (~30 songs), each `{id, name, singer, image, song}`. Paths point into `public/images/` and `public/songs/` (served at `/images/...`, `/songs/...`).
- One file per feature in the repo root: `playSong`, `player`, `youtube`, `playQueue`, `media`, `marquee`, `search`, `pauseButton`, `forwardButton`, `backwardButton`, `progressBar`, `volume`, `likeButton`, `likedSongsPlaylist`, `showToast`, `shuffleButton`.
- Shuffle, repeat, playlists, nav/side buttons, "see all" and the user button only show the "Coming Soon" toast (`showToast("comingSoon")`).

## localStorage keys
| Key | Contents | Written by | Read by |
|---|---|---|---|
| `songsLS` | `[{id, songName, songImage, songSinger, songAudio}]` for every local song + any search result that was played | `saveSong` in `saveData.js` | `getSongsFromLS.js` |
| `playSongDataLS` | play history of song IDs, most recent last, no duplicates | `savingPlaySongData.js` | `getPlaysongData.js` |
| `likedsongDataLS` | liked song IDs | `likeButton.js` | `getLikedsongData.js` |

## Unused / leftover code (don't treat as part of the app)
- `src/`: untouched Vite starter template.
- `fetchData.js`: Node-style MongoDB `require`, can't run in the browser; its import is commented out in `main.js`.
- `package.json` dependencies (mongodb, mongoose, multer, gridfs-stream, multer-gridfs-storage) are not used by the frontend.
- `addSong.js` is never imported.
- `env/`: a committed Windows Python virtualenv (Django 5.1.3) plus a Django project `env/musicLibrary/` (app `fileManager`). Most of the repo's ~7,500 tracked files are in here.
- README describes a `src/api`, `components/`, `styles/` layout and features (playlist create/delete, mute) that don't exist.

## Player behaviour
- **All playback goes through `player.js`** (engines: `<audio id="audioPlayer">` and the YouTube IFrame player in the Now Playing panel `#youtubeBox`). Use `playAudio`, `playYouTube`, `stop`, `toggle`, `seek(fraction)`, `setVolume`, and subscribe with `onTimeUpdate` / `onPlayStateChange` / `onEnded`. Don't touch the `<audio>` element or add audio listeners elsewhere.
- Startup: `playSong(1, { autoplay: false })` shows song 1 ready in the bar; the play/pause icon follows `onPlayStateChange` (set in `main.js`).
- `progressBar()` is called **once** in `main.js`; it subscribes to `onTimeUpdate` and seeks via `seek()`.
- `playQueue.js` holds an explicit queue (Liked Songs). `onEnded` (audio or YouTube) calls `forwardButton()`: next queued song, else the next card on the page (autoplay continues forever, wrapping around). Clicking a card clears the queue.
- Forward = next in queue, otherwise the next card in page (DOM) order, wrapping around.
- The current song is the last ID in `playSongDataLS`. `likeButton` uses that, not the audio `src`.
- One `<template id="songTemplate">`; cards are built only by `createSongCard(song)` in `homeSongsCards.js` (sets `data-song-id`, click = clearQueue + saveSong + playSong). No hidden `<audio>` per card (it made the browser preload every song).
- Song IDs: numbers for local songs (unique across all 5 JSON files), strings `itunes:<trackId>` for search results (Audius was removed 2026-11-12; `main.js` purges old `audius:` entries from localStorage). Always compare IDs with `String(a) === String(b)`.
- `main.js` renders cards (which saves songs) **before** `playSong(1)`.
- Imports must match file-name case exactly (Netlify/Linux builds are case-sensitive).
- Backward still uses play history (`history[len-2]`), so pressing it repeatedly toggles between the last two songs.

## Song & cover hosting (Cloudinary, optional)
- `media.js` (`songUrl`, `imageUrl`) decides where files load from. All card/player URLs go through it.
- `VITE_CLOUDINARY_CLOUD_NAME` unset → local `public/songs`, `public/images` (default, current behaviour).
- Set → same paths from Cloudinary: `/songs/X.mp3` → `res.cloudinary.com/<cloud>/video/upload/songs/X.mp3` (audio is the `video` resource type); covers get `f_auto,q_auto,w_400`.
- A full `https://` URL in `api/*.json` is always used as-is (for songs that only exist on Cloudinary).
- `npm run upload:cloudinary` (`scripts/upload-to-cloudinary.mjs`) uploads `public/songs` + `public/images` keeping the same paths; skips files already uploaded. Keys go in `.env` (git-ignored); `.env.example` must stay blank; see `.env.example`. The API secret must never be committed or put in Netlify; only the cloud name goes in Netlify env vars.
- User decision (2026-10-31): keep the mp3s in the repo for now; don't delete them or rewrite history.
- 2026-11-01: all 31 songs + 36 images uploaded to the user's Cloudinary; `.env` has the cloud name, so the dev server loads media from Cloudinary.
- `saveData` overwrites `songsLS` entries on every load, so switching local ↔ Cloudinary takes effect immediately.

## Search (`search.js`, no backend, no keys)
- Search box at the top of the main view; sidebar "Search" (`#searchNavButton`) focuses it. Searches as you type (400 ms) and on Enter; older requests are aborted.
- Two rows: "Your songs" (filters local JSON) and "Songs" from iTunes Search (`country=IN`; iTunes only gives 30-second `previewUrl`s, so they play in full from YouTube). **Audius removed 2026-11-12 (user: "songs will run from my own and YouTube")**.
- iTunes results carry `youtubeQuery` ("name artist"). With `VITE_YOUTUBE_API_KEY` set, `playSong` looks up the video (`youtube.js`: `search.list` for "<name> <artist> lyrics", `maxResults=5` (same 100-unit cost as 1), `videoEmbeddable=true`; `pickBestVideo` prefers titles with "lyric", then official label channels; cached per song in `youtubeLyricIdsLS`) and plays it in full via `playYouTube`; any failure (no result, quota, embed blocked) → toast + the 30s preview. Without the key: plain previews, badge "30s preview".
- YouTube rules: the player must stay visible (≥200×200) while playing; closing it pauses. No hidden/audio-only YouTube playback (user asked to hide it on 2026-11-01; declined, made it a design element instead).
- **Now Playing panel** (`<aside id="youtubeBox" class="App__now-panel">`, redesigned 2026-11-12) shows for **every** song: `data-mode="youtube"` → the YouTube video, `data-mode="audio"` → cover + vinyl sliding out/spinning (`.App__now-art`), set by `player.js`. Same stage (blurred cover bg, grain, skeleton peeking), title/singer, "playing from" pill (`nowPanel.js`: `setNowSong`, `setNowSource` youtube|preview|library) and lyrics card. ✕ (`closeNowPanel`) pauses YouTube songs, other songs keep playing and the panel stays closed until reopened with the player-bar "Now playing view" button (`#nowPanelToggle` → `toggleNowPanel`). Desktop = 3rd grid column (360px) via `.App:has(#youtubeBox:not([hidden]))`; phone = only YouTube mode, floating above the player bar using `--player-bar-height` (ResizeObserver in `player.js`). Player uses `controls: 0` and `cc_load_policy: 1`.
- **Lyrics** (`lyrics.js`, 2026-11-12): LRCLIB (`lrclib.net/api/get`, then `/search`), free, no key, CORS ok, community-run (not a licensed source). Synced LRC lines highlight + auto-scroll (pauses 4s after the user scrolls), click a line to seek; plain lyrics when no timings; 30s previews always plain (`useUnsyncedLyrics`, they start mid-song). Titles cleaned (`(From …)`, `feat.`, `_`) and first artist used for matching. Cached per song for the visit.
- Lyrics sync engine (2026-11-12 v2): a requestAnimationFrame loop reads `getPlaybackTime()` (player.js: exact audio/YouTube time) every frame; current line gets `.is-active` + a karaoke fill (`--fill` %, from its start to the next line's start, `background-clip: text`); a jump of >1.5s (seek / line click) re-centres instantly and resumes auto-scroll. (The ±0.5s "in sync" nudge buttons were removed at the user's request.)
- **Vibes** (`moods.js` + `vehicles.js`, 2026-11-12 v2; the earlier "Now vibing" scene banner was removed at the user's request): moods drive / party / moonlit / rain / hellfire. Mood = title keywords → row mood (`renderSongs(..., mood)` in homeSongsCards.js; onlineRows `mood`) → iTunes genre (saved in songsLS) → stable hash. `body[data-mood]` sets `--mood-accent/--mood-glow/--mood-top` (top gradient, lyrics glow, borders, driven road). Each mood has a **vehicle with a skeleton rider** (SVG drawn in vehicles.js + a skull picture from `public/theme/pins` as the head): Convertible, Party Van, Scooter, Bicycle (umbrella), Chopper (flames). It drives along the **road on the top edge of the player bar** (`#rideLane`, 6px, first child of `#playingBar`, full width; the vehicle sticks up above the bar): left = song progress (own `onTimeUpdate` subscription). Click the vehicle = trick + speech bubble (hop / bounce / wheelie / wobble); drag it = seek; click the lane = seek. Wheels, exhaust, lights, rider nod only animate while `body.is-playing`. The ride pill in the Now Playing panel (`#nowVibe`) cycles mood/vehicle for that song. User wants it there (not on the progress bar).
- Lyric scrapers (Lyrica, Genius/AZLyrics scraping, YouTube timedtext) declined 2026-11-01 and again 2026-11-12 (user said the third parties pay artists); LRCLIB's public API is used instead.
- Bulk-scraping "thousands" of Pinterest images (via the browser extension or other sites) declined 2026-11-12: Pinterest ToS forbids scraping and a blanket permission for thousands of artists isn't plausible; user can send specific pins/images to add.
- The YouTube key is public in the bundle by design: it must be restricted to the site's HTTP referrers + YouTube Data API v3 in Google Cloud Console.
- iTunes rate-limits to ~20 requests/min per IP (HTTP 429 without CORS headers → shows as a network error). Results are cached per query for the visit and typing waits 600 ms.
- Declined (2026-11-01): PagalWorld-scraping APIs (e.g. pagal-music-api) and unlicensed lyrics sources. Only legal sources (iTunes previews, YouTube embeds; Musixmatch if lyrics are added).
- Both APIs allow CORS (checked 2026-11-01). Jamendo not added (needs a client ID).
- Broken covers fall back to `FALLBACK_IMAGE` (in `media.js`).

## Online home rows (`onlineRows.js`, 2026-11-11)
- Below the 5 local rows, `#onlineRows` gets iTunes rows played from YouTube: Bollywood hits, Punjabi hits, Arijit Singh, Hip-Hop & Rap, Lo-fi flips, EDM & Dance, Pop hits (`ROWS` in onlineRows.js: title, mood, query). 7 iTunes requests on load (limit ~20/min).
- iTunes call/mapping shared with search lives in `onlineSongs.js` (`searchItunes`).
- Each song appears once on the page (deduped against local IDs) so forward/autoplay never loops; songs are saved to `songsLS`. A row whose source fails is removed.
- YouTube quota: each new iTunes song played costs 100 units (default 10,000/day ≈ 100 new songs/day; cached per song).
- "Show all" expands a row to all its cards ("Show less" collapses); hidden on phones (rows scroll sideways).
- The gist of music APIs the user shared (0xdevalias) has no free full-audio sources; Spotify Web API = metadata only, Premium + 5-user limit.

## Skeleton theme touches (2026-11-11, user: "don't change the whole theme, just fragments")
- Art: `public/theme/skeleton.png` (purple skeleton with earphones, transparent). Used as `.App__hero-skeleton` (faint, top-right of home view) and `.App__library-ghost` (very faint, bottom of library).
- More art (2026-11-11, backgrounds removed with macOS Vision; images 8 and 9 the user sent were identical): `public/theme/walkman.png` (B&W skeleton with walkman), `boombox.png` (lime skeleton with boombox), `pinkskull.png` (pink skull with headphones). Used as covers (`.cover--art`): Bollywood Trending = boombox, Lofi songs = walkman, Graveyard Shift = pink skull; page-end footer `.App__bottom` (walkman + boombox, "Dig up more songs" focuses search); pink skull on every toast (`.toast::before`).
- Skeleton pictures from Pinterest (2026-11-12): user asked to use the images from pinterest.com/ideas/skeleton-listening-to-music and said they have the artists' permission. The page had 186 pins, mostly unrelated memes; 22 music-skeleton ones were kept (guitar-hero later removed by the user → 21), backgrounds removed (macOS Vision), saved as `public/theme/pins/*.webp` (360px wide, ~940 KB total). Used for: covers (`.cover--pin`: Liked Songs=red-headphones, Daily Mix=vinyl-hands, Discover Weekly=flower-headphones, For You=orange-headphones, Your Episodes=headphones-rock), round head before every row title (`.App__section-skull`; online rows cycle `SKULLS` in onlineRows.js), "The Bone Lounge" strip of all 22 drifting under the quick links (`boneLounge.js`, `.App__lounge`), Now Playing title, progress knob, search "nothing found" (headache-headphones), plus the bone equalizer `.boneBars` while playing. My earlier drawn SVG skulls were rejected by the user ("not the vibe") and deleted.
- Tagline under the greeting, "Graveyard Shift" playlist (skull icon, was Release Radar), skull logo nods while playing (`body.is-playing`, set in `main.js` from `onPlayStateChange`), themed toast / "no results" texts.

## 2026-11-12 batch: road, lyrics pull, messages, settings, taste, phone
- Ride road: no empty road any more; only the lit driven line (`.App__ride-driven`) behind the vehicle.
- Lyrics auto-scroll uses its own eased scroll in `centre()` (lyrics.js) together with the chain-pull skeleton (`#lyricsPuller`, `.is-pulling`). **Gotcha:** the `.App__lyrics-body` rule (flex:1; min-height:0; overflow-y:auto) must exist or lyrics never scroll (it was once deleted by accident). Every synced line has a small skull bullet; the current line's marker = `--mood-skull` (set in moods.js = the vehicle rider's picture).
- Messages (`showToast.js`): kinds comingSoon / add / repeat / likedsongplaylist / noLikedSongs / noSongPlaying / youtubeFallback / lightMode / error, each with several random titles+lines and skeleton pictures. Search has random "searching"/"empty" lines.
- Settings gear (`#settingsButton` → `#settingsMenu`): "Light mode" switch never turns on: slides, page winces (`body.is-sunburnt`), snaps back, `showToast("lightMode")`. Site is dark-only by design.
- Taste (`taste.js`, localStorage `tasteLS` = `{artists, genres}` scores): play +1, finish +2, like +3, skip in first 20s −1.5. `tasteRow()` → "Picked for your bones" row in `#tasteRow` (above the local rows) from iTunes searches for top 3 artists (results filtered to that artist) + top genre; songs already in the local library are skipped. No IP address (no server sees it) and no YouTube recommendations (not available to apps) — told the user.
- Phone: Now Playing panel has `.is-expanded` = full-screen sheet (cover/video, pills, lyrics); collapsed = small floating video for YouTube songs, nothing for others. Tap the song in the player bar (or the mini panel title) to expand; the ✕ becomes a chevron that collapses without pausing (`closeNowPanel` in player.js). Settings gear stays visible on phones.

## 2026-11-12 batch 2
- Now Playing ✕ button hidden on desktop (user asked); panel toggles with the player-bar "Now playing view" button. Phones keep the down-arrow in the full-screen view only.
- No "Full song from YouTube" pill (`setNowSource("youtube")` hides `#nowSource`) and no "Full songs from YouTube" row/search notes when the key is set.
- Lyrics puller = original SVG skeleton dangling from a rope by its hands (`#lyricsPuller`); it drops first, the lyrics start moving 220 ms later. The user's reference was a watermarked stock image of a hanged skeleton: not used, drawn fresh and holding the rope instead.
- Next song (`forwardButton.js`): queue first; after a local song → fully random card on the page; after a YouTube (`itunes:`) song → one of the 3 best-scoring YouTube songs (same artist +4, same genre +3, same mood +1, taste score, random jitter). Never repeats the last 12 played. Backward still uses history.

## 2026-11-12 batch 3
- Lyrics: no skull markers on lines any more (user: only the glow/fill). Rope + dangling skeleton redrawn in one cartoon style (ink outline + flat fill, twist marks, knot).
- Greeting is always "Good night" with the tagline "The dead walk at night, so for us it's good morning" (time-of-day greeting removed). Search placeholder: "Dig up a song, an artist, some old bones…".

## 2026-11-12 batch 4
- Lyrics version matching (lyrics.js): LRCLIB often has several cuts of a song with different timings (e.g. "Shape of You" 234s vs 263s; the local file is 263s). `fetchLyrics` returns all versions with `duration`; `choose()` waits for the playing song's length and uses the synced version within 3s of it. No close match → plain lyrics without highlight (better than highlighting the wrong line).
- Now Playing pills never wrap: source pill ("Your library" / "30s preview") left, ride pill right.

## iTunes "musics://" redirect (2026-11-12)
- On the live site Apple sometimes answered `itunes.apple.com/search` with a redirect to `musics://…` (shows as a CORS error; could not be reproduced with curl). `searchItunes` (onlineSongs.js) now fetches with `redirect: "manual"`, retries with two other parameter wordings, caches results in localStorage `itunesCacheLS` for 6 hours (max 40 queries), and falls back to an expired cache entry if all attempts fail.

## Desktop layout (2026-11-11, modelled on the current Spotify desktop app)
- `.App` grid: top bar (logo, back/forward, home button, search pill `.App__search-form`, user) / "Your Library" panel (`.App__nav-bar`, chips + list) + rounded main view (`.App__main-view`) / player bar. Font: Figtree. Colours are CSS variables on `:root` in `style.css`.
- Search input lives in the top bar; results (`#searchResults`) render at the top of the main view, which scrolls to top on search.
- Elements with class `comingSoon` (and `playlistButton`, `extra`, `sidebuttons` except Liked Songs) show the Coming Soon toast.
- Speaker icon (`#volumeButton` inside `.volumeToggle`) mutes/unmutes; slider is always visible.

## Mobile layout
- One breakpoint: `@media (max-width: 768px)` at the end of `style.css`. Sidebar hidden, quick links 2 columns, song rows (`.songRow`, incl. search results) scroll sideways, player bar = song info row + controls/progress row, `.control` (mic/queue/device/volume) hidden.
- `@media (hover: none)` turns off hover zoom on touch screens.
- Long player-bar names scroll (`marquee.js`) instead of being cut off; user prefers this over "…".

## Working notes
- macOS filesystem is case-insensitive: `Claude.md` on disk is what Claude Code loads as `CLAUDE.md`.
- No tests, linter or CI exist.

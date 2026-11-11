// Decides where song and cover files are loaded from.
//
// - VITE_CLOUDINARY_CLOUD_NAME not set (default): local files from public/songs and public/images.
// - VITE_CLOUDINARY_CLOUD_NAME set: the same paths are loaded from Cloudinary's CDN.
//   "/songs/Believer.mp3" -> https://res.cloudinary.com/<cloud>/video/upload/songs/Believer.mp3
//   (Cloudinary stores audio under the "video" resource type.)
// - A full URL (https://...) in the song lists is always used as-is, so new songs can be
//   added on Cloudinary only, without putting the file in the repo.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const isFullUrl = (path) => /^(https?:\/\/|data:)/.test(path);

const cloudinaryUrl = (path, resourceType, transformation = "") => {
    if (!CLOUD_NAME || isFullUrl(path)) return path;
    const publicPath = encodeURI(path.replace(/^\//, ""));
    return `https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload/${transformation}${publicPath}`;
};

export const songUrl = (path) => cloudinaryUrl(path, "video");

// Covers: auto format (WebP/AVIF), auto quality and resized to 400px wide, so they load faster
export const imageUrl = (path) => cloudinaryUrl(path, "image", "f_auto,q_auto,w_400/");

// Used when a result has no cover art
export const FALLBACK_IMAGE =
    "data:image/svg+xml," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b2dbd"/><stop offset="1" stop-color="#9aa0ff"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><text x="50" y="62" font-size="40" text-anchor="middle" fill="#fff">♪</text></svg>'
    );

// Uploads public/songs/* and public/images/* to Cloudinary, keeping the same paths,
// so "/songs/Believer.mp3" becomes the Cloudinary public ID "songs/Believer".
//
// Usage:
//   1. Put your keys in .env (git-ignored, see .env.example)
//   2. npm run upload:cloudinary
//
// Files that already exist on Cloudinary are skipped, so it's safe to run again
// after adding new songs.
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { extname, basename, join } from "node:path";

// Reads .env, then .env.local (later file wins)
const envText = (await readFile(".env", "utf8").catch(() => "")) + "\n" +
    (await readFile(".env.local", "utf8").catch(() => ""));
const env = Object.fromEntries(
    envText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
            const i = line.indexOf("=");
            return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
        })
);
const get = (key) => process.env[key] || env[key];

const cloudName = get("VITE_CLOUDINARY_CLOUD_NAME");
const apiKey = get("CLOUDINARY_API_KEY");
const apiSecret = get("CLOUDINARY_API_SECRET");
if (!cloudName || !apiKey || !apiSecret) {
    console.error("Missing VITE_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET in .env");
    process.exit(1);
}

const folders = [
    { dir: "public/songs", folder: "songs", resourceType: "video" }, // audio uses "video"
    { dir: "public/images", folder: "images", resourceType: "image" },
];

const sign = (params) => {
    const toSign = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");
    return createHash("sha1").update(toSign + apiSecret).digest("hex");
};

let uploaded = 0, skipped = 0, failed = 0;

for (const { dir, folder, resourceType } of folders) {
    const files = (await readdir(dir)).filter((f) => !f.startsWith("."));
    for (const file of files) {
        const publicId = `${folder}/${basename(file, extname(file))}`;
        const params = { overwrite: "false", public_id: publicId, timestamp: Math.floor(Date.now() / 1000) };

        const form = new FormData();
        form.append("file", new Blob([await readFile(join(dir, file))]), file);
        for (const [k, v] of Object.entries(params)) form.append(k, String(v));
        form.append("api_key", apiKey);
        form.append("signature", sign(params));

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
            method: "POST",
            body: form,
        });
        const body = await res.json();
        if (!res.ok) {
            failed++;
            console.error(`✗ ${dir}/${file}: ${body.error?.message || res.status}`);
        } else if (body.existing) {
            skipped++;
            console.log(`- ${publicId} (already on Cloudinary)`);
        } else {
            uploaded++;
            console.log(`✓ ${publicId}`);
        }
    }
}

console.log(`\nDone: ${uploaded} uploaded, ${skipped} already there, ${failed} failed.`);
if (failed) process.exit(1);

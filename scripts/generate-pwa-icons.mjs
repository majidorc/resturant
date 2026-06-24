import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

function iconSvg(size) {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.28);

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${radius}" fill="#0f172a"/>
    <circle cx="${size / 2}" cy="${size * 0.38}" r="${size * 0.12}" fill="#f59e0b"/>
    <rect x="${size * 0.28}" y="${size * 0.55}" width="${size * 0.44}" height="${size * 0.08}" rx="${size * 0.04}" fill="#f59e0b"/>
    <text x="${size / 2}" y="${size * 0.82}" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700">RB</text>
  </svg>`);
}

async function writeIcon(size, filename) {
  const outputPath = path.join("public", filename);
  await sharp(iconSvg(size)).png().toFile(outputPath);
  console.log(`Generated ${outputPath}`);
}

await mkdir("public", { recursive: true });
await writeIcon(192, "icon-192x192.png");
await writeIcon(512, "icon-512x512.png");
await writeIcon(180, "apple-touch-icon.png");

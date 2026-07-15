import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const BG = "#1d3435";
const PETAL = "#3d7b74";
const CENTER = "#f5f4f1";

function petal(cx, cy, angleDeg) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="52" ry="92" fill="${PETAL}" transform="rotate(${angleDeg} 256 256)" />`;
}

const petals = [0, 72, 144, 216, 288]
  .map((deg) => petal(256, 150, deg))
  .join("\n");

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="${BG}" />
  <g opacity="0.92">${petals}</g>
  <circle cx="256" cy="256" r="34" fill="${CENTER}" />
</svg>
`;

const svgBuffer = Buffer.from(svg);

await mkdir("public/icons", { recursive: true });

const targets = [
  { size: 192, path: "public/icons/icon-192.png" },
  { size: 512, path: "public/icons/icon-512.png" },
  { size: 180, path: "public/icons/apple-touch-icon.png" },
  { size: 96, path: "public/seo/favicon-96x96.png" },
];

for (const { size, path } of targets) {
  await sharp(svgBuffer).resize(size, size).png().toFile(path);
  console.log("wrote", path);
}

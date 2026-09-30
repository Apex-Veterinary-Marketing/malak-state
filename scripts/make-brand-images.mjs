#!/usr/bin/env node
/**
 * One-off: builds this client's social card and favicon set from the brand
 * photo and the tokens.css palette, until the client's real logo arrives.
 *   public/og-default.png        1200x630: doorway photo + espresso panel with the wordmark
 *   public/favicon.png           32x32 "M" monogram
 *   public/apple-touch-icon.png  180x180 "M" monogram (opaque, padded)
 *   public/favicon.ico           PNG-compressed ICO (same container as generate-placeholder-assets.mjs)
 * Text is set in Georgia (librsvg uses system fonts); swap for the real logo later.
 * Run: node scripts/make-brand-images.mjs
 */
import fs from "node:fs";
import sharp from "sharp";

const tokens = fs.readFileSync("src/styles/tokens.css", "utf8");
const token = (name) => tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
const DARK = token("main-dark");
const CTA = token("cta");
const WHITE = token("white");
if (!DARK || !CTA || !WHITE) throw new Error("tokens.css is missing --main-dark / --cta / --white");

// 1. Open Graph card
const W = 1200, H = 630, PANEL = 520;
const photo = await sharp("src/assets/brand/marissa-doorway-wide.jpg").resize(W - PANEL, H, { fit: "cover", position: "attention" }).toBuffer();
const panel = `<svg xmlns="http://www.w3.org/2000/svg" width="${PANEL}" height="${H}">
  <rect width="100%" height="100%" fill="${DARK}"/>
  <text x="60" y="270" font-family="Georgia, serif" font-size="52" fill="${WHITE}">The <tspan font-style="italic">Malak</tspan></text>
  <text x="60" y="336" font-family="Georgia, serif" font-size="52" fill="${WHITE}">Estate Group</text>
  <rect x="60" y="372" width="64" height="2" fill="${CTA}"/>
  <text x="60" y="420" font-family="Arial, sans-serif" font-size="20" letter-spacing="3" fill="${CTA}">NORTHEAST OHIO REALTOR</text>
</svg>`;
await sharp({ create: { width: W, height: H, channels: 3, background: DARK } })
  .composite([{ input: Buffer.from(panel), left: 0, top: 0 }, { input: photo, left: PANEL, top: 0 }])
  .png()
  .toFile("public/og-default.png");

// 2. Monogram favicons
const mono = (size, pad) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="${DARK}"/>
  <text x="50%" y="${size * 0.5 + size * (0.5 - pad) * 0.62}" text-anchor="middle" font-family="Georgia, serif" font-size="${size * (1 - 2 * pad)}" fill="${CTA}">M</text>
</svg>`;
await sharp(Buffer.from(mono(64, 0.12))).resize(32, 32).png().toFile("public/favicon.png");
await sharp(Buffer.from(mono(180, 0.2))).png().toFile("public/apple-touch-icon.png");

// 3. favicon.ico: an ICONDIR wrapping the 32px PNG
const icoPng = await sharp(Buffer.from(mono(64, 0.12))).resize(32, 32).png().toBuffer();
const icondir = Buffer.alloc(6);
icondir.writeUInt16LE(0, 0);
icondir.writeUInt16LE(1, 2);
icondir.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(icoPng.length, 8);
entry.writeUInt32LE(6 + 16, 12);
fs.writeFileSync("public/favicon.ico", Buffer.concat([icondir, entry, icoPng]));
console.log("wrote public/og-default.png, favicon.png, apple-touch-icon.png, favicon.ico");

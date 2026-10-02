#!/usr/bin/env node
/**
 * One-off: builds this client's social card and favicon set from the brand
 * photo and the tokens.css palette, until the client's real logo arrives.
 *   public/og-default.png        1200x630: doorway photo + espresso panel with the wordmark
 *   public/favicon.png           32x32 "M" monogram
 *   public/apple-touch-icon.png  180x180 "M" monogram (opaque, padded)
 *   public/favicon.ico           PNG-compressed ICO (same container as generate-placeholder-assets.mjs)
 * The OG wordmark matches the site header (Header.astro: "The <em>Malak</em> Estate Group"
 * in --font-heading, Playfair Display), and the tagline uses --font-body (Manrope), both
 * from the @fontsource files the site ships. The favicon monogram is still set in Georgia.
 * Swap for the real logo later.
 * Run: node scripts/make-brand-images.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import sharp from "sharp";

// Pango (sharp's text renderer) can't read WOFF, and @fontsource ships WOFF/WOFF2 only.
// WOFF 1.0 is zlib-compressed sfnt tables, so inflate them back into a plain TTF.
function woffToSfnt(buf) {
  if (buf.toString("ascii", 0, 4) !== "wOFF") throw new Error("not a WOFF 1.0 file");
  const flavor = buf.readUInt32BE(4);
  const numTables = buf.readUInt16BE(12);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const e = 44 + i * 20;
    const offset = buf.readUInt32BE(e + 4), compLength = buf.readUInt32BE(e + 8), origLength = buf.readUInt32BE(e + 12);
    const raw = buf.subarray(offset, offset + compLength);
    tables.push({ tag: buf.toString("ascii", e, e + 4), checksum: buf.readUInt32BE(e + 16), data: compLength < origLength ? zlib.inflateSync(raw) : raw });
  }
  let pow = 1, log = 0;
  while (pow * 2 <= numTables) { pow *= 2; log++; }
  const head = Buffer.alloc(12 + numTables * 16);
  head.writeUInt32BE(flavor, 0);
  head.writeUInt16BE(numTables, 4);
  head.writeUInt16BE(pow * 16, 6);
  head.writeUInt16BE(log, 8);
  head.writeUInt16BE(numTables * 16 - pow * 16, 10);
  const bodies = [];
  let off = head.length;
  tables.forEach((t, i) => {
    const r = 12 + i * 16;
    head.write(t.tag, r, "ascii");
    head.writeUInt32BE(t.checksum, r + 4);
    head.writeUInt32BE(off, r + 8);
    head.writeUInt32BE(t.data.length, r + 12);
    const pad = (4 - (t.data.length % 4)) % 4;
    bodies.push(t.data, Buffer.alloc(pad));
    off += t.data.length + pad;
  });
  return Buffer.concat([head, ...bodies]);
}
// Writes the TTF to the OS temp dir and returns its path. Pango keeps every font file it
// has loaded, so a later call can mix faces (regular + italic) in one piece of markup.
const fontFile = (pkg, file) => {
  const ttf = path.join(os.tmpdir(), file.replace(/\.woff$/, ".ttf"));
  fs.writeFileSync(ttf, woffToSfnt(fs.readFileSync(`node_modules/@fontsource/${pkg}/files/${file}`)));
  return ttf;
};
const text = (markup, font, fontfile, extra = {}) =>
  sharp({ text: { text: markup, font, fontfile, rgba: true, dpi: 72, ...extra } }).png().toBuffer({ resolveWithObject: true });

const tokens = fs.readFileSync("src/styles/tokens.css", "utf8");
const token = (name) => tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
const DARK = token("main-dark");
const CTA = token("cta");
const WHITE = token("white");
if (!DARK || !CTA || !WHITE) throw new Error("tokens.css is missing --main-dark / --cta / --white");

// 1. Open Graph card
const W = 1200, H = 630, PANEL = 520;
const photo = await sharp("src/assets/brand/marissa-doorway-wide.jpg").resize(W - PANEL, H, { fit: "cover", position: "attention" }).toBuffer();
const RULE_Y = 372;
const panel = `<svg xmlns="http://www.w3.org/2000/svg" width="${PANEL}" height="${H}">
  <rect width="100%" height="100%" fill="${DARK}"/>
  <rect x="60" y="${RULE_Y}" width="64" height="2" fill="${CTA}"/>
</svg>`;
// Wordmark: the header's words and typeface, on two lines.
const playfair = fontFile("playfair-display", "playfair-display-latin-400-normal.woff");
await text("x", "Playfair Display 52", playfair); // load the regular face before the italic call
const wordmark = await text(
  `<span foreground="${WHITE}">The <i>Malak</i>\nEstate Group</span>`,
  "Playfair Display 52",
  fontFile("playfair-display", "playfair-display-latin-400-italic.woff"),
);
// Tagline: Manrope (--font-body), tracked out like the original.
const tagline = await text(
  `<span foreground="${CTA}" letter_spacing="${3 * 1024}">NORTHEAST OHIO REALTOR</span>`,
  "Manrope Medium 20",
  fontFile("manrope", "manrope-latin-500-normal.woff"),
);
await sharp({ create: { width: W, height: H, channels: 3, background: DARK } })
  .composite([
    { input: Buffer.from(panel), left: 0, top: 0 },
    { input: wordmark.data, left: 60, top: RULE_Y - 30 - wordmark.info.height },
    { input: tagline.data, left: 60, top: RULE_Y + 32 },
    { input: photo, left: PANEL, top: 0 },
  ])
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

// scripts/check-seo.mjs — built-output checks for every page in dist/ (run after `astro build`).
//   title: present, <= 60 chars, unique      description: present, <= 160 chars, unique
//   JSON-LD: parses; every {"@id": X} reference resolves to a node @id on this page or another built page
//   copy: no vet wording and no em/en dashes in visible text (this fork is a real estate site)
//   homepage: sections appear in the approved V2 preview's order (data-home markers)
import fs from "node:fs";
import path from "node:path";

const DIST = "dist";
const BANNED = [/\bveterinar/i, /\bpets?\b/i, /\bpatients\b/i, /\bnew patient\b/i,/\bDr\.\s/, /\bhooman\b/i, /\bpaws?\b/i];
const DASHES = /[–—]/;
const HOME_ORDER = ["hero", "mission", "services", "meet", "builders", "book"];
const errors = [];
const pages = [];

if (!fs.existsSync(DIST)) {
  console.error("✖ dist/ not found — run `astro build` first");
  process.exit(1);
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : d.name.endsWith(".html") ? [p] : [];
  });

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"');

for (const file of walk(DIST)) {
  const html = fs.readFileSync(file, "utf8");
  if (/http-equiv="refresh"/i.test(html) && html.length < 2000) continue; // redirect stub
  const rel = "/" + path.relative(DIST, file).replace(/\\/g, "/").replace(/index\.html$/, "");
  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? "");
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim() ?? "");
  const graphs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => {
      try {
        return JSON.parse(m[1]);
      } catch {
        errors.push(`${rel}: JSON-LD does not parse`);
        return null;
      }
    })
    .filter(Boolean);
  const nodes = graphs.flatMap((g) => g["@graph"] ?? [g]);
  const ids = new Set(nodes.map((n) => n["@id"]).filter(Boolean));
  const refs = [];
  const collect = (v, top) => {
    if (Array.isArray(v)) return v.forEach((x) => collect(x, false));
    if (v && typeof v === "object") {
      if (!top && v["@id"] && Object.keys(v).length === 1) refs.push(v["@id"]);
      Object.values(v).forEach((x) => collect(x, false));
    }
  };
  nodes.forEach((n) => collect(n, true));
  const text = decode(
    html
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/&[a-z#0-9]+;/gi, " ");
  pages.push({ rel, html, noindex, title, desc, ids, refs, text });
}

const allIds = new Set(pages.flatMap((p) => [...p.ids]));
const seen = { title: new Map(), desc: new Map() };
for (const p of pages) {
  const is404 = p.rel.startsWith("/404");
  if (!p.title) errors.push(`${p.rel}: missing <title>`);
  else if (p.title.length > 60) errors.push(`${p.rel}: title ${p.title.length} chars > 60 ("${p.title}")`);
  if (!p.desc) errors.push(`${p.rel}: missing meta description`);
  else if (p.desc.length > 160) errors.push(`${p.rel}: description ${p.desc.length} chars > 160`);
  if (!p.noindex && !is404) {
    for (const [k, v] of [["title", p.title], ["desc", p.desc]]) {
      if (seen[k].has(v)) errors.push(`${p.rel}: duplicate ${k} (also on ${seen[k].get(v)})`);
      else seen[k].set(v, p.rel);
    }
  }
  for (const r of p.refs) if (!allIds.has(r)) errors.push(`${p.rel}: JSON-LD reference ${r} has no matching node`);
  for (const re of BANNED) {
    const m = p.text.match(re);
    if (m) errors.push(`${p.rel}: banned wording "${m[0]}"`);
  }
  if (DASHES.test(p.text)) errors.push(`${p.rel}: em/en dash in visible text ("${p.text.match(new RegExp(`.{0,30}${DASHES.source}.{0,30}`))?.[0].trim()}")`);
  if (p.rel === "/") {
    const positions = HOME_ORDER.map((k) => p.html.indexOf(`data-home="${k}"`));
    if (positions.some((x) => x < 0) || positions.some((x, i) => i > 0 && x < positions[i - 1]))
      errors.push(`/: homepage section order differs from V2 preview (expected ${HOME_ORDER.join(" > ")})`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => "✖ " + e).join("\n"));
  console.error(`\n${errors.length} SEO/copy error(s) across ${pages.length} pages`);
  process.exit(1);
}
console.log(`✔ ${pages.length} pages: titles, descriptions, JSON-LD references and copy rules pass`);

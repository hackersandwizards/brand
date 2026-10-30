#!/usr/bin/env bun
// Writes catalogue.html, the one page that shows the brand: tokens, logos, every system's
// components and the Company OS brand applications from captures/ (`bun run capture`), the scan
// report, each repo's drift status and links to each repo's own catalogue. Reads reports/ and
// captures/ as they stand. Open the file from disk; every link in it is relative.
// Usage: bun scripts/catalogue.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import manifest from "../manifest.json";
import repos from "../repos.json";
import type { drift as driftReport } from "./drift";
import { ROOT } from "./git";
import type { Counts, scan as scanReport } from "./scan";
import { parseTokens, resolveColors, SOURCE } from "./tokens";

const read = (p: string) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
type ScanRepo = {
  commit: string;
  files: number;
  totals: Counts;
  offHex: { hex: string; count: number; near?: string; distance?: number }[];
};
const scan: Omit<ReturnType<typeof scanReport>, "repos"> & {
  repos: Record<string, ScanRepo>;
  aboveAllowlist: string[];
} = read("reports/scan.json");
const drift: { date: string; repos: ReturnType<typeof driftReport> } = read("reports/drift.json");
const allow = read("scan-allowlist.json");
const tokens = parseTokens(readFileSync(SOURCE, "utf8"));
const colors = resolveColors(tokens);
const esc = (s: unknown) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );
const table = (head: string[], rows: unknown[][]) =>
  `<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
const code = (s: unknown) => `<code>${esc(s)}</code>`;

const swatches = Object.entries(colors)
  .map(
    ([k, hex]) =>
      `<figure class="swatch"><div style="background:var(${k})"></div><figcaption>${code(k)}<br>${esc(hex)}${
        tokens[k] !== hex ? `<br><small>${esc(tokens[k])}</small>` : ""
      }</figcaption></figure>`,
  )
  .join("");

const roles = [
  ...new Set(Object.keys(tokens).flatMap((k) => k.match(/^--type-(\w+)-family$/)?.[1] ?? [])),
]
  .map((r) => {
    const v = (p: string) => (tokens[`--type-${r}-${p}`] ? `var(--type-${r}-${p})` : "normal");
    const style = `font-family:${v("family")};font-weight:${v("weight")};font-size:${v("size")};line-height:${v("line-height")};letter-spacing:${v("tracking")};text-transform:${tokens[`--type-${r}-case`] ? `var(--type-${r}-case)` : "none"}`;
    return `<div class="role"><span class="label">${esc(r)}</span><p style="${style}">Agentic Engineering, from the first prompt to the factory</p></div>`;
  })
  .join("");

const other = Object.entries(tokens).filter(
  ([k]) => !k.startsWith("--color-") && !k.startsWith("--type-") && !k.startsWith("--text-"),
);

const preview = (k: string) =>
  k.startsWith("--radius-")
    ? `<div class="pv" style="border-radius:var(${k})"></div>`
    : k.startsWith("--shadow-")
      ? `<div class="pv" style="box-shadow:var(${k})"></div>`
      : k.startsWith("--spacing-")
        ? `<div class="pv bar" style="width:var(${k})"></div>`
        : k.startsWith("--gradient-")
          ? `<div class="pv" style="background:var(${k})"></div>`
          : "";

const logos = manifest.files
  .filter((f) => f.path.startsWith("logos/"))
  .map((f) =>
    f.path.endsWith(".tif")
      ? `<figure class="logo"><a href="${f.path}">print file, TIFF CMYK</a><figcaption>${code(f.path)}</figcaption></figure>`
      : `<figure class="logo"><div class="pair"><img class="light" src="${f.path}" alt="${esc(f.path)} on light" loading="lazy"><img src="${f.path}" alt="${esc(f.path)} on dark" loading="lazy"></div><figcaption>${code(f.path)}</figcaption></figure>`,
  )
  .join("");

type Capture = { group: string; name: string; file: string; source: string; states?: number };
type Captures = {
  date: string;
  systems: { name: string; error?: string; commit?: string; built?: string; items?: Capture[] }[];
  applications: { title: string; dir: string; items: Capture[] }[];
};
const captures: Captures | undefined = existsSync(join(ROOT, "captures/index.json"))
  ? read("captures/index.json")
  : undefined;
const stamp = (iso: string) => `${esc(iso.slice(0, 16).replace("T", " "))} UTC`;
const shot = (c: Capture, file: string, caption: string) =>
  `<figure class="shot"><a href="captures/${esc(file)}"><img src="captures/${esc(file)}" alt="${esc(c.name)}" loading="lazy"></a><figcaption><strong>${esc(c.name)}</strong> ${caption}</figcaption></figure>`;
const system = (s: Captures["systems"][number]) => {
  if (s.error)
    return `<h3 id="sys-${esc(s.name)}">${esc(s.name)}</h3><p>Not captured: ${esc(s.error)}</p>`;
  const groups = [...new Set(s.items!.map((i) => i.group))].map(
    (g) =>
      `${g ? `<h4 class="label">${esc(g)}</h4>` : ""}<div class="shots">${s
        .items!.filter((i) => i.group === g)
        .map((i) =>
          shot(
            i,
            `${s.name}/${i.file}`,
            `${i.states! > 1 ? `${i.states} states, ` : ""}${code(i.source)}`,
          ),
        )
        .join("")}</div>`,
  );
  return `<h3 id="sys-${esc(s.name)}">${esc(s.name)}</h3><p class="label">commit ${esc(s.commit)}, build of ${stamp(s.built!)}, ${s.items!.length} captures</p>${groups.join("")}`;
};
const none = "<p>No captures yet: run <code>bun run capture</code>.</p>";
const systemsHtml = captures
  ? `<p>Captured ${stamp(captures.date)} from each repo's last build, each component with all its states. A capture is as old as that build: rebuild the repo, then run <code>bun run capture</code>. The captures stay on this machine (<code>captures/</code> is gitignored), because the Company OS and trainer hub stories carry fixtures trainers may not see.</p>
<p>${captures.systems.map((s) => `<a href="#sys-${esc(s.name)}">${esc(s.name)}</a> (${s.items ? s.items.length : "not captured"})`).join(" · ")}</p>
${captures.systems.map(system).join("")}`
  : none;
const applicationsHtml = captures
  ? captures.applications
      .map(
        (a) =>
          `<h3>${esc(a.title)}</h3><p class="label">os/${esc(a.dir)}</p><div class="grid">${a.items.map((i) => shot(i, i.file, "")).join("")}</div>`,
      )
      .join("") +
    "<p>The slide engine's title, content and closing slides are under talks in the components above.</p>"
  : none;

const driftRows = Object.entries(drift.repos).map(([name, r]) => [
  esc(name),
  esc(r.status),
  r.commit ? code(r.commit.slice(0, 9)) : "",
  r.rows
    .filter((x) => x.status !== "identical")
    .map((x) => `${esc(x.status)}: ${code(x.copy)}`)
    .join("<br>") || "",
]);

const scanRows = Object.entries(scan.repos).map(([name, r]) => [
  esc(name),
  code(r.commit.slice(0, 9)),
  r.files,
  r.totals.hex,
  r.totals.tokenHex,
  r.totals.font,
  r.totals.palette,
  r.offHex
    .map(
      (h) => `${code(h.hex)} ${h.count}x${h.near ? ` (near ${esc(h.near)}, ${h.distance})` : ""}`,
    )
    .join(", ") || "none",
]);

const dupRows = Object.entries(scan.duplicates).map(([k, l]) => [
  code(k),
  l.map((x) => `${esc(x.repo)}: ${code(x.path)}`).join("<br>"),
  l[0].identical ? "yes" : "no",
  esc(allow.duplicates[k] ?? "not allowlisted"),
]);

const catalogueRows = Object.entries(repos).map(([name, r]) => [
  esc(name),
  r.catalogues.map((u) => `<a href="${esc(u)}">${esc(u)}</a>`).join("<br>") || "no own catalogue",
]);

const origins = Object.entries(
  manifest.files.reduce<Record<string, number>>((m, f) => {
    const k = f.origin ? `${f.origin.repo} ${f.origin.commit.slice(0, 9)}` : "brand";
    m[k] = (m[k] ?? 0) + 1;
    return m;
  }, {}),
).map(([k, n]) => [code(k), n]);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>hackers&amp;wizards brand catalogue</title>
<link rel="stylesheet" href="generated/tokens.root.css">
<link rel="stylesheet" href="tokens/print.css">
<style>
  @page { margin: 0; }
  body { margin: 0 auto; max-width: var(--container-wide); padding: var(--spacing-gutter); background: var(--color-bg); color: var(--color-ink); font: var(--type-body-weight) var(--type-body-size)/var(--type-body-line-height) var(--type-body-family); }
  header { border-top: 3px solid; border-image: var(--gradient-magic) 1; padding-top: 1.5rem; }
  h1, h2 { font-family: var(--font-mono); font-weight: 700; letter-spacing: -0.02em; }
  h1 { font-size: var(--text-h1); line-height: 1.1; }
  h2 { font-size: var(--text-h3); margin-top: var(--spacing-section-head); }
  .label, th { font-family: var(--type-label-family); font-size: var(--type-label-size); letter-spacing: var(--type-label-tracking); text-transform: uppercase; color: var(--color-muted); }
  code { font-family: var(--font-code); font-size: 0.9em; }
  table { border-collapse: collapse; width: 100%; font-size: var(--text-small); }
  th, td { text-align: left; vertical-align: top; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--color-border); }
  .grid { display: grid; gap: var(--spacing-grid); grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); }
  .swatch div { height: 4rem; border-radius: var(--radius-brand); border: 1px solid var(--color-border); }
  figure { margin: 0; font-size: var(--text-small); }
  .logo { background: var(--color-night); color: var(--color-night-ink); padding: 1rem; border-radius: var(--radius-brand); }
  .grid.logos { grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); }
  .logo .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .logo img { width: 100%; height: 6rem; object-fit: contain; padding: 0.4rem; box-sizing: border-box; border-radius: var(--radius-brand); }
  .logo img.light { background: var(--color-bg); }
  .shots { display: grid; gap: var(--spacing-grid); grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); }
  .shot img { display: block; width: 100%; max-height: 24rem; object-fit: cover; object-position: top; border: 1px solid var(--color-border); border-radius: var(--radius-brand); background: var(--color-white); }
  .grid .shot img { height: 8rem; object-fit: contain; background: var(--color-tint); }
  nav a { margin-right: 1rem; }
  .pv { width: 4rem; height: 2rem; background: var(--color-white); border: 1px solid var(--color-border); }
  .pv.bar { height: 0.5rem; max-width: 100%; background: var(--color-teal); border: 0; }
  h4 { margin: 1.5rem 0 0.5rem; }
  .logo a { color: var(--color-night-ink); }
  .role { border-bottom: 1px solid var(--color-border); padding: 0.5rem 0; }
  .role p { margin: 0.25rem 0 0; }
</style>
</head>
<body>
<header>
<p class="label">@hackersandwizards/brand</p>
<h1>Brand catalogue</h1>
<p>Tokens, logos, every system's components, the brand applications, the scan of every repo and each repo's drift against this repo. Scan of ${esc(scan.date)}, drift of ${esc(drift.date)}. Refresh with <code>bun run report</code>, the captures with <code>bun run capture</code>.</p>
<nav class="label"><a href="#colours">Colours</a> <a href="#type">Type</a> <a href="#tokens">Other tokens</a> <a href="#logos">Logos</a> <a href="#components">Components</a> <a href="#applications">Applications</a> <a href="#catalogues">Live catalogues</a> <a href="#drift">Drift</a> <a href="#scan">Scan</a></nav>
</header>

<h2 id="colours">Colours</h2>
<div class="grid">${swatches}</div>

<h2 id="type">Type roles</h2>
${roles}

<h2 id="tokens">Other tokens: spacing, radius, shadow, layout</h2>
${table(
  ["Token", "Value", "Preview"],
  other.map(([k, v]) => [code(k), code(v), preview(k)]),
)}

<h2 id="logos">Logos, each on light and on dark</h2>
<div class="grid logos">${logos}</div>

<h2 id="components">Components of every system</h2>
${systemsHtml}

<h2 id="applications">Brand applications in Company OS</h2>
${applicationsHtml}

<h2 id="catalogues">Live catalogues, while the repo's server runs</h2>
${table(["Repo", "Catalogue"], catalogueRows)}

<h2 id="drift">Drift per repo</h2>
<p>Each repo's copies at its last commit, compared byte for byte with <code>manifest.json</code>. Read only: nothing here writes into a repo.</p>
${table(["Repo", "Status", "Commit", "Not identical"], driftRows)}

<h2 id="scan">Scan</h2>
<p>Per repo at its last commit: hex literals off the token set, hex literals that repeat a token value, font stacks without a brand family, Tailwind default palette classes. ${Object.keys(allow.files).length} files and ${Object.keys(allow.duplicates).length} duplicates are allowlisted; the list may only shrink.</p>
${scan.aboveAllowlist.length ? `<p><strong>Above the allowlist:</strong></p><ul>${scan.aboveAllowlist.map((b: string) => `<li>${code(b)}</li>`).join("")}</ul>` : "<p>Every count is within the allowlist.</p>"}
${table(["Repo", "Commit", "Files", "Off-token hex", "Token value as hex", "Off-brand fonts", "Palette classes", "Most frequent off-token hex"], scanRows)}
<h3 class="label">Components in more than one repo, outside the slide engine</h3>
${table(["Name", "Where", "Identical", "Allowlist reason"], dupRows)}

<h2>Provenance</h2>
<p>Where each file came from, by repo and commit. File by file in <code>manifest.json</code>.</p>
${table(["Origin", "Files"], origins)}
</body>
</html>
`;

writeFileSync(join(ROOT, "catalogue.html"), html);
console.log("wrote catalogue.html");

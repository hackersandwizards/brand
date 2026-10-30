#!/usr/bin/env bun
// Writes catalogue.html, the brand portal: one file opened from disk, with a left nav, a search
// over every token, logo and component, and one view per area (overview, colours, type, tokens,
// logos, one page per system, components compared across systems, applications, health). Reads
// tokens, manifest.json, reports/ and captures/ (`bun run capture`) as they stand; every link is
// relative. CAPTURES=<dir or URL> points the capture links elsewhere, for a copy of the page.
// Usage: bun scripts/catalogue.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import manifest from "../manifest.json";
import pkg from "../package.json";
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
const CAPTURES = (process.env.CAPTURES ?? "captures").replace(/\/$/, "");
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
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// The search index: what a reader types, where it leads.
const index: { t: string; k: string; h: string; x?: string }[] = [];

// Colours, grouped by family.
const family = (k: string) =>
  /night/.test(k)
    ? "Night"
    : /teal|purple|ampersand/.test(k)
      ? "Brand"
      : /green|amber|factory|red/.test(k)
        ? "Status"
        : "Surface and ink";
const colourGroups = ["Surface and ink", "Brand", "Status", "Night"].map((g) => {
  const list = Object.entries(colors).filter(([k]) => family(k) === g);
  for (const [k, hex] of list)
    index.push({ t: k, k: "colour", h: `colours/${slug(k)}`, x: `${hex} ${g}` });
  return `<h3 class="label">${g}</h3><div class="grid">${list
    .map(
      ([k, hex]) =>
        `<button class="swatch" id="${slug(k)}" data-copy="${esc(hex)}" title="Copy ${esc(hex)}"><span style="background:var(${k})"></span><strong>${esc(hex)}</strong>${code(k)}${
          tokens[k] !== hex ? `<small>${esc(tokens[k])}</small>` : ""
        }</button>`,
    )
    .join("")}</div>`;
});

const roles = [
  ...new Set(Object.keys(tokens).flatMap((k) => k.match(/^--type-(\w+)-family$/)?.[1] ?? [])),
]
  .map((r) => {
    index.push({ t: `type ${r}`, k: "type", h: `type/type-${r}` });
    const v = (p: string) => (tokens[`--type-${r}-${p}`] ? `var(--type-${r}-${p})` : "normal");
    const style = `font-family:${v("family")};font-weight:${v("weight")};font-size:${v("size")};line-height:${v("line-height")};letter-spacing:${v("tracking")};text-transform:${tokens[`--type-${r}-case`] ? `var(--type-${r}-case)` : "none"}`;
    return `<div class="role" id="type-${r}"><span class="label">${esc(r)} ${code(`--type-${r}-*`)}</span><p style="${style}">Agentic Engineering, from the first prompt to the factory</p></div>`;
  })
  .join("");

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
const otherTokens = Object.entries(tokens).filter(
  ([k]) => !k.startsWith("--color-") && !k.startsWith("--type-") && !k.startsWith("--text-"),
);
const tokenKinds = [...new Set(otherTokens.map(([k]) => k.split("-")[2]))];
const tokensHtml = tokenKinds
  .map((kind) => {
    const rows = otherTokens.filter(([k]) => k.split("-")[2] === kind);
    for (const [k, v] of rows) index.push({ t: k, k: "token", h: `tokens/${slug(k)}`, x: v });
    return `<h3 class="label" id="kind-${kind}">${esc(kind)}</h3>${table(
      ["Token", "Value", "Preview"],
      rows.map(([k, v]) => [`<span id="${slug(k)}">${code(k)}</span>`, code(v), preview(k)]),
    )}`;
  })
  .join("");

// Logos: one card per logo with its light, night, outline and print files as downloads.
const logoFiles = manifest.files.map((f) => f.path).filter((p) => p.startsWith("logos/"));
const bases = [
  ...new Set(
    logoFiles.map((p) => p.replace(/^logos\//, "").replace(/(-night|-outline|-cmyk)?\.\w+$/, "")),
  ),
];
const LOGO_NOTES: Record<string, string> = {
  lockup:
    "The standard logo: wizard beside the pixel wordmark. Every surface without its own row: screens, slides, documents, website, banners, notebook, cloth.",
  "lockup-compact":
    "Stacked, for small and square spots: mug, lock screens. The iPhone lock screen keeps it at its smaller size.",
  wordmark:
    "The wordmark alone, for textiles: shirts, hoodie and stickers. Also where the wizard already appears nearby.",
  "emoji-logo-long": "The conceptual origin 👨🏼‍💻 🧙🏼‍♂️, not the logo.",
  "emoji-logo-short": "The conceptual origin, short. Not the logo.",
  "emoji-logo-short-quote": "The conceptual origin as a quote mark. Not the logo.",
  "type-logo-long": "Former logo: new work never uses it, replace on sight.",
  "type-logo-short": "Former logo: new work never uses it, replace on sight.",
};
const logoCard = (base: string) => {
  const files = logoFiles.filter((p) =>
    new RegExp(`^logos/${base}(-night|-outline|-cmyk)?\\.\\w+$`).test(p),
  );
  const show = files.find((p) => p.endsWith(`${base}.svg`)) ?? files.find((p) => /png$/.test(p));
  const night = files.find((p) => p.endsWith(`${base}-night.svg`)) ?? show;
  const outline = files.find((p) => p.endsWith(`${base}-outline.svg`));
  const former = base.startsWith("type-logo") || base.startsWith("emoji");
  index.push({
    t: base,
    k: "logo",
    h: `logos/logo-${base}`,
    x: `${files.join(" ")} download ${former ? "" : "logo"}`,
  });
  return `<article class="logo${former ? " former" : ""}" id="logo-${base}"><div class="pair">${
    show ? `<img class="on-light" src="${show}" alt="${esc(base)} on light">` : ""
  }${night ? `<img class="on-dark" src="${night}" alt="${esc(base)} on dark">` : ""}${outline ? `<img class="on-purple-love" src="${outline}" alt="${esc(base)} outlined on Purple Love">` : ""}</div><h3>${esc(base)}</h3><p>${esc(LOGO_NOTES[base] ?? "")}</p><p class="dl">${files
    .map(
      (p) =>
        `<a href="${p}" download>${esc(
          p
            .replace(/^logos\//, "")
            .replace(`${base}`, "")
            .replace(/^-/, "") || p.split(".").pop(),
        )}</a>`,
    )
    .join("")}</p></article>`;
};
const order = (b: string) =>
  ["lockup", "lockup-compact", "wordmark"].indexOf(b) + 1 || 10 + bases.indexOf(b);
const isLogo = (b: string) => b.startsWith("lockup") || b.startsWith("wordmark");
const logosHtml = `<div class="logos">${bases
  .filter(isLogo)
  .sort((a, b) => order(a) - order(b))
  .map(logoCard)
  .join("")}</div>
<h3>Not the logo: the conceptual origin and the former logo</h3>
<div class="logos">${bases
  .filter((b) => !isLogo(b))
  .map(logoCard)
  .join("")}</div>`;

// Captures of every system and the Company OS applications.
type Capture = { group: string; name: string; file: string; source: string; states?: number };
type System = { name: string; error?: string; commit?: string; built?: string; items?: Capture[] };
type Captures = {
  date: string;
  systems: System[];
  applications: { title: string; dir: string; items: Capture[] }[];
};
const captures: Captures | undefined = existsSync(join(ROOT, "captures/index.json"))
  ? read("captures/index.json")
  : undefined;
const day = (iso: string) => esc(iso.slice(0, 10));
const stamp = (iso: string) => `${esc(iso.slice(0, 16).replace("T", " "))} UTC`;
const shotCard = (s: string, c: Capture, file = `${s}/${c.file}`) =>
  `<figure class="shot" id="c-${slug(`${s}-${c.file}`)}"><a href="${CAPTURES}/${esc(file)}"><img src="${CAPTURES}/${esc(file)}" alt="${esc(c.name)}" loading="lazy"></a><figcaption><strong>${esc(c.name)}</strong> <span class="label">${esc(s)}${c.states && c.states > 1 ? ` · ${c.states} states` : ""}</span><br>${code(c.source)}</figcaption></figure>`;
const systems = captures?.systems ?? [];
const systemPage = (s: System) => {
  if (s.error) return `<p>Not captured: ${esc(s.error)}</p>`;
  const groups = [...new Set(s.items!.map((i) => i.group))];
  for (const i of s.items!)
    index.push({
      t: i.name,
      k: s.name,
      h: `sys-${s.name}/c-${slug(`${s.name}-${i.file}`)}`,
      x: `${i.group} ${i.source}`,
    });
  const scanned = scan.repos[s.name]?.commit;
  const stale =
    scanned && !scanned.startsWith(s.commit!)
      ? ` · <strong class="stale">captured from ${esc(s.commit)}, the repo is at ${esc(scanned.slice(0, 9))}: rebuild and run <code>bun run capture</code></strong>`
      : "";
  return `<p class="meta">commit ${code(s.commit)} · build of ${stamp(s.built!)}${stale} · ${s.items!.length} components · <a href="${esc(
    (repos as Record<string, { catalogues: string[] }>)[s.name]?.catalogues[0] ?? "#",
  )}">live catalogue</a></p>${
    groups.length > 1
      ? `<p class="chips">${groups.map((g) => `<a href="#sys-${s.name}/g-${slug(`${s.name}-${g}`)}">${esc(g || "Other")}</a>`).join("")}</p>`
      : ""
  }${groups
    .map(
      (g) =>
        `${groups.length > 1 ? `<h3 class="label" id="g-${slug(`${s.name}-${g}`)}">${esc(g || "Other")}</h3>` : ""}<div class="shots">${s
          .items!.filter((i) => i.group === g)
          .map((i) => shotCard(s.name, i))
          .join("")}</div>`,
    )
    .join("")}`;
};

// Components that more than one system carries, by name, plus every action and button.
const byName = new Map<string, [string, Capture][]>();
for (const s of systems)
  for (const i of s.items ?? []) {
    const key = /button|cta|primitives/.test(i.name) ? "buttons and actions" : i.name;
    if (i.group === "" && s.name === "website") continue;
    byName.set(key, [...(byName.get(key) ?? []), [s.name, i]]);
  }
const shared = [...byName].filter(([, l]) => new Set(l.map(([s]) => s)).size > 1);
for (const [k] of shared) index.push({ t: k, k: "compare", h: `compare/cmp-${slug(k)}` });
const compareHtml = shared.length
  ? shared
      .map(
        ([k, l]) =>
          `<h3 id="cmp-${slug(k)}">${esc(k)} <span class="label">${[...new Set(l.map(([s]) => s))].join(" · ")}</span></h3><div class="shots cmp">${l.map(([s, i]) => shotCard(s, i)).join("")}</div>`,
      )
      .join("")
  : "<p>No captures yet: run <code>bun run capture</code>.</p>";

const applicationsHtml = captures
  ? captures.applications
      .map((a) => {
        for (const i of a.items)
          index.push({
            t: i.name,
            k: "application",
            h: `applications/c-${slug(`os-${i.file}`)}`,
            x: a.title,
          });
        return `<h3 id="app-${slug(a.title)}">${esc(a.title)}</h3><p class="meta">os/${esc(a.dir)}</p><div class="grid apps">${a.items.map((i) => shotCard("os", i, i.file)).join("")}</div>`;
      })
      .join("")
  : "<p>No captures yet: run <code>bun run capture</code>.</p>";

// Health: drift, scan, duplicates, provenance.
const driftBad = Object.entries(drift.repos).filter(([, r]) =>
  r.rows.some((x) => x.status !== "identical"),
);
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
    .slice(0, 5)
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
const origins = Object.entries(
  manifest.files.reduce<Record<string, number>>((m, f) => {
    const k = f.origin ? `${f.origin.repo} ${f.origin.commit.slice(0, 9)}` : "brand";
    m[k] = (m[k] ?? 0) + 1;
    return m;
  }, {}),
).map(([k, n]) => [code(k), n]);
for (const b of scan.aboveAllowlist) index.push({ t: b, k: "scan", h: "health/scan" });
const withCopies = Object.entries(drift.repos).filter(([, r]) => r.rows.length);
const above = (name: string) => scan.aboveAllowlist.filter((b) => b.startsWith(`${name}:`)).length;
const offHex = Object.entries(scan.repos)
  .sort(([, a], [, b]) => b.totals.hex - a.totals.hex)
  .map(([n, r]) => `${esc(n)} ${r.totals.hex}`)
  .join(", ");
const driftLine = `${driftBad.length ? `${driftBad.length} of ${withCopies.length} repos with copies drifted` : `none of the ${withCopies.length} repos with copies drifted`}; ${Object.keys(drift.repos).length - withCopies.length} hold no copies`;
const summaryRows = Object.entries(scan.repos).map(([name, r]) => {
  const sys = systems.find((x) => x.name === name);
  return [
    esc(name),
    sys?.commit
      ? `${code(sys.commit)} ${day(sys.built!)}${r.commit.startsWith(sys.commit) ? "" : ' <strong class="stale">older than the scanned commit</strong>'}`
      : "no catalogue",
    code(r.commit.slice(0, 9)),
    esc(drift.repos[name]?.status ?? ""),
    r.totals.hex,
    above(name) ? `<strong>${above(name)} above</strong>` : "within",
  ];
});

const health = `<p>Per repo: the build its components were captured from, the commit the scan read, whether its copies of brand files still match, and its off-token hex count against the allowlist.</p>
${table(["Repo", "Captured build", "Scanned commit", "Copies", "Off-token hex", "Allowlist"], summaryRows)}
<h3 id="drift">Drift: do the repos' copies still match?</h3>
<p><strong>${driftLine}.</strong> ${driftBad.length ? `Drifted: ${driftBad.map(([n]) => esc(n)).join(", ")}.` : "Every copy is byte-identical with this repo."} A repo without copies imports the package or nothing, so drift does not apply to it; the scan below covers every repo. Drift of ${esc(drift.date)}, each repo at its last commit.</p>
${table(["Repo", "Status", "Commit", "Not identical"], driftRows)}
<h3 id="scan">Scan: off-token values per repo</h3>
<p>Hex literals off the token set, hex literals that repeat a token value, font stacks without a brand family, Tailwind default palette classes. Scan of ${esc(scan.date)}. ${Object.keys(allow.files).length} files and ${Object.keys(allow.duplicates).length} duplicates are allowlisted; the list may only shrink.</p>
${scan.aboveAllowlist.length ? `<p class="warn"><strong>Above the allowlist:</strong> ${scan.aboveAllowlist.map(code).join(", ")}</p>` : "<p>Every count is within the allowlist.</p>"}
${table(["Repo", "Commit", "Files", "Off-token hex", "Token value as hex", "Off-brand fonts", "Palette classes", "Most frequent off-token hex"], scanRows)}
<h3 id="duplicates">Components in more than one repo</h3>
${table(["Name", "Where", "Identical", "Allowlist reason"], dupRows)}
<h3 id="provenance">Provenance</h3>
<p>Where each file came from, by repo and commit; file by file in <code>manifest.json</code>.</p>
${table(["Origin", "Files"], origins)}`;

// Overview: what is here, how fresh, what needs attention.
const tile = (href: string, title: string, body: string) =>
  `<a class="tile" href="#${href}"><strong>${title}</strong><span>${body}</span></a>`;
const overview = `<p class="lead">Everything the hackers&amp;wizards brand is made of, from the tokens to every component of every system, and whether each repo still matches.</p>
<div class="tiles">
${tile("colours", "Colours", `${Object.keys(colors).length} tokens in four families, click to copy`)}
${tile("type", "Type", "Type roles in JetBrains Mono and Inter")}
${tile("logos", "Logos", "Lockup, compact, wordmark, light, night and outline, SVG and PNG downloads")}
${tile("compare", "Compare", `${shared.length} components side by side across systems`)}
${systems.map((s) => tile(`sys-${s.name}`, esc(s.name), s.items ? `${s.items.length} components · build ${day(s.built!)}` : "not captured")).join("")}
${tile("applications", "Applications", "Design-guide assets, merch, backgrounds")}
${tile("health", "Health", `${driftLine} · off-token hex: ${offHex} · ${scan.aboveAllowlist.length} file(s) above the allowlist`)}
</div>
<h3>Freshness</h3>
${table(
  ["Source", "As of", "Refresh"],
  [
    ["Tokens, logos", `v${esc(pkg.version)}`, code("bun run tokens")],
    [
      "Component captures",
      captures ? stamp(captures.date) : "none",
      `${code("bun run capture")}, after building each repo`,
    ],
    ["Drift", esc(drift.date), code("bun run report")],
    ["Scan", esc(scan.date), code("bun run report")],
  ],
)}
<h3>Quick start</h3>
<ul>
<li>Logo for a slide or a document: <a href="logos/lockup.svg" download>lockup.svg</a>, on dark <a href="logos/lockup-night.svg" download>lockup-night.svg</a>, square <a href="logos/lockup-compact.svg" download>lockup-compact.svg</a>.</li>
<li>Slides: there is no slide template file. Decks are built in the talks slide engine (<code>styles/slides.css</code>); its title, content and closing slides are under <a href="#sys-talks">talks</a>.</li>
<li>In code: <code>@import "@hackersandwizards/brand/tokens.css";</code>, the rest in <code>README.md</code>.</li>
</ul>`;

const pages: [string, string, string][] = [
  ["overview", "Overview", overview],
  ["colours", "Colours", colourGroups.join("")],
  ["type", "Type", roles],
  ["tokens", "Spacing, radius, shadow, layout", tokensHtml],
  [
    "logos",
    "Logos",
    `<p>Three logos, each one line: the lockup is the standard, the wordmark alone goes on textiles and stickers, the compact lockup on small spots. The mail signature keeps the typed wordmark. On night, black, black textile and Stargazer take the night cut, without an outline; on Purple Love the outline cut, a white outline round the letters. The gradient is never a ground. Alignment rules: <code>README.md</code>, "Use it in another repo".</p>${logosHtml}`,
  ],
  [
    "compare",
    "Compare across systems",
    `<p>Components with the same name in more than one system, and every button and action, side by side.</p>${compareHtml}`,
  ],
  ...systems.map((s): [string, string, string] => [`sys-${s.name}`, s.name, systemPage(s)]),
  ["applications", "Brand applications in Company OS", applicationsHtml],
  ["health", "Health: drift and scan", health],
];
const nav = (id: string, title: string, extra = "") =>
  `<a href="#${id}" data-page="${id}">${esc(title)}${extra}</a>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>hackers&amp;wizards brand</title>
<link rel="stylesheet" href="generated/tokens.root.css">
<link rel="stylesheet" href="tokens/print.css">
<style>
  body { margin: 0; display: grid; grid-template-columns: 16rem 1fr; min-height: 100vh; background: var(--color-bg); color: var(--color-ink); font: var(--type-body-weight) var(--text-small)/1.5 var(--type-body-family); }
  aside { position: sticky; top: 0; height: 100vh; overflow: auto; box-sizing: border-box; padding: 1.25rem 1rem; border-right: 1px solid var(--color-border); background: var(--color-white); border-top: 3px solid; border-image: var(--gradient-magic) 1; }
  aside img { width: 100%; margin-bottom: 0.25rem; }
  aside nav { display: grid; gap: 1px; margin-top: 1rem; }
  aside nav a { padding: 0.3rem 0.5rem; border-radius: 4px; color: var(--color-ink); text-decoration: none; display: flex; justify-content: space-between; }
  aside nav a:hover { background: var(--color-tint); }
  aside nav a.on { background: var(--color-teal); color: var(--color-white); }
  aside nav a small { color: inherit; opacity: 0.7; }
  aside .label { margin: 1rem 0.5rem 0.25rem; }
  input[type=search] { width: 100%; box-sizing: border-box; padding: 0.5rem 0.6rem; font: inherit; border: 1px solid var(--color-border-strong); border-radius: 6px; }
  main { padding: 1.5rem clamp(1rem, 3vw, 3rem) 4rem; min-width: 0; }
  section { display: none; max-width: var(--container-wide); }
  section.on { display: block; }
  h1, h2, h3 { font-family: var(--font-mono); letter-spacing: -0.02em; }
  h2 { font-size: var(--text-h2); margin: 0 0 1rem; }
  h3 { font-size: var(--text-h4); margin: 2rem 0 0.75rem; }
  .label, th { font-family: var(--type-label-family); font-size: var(--type-label-size); letter-spacing: var(--type-label-tracking); text-transform: uppercase; color: var(--color-muted); font-weight: 400; }
  .lead { font-size: var(--text-lead); max-width: 40em; }
  .meta { color: var(--color-muted); }
  code { font-family: var(--font-code); font-size: 0.9em; }
  table { border-collapse: collapse; width: 100%; background: var(--color-white); }
  th, td { text-align: left; vertical-align: top; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--color-border); }
  .grid { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); }
  .swatch { all: unset; cursor: copy; display: grid; gap: 0.15rem; background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); padding: 0.5rem; }
  .swatch span { height: 3.5rem; border-radius: 12px 3px; border: 1px solid var(--color-border); margin-bottom: 0.3rem; }
  .swatch strong { font-family: var(--font-code); }
  .swatch small { color: var(--color-muted); font-size: 0.7rem; }
  .swatch.copied strong::after { content: " copied"; color: var(--color-teal); font-weight: 400; }
  .tiles { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); }
  .tile { display: grid; gap: 0.25rem; padding: 1rem; background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); color: var(--color-ink); text-decoration: none; }
  .tile:hover { border-color: var(--color-teal); }
  .tile strong { font-family: var(--font-mono); font-size: var(--text-h4); }
  .tile span { color: var(--color-muted); }
  .logos { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr)); }
  .logo { background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); padding: 1rem; }
  .logo.former { border-style: dashed; }
  .logo.former h3, .logo.former p { color: var(--color-muted); }
  .logo h3 { margin: 0.75rem 0 0.25rem; }
  .logo p { margin: 0.25rem 0; }
  .pair { display: grid; grid-auto-columns: 1fr; grid-auto-flow: column; gap: 0.5rem; }
  .pair img { width: 100%; height: 6rem; object-fit: contain; padding: 0.75rem; box-sizing: border-box; border-radius: 12px 3px; }
  .on-light { background: var(--color-bg); border: 1px solid var(--color-border); }
  .on-dark { background: var(--color-night); }
  .on-purple-love { background: #6c5a9e; } /* Purple Love, the Stanley/Stella textile C115, no brand token */
  .dl a, .chips a { display: inline-block; margin: 0.25rem 0.4rem 0 0; padding: 0.15rem 0.5rem; border: 1px solid var(--color-border-strong); border-radius: 999px; color: var(--color-ink); text-decoration: none; font-family: var(--font-code); font-size: 0.75rem; }
  .dl a::before { content: "↓ "; }
  .dl a:hover, .chips a:hover { background: var(--color-tint); }
  .shots { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); }
  .shot { margin: 0; }
  .shot img { display: block; width: 100%; height: 13rem; object-fit: cover; object-position: top; border: 1px solid var(--color-border); border-radius: 12px 3px; background: var(--color-white); }
  .cmp { grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr)); }
  .cmp .shot img { height: 24rem; }
  .apps .shot img { height: 8rem; object-fit: contain; background: var(--color-tint); }
  .shot figcaption { padding-top: 0.3rem; overflow-wrap: anywhere; }
  .pv { width: 4rem; height: 2rem; background: var(--color-white); border: 1px solid var(--color-border); }
  .pv.bar { height: 0.5rem; max-width: 100%; background: var(--color-teal); border: 0; }
  .role { border-bottom: 1px solid var(--color-border); padding: 0.75rem 0; }
  .role p { margin: 0.25rem 0 0; }
  .warn { border-left: 3px solid var(--color-amber); padding-left: 0.75rem; }
  #results { display: none; }
  #results.on { display: block; }
  #results a { display: flex; gap: 0.75rem; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--color-border); color: var(--color-ink); text-decoration: none; background: var(--color-white); }
  #results a:hover { background: var(--color-tint); }
  #results .label { min-width: 7rem; }
  .stale { color: var(--color-amber-dark); }
  dialog { width: 96vw; max-width: none; height: 92vh; padding: 1rem; border: 0; border-radius: var(--radius-brand); }
  dialog::backdrop { background: rgb(11 17 24 / 0.7); }
  dialog div { display: grid; gap: 1rem; grid-auto-flow: column; grid-auto-columns: minmax(28rem, 1fr); align-items: start; }
  dialog figure { margin: 0; }
  dialog img { width: 100%; border: 1px solid var(--color-border); }
  .shot img { cursor: zoom-in; }
</style>
</head>
<body>
<aside>
<a href="#overview"><img src="logos/lockup.svg" alt="hackers&amp;wizards"></a>
<p class="label" style="margin:0">Brand v${esc(pkg.version)}</p>
<input type="search" id="q" placeholder="Search tokens, logos, components  /" autocomplete="off">
<nav>
${nav("overview", "Overview")}
<p class="label">Foundations</p>
${nav("colours", "Colours")}${nav("type", "Type")}${nav("tokens", "Spacing and more")}${nav("logos", "Logos")}
<p class="label">Components</p>
${nav("compare", "Compare", `<small>${shared.length}</small>`)}
${systems.map((s) => nav(`sys-${s.name}`, s.name, `<small>${s.items?.length ?? "–"}</small>`)).join("")}
<p class="label">Brand in use</p>
${nav("applications", "Applications")}${nav("health", "Health", `<small>${driftBad.length + scan.aboveAllowlist.length || "ok"}</small>`)}
</nav>
</aside>
<main>
<dialog id="zoom"><p class="meta">Full size, uncropped. Esc or click to close.</p><div></div></dialog>
<section id="results"><h2>Search</h2><div></div></section>
${pages.map(([id, title, body]) => `<section id="${id}" data-page><h2>${esc(title)}</h2>${body}</section>`).join("\n")}
</main>
<script>
const INDEX = ${JSON.stringify(index).replace(/</g, "\\u003c")};
const q = document.getElementById("q"), results = document.getElementById("results");
const show = () => {
  const [page, anchor] = decodeURIComponent(location.hash.slice(1)).split("/");
  const target = document.getElementById(page)?.matches("[data-page]") ? page : "overview";
  for (const s of document.querySelectorAll("section[data-page]")) s.classList.toggle("on", s.id === target && !q.value);
  for (const a of document.querySelectorAll("aside nav a")) a.classList.toggle("on", a.dataset.page === target);
  const el = anchor && document.getElementById(anchor);
  if (el) { el.scrollIntoView({ block: "center" }); el.style.outline = "3px solid var(--color-purple)"; el.style.outlineOffset = "3px"; setTimeout(() => (el.style.outline = ""), 2000); }
  else scrollTo(0, 0);
};
const search = () => {
  const words = q.value.toLowerCase().split(/\\s+/).filter(Boolean);
  results.classList.toggle("on", words.length > 0);
  const hits = INDEX.filter((e) => words.every((w) => (e.t + " " + e.k + " " + (e.x || "")).toLowerCase().includes(w))).slice(0, 60);
  results.querySelector("div").innerHTML = hits.map((e) => '<a href="#' + e.h + '"><span class="label">' + e.k + "</span>" + (e.k === "colour" ? '<i style="width:1rem;height:1rem;border-radius:4px;border:1px solid var(--color-border);background:' + e.x.split(" ")[0] + '"></i>' : "") + "<strong>" + e.t.replace(/[&<]/g, (c) => ({ "&": "&amp;", "<": "&lt;" })[c]) + "</strong><span class=meta>" + (e.x || "").replace(/[&<]/g, "") .slice(0, 80) + "</span></a>").join("") || "<p>Nothing found.</p>";
  show();
};
q.addEventListener("input", search);
results.addEventListener("click", () => { q.value = ""; results.classList.remove("on"); });
addEventListener("hashchange", show);
addEventListener("keydown", (e) => { if (e.key === "/" && document.activeElement !== q) { e.preventDefault(); q.focus(); } });
const zoom = document.getElementById("zoom");
zoom.addEventListener("click", () => zoom.close());
document.addEventListener("click", (e) => {
  const shot = e.target.closest(".shot a");
  if (shot) {
    e.preventDefault();
    const group = shot.closest(".cmp") ? [...shot.closest(".cmp").querySelectorAll(".shot")] : [shot.closest(".shot")];
    zoom.querySelector("div").innerHTML = group.map((f) => "<figure><img src='" + f.querySelector("img").src + "'>" + f.querySelector("figcaption").outerHTML + "</figure>").join("");
    zoom.showModal();
    return;
  }
  const b = e.target.closest("[data-copy]");
  if (b) navigator.clipboard?.writeText(b.dataset.copy).then(() => { b.classList.add("copied"); setTimeout(() => b.classList.remove("copied"), 1200); });
});
show();
</script>
</body>
</html>
`;

writeFileSync(join(ROOT, "catalogue.html"), html);
console.log("wrote catalogue.html");

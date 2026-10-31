#!/usr/bin/env bun
// Writes catalogue.html, the brand portal: one file opened from disk, with a left nav, a search
// over every token, logo and component, and one view per area (overview, colours, type, tokens,
// logos, a Compare that renders the systems a reader picks side by side, applications, health).
// Under Components the nav is a tree as in Storybook, system > group > component, and the page
// renders a system's index, a group's gallery or one component from the hash. Components are each
// system's own pages from captures/live/ (`bun run live`), embedded as frames; application files
// open from the os checkout next to this repo. CAPTURES=<dir or URL> points the live pages
// elsewhere, for a copy of the page.
// Usage: bun scripts/catalogue.ts
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import manifest from "../manifest.json";
import pkg from "../package.json";
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
// A former name is a token whose value is another colour token: it resolves, but adds no colour.
const former = Object.keys(colors).filter((k) => /^var\(--color-[\w-]+\)$/.test(tokens[k]));
const own = Object.entries(colors).filter(([k]) => !former.includes(k));
const colourGroups = ["Surface and ink", "Brand", "Status", "Night"].map((g) => {
  const list = own.filter(([k]) => family(k) === g);
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

// The role table and the chart order, read from tokens.css.
const swatchCell = (name: string) =>
  `<span class="sw" style="background:var(--color-${name})"></span>${code(name)}`;
const tintCell = (base: string, p: number) =>
  `<span class="sw" style="background:color-mix(in srgb, var(--color-${base}) ${p}%, white)"></span>${p} %`;
const roleRows = [
  ...readFileSync(SOURCE, "utf8").matchAll(
    /^\s*([\w-]+)\s*\|\s*([\w-]+)\s*\|\s*([\w-]+)\s*(?:\*\/)?$/gm,
  ),
].map(([, base, text, night]) => [
  swatchCell(base),
  swatchCell(text),
  `<span class="night-cell">${swatchCell(night)}</span>`,
  tintCell(base, 7),
  tintCell(base, 40),
]);
const chart = Object.keys(tokens)
  .filter((k) => k.startsWith("--chart-"))
  .map((k) => swatchCell(tokens[k].match(/--color-([\w-]+)/)![1]));
const rolesHtml = `<h3 class="label" id="roles">Roles</h3>
<p>Each hue has a base, a text colour on light, one colour on night, and two tints. Text on light clears 4.5:1 on bg and white, night clears 4.5:1 on night and night-2.</p>
${table(["Base", "Text on light", "Night", "Tint 7 %", "Tint 40 %"], roleRows)}
<h3 class="label" id="chart">Chart order</h3>
<p>Series take this order, ${code("--chart-1")} to ${code(`--chart-${chart.length}`)}; on night each takes its hue's night colour.</p>
<ol class="chart">${chart.map((c) => `<li>${c}</li>`).join("")}</ol>
${former.length ? `<p class="meta">Former names, resolving to their successor: ${former.map((k) => `${code(k)} → ${code(tokens[k].slice(4, -1))}`).join(", ")}.</p>` : ""}`;

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
const otherTokens = Object.entries(tokens).filter(([k]) => !/^--(color|type|text|chart)-/.test(k));
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
};
const logoCard = (base: string) => {
  const files = logoFiles.filter((p) =>
    new RegExp(`^logos/${base}(-night|-outline|-cmyk)?\\.\\w+$`).test(p),
  );
  const show = files.find((p) => p.endsWith(`${base}.svg`)) ?? files.find((p) => /png$/.test(p));
  const night = files.find((p) => p.endsWith(`${base}-night.svg`)) ?? show;
  const outline = files.find((p) => p.endsWith(`${base}-outline.svg`));
  index.push({
    t: base,
    k: "logo",
    h: `logos/logo-${base}`,
    x: `${files.join(" ")} download logo`,
  });
  return `<article class="logo" id="logo-${base}"><div class="pair">${
    show ? `<img class="on-light" src="${show}" alt="${esc(base)} on light">` : ""
  }${night ? `<img class="on-dark" src="${night}" alt="${esc(base)} on dark">` : ""}${outline ? `<img class="on-purple-love" src="${outline}" alt="${esc(base)} outlined on Purple Love"><img class="on-gradient" src="${outline}" alt="${esc(base)} outlined on the gradient">` : ""}</div><h3>${esc(base)}</h3><p>${esc(LOGO_NOTES[base] ?? "")}</p><p class="dl">${files
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
// The package still ships the former type-logo and the emoji files for the code that reads them;
// the page shows only the logos in use.
const isLogo = (b: string) => b.startsWith("lockup") || b.startsWith("wordmark");
const logosHtml = `<div class="logos">${bases
  .filter(isLogo)
  .sort((a, b) => order(a) - order(b))
  .map(logoCard)
  .join("")}</div>`;

// Every system's catalogue as live pages (`bun scripts/live.ts`): each story's own markup with its
// own app's CSS, embedded in a frame, so what the portal shows is the component itself.
type Story = { group: string; name: string; story: string; file: string };
type System = {
  name: string;
  error?: string;
  commit?: string;
  built?: string;
  stories?: Story[];
  colours?: Record<string, string>;
};
const live: { date: string; systems: System[] } | undefined = existsSync(
  join(ROOT, "captures/live/index.json"),
)
  ? read("captures/live/index.json")
  : undefined;
const systems = live?.systems ?? [];

// The kinds a reader compares by: the first match on the name wins, else on the group.
const KINDS: [string, RegExp][] = [
  ["Slides", /slide/],
  ["Buttons and links", /button|cta|action|link|elements/],
  ["Chips, pills and badges", /chip|pill|badge|tag|label|topic/],
  ["Cards and tiles", /card|tile|panel/],
  ["Notices and callouts", /callout|notice|warning|alert|banner|note|quote|not-found|unavailable/],
  ["Lists and tables", /list|table|row|facts/],
  ["Forms and search", /input|form|field|select|search|checkbox|toggle|filter|dialog|edit/],
  ["Navigation, header, footer", /header|nav|footer|menu|breadcrumb|sidebar/],
  ["Type and headings", /heading|title|type|text|prose|eyebrow|kicker/],
  ["Logos", /logo|brand|wordmark|lockup/],
  ["Tokens and lengths", /token|length|colou?r/],
];
const kindOf = (group: string, name: string) =>
  (KINDS.find(([, re]) => re.test(name.toLowerCase())) ??
    KINDS.find(([, re]) => re.test(group.toLowerCase())))?.[0] ?? "Other";
type Component = { kind: string; group: string; name: string; stories: Story[] };
const components = (s: System) => {
  const m = new Map<string, Component>();
  for (const st of s.stories ?? []) {
    const key = `${st.group}/${st.name}`;
    if (!m.has(key))
      m.set(key, { kind: kindOf(st.group, st.name), group: st.group, name: st.name, stories: [] });
    m.get(key)!.stories.push(st);
  }
  // A frame opens on the plain state where the system has one.
  const plain = (s: Story) => (/^(primary|default|rest|base)/.test(s.story) ? 0 : 1);
  for (const c of m.values()) c.stories.sort((a, b) => plain(a) - plain(b));
  return [...m.values()];
};
// Each system as groups of components: the left nav's tree and the data the page renders a
// system, a group or a component from. A system whose catalogue has no groups gets one, "all".
const tree = systems
  .filter((s) => s.stories)
  .map((s) => {
    const list = components(s);
    const groups = [...new Set(list.map((c) => c.group))].map((g) => ({
      g,
      id: slug(g || "all").replace(/^-|-$/g, ""),
      c: list
        .filter((c) => c.group === g)
        .map((c) => ({
          n: c.name,
          id: slug(c.name),
          k: c.kind,
          s: c.stories.map((x) => [x.story, x.file]),
        })),
    }));
    for (const g of groups) {
      if (g.g)
        index.push({
          t: g.g,
          k: s.name,
          h: `sys-${s.name}/${g.id}`,
          x: `group ${g.c.length} components`,
        });
      for (const c of g.c)
        index.push({ t: c.n, k: s.name, h: `sys-${s.name}/${g.id}/${c.id}`, x: `${g.g} ${c.k}` });
    }
    return { name: s.name, colours: s.colours ?? {}, groups };
  });
const DATA = {
  capture: `${CAPTURES}/live/`,
  brand: colors,
  systems: Object.fromEntries(tree.map((t) => [t.name, t])),
};

const kindNames = [...KINDS.map(([k]) => k), "Other"];
for (const k of kindNames)
  index.push({ t: k, k: "compare", h: `compare/website+trainer-hub/${slug(k)}` });
index.push({ t: "Colour tokens", k: "compare", h: "compare/website+os+trainer-hub/colour-tokens" });
const compareHtml = tree.length
  ? `<p class="lead">Pick two or more systems and one kind of component or token: each system's own version appears side by side, rendered from its last build with its own CSS.</p>
<form id="cmp-form" class="controls">
<div class="field wide"><span class="label" id="cmp-sys">Systems</span><div class="chips" role="group" aria-labelledby="cmp-sys">${tree
      .map(
        (s) =>
          `<label class="chip"><input type="checkbox" name="sys" value="${esc(s.name)}"><span>${esc(s.name)}</span><small data-count="${esc(s.name)}"></small></label>`,
      )
      .join("")}</div></div>
<label class="field"><span class="label">Kind</span><select class="input" name="kind">${[
      "colour-tokens",
      ...kindNames.map(slug),
    ]
      .map((v, i) => `<option value="${v}">${esc(i ? kindNames[i - 1] : "Colour tokens")}</option>`)
      .join("")}</select></label>
<label class="field"><span class="label">Name contains</span><input class="input" type="search" name="q" placeholder="e.g. button" autocomplete="off"></label>
</form>
<div id="cmp-grid"></div>`
  : "<p>No live pages yet: build the repos, then run <code>bun run live</code>.</p>";

// The left nav under Components, as in Storybook: system > group > component.
const navTree = tree
  .map((s) => {
    const count = s.groups.reduce((n, g) => n + g.c.length, 0);
    const top = `<a href="#sys-${s.name}"><span>${esc(s.name)}</span><small>${count}</small></a>`;
    const leaf = (g: (typeof s.groups)[number]) =>
      g.c
        .map((c) => `<a class="leaf" href="#sys-${s.name}/${g.id}/${c.id}">${esc(c.n)}</a>`)
        .join("");
    const inner =
      s.groups.length === 1
        ? leaf(s.groups[0])
        : s.groups
            .map(
              (g) =>
                `<details><summary><a href="#sys-${s.name}/${g.id}"><span>${esc(g.g)}</span><small>${g.c.length}</small></a></summary>${leaf(g)}</details>`,
            )
            .join("");
    return `<details><summary>${top}</summary><div class="kids">${inner}</div></details>`;
  })
  .join("");

// Applications: every family of brand files in use, from applications/. A retired file is deleted;
// git history keeps it.
type Family = {
  id: string;
  title: string;
  note: string;
  dir?: string;
  match?: RegExp;
  link?: [string, string];
};
const FAMILIES: Family[] = [
  {
    id: "backgrounds",
    title: "Backgrounds for devices and calls",
    note: "The dark (night) family: the wizard over the wordmark on MacBook and lock screens, the lockup across the home screens, a small lockup above the head in calls. Set on the devices by hand.",
    dir: `applications/backgrounds`,
    match: /\.png$/,
  },
  {
    id: "booth",
    title: "Booth banners",
    note: "Pixlip frames, 1 x 1 m and 1 x 2 m: the light grey (#E6EAED) pair for dark stand walls, the dark pair for light walls, and the gradient pair: the brand gradient over the whole banner with the logo in its outline cut and only large white type, a PNG preview beside each of its PDFs.",
    dir: "applications/booth",
    match: /^booth-banner.*\.(pdf|png)$/,
  },
  {
    id: "channel-banners",
    title: "Channel banners",
    note: "The airy version in light teal with two profile slides, one file per platform.",
    dir: `applications/channel-banners`,
    match: /\.png$/,
  },
  {
    id: "avatars",
    title: "Avatars and workspace icons",
    note: "The favicon tile, one file per platform.",
    dir: `applications/avatars`,
    match: /\.(png|svg)$/,
  },
  {
    id: "gradients",
    title: "Gradients",
    note: "Linear, mesh and radial brand gradients; the Illustrator source sits beside them.",
    dir: `applications/gradients`,
    match: /\.png$/,
  },
  {
    id: "overlays",
    title: "Overlays",
    note: "Brand overlays for images.",
    dir: `applications/overlays`,
    match: /\.png$/,
  },
  {
    id: "visuals",
    title: "Visuals",
    note: "The party visual, with and without background.",
    dir: `applications/visuals`,
    match: /\.png$/,
  },
  {
    id: "merch",
    title: "Merch print files",
    note: "Shirt, hoodie, stickers, cleaning cloths, mug and notebook, each as SVG in millimetres with a PDF beside it; the embroidery source emoji-logo-7color.ai sits with them.",
    dir: "applications/merch",
    match: /\.svg$/,
  },
  {
    id: "mail-signature",
    title: "Mail signatures",
    note: "One signature for every mail, new mails and replies alike: the typed wordmark in colour, name, role, contact line and the three lines § 35a GmbHG requires. One HTML file per person to open in a browser and copy into the mail client, and a plain-text file for the iPhone. Links in teal #1A7285 (5.54:1 on white).",
    dir: "applications/mail-signature",
    match: /\.(html|txt)$/,
  },
  {
    id: "slides",
    title: "Slides",
    note: "There is no slide template file: decks are built in the talks slide engine.",
    link: ["#sys-talks", "the talks slide engine, live"],
  },
  {
    id: "documents",
    title: "Documents",
    note: "Proposals, rate cards, certificates and handouts come from the document components in this package (document/components), rendered by Company OS and the trainer hub.",
    link: ["#sys-os", "the document components in os, live"],
  },
];
const assetFiles = (dir: string, match: RegExp) => {
  const abs = join(ROOT, dir);
  return existsSync(abs)
    ? readdirSync(abs)
        .filter((f) => match.test(f))
        .sort()
    : [];
};
const assetCard = (dir: string, f: string, fam: Family) => {
  index.push({
    t: f,
    k: "application",
    h: `applications/a-${slug(`${fam.id}-${f}`)}`,
    x: `${fam.title} ${fam.note}`,
  });
  const href = `${dir}/${esc(f)}`;
  return `<figure class="asset" id="a-${slug(`${fam.id}-${f}`)}"><a href="${href}" target="_blank">${
    f.endsWith(".pdf")
      ? `<span class="pdf">PDF</span>`
      : /\.(html|txt)$/.test(f)
        ? `<iframe src="${href}" title="${esc(f)}" loading="lazy"></iframe>`
        : `<img src="${href}" alt="${esc(f)}" loading="lazy">`
  }</a><figcaption>${code(f)} <a href="${href}" download>download</a></figcaption></figure>`;
};
const applicationsHtml = `<p>Every family of brand files in use. The files sit in applications/ of this repo.</p>
${table(
  ["Family", "Files"],
  FAMILIES.map((f) => [
    `<a href="#applications/app-${f.id}">${esc(f.title)}</a>`,
    f.dir ? String(assetFiles(f.dir, f.match!).length) : "",
  ]),
)}
${FAMILIES.map((f) => {
  const files = f.dir ? assetFiles(f.dir, f.match!) : [];
  return `<h3 id="app-${f.id}">${esc(f.title)}</h3><p>${esc(f.note)}${f.link ? ` See <a href="${f.link[0]}">${esc(f.link[1])}</a>.` : ""}</p>${
    f.dir
      ? `<p class="meta">${esc(f.dir.replace("../", ""))}</p><div class="assets">${files.map((x) => assetCard(f.dir!, x, f)).join("")}</div>`
      : ""
  }`;
}).join("")}`;

// Health: drift, scan, duplicates.
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
      ? `${code(sys.commit)}${r.commit.startsWith(sys.commit) ? "" : ' <strong class="stale">older than the scanned commit</strong>'}`
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
<p><strong>${driftLine}.</strong> ${driftBad.length ? `Drifted: ${driftBad.map(([n]) => esc(n)).join(", ")}.` : "Every copy is byte-identical with this repo."} A repo without copies imports the package or nothing, so drift does not apply to it; the scan below covers every repo. Each repo at its last commit.</p>
${table(["Repo", "Status", "Commit", "Not identical"], driftRows)}
<h3 id="scan">Scan: off-token values per repo</h3>
<p>Hex literals off the token set, hex literals that repeat a token value, font stacks without a brand family, Tailwind default palette classes. ${Object.keys(allow.files).length} files and ${Object.keys(allow.duplicates).length} duplicates are allowlisted; the list may only shrink.</p>
${scan.aboveAllowlist.length ? `<p class="warn"><strong>Above the allowlist:</strong> ${scan.aboveAllowlist.map(code).join(", ")}</p>` : "<p>Every count is within the allowlist.</p>"}
${table(["Repo", "Commit", "Files", "Off-token hex", "Token value as hex", "Off-brand fonts", "Palette classes", "Most frequent off-token hex"], scanRows)}
<h3 id="duplicates">Components in more than one repo</h3>
${table(["Name", "Where", "Identical", "Allowlist reason"], dupRows)}`;

// Overview: what is here, how fresh, what needs attention.
const tile = (href: string, title: string, body: string) =>
  `<a class="tile" href="#${href}"><strong>${title}</strong><span>${body}</span></a>`;
const overview = `<p class="lead">Everything the hackers&amp;wizards brand is made of, from the tokens to every component of every system, and whether each repo still matches.</p>
<div class="tiles">
${tile("colours", "Colours", `${own.length} colours in four families, their roles and the chart order, click to copy`)}
${tile("type", "Type", "Type roles in JetBrains Mono and Inter")}
${tile("logos", "Logos", "Lockup, compact, wordmark, light, night and outline, SVG and PNG downloads")}
${tile("compare", "Compare", "Pick systems and a kind of component or token, see them live side by side")}
${systems.map((s) => tile(`sys-${s.name}`, esc(s.name), s.stories ? `${components(s).length} components live` : "not rendered")).join("")}
${tile("applications", "Applications", `${FAMILIES.length} families: backgrounds, booth, banners, avatars, gradients, mail signatures, slides, documents`)}
${tile("health", "Health", `${driftLine} · off-token hex: ${offHex} · ${scan.aboveAllowlist.length} file(s) above the allowlist`)}
</div>
<h3>Refresh</h3>
${table(
  ["Source", "Refresh"],
  [
    ["Tokens, logos", code("bun run tokens")],
    ["Live component pages", `${code("bun run live")}, after building each repo`],
    ["Drift, scan", code("bun run report")],
  ],
)}
<h3>Quick start</h3>
<ul>
<li>Logo for a slide or a document: <a href="logos/lockup.svg" download>lockup.svg</a>, on dark <a href="logos/lockup-night.svg" download>lockup-night.svg</a>, square <a href="logos/lockup-compact.svg" download>lockup-compact.svg</a>.</li>
<li>Slides: there is no slide template file. Decks are built in the talks slide engine (<code>styles/slides.css</code>); its title, content and closing slides are under <a href="#sys-talks">talks</a>.</li>
<li>Workshop kit for trainers: the lockup above, the night call background <a href="applications/backgrounds/call-background.png" download>call-background.png</a> (all backgrounds under <a href="#applications/app-backgrounds">Applications</a>), slides from the talks slide engine.</li>
<li>In code: <code>@import "@hackersandwizards/brand/tokens.css";</code>, the rest in <code>README.md</code>.</li>
</ul>`;

const pages: [string, string, string][] = [
  ["overview", "Overview", overview],
  ["colours", "Colours", colourGroups.join("") + rolesHtml],
  ["type", "Type", roles],
  ["tokens", "Spacing, radius, shadow, layout", tokensHtml],
  [
    "logos",
    "Logos",
    `<p>Three logos, each one line: the lockup is the standard, the wordmark alone goes on textiles and stickers, the compact lockup on small spots. The mail signature keeps the typed wordmark. On night, black and black textile take the night cut, with a grey edge round the wizard; on Purple Love, Stargazer and the gradient the outline cut, a white outline round the letters and a white edge round the wizard. Alignment rules: <code>README.md</code>, "Use it in another repo".</p>${logosHtml}`,
  ],
  ["compare", "Compare", compareHtml],
  ["applications", "Applications: the brand in use", applicationsHtml],
  ["health", "Health: drift and scan", health],
];
const nav = (id: string, title: string, extra = "") =>
  `<a href="#${id}"><span>${esc(title)}</span>${extra}</a>`;
const chevron = (stroke: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath fill='none' stroke='${stroke}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.6' d='M1 1.5 6 6.5 11 1.5'/%3E%3C/svg%3E")`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>hackers&amp;wizards brand</title>
<link rel="stylesheet" href="generated/tokens.root.css">
<link rel="stylesheet" href="tokens/print.css">
<style>
  /* Controls take the website's own roles: a field is white with the brand corner, a choice is a
     pill that fills teal-dark when checked, focus is the 3 px purple ring. */
  html { accent-color: var(--color-teal); caret-color: var(--color-purple); }
  :focus-visible { outline: 3px solid var(--color-purple); outline-offset: 2px; }
  body { margin: 0; display: grid; grid-template-columns: 17rem 1fr; min-height: 100vh; background: var(--color-bg); color: var(--color-ink); font: var(--type-body-weight) var(--text-small)/1.5 var(--type-body-family); }
  aside.side { position: sticky; top: 0; height: 100vh; overflow: auto; box-sizing: border-box; padding: 1.25rem 0.75rem 2rem; border-right: 1px solid var(--color-border); background: var(--color-white); border-top: 3px solid; border-image: var(--gradient-magic) 1; }
  aside.side > a img { width: 100%; margin-bottom: 0.25rem; padding: 0 0.25rem; box-sizing: border-box; }
  aside.side .version { margin: 0 0.5rem 0.75rem; }
  aside.side nav { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1px; margin-top: 0.5rem; }
  aside.side nav a { display: flex; justify-content: space-between; gap: 0.5rem; padding: 0.3rem 0.5rem; border-radius: 6px; color: var(--color-ink); text-decoration: none; }
  aside.side nav a span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  aside.side nav a:hover { background: var(--color-tint); }
  aside.side nav a.on { background: var(--color-teal-dark); color: var(--color-white); }
  aside.side nav a.trail { color: var(--color-teal-dark); font-weight: 600; }
  aside.side nav small { color: var(--color-muted); font: 0.7rem var(--font-code); align-self: center; }
  aside.side nav a.on small { color: inherit; opacity: 0.8; }
  aside.side .label { margin: 1.25rem 0.5rem 0.25rem; }
  aside.side details > summary { list-style: none; display: flex; align-items: center; cursor: pointer; }
  aside.side details > summary::-webkit-details-marker { display: none; }
  aside.side details > summary::before { content: ""; flex: none; width: 1rem; height: 1rem; margin-left: -0.15rem; background: ${chevron("%23545861")} center / 0.55rem no-repeat; transform: rotate(-90deg); transition: transform 0.15s; }
  aside.side details[open] > summary::before { transform: none; }
  aside.side details > summary > a { flex: 1; min-width: 0; padding-left: 0.2rem; }
  aside.side .kids { margin-left: 0.45rem; padding-left: 0.4rem; border-left: 1px solid var(--color-border); display: grid; grid-template-columns: minmax(0, 1fr); gap: 1px; }
  aside.side .kids details .leaf, aside.side .kids > .leaf { margin-left: 0.85rem; }
  aside.side .kids a { padding-block: 0.2rem; font-size: 0.8125rem; line-height: 1.35; }
  aside.side .kids a span { white-space: normal; }
  aside.side .leaf { color: var(--color-muted); }
  .label, th { font-family: var(--type-label-family); font-size: var(--type-label-size); letter-spacing: var(--type-label-tracking); text-transform: uppercase; color: var(--color-muted); font-weight: 500; }
  .input { box-sizing: border-box; min-height: 2.5rem; width: 100%; padding: 0 0.875rem; border: 1px solid var(--color-border); border-radius: var(--radius-brand); background: var(--color-white); color: var(--color-ink); font: inherit; }
  .input::placeholder { color: var(--color-muted); }
  .input:hover { border-color: var(--color-border-strong); }
  .input:focus-visible { border-color: var(--color-teal); }
  select.input { appearance: none; padding-right: 2.25rem; cursor: pointer; background: var(--color-white) ${chevron("%23155b6a")} right 0.875rem center / 0.7rem no-repeat; }
  input[type=search]::-webkit-search-cancel-button { cursor: pointer; }
  .controls { display: grid; grid-template-columns: minmax(12rem, 18rem) minmax(12rem, 1fr); gap: 1.25rem 1.5rem; align-items: end; padding: 1.25rem; background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); margin-bottom: 1.5rem; }
  .field { display: grid; gap: 0.375rem; }
  .field.wide { grid-column: 1 / -1; }
  .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .chip { position: relative; display: inline-flex; align-items: center; gap: 0.4rem; min-height: 2.5rem; box-sizing: border-box; padding: 0 0.875rem; border: 1px solid color-mix(in srgb, var(--color-teal-dark) 20%, transparent); border-radius: 999px; font-weight: 500; cursor: pointer; user-select: none; transition: background-color 0.15s; }
  .chip input { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; pointer-events: none; }
  .chip::before { content: ""; width: 0.875rem; height: 0.875rem; box-sizing: border-box; border: 1.5px solid var(--color-border-strong); border-radius: 4px; }
  .chip:hover { background: color-mix(in srgb, var(--color-teal) 10%, transparent); }
  .chip:has(:checked) { background: var(--color-teal-dark); border-color: var(--color-teal-dark); color: var(--color-white); }
  .chip:has(:checked)::before { border-color: var(--color-white); background: var(--color-white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='%23155b6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M2.5 6.2 5 8.7 9.5 3.5'/%3E%3C/svg%3E") center / 100% no-repeat; }
  .chip:has(:focus-visible) { outline: 3px solid var(--color-purple); outline-offset: 2px; }
  .chip small { font: 0.7rem var(--font-code); opacity: 0.75; }
  .chip small:empty { display: none; }
  .btn { display: inline-flex; align-items: center; gap: 0.4rem; min-height: 2.5rem; box-sizing: border-box; padding: 0 1.25rem; border: 1px solid var(--color-teal); border-radius: var(--radius-brand); font: 500 var(--text-small) var(--font-sans); text-decoration: none; cursor: pointer; transition: background-color 0.2s, border-color 0.2s; background: var(--color-white); color: var(--color-teal-dark); }
  .btn:hover { border-color: var(--color-purple); color: var(--color-purple); }
  .btn.primary { background: var(--color-teal); color: var(--color-white); }
  .btn.primary:hover { background: var(--color-purple); border-color: var(--color-purple); color: var(--color-white); }
  #q { margin: 0 0.25rem; width: calc(100% - 0.5rem); }
  main { padding: 1.5rem clamp(1rem, 3vw, 3rem) 4rem; min-width: 0; }
  section { display: none; max-width: var(--container-wide); }
  section.on { display: block; }
  h1, h2, h3 { font-family: var(--font-mono); letter-spacing: -0.02em; }
  h2 { font-size: var(--text-h2); margin: 0 0 1rem; }
  h3 { font-size: var(--text-h4); margin: 2rem 0 0.75rem; scroll-margin-top: 1rem; }
  .lead { font-size: var(--text-lead); max-width: 40em; }
  .meta { color: var(--color-muted); }
  .crumbs { margin: 0 0 0.25rem; }
  .crumbs a { color: inherit; text-decoration: none; }
  .crumbs a:hover { color: var(--color-teal-dark); text-decoration: underline; }
  code { font-family: var(--font-code); font-size: 0.9em; }
  a { color: var(--color-teal-dark); }
  table { border-collapse: collapse; width: 100%; background: var(--color-white); }
  th, td { text-align: left; vertical-align: top; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--color-border); }
  .grid { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); }
  .swatch { all: unset; cursor: copy; display: grid; gap: 0.15rem; background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); padding: 0.5rem; }
  .swatch:focus-visible { outline: 3px solid var(--color-purple); outline-offset: 2px; }
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
  .logo h3 { margin: 0.75rem 0 0.25rem; }
  .logo p { margin: 0.25rem 0; }
  .pair { display: grid; grid-auto-columns: 1fr; grid-auto-flow: column; gap: 0.5rem; }
  .pair img { width: 100%; height: 6rem; object-fit: contain; padding: 0.75rem; box-sizing: border-box; border-radius: 12px 3px; }
  .on-light { background: var(--color-bg); border: 1px solid var(--color-border); }
  .on-dark { background: var(--color-night); }
  .on-gradient { background: var(--gradient-magic); }
  .on-purple-love { background: #6c5a9e; } /* Purple Love, the Stanley/Stella textile C115, no brand token */
  .dl a { display: inline-block; margin: 0.25rem 0.4rem 0 0; padding: 0.15rem 0.5rem; border: 1px solid var(--color-border-strong); border-radius: 999px; color: var(--color-ink); text-decoration: none; font-family: var(--font-code); font-size: 0.75rem; }
  .dl a::before { content: "↓ "; }
  .dl a:hover { background: var(--color-tint); }
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
  .groups { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); align-items: start; }
  .group { background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-brand); padding: 1rem 1.1rem; }
  .group h3 { margin: 0 0 0.5rem; display: flex; justify-content: space-between; gap: 0.5rem; }
  .group h3 a { color: var(--color-ink); text-decoration: none; }
  .group h3 a:hover { color: var(--color-teal-dark); }
  .group h3 small { font: 0.75rem var(--font-code); color: var(--color-muted); }
  .group ul { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; }
  .group .all { display: inline-block; margin-top: 0.75rem; font-size: 0.8125rem; font-weight: 500; text-decoration: none; }
  .group .all:hover { text-decoration: underline; }
  .group li a { color: var(--color-muted); text-decoration: none; font-size: 0.8125rem; }
  .group li a:hover { color: var(--color-teal-dark); text-decoration: underline; }
  .lives { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(26rem, 1fr)); align-items: start; }
  .live { margin: 0 0 1rem; background: var(--color-white); border: 1px solid var(--color-border); border-radius: 12px 3px; padding: 0.5rem; min-width: 0; scroll-margin-top: 1rem; }
  .live figcaption { display: flex; gap: 0.5rem; align-items: baseline; flex-wrap: wrap; padding: 0 0.25rem 0.4rem; }
  .live figcaption a.name { color: var(--color-ink); text-decoration: none; font-weight: 600; }
  .live figcaption a.name:hover { color: var(--color-teal-dark); text-decoration: underline; }
  .open { margin-left: auto; font-size: 0.75rem; text-decoration: none; }
  .open:hover { text-decoration: underline; }
  .live iframe { display: block; width: 100%; height: 20rem; border: 0; border-top: 1px solid var(--color-border); }
  .live.big { padding: 0.75rem; }
  .live.big iframe { min-height: 24rem; }
  .states { margin: 0 0 0.5rem; display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .states button { font: 0.75rem var(--font-code); min-height: 1.75rem; padding: 0 0.6rem; border: 1px solid color-mix(in srgb, var(--color-teal-dark) 20%, transparent); border-radius: 999px; background: var(--color-white); color: var(--color-ink); cursor: pointer; }
  .states button:hover { background: color-mix(in srgb, var(--color-teal) 10%, transparent); }
  .states button.on { background: var(--color-teal-dark); color: var(--color-white); border-color: var(--color-teal-dark); }
  .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin: 1rem 0; }
  .pager { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border); }
  .pager a { text-decoration: none; }
  .pager a:hover { text-decoration: underline; }
  .cols { display: grid; gap: 1rem; align-items: start; }
  .night-cell { display: inline-block; padding: 0.15rem 0.4rem; background: var(--color-night); color: var(--color-night-ink); border-radius: 4px; }
  .night-cell code { color: inherit; }
  .chart { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; padding-left: 1.25rem; }
  .sw { display: inline-block; width: 1rem; height: 1rem; border-radius: 4px; border: 1px solid var(--color-border); vertical-align: -0.2rem; margin-right: 0.3rem; }
  .assets { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); }
  .asset { margin: 0; }
  .asset img, .asset .pdf { display: grid; place-items: center; width: 100%; height: 8rem; object-fit: contain; background: var(--color-tint); border: 1px solid var(--color-border); border-radius: 12px 3px; box-sizing: border-box; }
  .asset img[src$=".png"] { object-fit: scale-down; }
  .assets:has(iframe) { grid-template-columns: repeat(auto-fill, minmax(36rem, 1fr)); }
  .asset iframe { display: block; width: 100%; height: 11.5rem; background: #fff; border: 1px solid var(--color-border); border-radius: 12px 3px; box-sizing: border-box; }
  .asset figcaption { padding-top: 0.25rem; overflow-wrap: anywhere; font-size: 0.75rem; }
</style>
</head>
<body>
<aside class="side">
<a href="#overview"><img src="logos/lockup.svg" alt="hackers&amp;wizards"></a>
<p class="label version">Brand v${esc(pkg.version)}</p>
<input type="search" id="q" class="input" placeholder="Search  /" aria-label="Search tokens, logos and components" autocomplete="off">
<nav>
${nav("overview", "Overview")}
<p class="label">Foundations</p>
${nav("colours", "Colours")}${nav("type", "Type")}${nav("tokens", "Spacing and more")}${nav("logos", "Logos")}
<p class="label">Components</p>
${nav("compare", "Compare")}
${navTree}
<p class="label">Brand in use</p>
${nav("applications", "Applications")}${nav("health", "Health", `<small>${driftBad.length + scan.aboveAllowlist.length || "ok"}</small>`)}
</nav>
</aside>
<main>
<section id="results"><h2>Search</h2><div></div></section>
${pages.map(([id, title, body]) => `<section id="${id}" data-page><h2>${esc(title)}</h2>${body}</section>`).join("\n")}
<section id="sys" data-page></section>
</main>
<script>
const INDEX = ${JSON.stringify(index).replace(/</g, "\\u003c")};
const DATA = ${JSON.stringify(DATA).replace(/</g, "\\u003c")};
const q = document.getElementById("q"), results = document.getElementById("results"), sysView = document.getElementById("sys");
const h = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const kslug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const flat = (s) => DATA.systems[s].groups.flatMap((g) => g.c.map((c) => ({ ...c, g: g.g, gid: g.id })));
// One live frame: the system's own page for the component's first state, with a pill per state.
const frame = (sys, gid, c, big) => {
  const f = DATA.capture + c.s[0][1];
  const name = big ? "" : '<a class="name" href="#sys-' + h(sys) + "/" + gid + "/" + c.id + '">' + h(c.n) + "</a>" + (c.g ? ' <span class="label">' + h(c.g) + "</span>" : "");
  return '<figure class="live' + (big ? " big" : "") + '" id="c-' + h(sys) + "-" + c.id + '"><figcaption>' + name + (c.s.length > 1 ? '<span class="states">' + c.s.map((x, i) => '<button type="button" data-src="' + h(DATA.capture + x[1]) + '"' + (i ? "" : ' class="on"') + ">" + h(x[0]) + "</button>").join("") + "</span>" : "") + '<a class="open" href="' + h(f) + '" target="_blank">open alone ↗</a></figcaption><iframe' + (big ? "" : ' loading="lazy"') + ' src="' + h(f) + '" title="' + h(sys + " " + c.n) + '"></iframe></figure>';
};
const crumbs = (parts) => '<p class="label crumbs">' + parts.map(([href, t]) => (href ? '<a href="#' + href + '">' + h(t) + "</a>" : h(t))).join(" / ") + "</p>";
const frames = (sys, list) => '<div class="lives">' + list.map((c) => frame(sys, c.gid, { ...c, g: "" })).join("") + "</div>";
const renderSys = (name, gid, cid) => {
  const s = DATA.systems[name];
  const all = flat(name);
  const single = s.groups.length === 1;
  const g = s.groups.find((x) => x.id === gid);
  const c = g && g.c.find((x) => x.id === cid);
  if (c) {
    const i = all.findIndex((x) => x.gid === gid && x.id === cid), prev = all[i - 1], next = all[i + 1];
    const others = Object.keys(DATA.systems).filter((o) => o !== name && flat(o).some((x) => x.k === c.k));
    const link = (x, label) => x ? '<a href="#sys-' + h(name) + "/" + x.gid + "/" + x.id + '">' + label + "</a>" : "<span></span>";
    return crumbs([["sys-" + name, name]].concat(single ? [] : [["sys-" + name + "/" + gid, g.g]])) + "<h2>" + h(c.n) + '</h2><p class="meta">' + h(c.k) + " · " + c.s.length + (c.s.length > 1 ? " states" : " state") + "</p>" + frame(name, gid, { ...c, g: g.g }, true) + '<p class="actions">' + (single || g.c.length < 2 ? "" : '<a class="btn" href="#sys-' + h(name) + "/" + gid + '">All ' + g.c.length + " in " + h(g.g) + " live</a>") + (others.length ? '<a class="btn" href="#compare/' + [name].concat(others).join("+") + "/" + kslug(c.k) + '">Compare ' + h(c.k.toLowerCase()) + " across systems</a>" : "") + "</p>" + '<nav class="pager">' + link(prev, "← " + h(prev ? prev.n : "")) + link(next, h(next ? next.n : "") + " →") + "</nav>";
  }
  const head = (title, meta) => "<h2>" + h(title) + '</h2><p class="meta">' + meta + "</p>";
  if (g && !single) {
    const list = all.filter((x) => x.gid === gid);
    return crumbs([["sys-" + name, name]]) + head(g.g, list.length + " components") + frames(name, list);
  }
  const meta = all.length + " components" + (single ? "" : " in " + s.groups.length + " groups") + " · each frame is the system's own HTML and CSS";
  if (single) return crumbs([["", "Components"]]) + head(name, meta) + frames(name, all);
  return crumbs([["", "Components"]]) + head(name, meta) + '<div class="groups">' + s.groups.map((x) => '<article class="group"><h3><a href="#sys-' + h(name) + "/" + x.id + '">' + h(x.g) + "</a><small>" + x.c.length + "</small></h3><ul>" + x.c.map((y) => '<li><a href="#sys-' + h(name) + "/" + x.id + "/" + y.id + '">' + h(y.n) + "</a></li>").join("") + "</ul>" + (x.c.length > 1 ? '<a class="all" href="#sys-' + h(name) + "/" + x.id + '">All ' + x.c.length + " live →</a>" : "") + "</article>").join("") + "</div>";
};
let shownSys = "";
const show = () => {
  const path = decodeURIComponent(location.hash.slice(1));
  const [page, anchor, third] = path.split("/");
  const sys = page.startsWith("sys-") && DATA.systems[page.slice(4)] ? page.slice(4) : "";
  const target = sys ? "sys" : document.getElementById(page)?.matches("[data-page]") ? page : "overview";
  for (const s of document.querySelectorAll("section[data-page]")) s.classList.toggle("on", s.id === target && !q.value);
  // The nav marks the exact entry and the trail above it, and opens the trail.
  const key = sys ? path : target;
  // Only the current branch stays open, as in Carbon's and Atlassian's trees.
  for (const d of document.querySelectorAll("aside nav details")) d.open = false;
  for (const a of document.querySelectorAll("aside nav a")) {
    const href = a.getAttribute("href").slice(1);
    a.classList.toggle("on", href === key);
    a.classList.toggle("trail", !a.classList.contains("on") && sys !== "" && key.startsWith(href + "/"));
    if (a.classList.contains("on") || a.classList.contains("trail")) for (let d = a.closest("details"); d; d = d.parentElement.closest("details")) d.open = true;
  }
  if (sys) {
    const g = DATA.systems[sys].groups;
    const gid = g.length === 1 && anchor && !third ? g[0].id : anchor;
    const cid = g.length === 1 && anchor && !third ? anchor : third;
    const key2 = sys + "/" + gid + "/" + cid;
    if (shownSys !== key2) { sysView.innerHTML = renderSys(sys, gid, cid); shownSys = key2; }
    scrollTo(0, 0);
    return;
  }
  const el = page !== "compare" && anchor && document.getElementById(anchor);
  if (el) { el.scrollIntoView({ block: "start" }); el.style.outline = "3px solid var(--color-purple)"; el.style.outlineOffset = "3px"; setTimeout(() => (el.style.outline = ""), 2000); }
  else scrollTo(0, 0);
};
const search = () => {
  const words = q.value.toLowerCase().split(/\\s+/).filter(Boolean);
  results.classList.toggle("on", words.length > 0);
  const hits = INDEX.filter((e) => words.every((w) => (e.t + " " + e.k + " " + (e.x || "")).toLowerCase().includes(w))).slice(0, 60);
  results.querySelector("div").innerHTML = hits.map((e) => '<a href="#' + e.h + '"><span class="label">' + e.k + "</span>" + (e.k === "colour" ? '<i style="width:1rem;height:1rem;border-radius:4px;border:1px solid var(--color-border);background:' + e.x.split(" ")[0] + '"></i>' : "") + "<strong>" + h(e.t) + "</strong><span class=meta>" + h(e.x || "").slice(0, 80) + "</span></a>").join("") || "<p>Nothing found.</p>";
  show();
};
q.addEventListener("input", search);
results.addEventListener("click", () => { q.value = ""; results.classList.remove("on"); });
addEventListener("hashchange", show);
// Keys as in Storybook: / or Cmd+K searches, Alt+Up and Alt+Down step through a system's components.
addEventListener("keydown", (e) => {
  const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
  if ((e.key === "/" && !typing) || (e.key === "k" && (e.metaKey || e.ctrlKey))) { e.preventDefault(); q.focus(); return; }
  if (!e.altKey || typing || !/^Arrow(Up|Down)$/.test(e.key)) return;
  const [page] = location.hash.slice(1).split("/");
  if (!page.startsWith("sys-") || !DATA.systems[page.slice(4)]) return;
  const all = flat(page.slice(4)).map((c) => page + "/" + c.gid + "/" + c.id);
  const i = all.indexOf(decodeURIComponent(location.hash.slice(1)));
  const next = all[e.key === "ArrowDown" ? i + 1 : i < 0 ? 0 : i - 1];
  if (next) { e.preventDefault(); location.hash = next; }
});
// A live frame reports its content height; a state pill switches the frame's page.
addEventListener("message", (e) => {
  if (!e.data || !e.data.liveHeight) return;
  for (const f of document.querySelectorAll("iframe")) if (f.contentWindow === e.source) f.style.height = Math.min(e.data.liveHeight, 1400) + "px";
});
document.addEventListener("click", (e) => {
  const st = e.target.closest(".states button");
  if (st) {
    st.parentNode.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === st));
    const fig = st.closest("figure");
    fig.querySelector("iframe").src = st.dataset.src;
    fig.querySelector(".open").href = st.dataset.src;
    return;
  }
  const b = e.target.closest("[data-copy]");
  if (b) navigator.clipboard?.writeText(b.dataset.copy).then(() => { b.classList.add("copied"); setTimeout(() => b.classList.remove("copied"), 1200); });
});
// Compare: #compare/<system>+<system>/<kind>[/<name>], rendered from DATA.
const form = document.getElementById("cmp-form"), grid = document.getElementById("cmp-grid");
const compare = (sys, kind, q) => {
  if (!form) return;
  form.querySelectorAll("[name=sys]").forEach((c) => (c.checked = sys.includes(c.value)));
  form.kind.value = kind;
  form.q.value = q;
  const match = (c) => kslug(c.k) === kind && (c.n + " " + c.g).toLowerCase().includes(q.toLowerCase());
  form.querySelectorAll("[data-count]").forEach((el) => (el.textContent = kind === "colour-tokens" ? "" : flat(el.dataset.count).filter(match).length));
  if (sys.length < 2) { grid.innerHTML = "<p>Pick at least two systems.</p>"; return; }
  if (kind === "colour-tokens") {
    const own = Object.keys(DATA.brand).filter((n) => n.includes(q));
    const extra = [...new Set(sys.flatMap((s) => Object.keys(DATA.systems[s].colours)))].filter((n) => !DATA.brand[n] && n.includes(q)).sort();
    const cell = (v, ref) => v ? '<span class="sw" style="background:' + h(v) + '"></span>' + h(v) + (ref && v.toLowerCase() !== ref.toLowerCase() ? ' <strong class="stale">differs</strong>' : "") : '<span class="meta">not declared</span>';
    const rows = (names) => "<table><thead><tr><th>Token</th><th>brand</th>" + sys.map((s) => "<th>" + h(s) + "</th>").join("") + "</tr></thead><tbody>" + names.map((n) => "<tr><td><code>" + h(n) + "</code></td><td>" + cell(DATA.brand[n]) + "</td>" + sys.map((s) => "<td>" + cell(DATA.systems[s].colours[n], DATA.brand[n]) + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
    grid.innerHTML = "<p class=meta>The brand's colour tokens against each system's built CSS, first declaration wins; a value written as var() or in another notation shows as it stands.</p>" + rows(own) + (extra.length ? "<details><summary>" + extra.length + " colour tokens only a system declares</summary>" + rows(extra) + "</details>" : "");
    return;
  }
  grid.innerHTML = '<div class="cols" style="grid-template-columns:repeat(' + sys.length + ',minmax(18rem,1fr))">' + sys.map((s) => {
    const list = flat(s).filter(match);
    const kinds = Object.entries(flat(s).reduce((m, c) => ((m[c.k] = (m[c.k] || 0) + 1), m), {})).map(([k, n]) => h(k) + " " + n).join(", ");
    return "<div><h3>" + h(s) + ' <span class="label">' + list.length + "</span></h3>" + (list.map((c) => frame(s, c.gid, c)).join("") || "<p class=warn><strong>" + h(s) + "'s catalogue holds no component of this kind.</strong> What it holds: " + kinds + ".</p>") + "</div>";
  }).join("") + "</div>";
};
const fromHash = () => {
  const [page, sys, kind, q] = decodeURIComponent(location.hash.slice(1)).split("/");
  if (page === "compare") compare(sys ? sys.split("+").filter((s) => DATA.systems[s]) : ["website", "trainer-hub"], kind || "buttons-and-links", q || "");
};
form?.addEventListener("input", () => {
  const sys = [...form.querySelectorAll("[name=sys]:checked")].map((c) => c.value);
  history.replaceState(null, "", "#compare/" + sys.join("+") + "/" + form.kind.value + (form.q.value ? "/" + form.q.value : ""));
  compare(sys, form.kind.value, form.q.value);
});
form?.addEventListener("submit", (e) => e.preventDefault());
addEventListener("hashchange", fromHash);
fromHash();
show();
</script>
</body>
</html>
`;

writeFileSync(join(ROOT, "catalogue.html"), html);
console.log("wrote catalogue.html");

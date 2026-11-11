// The social preview of every public, unarchived repository of the GitHub organization: the
// 1280 x 640 card Slack, LinkedIn and X show for a shared link. Night ground with teal and purple
// corner glows and the gradient strip, the night lockup top left, a teal tile with the category's
// Lucide icon top right, then the category label, the repository name in JetBrains Mono and its
// current GitHub description in Inter. One PNG per repository, named for it without a leading dot
// (.github writes github.png, as the catalog build drops dot files), beside this
// file. GitHub offers no API for the social preview: upload each under Settings > Social preview,
// again whenever a description changes.
// bun applications/social-previews/generate.ts [repository ...]   (needs gh, signed in)
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { colors } from "../../generated/tokens";
import { brand, browser, fontFaces } from "../backgrounds/render";
import { escHtml } from "../linkedin-visuals/render";

const ORG = "hackersandwizards";
const [W, H] = [1280, 640];

// The category of each repository: its label and its Lucide icon. A public repository missing here
// stops the run, so a new one never goes without a card.
const CATEGORY = {
  design: ["Package · Design system", "palette"],
  tools: ["Package · Developer tools", "blocks"],
  agents: ["Agent toolkit", "wand-sparkles"],
  setup: ["Developer setup", "terminal"],
  example: ["Example", "code"],
  training: ["Training codebase", "graduation-cap"],
  exercises: ["Training exercises", "graduation-cap"],
  website: ["Website content", "users"],
  essay: ["Manifesto", "book-open"],
  org: ["Organization", "building-2"],
  community: ["Community", "message-circle"],
} as const;
const REPOSITORIES: Record<string, keyof typeof CATEGORY> = {
  brand: "design",
  slides: "design",
  documents: "design",
  mail: "design",
  scaffolding: "tools",
  admin: "tools",
  artificer: "agents",
  bench: "setup",
  "local-mlx-stack": "setup",
  "claude-rust-guard-example": "example",
  "agentic-engineering-for-developers": "training",
  "agentic-engineering-training-kotlin-vue": "training",
  "agentic-software-factory": "exercises",
  practitioners: "website",
  testimonials: "website",
  hycle: "essay",
  ".github": "org",
  discussions: "community",
};

const lucideIcon = (name: string) =>
  readFileSync(require.resolve(`lucide-static/icons/${name}.svg`), "utf8")
    .replace(/<!--.*?-->/s, "")
    .replace(/width="24"\s+height="24"/, 'width="96" height="96"');

function card(name: string, description: string, category: keyof typeof CATEGORY) {
  const [label, iconName] = CATEGORY[category];
  // A long name shrinks to stay on one line: JetBrains Mono advances 0.6 em per character.
  const nameSize = Math.min(88, Math.floor(1100 / (0.6 * name.length)));
  return `<!doctype html><meta charset="utf-8"><style>${fontFaces}
*{margin:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;color:${colors["--color-white"]};font-family:Inter;
  background:radial-gradient(ellipse 34% 75% at 0 0,#07292e,transparent),radial-gradient(ellipse 40% 75% at 100% 100%,#230936,transparent),${colors["--color-night"]};
  padding:64px 80px;display:flex;flex-direction:column}
.strip{position:absolute;inset:0 0 auto;height:8px;background:linear-gradient(to right,${colors["--color-teal"]},${colors["--color-purple"]})}
header{display:flex;justify-content:space-between;align-items:flex-start}
header img{height:96px;margin-top:8px}
.tile{width:176px;height:176px;background:${colors["--color-teal"]};color:${colors["--color-white"]};display:grid;place-items:center}
main{margin-top:auto}
.label{font:500 30px/1 "JetBrains Mono";letter-spacing:.12em;text-transform:uppercase;color:${colors["--color-teal-night"]}}
h1{font:700 ${nameSize}px/1.1 "JetBrains Mono";margin:20px 0 22px;white-space:nowrap}
p{font:400 32px/1.4 Inter;color:${colors["--color-night-muted"]};max-width:1100px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
</style><div class="strip"></div>
<header><img src="${brand.lockupNight}" alt=""><div class="tile">${lucideIcon(iconName)}</div></header>
<main><div class="label">${escHtml(label)}</div><h1>${escHtml(name)}</h1><p>${escHtml(description)}</p></main>`;
}

if (import.meta.main) {
  const repos = JSON.parse(
    execFileSync(
      "gh",
      [
        "repo",
        "list",
        ORG,
        "--visibility",
        "public",
        "--no-archived",
        "--source",
        "--limit",
        "200",
        "--json",
        "name,description",
      ],
      { encoding: "utf8" },
    ),
  ) as { name: string; description: string | null }[];
  const missing = repos.filter((r) => !(r.name in REPOSITORIES)).map((r) => r.name);
  if (missing.length)
    throw new Error(`No category for ${missing.join(", ")}: add it to REPOSITORIES`);
  const file = (name: string) => `${name.replace(/^\./, "")}.png`;
  const files = new Set(repos.map((r) => file(r.name)));
  const stale = readdirSync(import.meta.dir).filter((f) => f.endsWith(".png") && !files.has(f));
  const gone = Object.keys(REPOSITORIES).filter((n) => !repos.some((r) => r.name === n));
  if (stale.length || gone.length)
    throw new Error(`No public repository for ${[...stale, ...gone].join(", ")}: delete them`);
  const only = process.argv.slice(2);
  const unknown = only.filter((n) => !(n in REPOSITORIES));
  if (unknown.length) throw new Error(`Not a listed repository: ${unknown.join(", ")}`);
  const chrome = await browser();
  try {
    for (const { name, description } of repos.filter(
      (r) => !only.length || only.includes(r.name),
    )) {
      if (!description) throw new Error(`${name} has no GitHub description`);
      const png = await chrome.shot(card(name, description, REPOSITORIES[name]), W, H);
      const kb = png.length / 1024;
      if (kb >= 1024) throw new Error(`${name} is ${kb.toFixed(0)} KB, GitHub takes under 1 MB`);
      await Bun.write(join(import.meta.dir, file(name)), png);
      console.log(`${file(name)} ${kb.toFixed(0)} KB`);
    }
  } finally {
    await chrome.close();
  }
}

import { spawnSync } from "node:child_process";
import { basename } from "node:path";
import { ROOT } from "../../scripts/git";
import { code, esc } from "./markup";

export type ApplicationAsset = { dir: string; stem: string; files: string[] };

// Not shown: the scripts that build a family and their inputs.
const SKIP = /\.(ts|py|css)$|^qr-/;
const PREVIEW = ["png", "svg", "html", "txt"];
// Tracked files only, so a scratch render or a .DS_Store in the folder never reaches the page.
export const assetStems = (dir: string) => {
  const ls = spawnSync("git", ["ls-files", "-z", "--", dir], { cwd: ROOT, encoding: "utf8" });
  if (ls.status !== 0) throw new Error(`portal: git ls-files ${dir}: ${ls.stderr}`);
  return groupApplicationFiles(dir, ls.stdout.split("\0").filter(Boolean));
};

// Groups a directory's listed files into sorted variants for each displayable stem.
export function groupApplicationFiles(dir: string, paths: readonly string[]) {
  const stems = new Map<string, ApplicationAsset>();
  for (const f of paths.map((p) => basename(p)).sort()) {
    if (SKIP.test(f)) continue;
    const stem = f.replace(/\.\w+$/, "");
    const asset = stems.get(stem);
    if (asset) asset.files.push(f);
    else stems.set(stem, { dir, stem, files: [f] });
  }
  return stems;
}

// Renders one tracked application asset with its preferred preview and every downloadable variant.
export const assetCard = ({ dir, stem, files }: ApplicationAsset, id: string) => {
  const ext = (f: string) => f.split(".").pop()!;
  const shown = PREVIEW.map((e) => files.find((f) => ext(f) === e)).find(Boolean);
  const href = (f: string) => `${dir}/${esc(f)}`;
  const view = !shown
    ? `<span class="pdf">${esc(ext(files[0]).toUpperCase())}</span>`
    : /^(html|txt)$/.test(ext(shown))
      ? `<iframe src="${href(shown)}" title="${esc(stem)}" loading="lazy"></iframe>`
      : `<img src="${href(shown)}" alt="${esc(stem)}" loading="lazy">`;
  return `<figure class="asset" id="${id}"><div class="views" data-theme="light"><a href="${href(shown ?? files[0])}" target="_blank">${view}</a></div><figcaption>${code(stem)}<span class="dl">${files.map((f) => `<a href="${href(f)}" download>${esc(ext(f))}</a>`).join("")}</span></figcaption></figure>`;
};

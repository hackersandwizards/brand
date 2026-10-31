// What frame.ts and terminal.ts share: the brand CSS with its faces inlined, HTML escaping, and one
// headless Chrome screenshot. Both run from this repo and, as the package's bins, from a consumer's
// install, so every brand file is read relative to this folder.
import { execFile, execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const BRAND = resolve(import.meta.dir, "../..");
export const brandPath = (file: string) => join(BRAND, file);

function inlineCss(path: string): string {
  return readFileSync(path, "utf-8")
    .replace(/@theme\s*\{/g, ":root {")
    .replace(
      /url\("(fonts\/[^"]+)"\)/g,
      (_, file: string) =>
        `url(data:font/woff2;base64,${readFileSync(join(BRAND, "tokens", file)).toString("base64")})`,
    );
}

// The faces and the print sizes of the type roles, then the screen tokens, which restore the
// screen sizes.
export const linkedinCss = () =>
  ["tokens/print.css", "tokens/tokens.css"].map((f) => inlineCss(brandPath(f))).join("\n");

export const escHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function findChrome(): string {
  if (process.env.CHROME_BINARY) return process.env.CHROME_BINARY;
  const installed = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ].find((path) => existsSync(path));
  if (installed) return installed;
  for (const bin of ["chromium", "google-chrome"]) {
    try {
      const found = execFileSync("which", [bin], { encoding: "utf-8" }).trim();
      if (found) return found;
    } catch {
      // not on PATH: try the next name
    }
  }
  throw new Error("Chrome or Chromium is required. Install one, or set CHROME_BINARY.");
}

/** Screenshots `html` (a file in `dir`) at width x height CSS px, captured at `scale`. */
export async function screenshot(
  dir: string,
  html: string,
  [width, height, scale]: number[],
  out: string,
): Promise<void> {
  await promisify(execFile)(
    findChrome(),
    [
      "--headless=new",
      // Its own profile, so it never attaches to a Chrome the user has open.
      `--user-data-dir=${join(dir, "profile")}`,
      "--hide-scrollbars",
      `--force-device-scale-factor=${scale}`,
      `--window-size=${width},${height}`,
      // Holds the screenshot until the faces and the images have loaded.
      "--virtual-time-budget=10000",
      `--screenshot=${resolve(out)}`,
      pathToFileURL(join(dir, html)).href,
    ],
    { timeout: 60_000 },
  );
  if (!existsSync(out)) throw new Error(`Chrome produced no image at ${out}`);
}

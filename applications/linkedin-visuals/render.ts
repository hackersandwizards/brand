// What frame.ts and terminal.ts share: the brand CSS with its faces inlined, HTML escaping, and one
// headless Chrome screenshot. Both run from this repo and, as the package's bins, from a consumer's
// install, so every brand file is read relative to this folder.
import { execFile, execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
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

/**
 * Chrome for Testing, the build puppeteer and playwright install, never the user's own Chrome: a
 * headless instance from `/Applications/Google Chrome.app` made macOS activate it instead of opening
 * the user's window (shown 2026-10-31). The newest build in puppeteer's cache, else installed there.
 */
export function findChrome(): string {
  if (process.env.CHROME_BINARY) return process.env.CHROME_BINARY;
  const cache = process.env.PUPPETEER_CACHE_DIR ?? join(homedir(), ".cache", "puppeteer");
  const builds = join(cache, "chrome");
  const exe =
    process.platform === "darwin"
      ? "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
      : "chrome";
  const found = (existsSync(builds) ? readdirSync(builds) : [])
    .sort((x, y) => y.localeCompare(x, "en", { numeric: true }))
    .flatMap((build) =>
      readdirSync(join(builds, build))
        .filter((dir) => dir.startsWith("chrome-"))
        .map((dir) => join(builds, build, dir, exe)),
    )
    .find((path) => existsSync(path));
  if (found) return found;
  const args = ["@puppeteer/browsers", "install", "chrome@stable", "--path", cache];
  return execFileSync("bunx", [...args, "--format", "{{path}}"], { encoding: "utf-8" }).trim();
}

/** Chrome otherwise asks the macOS keychain for "Chromium Safe Storage", a dialog per launch. */
export const NO_KEYCHAIN = ["--use-mock-keychain", "--password-store=basic"];

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
      ...NO_KEYCHAIN,
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

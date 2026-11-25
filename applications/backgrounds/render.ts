// One headless Chrome over CDP for the background, booth and merch generators, plus the brand
// files of this repo. The 4096 px emoji master is in Git LFS: fetch it with
// `git -c lfs.fetchexclude= lfs pull` before a run.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { version } from "../../package.json";
import { findChrome, NO_KEYCHAIN, type Viewport } from "../linkedin-visuals/render";
import { lfsOid } from "../../scan/assets";
import { connectCdp } from "./cdp";

const BRAND = resolve(import.meta.dir, "../..");

function lfs(file: string): string {
  const path = join(BRAND, "logos", file);
  if (lfsOid(readFileSync(path)))
    throw new Error(`${file} is a Git LFS pointer: run git -c lfs.fetchexclude= lfs pull`);
  return path;
}

export const fileUrl = (path: string) => pathToFileURL(path).href;
let emoji: string | undefined;
export const brand = {
  version,
  // Read on use, so a generator that draws no emoji runs where the master is still a pointer.
  get emoji() {
    return (emoji ??= fileUrl(lfs("emoji-logo-short.png")));
  },
  lockup: fileUrl(join(BRAND, "logos/lockup.svg")),
  lockupNight: fileUrl(join(BRAND, "logos/lockup-night.svg")),
  lockupOutline: fileUrl(join(BRAND, "logos/lockup-outline.svg")),
  compact: fileUrl(join(BRAND, "logos/lockup-compact.svg")),
  compactNight: fileUrl(join(BRAND, "logos/lockup-compact-night.svg")),
  wordmark: fileUrl(join(BRAND, "logos/wordmark.svg")),
  wordmarkNight: fileUrl(join(BRAND, "logos/wordmark-night.svg")),
  wordmarkOutline: fileUrl(join(BRAND, "logos/wordmark-outline.svg")),
  fonts: fileUrl(join(BRAND, "tokens/fonts")),
};

export const fontFaces = `
@font-face{font-family:"JetBrains Mono";src:url(${brand.fonts}/jetbrains-mono-latin-700-normal.woff2);font-weight:700}
@font-face{font-family:"JetBrains Mono";src:url(${brand.fonts}/jetbrains-mono-latin-500-normal.woff2);font-weight:500}
@font-face{font-family:Inter;src:url(${brand.fonts}/inter-latin-400-normal.woff2);font-weight:400}
@font-face{font-family:Inter;src:url(${brand.fonts}/inter-latin-600-normal.woff2);font-weight:600}
@font-face{font-family:Inter;src:url(${brand.fonts}/inter-latin-700-normal.woff2);font-weight:700}`;

type DevTools = Pick<Awaited<ReturnType<typeof connectCdp>>, "lastRequestId" | "once" | "send">;

// In port-zero mode Chrome tells its client the DevTools address through the profile directory.
export async function chromeSocket(profile: string) {
  const portFile = join(profile, "DevToolsActivePort");
  for (let i = 0; !existsSync(portFile) || !readFileSync(portFile, "utf8").includes("\n"); i++) {
    if (i > 200) throw new Error("Chrome did not start");
    await Bun.sleep(50);
  }
  const [port, path] = readFileSync(portFile, "utf8").trim().split("\n");
  return `ws://127.0.0.1:${port}${path}`;
}

// Boot a dedicated Chrome process and own its temporary profile.
export async function openChrome() {
  const profile = mkdtempSync(join(tmpdir(), "hw-render-"));
  const proc = spawn(findChrome(), [
    "--headless=new",
    ...NO_KEYCHAIN,
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "--allow-file-access-from-files",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
  ]);
  const stop = () => {
    proc.kill();
    rmSync(profile, { recursive: true, force: true });
  };
  try {
    return { cdp: await connectCdp(await chromeSocket(profile)), stop };
  } catch (error) {
    stop();
    throw error;
  }
}

// A page session owns its HTML inputs and captures PNG or PDF from the loaded document.
export class RenderPage {
  #scratch = mkdtempSync(join(tmpdir(), "hw-html-"));
  private readonly cdp: DevTools;
  private readonly sessionId: string;

  constructor(cdp: DevTools, sessionId: string) {
    this.cdp = cdp;
    this.sessionId = sessionId;
  }

  // Wait for both the page navigation and the caller's readiness expression.
  private async load(html: string, ready = "document.fonts.ready") {
    // Chrome uses the filename as the title of a PDF whose document has no <title>.
    const file = join(this.#scratch, `${this.cdp.lastRequestId}.html`);
    const remote = /^https?:/.test(html);
    if (!remote) writeFileSync(file, html);
    const loaded = this.cdp.once("Page.loadEventFired", this.sessionId);
    const url = remote ? html : fileUrl(file);
    await this.cdp.send("Page.navigate", { url }, this.sessionId);
    await loaded;
    await this.cdp.send(
      "Runtime.evaluate",
      { expression: ready, awaitPromise: true },
      this.sessionId,
    );
  }

  // Render an HTML string at width x height CSS px and the given scale; returns PNG bytes.
  // html may be an http(s) URL to capture instead. ready: an expression whose promise the capture
  // waits for.
  async shot(html: string, { width, height, scale = 1 }: Viewport, ready = "document.fonts.ready") {
    await this.cdp.send(
      "Emulation.setDeviceMetricsOverride",
      { width, height, deviceScaleFactor: scale, mobile: false },
      this.sessionId,
    );
    await this.load(html, ready);
    const { data } = (await this.cdp.send(
      "Page.captureScreenshot",
      { format: "png", clip: { x: 0, y: 0, width, height, scale: 1 } },
      this.sessionId,
    )) as { data: string };
    return Buffer.from(data, "base64");
  }

  // Print the document at its physical paper dimensions, preserving the background.
  async pdf(html: string, widthMm: number, heightMm: number) {
    await this.load(html);
    const { data } = (await this.cdp.send(
      "Page.printToPDF",
      {
        paperWidth: widthMm / 25.4,
        paperHeight: heightMm / 25.4,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        printBackground: true,
        preferCSSPageSize: true,
      },
      this.sessionId,
    )) as { data: string };
    return Buffer.from(data, "base64");
  }

  clearDocuments() {
    rmSync(this.#scratch, { recursive: true, force: true });
  }
}

// Open one page session for a batch of screenshots and print renders.
export async function browser() {
  const { cdp, stop } = await openChrome();
  try {
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = (await cdp.send("Target.attachToTarget", {
      targetId,
      flatten: true,
    })) as {
      sessionId: string;
    };
    await cdp.send("Page.enable", {}, sessionId);
    const page = new RenderPage(cdp, sessionId);
    return {
      shot: page.shot.bind(page),
      pdf: page.pdf.bind(page),
      async close() {
        await cdp.send("Browser.close").catch(() => {});
        cdp.close();
        stop();
        page.clearDocuments();
      },
    };
  } catch (error) {
    cdp.close();
    stop();
    throw error;
  }
}

// A brand colour mixed with white, the way the brand tokens build their -light tones.
export const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, white)`;
export const toJpeg = (png: Buffer) => sharp(png).jpeg({ quality: 88 }).toBuffer();

// One headless Chrome over CDP for the background, booth and merch generators, plus the brand
// files of this repo. The 4096 px emoji master is in Git LFS: fetch it with
// `git -c lfs.fetchexclude= lfs pull` before a run.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import sharp from "sharp";

const BRAND = resolve(import.meta.dir, "../..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function lfs(file: string): string {
  const path = join(BRAND, "logos", file);
  if (readFileSync(path).subarray(0, 8).toString() === "version ")
    throw new Error(`${file} is a Git LFS pointer: run git -c lfs.fetchexclude= lfs pull`);
  return path;
}

const fileUrl = (path: string) => `file://${path}`;
export const brand = {
  version: JSON.parse(readFileSync(join(BRAND, "package.json"), "utf8")).version as string,
  emoji: fileUrl(lfs("emoji-logo-short.png")),
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

type Pending = {
  resolve: (v: Record<string, unknown>) => void;
  reject: (e: Error) => void;
};

export async function browser() {
  const profile = mkdtempSync(join(tmpdir(), "hw-render-"));
  const proc = spawn(CHROME, [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "--allow-file-access-from-files",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
  ]);
  const portFile = join(profile, "DevToolsActivePort");
  for (let i = 0; !existsSync(portFile) || !readFileSync(portFile, "utf8").includes("\n"); i++) {
    if (i > 200) throw new Error("Chrome did not start");
    await Bun.sleep(50);
  }
  const [port, path] = readFileSync(portFile, "utf8").trim().split("\n");
  const ws = new WebSocket(`ws://127.0.0.1:${port}${path}`);
  await new Promise((ok) => ws.addEventListener("open", ok, { once: true }));
  let id = 0;
  const pending = new Map<number, Pending>();
  const events: ((m: { method: string; sessionId?: string }) => void)[] = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(String(e.data));
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id)!;
      pending.delete(m.id);
      if (m.error) p.reject(new Error(m.error.message));
      else p.resolve(m.result);
    } else for (const f of events) f(m);
  });
  const send = (method: string, params: object = {}, sessionId?: string) =>
    new Promise<Record<string, unknown>>((ok, ko) => {
      pending.set(++id, { resolve: ok, reject: ko });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const { targetId } = await send("Target.createTarget", {
    url: "about:blank",
  });
  const { sessionId } = (await send("Target.attachToTarget", {
    targetId,
    flatten: true,
  })) as {
    sessionId: string;
  };
  await send("Page.enable", {}, sessionId);
  const scratch = mkdtempSync(join(tmpdir(), "hw-html-"));

  // Render an HTML string at width x height CSS px and the given scale; returns PNG bytes.
  // html may be an http(s) URL to capture instead. ready: an expression whose promise the capture
  // waits for.
  async function shot(
    html: string,
    width: number,
    height: number,
    scale = 1,
    ready = "document.fonts.ready",
  ) {
    const file = join(scratch, `${id}.html`);
    writeFileSync(file, html);
    await send(
      "Emulation.setDeviceMetricsOverride",
      { width, height, deviceScaleFactor: scale, mobile: false },
      sessionId,
    );
    const loaded = new Promise<void>((ok) => {
      const f = (m: { method: string; sessionId?: string }) => {
        if (m.method === "Page.loadEventFired" && m.sessionId === sessionId) {
          events.splice(events.indexOf(f), 1);
          ok();
        }
      };
      events.push(f);
    });
    await send("Page.navigate", { url: /^https?:/.test(html) ? html : fileUrl(file) }, sessionId);
    await loaded;
    await send("Runtime.evaluate", { expression: ready, awaitPromise: true }, sessionId);
    const { data } = (await send(
      "Page.captureScreenshot",
      { format: "png", clip: { x: 0, y: 0, width, height, scale: 1 } },
      sessionId,
    )) as { data: string };
    return Buffer.from(data, "base64");
  }

  async function pdf(html: string, widthMm: number, heightMm: number) {
    const file = join(scratch, `${id}.html`);
    writeFileSync(file, html);
    const loaded = new Promise<void>((ok) => {
      const f = (m: { method: string; sessionId?: string }) => {
        if (m.method === "Page.loadEventFired" && m.sessionId === sessionId) {
          events.splice(events.indexOf(f), 1);
          ok();
        }
      };
      events.push(f);
    });
    await send("Page.navigate", { url: fileUrl(file) }, sessionId);
    await loaded;
    await send(
      "Runtime.evaluate",
      { expression: "document.fonts.ready", awaitPromise: true },
      sessionId,
    );
    const { data } = (await send(
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
      sessionId,
    )) as { data: string };
    return Buffer.from(data, "base64");
  }

  async function close() {
    await send("Browser.close").catch(() => {});
    ws.close();
    proc.kill();
    rmSync(profile, { recursive: true, force: true });
    rmSync(scratch, { recursive: true, force: true });
  }
  return { shot, pdf, close };
}

// A brand colour mixed with white, the way the brand tokens build their -light tones.
export const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, white)`;
export const toJpeg = (png: Buffer) => sharp(png).jpeg({ quality: 88 }).toBuffer();

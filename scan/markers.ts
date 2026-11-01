#!/usr/bin/env bun
// The marker check a consumer runs in its own gate, on pages it serves or builds: every list marker
// measured on the pixels headless Chrome paints. A marker's middle has to sit on the middle of the
// x-height of the first line beside it (the caps' middle beside capitals), and a list item's first
// line has to start where its wrapped lines start. Markers drifted 0.5 to 3.4px off for months on
// several surfaces while every check passed, since only a render shows where they land.
//
// Each page runs twice, as served and with a newline and an indent opening every list item, as
// prettier-plugin-astro and hand-written HTML leave it, where an inline-block marker kept the
// newline as a space. The words starting each marked line become "xxxx", so their ink is the
// x-height band itself. Markers found: a square ::before (side up to 16px) on a list item or its
// opening paragraph, an empty square element (up to 16px) followed by text in its row that is the
// brand's .hw-marker or an item's first element, a bullet glyph as a ul item's ::before content, and
// the browser's own marker in a ul. Not measured: a
// heading's or link's swatch outside a list, and ol numerals, whose digits stand on the baseline.
//
// Usage: brand-markers [--scale 2,4] [--width 1280] [--json] <url or html file>...
// Exits 1 on a marker off by more than 0.25px, a first line off by more than 0.25px, or a page
// with no marker (a zero proves nothing). Needs Chrome for Testing (CHROME_BINARY overrides).
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer, { type Browser } from "puppeteer-core";
import { findChrome, NO_KEYCHAIN } from "../applications/linkedin-visuals/render";

export const TOLERANCE = 0.25; // CSS px
const MAX_SIDE = 16; // CSS px; a larger square is an icon or a swatch, not a marker

type Box = { x: number; y: number; width: number; height: number };
type Probe = { label: string; kind: Kind; marker: Box; text: Box; indent: number | null };
export type Kind = "before" | "element" | "native" | "glyph";
export type Reading = {
  page: string;
  label: string;
  kind: Kind;
  scale: number;
  newline: boolean;
  offset: number;
  indent: number | null;
};

/** Runs in the page: rewrites the line beside each marker and returns the boxes to read. */
function collect([newline, maxSide]: [boolean, number]): Probe[] {
  // A closed panel's lists are markers too, painted once it opens.
  for (const d of document.querySelectorAll("details")) d.open = true;
  if (newline)
    for (const li of document.querySelectorAll("li"))
      li.insertBefore(document.createTextNode("\n      "), li.firstChild);
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect();
    // Hidden by opacity too: a progressive reveal's items wait at opacity 0.
    return (
      r.width > 0 &&
      r.height > 0 &&
      el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
    );
  };
  const firstText = (el: Node) => {
    // A marker's neighbour may be bare text, which a walker rooted at it never returns.
    if (el instanceof Text) return el.textContent!.trim() && visible(el.parentElement!) ? el : null;
    const list = el instanceof Element ? el.closest("ul, ol") : null;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) =>
        (!list || n.parentElement!.closest("ul, ol") === list) &&
        n.textContent!.trim() &&
        visible(n.parentElement!)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP,
    });
    return walker.nextNode() as Text | null;
  };
  const label = (el: Element) =>
    `${el.tagName.toLowerCase()}${el.classList[0] ? "." + el.classList[0] : ""} "${el.textContent!.trim().slice(0, 30)}"`;
  const contentLeft = (el: Element) => {
    const s = getComputedStyle(el);
    return (
      el.getBoundingClientRect().left + parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft)
    );
  };
  const found: { host: Element; text: Text; kind: Kind; mark?: Element }[] = [];
  const seen = new Set<Text>();
  const add = (host: Element, text: Text | null, kind: Kind, mark?: Element) => {
    if (!text || seen.has(text)) return;
    seen.add(text);
    found.push({ host, text, kind, mark });
  };
  for (const host of document.querySelectorAll("body *")) {
    if (!visible(host)) continue;
    const before = getComputedStyle(host, "::before");
    const side = parseFloat(before.width);
    const item =
      host.tagName === "LI" || (host.tagName === "P" && host.parentElement?.tagName === "LI");
    if (
      item &&
      before.content === '""' &&
      before.display !== "none" &&
      before.width === before.height &&
      side > 0 &&
      side <= maxSide
    )
      add(host, firstText(host), "before");
    else if (
      host.tagName === "LI" &&
      host.parentElement?.tagName === "UL" &&
      getComputedStyle(host).display === "list-item" &&
      getComputedStyle(host).listStyleType !== "none"
    )
      add(host, firstText(host), "native");
    else if (
      host.tagName === "LI" &&
      host.parentElement?.tagName === "UL" &&
      before.display !== "none" &&
      /^"[•·▪■◦‣–—-]"$/.test(before.content)
    )
      // A bullet glyph drawn as content, rather than the brand's square.
      add(host, firstText(host), "glyph");
    const r = host.getBoundingClientRect();
    if (
      !host.childNodes.length &&
      (host.classList.contains("hw-marker") ||
        (host.parentElement?.tagName === "LI" && host.parentElement.firstElementChild === host)) &&
      Math.abs(r.width - r.height) < 0.01 &&
      r.width <= maxSide &&
      getComputedStyle(host).backgroundColor !== "rgba(0, 0, 0, 0)"
    ) {
      let next = host.nextSibling;
      while (next && !next.textContent!.trim()) next = next.nextSibling;
      if (next) add(host.parentElement!, firstText(next), "element", host);
    }
  }
  for (const f of found) {
    f.text.data = "xxxx " + f.text.data.trimStart();
    // An underline or a shadow (a link item) would add ink below the x-height band. A decoration
    // reaches every descendant, so it goes on each element from the text up to the item.
    for (let el = f.text.parentElement; el && el !== f.host.parentElement; el = el.parentElement) {
      (el as HTMLElement).style.textDecorationLine = "none";
      (el as HTMLElement).style.textShadow = "none";
    }
  }
  const rectOf = (node: Text) => {
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, 4);
    return range.getClientRects()[0]!;
  };
  const box = (left: number, right: number, top: number, bottom: number): Box => ({
    x: left + scrollX,
    y: top + scrollY,
    width: right - left,
    height: bottom - top,
  });
  return found.map(({ host, text, kind, mark }) => {
    const t = rectOf(text);
    const em = parseFloat(getComputedStyle(text.parentElement!).fontSize);
    let left: number;
    let right = t.left - 0.5;
    if (mark) {
      const m = mark.getBoundingClientRect();
      [left, right] = [m.left - 1, m.right + 1];
    } else if (kind === "native" || kind === "glyph")
      left = Math.max(t.left - 2 * em, host.getBoundingClientRect().left - 1.5 * em);
    // A loose item's paragraph starts where its text starts: the marker sits in the item's padding.
    else
      left = Math.max(
        t.left - 2 * em,
        (host.closest("li") ?? host).getBoundingClientRect().left - 1,
      );
    const li = kind !== "element" && host.closest("li");
    return {
      label: label(host),
      kind,
      marker: box(left, right, t.top - 3, t.bottom + 3),
      text: box(t.left, t.right, t.top, t.bottom),
      indent: li && host === li && kind === "before" ? t.left - contentLeft(host) : null,
    };
  });
}

/** Runs in the page: the y in CSS px, from the top of the shot, of its ink's middle, each pixel
 * weighted by its distance from the shot's most common colour. */
async function inkMiddle(png: string, scale: number): Promise<number> {
  const img = new Image();
  img.src = `data:image/png;base64,${png}`;
  await img.decode();
  const ctx = new OffscreenCanvas(img.width, img.height).getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);
  const counts = new Map<number, number>();
  for (let i = 0; i < data.length; i += 4) {
    const key = (data[i]! << 16) | (data[i + 1]! << 8) | data[i + 2]!;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const bg = [...counts].sort((a, b) => b[1] - a[1])[0]![0];
  let total = 0;
  let sum = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const ink = Math.hypot(
        data[i]! - (bg >> 16),
        data[i + 1]! - ((bg >> 8) & 255),
        data[i + 2]! - (bg & 255),
      );
      total += ink;
      sum += ink * (y + 0.5);
    }
  // No ink where the marker should be: a marker drawn elsewhere, which fails as infinitely off.
  if (!total) return Infinity;
  return sum / total / scale;
}

export const launch = () =>
  puppeteer.launch({ executablePath: findChrome(), headless: true, args: NO_KEYCHAIN });

/** Every marker on one page, at one device scale, how far it sits off its line and how far its
 * first line starts right of the wrapped lines, in CSS px, after `css` is added. */
export async function measureMarkers(
  browser: Browser,
  url: string,
  { scale = 4, width = 1280, newline = false, css = "" } = {},
): Promise<Reading[]> {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width, height: 900, deviceScaleFactor: scale });
    // The settled layout: a scroll reveal still moving at screenshot time reads a marker off.
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.goto(url, { waitUntil: "networkidle0" });
    if (css) await page.addStyleTag({ content: css });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    // Each box is shot inside the viewport, scrolled to it: capturing beyond the viewport resizes it,
    // and a layout sized by the viewport's height then moves under the measured boxes.
    const read = async (clip: Box) => {
      await page.evaluate((y) => scrollTo(0, Math.max(0, y - 200)), clip.y);
      const png = await page.screenshot({ clip, encoding: "base64", captureBeyondViewport: false });
      return clip.y + (await page.evaluate(inkMiddle, png, scale));
    };
    const out: Reading[] = [];
    for (const p of await page.evaluate(collect, [newline, MAX_SIDE] as [boolean, number])) {
      // A square ::before that is not beside its first line (an absolute dot above the item) leaves
      // no room left of the text: it is decoration, not this line's marker.
      if (p.marker.width < 1 || p.text.width <= 0) continue;
      out.push({
        page: url,
        label: p.label,
        kind: p.kind,
        scale,
        newline,
        offset: (await read(p.marker)) - (await read(p.text)),
        indent: p.indent,
      });
    }
    return out;
  } finally {
    await page.close();
  }
}

export const failing = (r: Reading) =>
  Math.abs(r.offset) > TOLERANCE || (r.indent !== null && Math.abs(r.indent) > TOLERANCE);

const toUrl = (arg: string) => (/^[a-z]+:\/\//.test(arg) ? arg : pathToFileURL(resolve(arg)).href);

if (import.meta.main) {
  const args = process.argv.slice(2);
  const opt = (name: string, fallback: string) => {
    const i = args.indexOf(name);
    return i < 0 ? fallback : args.splice(i, 2)[1]!;
  };
  const scales = opt("--scale", "2,4").split(",").map(Number);
  const width = Number(opt("--width", "1280"));
  const json = args.includes("--json");
  const pages = args.filter((a) => a !== "--json").map(toUrl);
  if (!pages.length) {
    console.error(
      "usage: brand-markers [--scale 2,4] [--width 1280] [--json] <url or html file>...",
    );
    process.exit(2);
  }
  const browser = await launch();
  const readings: Reading[] = [];
  const empty: string[] = [];
  try {
    for (const url of pages) {
      const before = readings.length;
      for (const scale of scales)
        for (const newline of [false, true])
          readings.push(...(await measureMarkers(browser, url, { scale, width, newline })));
      if (readings.length === before) empty.push(url);
    }
  } finally {
    await browser.close();
  }
  const bad = readings.filter(failing);
  if (json) console.log(JSON.stringify(readings, null, 2));
  else {
    for (const r of bad)
      console.error(
        `${r.page} ${r.label} (${r.kind}, ${r.scale}x${r.newline ? ", newline after <li>" : ""}): ` +
          `${r.offset.toFixed(2)} px off${r.indent === null ? "" : `, first line ${r.indent.toFixed(2)} px in`}`,
      );
    for (const url of empty) console.error(`${url}: no marker found`);
    console.log(
      `brand-markers: ${readings.length} readings on ${pages.length} pages, ${bad.length} off by more than ${TOLERANCE} px`,
    );
  }
  process.exit(bad.length || empty.length ? 1 : 0);
}

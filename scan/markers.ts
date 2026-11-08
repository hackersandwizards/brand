#!/usr/bin/env bun
// The marker check a consumer runs in its own gate, on pages it serves or builds: every list marker
// measured on the pixels headless Chrome paints. A marker's middle has to sit two thirds of the way
// from the x-height middle of the first line beside it to its cap-height middle (marker.css's
// --hw-marker-mid; the caps' middle beside capitals), and a list item's first line has to start
// where its wrapped lines start.
//
// Each page runs twice, as served and with a newline and an indent opening every list item, as
// prettier-plugin-astro and hand-written HTML leave it, where an inline-block marker kept the
// newline as a space. Each marked line opens with "xxxxHHHH", so the ink of the x's is the x-height
// band and that of the H's the cap-height band; where text-transform sets the line in capitals,
// both are capitals and the target is the caps' middle. Markers found: a square ::before (side up
// to 16px) on a list item or its opening paragraph, an empty square element (up to 16px) followed
// by text in its row that is the brand's .hw-marker or an item's first element, a bullet glyph as a
// ul item's ::before content, and the browser's own marker in a ul. A drawn marker on an item that
// also keeps the browser's own fails, whatever its offset. Not measured: a heading's or
// link's swatch outside a list, and ol numerals, whose digits stand on the baseline.
//
// Usage: brand-markers [--scale 2,4] [--width 1280] [--site <folder> | --base <url>] [--catalog <folder>
// [--catalog-at <page>]] [--json] <url, html file or site path>... --site serves a built folder on a
// free port, and a page starting with / is a path on it; --base names a server the gate started
// instead. --catalog adds every story page of a built catalog folder (catalogPages), each named
// below --catalog-at, by default the folder itself, or its path on --site. Without --catalog, the
// "catalog" of brand-elements.json in the working directory is measured, with its "site" where
// neither --site nor --base is given and its "exclude" (listedCatalog), so a consumer names its
// catalog once.
// Exits 1 on a marker off by more than 0.25px, a first line off by more than 0.25px, an item with
// two markers, or a named page with no marker (a zero proves nothing; a story page may show none).
// Exits 2 on a catalog folder without a story page. Needs Chrome for Testing (CHROME_BINARY overrides).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { availableParallelism } from "node:os";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer, {
  type Browser,
  type BrowserContext,
  type HTTPRequest,
  type HTTPResponse,
  type Page,
} from "puppeteer-core";
import { findChrome, NO_KEYCHAIN } from "../applications/linkedin-visuals/render";

export const TOLERANCE = 0.25; // CSS px
// Where the marker's middle sits from the x-height middle (0) to the cap-height middle (1): the
// default of --hw-marker-mid in marker.css, 1ex / 6 + 1cap / 3.
export const CAP_SHARE = 2 / 3;
const MAX_SIDE = 16; // CSS px; a larger square is an icon or a swatch, not a marker

type Box = { x: number; y: number; width: number; height: number };
// text spans "xxxxHHHH"; split is where the H's start, in CSS px from its left edge. The boxes are
// in CSS px from the top left of the element nearest the line (the marker element, else the text's
// parent), which the read scrolls into view.
type Probe = {
  label: string;
  kind: Kind;
  marker: Box;
  text: Box;
  split: number;
  indent: number | null;
  double: boolean;
};
export type Kind = "before" | "element" | "native" | "glyph";
export type Reading = {
  page: string;
  label: string;
  kind: Kind;
  scale: number;
  newline: boolean;
  offset: number;
  indent: number | null;
  double: boolean;
};

/** Runs in the page: opens every closed <details>, whose contents are drawn only once it opens. Not
 * a header's or nav's disclosure: a site's menu script may hold the page while one is open. */
export function openFolds() {
  for (const d of document.querySelectorAll("details:not(header details, nav details)"))
    (d as HTMLDetailsElement).open = true;
}

/** Runs in the page: rewrites the line beside each marker and returns the boxes to read, with the
 * element each probe of the same index scrolls into view. */
function collect([newline, maxSide]: [boolean, number]): { probes: Probe[]; anchors: Element[] } {
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
        visible(n.parentElement!) &&
        // Code (a mono chip, often smaller) has its own x-height; the line's is the text's.
        !n.parentElement!.closest("code, kbd, samp")
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
  // Where the item's first line starts: its first content, text or an element such as a code chip.
  const lineStart = (host: Element) => {
    for (const n of host.childNodes) {
      if (n instanceof Text && !n.textContent!.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      if (n instanceof Text)
        range.setStart(n, n.textContent!.length - n.textContent!.trimStart().length);
      const r = n instanceof Element ? n.getClientRects()[0] : range.getClientRects()[0];
      if (r) return r.left;
    }
    return contentLeft(host);
  };
  // The browser draws its own marker on the item: a list-style type or image on a list item whose
  // ::marker is not emptied.
  const ownMarker = (li: Element) => {
    const s = getComputedStyle(li);
    const content = getComputedStyle(li, "::marker").content;
    return (
      s.display.includes("list-item") &&
      (s.listStyleType !== "none" || s.listStyleImage !== "none") &&
      content !== "none" &&
      content !== '""'
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
    else if (host.tagName === "LI" && host.parentElement?.tagName === "UL" && ownMarker(host))
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
    f.text.data = "xxxxHHHH " + f.text.data.trimStart();
    // An underline or a shadow (a link item) would add ink below the x-height band. A decoration
    // reaches every descendant, so it goes on each element from the text up to the item.
    for (let el = f.text.parentElement; el && el !== f.host.parentElement; el = el.parentElement) {
      (el as HTMLElement).style.textDecorationLine = "none";
      (el as HTMLElement).style.textShadow = "none";
    }
  }
  const rectOf = (node: Text, start = 0) => {
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + 4);
    return range.getClientRects()[0]!;
  };
  const probes = found.map(({ host, text, kind, mark }): Probe => {
    const at = (mark ?? text.parentElement!).getBoundingClientRect();
    const box = (left: number, right: number, top: number, bottom: number): Box => ({
      x: left - at.left,
      y: top - at.top,
      width: right - left,
      height: bottom - top,
    });
    const t = rectOf(text);
    const c = rectOf(text, 4);
    const em = parseFloat(getComputedStyle(text.parentElement!).fontSize);
    // The marker stands left of where the line starts, which is the text or an element before it,
    // such as a code chip; only its height comes from the text.
    const start = mark ? t.left : lineStart(host);
    let left: number;
    let right = start - 0.5;
    if (mark) {
      const m = mark.getBoundingClientRect();
      [left, right] = [m.left - 1, m.right + 1];
    } else if (kind === "native" || kind === "glyph")
      left = Math.max(start - 2 * em, host.getBoundingClientRect().left - 1.5 * em);
    // The marker hangs left of the item's text, into the item's padding or past it into the list's
    // (a loose item's paragraph starts at the text, Tailwind prose pads an item less than the
    // marker's indent), so the box reaches to the list's edge.
    else
      left = Math.max(
        start - 2 * em,
        (host.closest("ul") ?? host).getBoundingClientRect().left - 1,
      );
    const li = host.closest("li");
    return {
      label: label(host),
      kind,
      marker: box(left, right, t.top - 3, t.bottom + 3),
      text: box(t.left, c.right, t.top, t.bottom),
      split: c.left - t.left,
      indent: host === li && kind === "before" ? start - contentLeft(host) : null,
      // A marker drawn on an item the browser still gives its own: two markers on one line.
      // An element marker counts only as its item's first child, not inside a row deeper in it.
      double: kind !== "native" && !!li && (kind !== "element" || host === li) && ownMarker(li),
    };
  });
  return { probes, anchors: found.map((f) => f.mark ?? f.text.parentElement!) };
}

/** Runs in the page: the y in CSS px, from the top of the shot, of the ink's middle left of `split`
 * (CSS px from the shot's left edge) and right of it, each pixel weighted by its distance from the
 * shot's most common colour. */
async function inkMiddle(png: string, scale: number, split: number): Promise<[number, number]> {
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
  const total = [0, 0];
  const sum = [0, 0];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const ink = Math.hypot(
        data[i]! - (bg >> 16),
        data[i + 1]! - ((bg >> 8) & 255),
        data[i + 2]! - (bg & 255),
      );
      const side = x + 0.5 < split * scale ? 0 : 1;
      total[side]! += ink;
      sum[side]! += ink * (y + 0.5);
    }
  // -1 for no ink, as NaN and Infinity leave the page as null.
  const middle = (side: number) => (total[side] ? sum[side]! / total[side]! / scale : -1);
  return [middle(0), middle(1)];
}

/** Opens `url` and throws where a stylesheet of its own (its origin's or a file) fails to load: an
 *  unstyled page shows the browser's own list markers and spacing, as a build linking file://
 *  stylesheets does when served over http with --site. A third party's sheet, such as a web font
 *  service's, may fail offline without reddening the run. A page answering 4xx or 5xx throws too:
 *  a missing story would otherwise pass as one showing nothing. */
export async function open(page: Page, url: string) {
  const origin = new URL(url).origin;
  const missing: string[] = [];
  const failed = (r: HTTPRequest) => {
    const u = new URL(r.url());
    if (r.resourceType() === "stylesheet" && (u.protocol === "file:" || u.origin === origin))
      missing.push(r.url());
  };
  const status = (r: HTTPResponse) => r.status() >= 400 && failed(r.request());
  page.on("requestfailed", failed).on("response", status);
  try {
    const answer = await page.goto(url, { waitUntil: "networkidle0" });
    if (answer && answer.status() >= 400) throw new Error(`${url}: HTTP ${answer.status()}`);
  } finally {
    page.off("requestfailed", failed).off("response", status);
  }
  if (missing.length) throw new Error(`${url}: stylesheet not loaded: ${missing.join(", ")}`);
}

export const launch = () =>
  puppeteer.launch({ executablePath: findChrome(), headless: true, args: NO_KEYCHAIN });

/** Every marker on one page, at one device scale, how far it sits off its line and how far its
 * first line starts right of the wrapped lines, in CSS px, after `css` is added. */
export async function measureMarkers(
  browser: Browser | BrowserContext,
  url: string,
  { scale = 4, width = 1280, newline = false, css = "" } = {},
): Promise<Reading[]> {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width, height: 900, deviceScaleFactor: scale });
    // The settled layout: a scroll reveal still moving at screenshot time reads a marker off.
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await open(page, url);
    if (css) await page.addStyleTag({ content: css });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    // A closed panel's lists are markers too.
    await page.evaluate(openFolds);
    const found = await page.evaluateHandle(collect, [newline, MAX_SIDE] as [boolean, number]);
    // Each box is shot inside the viewport, its host scrolled into view in every scroll container
    // it sits in, the window or an element such as a catalog's main: capturing beyond the viewport
    // resizes it, and a layout sized by the viewport's height then moves under the measured boxes.
    // Instant, whatever the page's scroll-behavior, 200px below the top as a sticky header may
    // cover it, and a frame for the paint to follow. The anchor's top left and the viewport's four
    // edges, in page px.
    const place = (index: number) =>
      found.evaluate(
        ({ anchors }, i) =>
          new Promise<{
            x: number;
            y: number;
            top: number;
            bottom: number;
            left: number;
            right: number;
          }>((done) => {
            const anchor = anchors[i] as HTMLElement;
            anchor.style.scrollMarginTop = "200px";
            anchor.scrollIntoView({ block: "start", inline: "nearest", behavior: "instant" });
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                const r = anchor.getBoundingClientRect();
                const [x, y] = [r.left + scrollX, r.top + scrollY];
                done({
                  x,
                  y,
                  top: scrollY,
                  bottom: scrollY + innerHeight,
                  left: scrollX,
                  right: scrollX + innerWidth,
                });
              }),
            );
          }),
        index,
      );
    // The ink middles left and right of split (CSS px from the clip's left edge), in page px.
    type At = Awaited<ReturnType<typeof place>>;
    const inside = (at: At, rel: Box) =>
      at.y + rel.y >= at.top &&
      at.y + rel.y + rel.height <= at.bottom &&
      at.x + rel.x >= at.left &&
      at.x + rel.x + rel.width <= at.right;
    const read = async (at: At, rel: Box, beyond: boolean, split = Infinity) => {
      const box = { ...rel, x: at.x + rel.x, y: at.y + rel.y };
      // Whole px, as puppeteer would round it, so the shot starts where the offsets below count from.
      const [x, y] = [Math.round(box.x), Math.round(box.y)];
      const clip = {
        x,
        y,
        width: Math.round(box.x + box.width) - x,
        height: Math.round(box.y + box.height) - y,
      };
      const png = await page.screenshot({
        clip,
        encoding: "base64",
        captureBeyondViewport: beyond,
      });
      const middles = await page.evaluate(inkMiddle, png, scale, split + box.x - x);
      // No ink where the marker should be: a marker drawn elsewhere, which fails as NaN.
      return middles.map((m) => (m < 0 ? NaN : y + m));
    };
    const out: Reading[] = [];
    for (const [i, p] of (await found.evaluate((f) => f.probes)).entries()) {
      // A square ::before that is not beside its first line (an absolute dot above the item) leaves
      // no room left of the text: it is decoration, not this line's marker.
      if (p.marker.width < 1 || p.text.width <= 0) continue;
      const at = await place(i);
      // Where the page will not scroll a box into view (a script holding it, a page wider than the
      // viewport), both boxes are shot beyond the viewport, so both read the same layout.
      const beyond = !inside(at, p.text) || !inside(at, p.marker);
      const [x, caps] = await read(at, p.text, beyond, p.split);
      out.push({
        page: url,
        label: p.label,
        kind: p.kind,
        scale,
        newline,
        offset: (await read(at, p.marker, beyond))[0]! - (x! + CAP_SHARE * (caps! - x!)),
        indent: p.indent,
        double: p.double,
      });
    }
    return out;
  } finally {
    await page.close();
  }
}

// Written as "not within" so a NaN offset, from a marker and a text that both show no ink, fails.
export const failing = (r: Reading) =>
  r.double ||
  !(Math.abs(r.offset) <= TOLERANCE) ||
  (r.indent !== null && !(Math.abs(r.indent) <= TOLERANCE));

/** A page argument as a URL: a URL as it is, a path starting with / on the served site `site`, else
 * a file. */
export const toUrl = (arg: string, site?: URL) =>
  /^[a-z]+:\/\//.test(arg)
    ? arg
    : site && arg.startsWith("/")
      ? new URL(arg, site).href
      : pathToFileURL(resolve(arg)).href;

/** The file a path names inside `root`, a folder answering with its index.html, as a static host
 * does; undefined for none or for a path leaving `root`. */
export const fileIn = (root: string, path: string) => {
  let file: string;
  try {
    file = join(root, decodeURIComponent(path));
  } catch {
    return; // a malformed escape names no file
  }
  if (!file.startsWith(`${root}/`)) return;
  // A path running on past a file (ENOTDIR) or holding a NUL throws rather than naming no file.
  const stat = (f: string) => {
    try {
      return statSync(f, { throwIfNoEntry: false });
    } catch {
      return undefined;
    }
  };
  if (stat(file)?.isDirectory()) file = join(file, "index.html");
  return stat(file)?.isFile() ? file : undefined;
};

/** A built site folder served at the root of a free local port: pages whose links start at / then
 * load as published, and a folder's path without its slash redirects to it, so relative links
 * resolve as on Pages. */
export const serve = (dir: string) => {
  const root = resolve(dir);
  if (!existsSync(root)) throw new Error(`no site folder ${root}; build it first`);
  return Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      const { pathname, search } = new URL(request.url);
      const file = fileIn(root, pathname);
      if (
        file &&
        !pathname.endsWith("/") &&
        file.endsWith("/index.html") &&
        !pathname.endsWith(".html")
      )
        return Response.redirect(`${pathname}/${search}`, 301);
      return file ? new Response(Bun.file(file)) : new Response("Not found", { status: 404 });
    },
  });
};

/** Every story state page of a built catalog folder `dir`, as scaffolding writes it
 * (stories/<group>/<story>/<state>/index.html), named below `at` the way a page is: a URL or a path
 * on the served site ends in the state's folder, URL-encoded, a file names its index.html. `at` defaults to the
 * folder's path on the served `site`, else the folder; `served` (a site or a --base server) makes a
 * path starting with / one on the server. A page forwarding elsewhere (a meta refresh,
 * as a catalog that is not the site's home leaves under its old path) is no story, nor is one an
 * `exclude` glob matches, relative to the stories folder (a story group the consumer does not own,
 * such as "Slides/**"). Throws on a folder without a story page and on a glob matching no story. */
export const catalogPages = (
  dir: string,
  at?: string,
  site?: string,
  served = !!site,
  exclude: string[] = [],
) => {
  if (!Array.isArray(exclude))
    throw new Error(`"exclude" is a list of globs, not ${JSON.stringify(exclude)}`);
  const stories = join(dir, "stories");
  const pages = existsSync(stories)
    ? readdirSync(stories, { recursive: true, encoding: "utf8" }).filter((f) =>
        f.endsWith("/index.html"),
      )
    : [];
  // A glob that leaves out nothing is a typo or a story group since gone: it fails.
  const skip = exclude.map((g) => {
    const glob = new Bun.Glob(g);
    if (!pages.some((f) => glob.match(f)))
      throw new Error(`exclude "${g}" matches no story under ${stories}`);
    return glob;
  });
  const states = pages
    .filter(
      (f) =>
        !skip.some((g) => g.match(f)) &&
        !/<meta[^>]+http-equiv=["']?refresh/i.test(readFileSync(join(stories, f), "utf8")),
    )
    .map((f) => `stories/${f.slice(0, -"index.html".length)}`)
    .sort();
  if (!states.length) throw new Error(`no story page under ${stories}; build the catalog first`);
  const root = at ?? (site ? `/${relative(site, dir)}` : dir);
  const file = !/^[a-z]+:\/\//.test(root) && !(served && root.startsWith("/"));
  const encoded = (s: string) => s.split("/").map(encodeURIComponent).join("/");
  return states.map((s) => `${root.replace(/\/?$/, "/")}${file ? `${s}index.html` : encoded(s)}`);
};

/** The catalog and site a parsed brand-elements.json names, so brand-markers takes the catalog
 * brand-elements measures without a flag. Empty where it names no catalog. */
/** The "catalog" of brand-elements.json. */
export type Catalog = string | { dir: string; at?: string; exclude?: string[] };
export const listedCatalog = (config: {
  catalog?: Catalog;
  site?: string;
}): { dir?: string; at?: string; exclude?: string[]; site?: string } =>
  config.catalog
    ? {
        ...(typeof config.catalog === "string" ? { dir: config.catalog } : config.catalog),
        site: config.site,
      }
    : {};

/** `run` over `items`, at most `limit` at a time, each call told which of the `limit` workers runs it;
 * the results in the items' order. */
export async function pool<T, R>(
  items: T[],
  limit: number,
  run: (item: T, worker: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(items.length, limit) }, async (_, worker) => {
      for (let i = next++; i < items.length; i = next++) out[i] = await run(items[i]!, worker);
    }),
  );
  return out;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const opt = (name: string, fallback: string) => {
    const i = args.indexOf(name);
    return i < 0 ? fallback : args.splice(i, 2)[1]!;
  };
  const scales = opt("--scale", "2,4").split(",").map(Number);
  const width = Number(opt("--width", "1280"));
  const flagSite = opt("--site", "");
  const flagBase = opt("--base", "");
  const flagCatalog = opt("--catalog", "");
  const flagAt = opt("--catalog-at", "");
  const json = args.includes("--json");
  const named = args.filter((a) => a !== "--json");
  const usage =
    "usage: brand-markers [--scale 2,4] [--width 1280] [--site <folder> | --base <url>] [--catalog <folder> [--catalog-at <page>]] [--json] <url, html file or site path>...";
  if (flagBase && !/^https?:$/.test(URL.parse(flagBase)?.protocol ?? "")) {
    console.error(usage);
    process.exit(2);
  }
  const listed =
    flagCatalog || !existsSync("brand-elements.json")
      ? {}
      : listedCatalog(JSON.parse(readFileSync("brand-elements.json", "utf8")));
  const catalog = flagCatalog || listed.dir;
  const at = flagAt || listed.at;
  const site = flagSite || (flagBase ? undefined : listed.site);
  let stories: string[] = [];
  try {
    if (catalog) stories = catalogPages(catalog, at, site, !!site || !!flagBase, listed.exclude);
  } catch (e) {
    console.error(`brand-markers: ${(e as Error).message}`);
    process.exit(2);
  }
  if (!named.length && !stories.length) {
    console.error(usage);
    process.exit(2);
  }
  const server = site ? serve(site) : undefined;
  const base = server?.url ?? (flagBase ? new URL(flagBase) : undefined);
  const browser = await launch();
  const pages = [...named, ...stories].map((a) => toUrl(a, base));
  // Every page at every scale, with and without the newline, run side by side: one run per core, at
  // most 8, as a run at 4x holds a 5120 x 3600 surface. A first pass at the first scale finds the
  // pages with a marker, most stories having none; only those take the other runs.
  const workers = Math.min(availableParallelism(), 8, pages.length);
  let readings: Reading[];
  try {
    // A context per worker: puppeteer shoots one page of a context at a time.
    const contexts = await Promise.all(
      Array.from({ length: workers }, () => browser.createBrowserContext()),
    );
    type Run = { url: string; scale: number; newline: boolean };
    const measure = (runs: Run[]) =>
      pool(runs, workers, ({ url, ...options }, w) =>
        measureMarkers(contexts[w]!, url, { ...options, width }),
      );
    const [first, ...rest] = scales;
    // Both newline runs at the first scale, as the newline may change which items read.
    const firstRuns = pages.flatMap((url) =>
      [false, true].map((newline) => ({ url, scale: first!, newline })),
    );
    const found = await measure(firstRuns);
    const read = new Set(firstRuns.filter((_, i) => found[i]!.length).map((r) => r.url));
    const more = await measure(
      pages
        .filter((url) => read.has(url))
        .flatMap((url) =>
          rest.flatMap((scale) => [false, true].map((newline) => ({ url, scale, newline }))),
        ),
    );
    // Grouped by page, in the order named, as --json printed them before.
    readings = [...found, ...more]
      .flat()
      .sort((a, b) => pages.indexOf(a.page) - pages.indexOf(b.page));
  } finally {
    await browser.close();
    await server?.stop(true);
  }
  const empty = pages.slice(0, named.length).filter((url) => !readings.some((r) => r.page === url));
  const bad = readings.filter(failing);
  if (json) console.log(JSON.stringify(readings, null, 2));
  else {
    for (const r of bad)
      console.error(
        `${r.page} ${r.label} (${r.kind}, ${r.scale}x${r.newline ? ", newline after <li>" : ""}): ` +
          `${r.offset.toFixed(2)} px off${r.indent === null ? "" : `, first line ${r.indent.toFixed(2)} px in`}` +
          (r.double ? ", and the browser's own marker beside it" : ""),
      );
    for (const url of empty) console.error(`${url}: no marker found`);
    console.log(
      `brand-markers: ${readings.length} readings on ${pages.length} pages, ${bad.length} off by more than ${TOLERANCE} px`,
    );
  }
  process.exit(bad.length || empty.length ? 1 : 0);
}

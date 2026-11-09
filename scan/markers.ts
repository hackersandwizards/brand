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
// link's swatch outside a list, an area mark (.hw-mark), ol numerals, whose digits stand on the
// baseline, and anything inside [data-hw-exception], a system's own element brand-elements.json
// names with its reason.
//
// Usage: brand-markers [--scale 2,4] [--width 1280] [--site <folder> | --base <url>] [--catalog <folder>
// [--catalog-at <page>]] [--json] [<url, html file or site path>...] --site serves a built folder on
// a free port, and a page starting with / is a path on it; --base names a server the gate started
// instead. --catalog adds every story page of a built catalog folder (catalogPages), each named
// below --catalog-at, by default the folder itself, or its path on --site. brand-elements.json in
// the working directory gives the rest, so a consumer names its pages once: its "site" where
// none of --site, --base and --catalog is given, its "catalog" with its "exclude" (listedCatalog)
// where --catalog is not, and its "pages" where no page is named, each measured where it shows a
// marker, as a story is (a site path only where a site or --base serves it); a run of those that
// finds no marker at all fails.
// The "markers" block of brand-elements.json declares the readings a consumer keeps, each with
// its reason and how many off readings it keeps at most:
//   "markers": { "<glob over the page's path>": { "reason": "...", "off": 6 } }
// The "csp" of brand-elements.json states the policy the consumer's host sends, for every page or
// by the glob over each page's path (elements.ts), and each source a page's policy refuses fails,
// "csp" or the page's own.
// An off reading on a page the glob matches is kept, printed as kept; more off readings there than
// "off" fail, and so does an entry that keeps nothing on a page it matches in this run (stale), so a
// fixed page drops its exception. An item with two markers is never kept.
// Exits 1 on a marker off by more than 0.25px, a first line off by more than 0.25px, an item with
// two markers, or a page named on the command line with no marker (a zero proves nothing; a story
// page may show none).
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
  type JSHandle,
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
 * element each probe of the same index scrolls into view; with `count`, only how many markers it
 * finds, the page's lines left as they are but for the newline. The boxes are read two frames after
 * the rewrite, once a script that refits the page to its longer lines (a slide's fit guard, run by
 * a ResizeObserver) has done so. */
async function collect([newline, maxSide, count]: [boolean, number, boolean?]): Promise<
  { probes: Probe[]; anchors: Element[] } | number
> {
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
    // Under a CSS zoom a rect is in zoomed px and a computed length is not.
    return (
      el.getBoundingClientRect().left +
      (parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft)) * el.currentCSSZoom
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
    // A system's own mark, declared in brand-elements.json, as brand-elements leaves it out.
    if (!visible(host) || host.closest("[data-hw-exception]")) continue;
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
      !host.classList.contains("hw-mark") &&
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
  if (count) return found.length;
  for (const f of found) {
    f.text.data = "xxxxHHHH " + f.text.data.trimStart();
    // An underline or a shadow (a link item) would add ink below the x-height band. A decoration
    // reaches every descendant, so it goes on each element from the text up to the item.
    for (let el = f.text.parentElement; el && el !== f.host.parentElement; el = el.parentElement) {
      (el as HTMLElement).style.textDecorationLine = "none";
      (el as HTMLElement).style.textShadow = "none";
    }
  }
  await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  const rectOf = (node: Text, start = 0) => {
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + 4);
    return range.getClientRects()[0]!;
  };
  // An absolutely placed ::before, such as a timeline's waypoint, may sit anywhere left of the text
  // and be turned or moved: its box is that of an element appended to the item with the pseudo's
  // computed style, which the browser places, transforms and zooms alike, 1 px wider on each side.
  const placed = (host: Element) => {
    const b = getComputedStyle(host, "::before");
    if (b.position !== "absolute") return null;
    const twin = document.createElement("span");
    for (const p of b) twin.style.setProperty(p, b.getPropertyValue(p));
    host.append(twin);
    const r = twin.getBoundingClientRect();
    twin.remove();
    return { left: r.left - 1, right: r.right + 1, top: r.top - 1, bottom: r.bottom + 1 };
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
    const own = kind === "before" ? placed(host) : null;
    if (own)
      // Starting at or right of the line (a square above the item): decoration, skipped below.
      [left, right] = [
        own.left,
        own.left + 1 < start ? Math.min(own.right, start - 0.5) : own.left,
      ];
    else if (mark) {
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
      marker: box(left, right, own?.top ?? t.top - 3, own?.bottom ?? t.bottom + 3),
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
  // Decoded from bytes, which no img-src of the page's policy governs, as it would a data: URL.
  const img = await createImageBitmap(
    new Blob([Uint8Array.from(atob(png), (c) => c.charCodeAt(0))], { type: "image/png" }),
  );
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

/** The "csp" of brand-elements.json: one policy for every page, or a policy per glob over a page's
 *  decoded path. */
export type Csp = string | Record<string, string>;

const pathOf = (page: string) => {
  const path = URL.parse(page)?.pathname ?? page;
  try {
    return decodeURIComponent(path);
  } catch {
    return path; // a malformed escape, which a glob reads as written
  }
};

/** The lookup of a document's policy in `csp`: the first listed glob matching its path decides, and
 *  a path none matches has none. Throws on a malformed value. */
export function policies(csp: Csp) {
  const valid = (p: unknown): p is string =>
    typeof p === "string" && !!p.trim() && !/[\r\n]/.test(p);
  if (valid(csp)) return () => csp;
  const entries = typeof csp === "object" && !Array.isArray(csp) ? Object.entries(csp ?? {}) : [];
  if (!entries.length || !entries.every(([, p]) => valid(p)))
    throw new Error(
      `brand-elements.json "csp": one line of policy or { "<glob>": "<policy>" }, not ${JSON.stringify(csp)}`,
    );
  const globs = entries.map(([glob, p]) => [new Bun.Glob(glob), p] as const);
  return (url: string) => globs.find(([glob]) => glob.match(pathOf(url)))?.[1];
}

/** Opens `url` and throws where a stylesheet of its own (its origin's or a file) fails to load: an
 *  unstyled page shows the browser's own list markers and spacing, as a build linking file://
 *  stylesheets does when served over http with --site. A third party's sheet, such as a web font
 *  service's, may fail offline without reddening the run. A page answering 4xx or 5xx throws too:
 *  a missing story would otherwise pass as one showing nothing. `csp`, the policy the consumer's
 *  host sends (brand-elements.json "csp"), is added to every document's response, a file's
 *  included, by the document's own path where it names globs; a document of this page's origin no
 *  glob matches throws, as it would otherwise pass under no policy. Each refusal of the page's policies is recorded for `refusals`. */
export async function open(page: Page, url: string, csp?: Csp) {
  await page.evaluateOnNewDocument(recordRefusals);
  const origin = new URL(url).origin;
  const unmatched: string[] = [];
  if (csp !== undefined) {
    const policy = policies(csp);
    const cdp = await page.createCDPSession();
    // Fetch.continueResponse drops added headers on http; fulfilling with the body keeps them.
    cdp.on("Fetch.requestPaused", async (e) => {
      const status = e.responseStatusCode ?? 200;
      try {
        if (e.responseErrorReason || (status >= 300 && status < 400))
          return await cdp.send("Fetch.continueRequest", { requestId: e.requestId });
        const value = policy(e.request.url);
        if (!value) {
          if (new URL(e.request.url).origin === origin) unmatched.push(pathOf(e.request.url));
          return await cdp.send("Fetch.continueRequest", { requestId: e.requestId });
        }
        const { body, base64Encoded } = await cdp.send("Fetch.getResponseBody", {
          requestId: e.requestId,
        });
        await cdp.send("Fetch.fulfillRequest", {
          requestId: e.requestId,
          responseCode: status,
          // The body arrives decoded, so its former encoding and length no longer hold.
          responseHeaders: [
            ...(e.responseHeaders ?? []).filter(
              (h) => !/^content-(encoding|length)$/i.test(h.name),
            ),
            { name: "Content-Security-Policy", value },
          ],
          body: base64Encoded ? body : Buffer.from(body).toString("base64"),
        });
      } catch {
        // Failed loudly: a document left paused would time out without its cause. Where the page
        // closed meanwhile, this fails too.
        await cdp
          .send("Fetch.failRequest", { requestId: e.requestId, errorReason: "Failed" })
          .catch(() => undefined);
      }
    });
    await cdp.send("Fetch.enable", {
      patterns: [{ resourceType: "Document", requestStage: "Response" }],
    });
  }
  const missing: string[] = [];
  const failed = (r: HTTPRequest) => {
    const u = new URL(r.url());
    if (r.resourceType() === "stylesheet" && (u.protocol === "file:" || u.origin === origin))
      missing.push(r.url() + (r.failure() ? ` (${r.failure()!.errorText})` : ""));
  };
  const status = (r: HTTPResponse) => r.status() >= 400 && failed(r.request());
  page.on("requestfailed", failed).on("response", status);
  try {
    const answer = await page.goto(url, { waitUntil: "networkidle0" });
    if (answer && answer.status() >= 400) throw new Error(`${url}: HTTP ${answer.status()}`);
    if (unmatched.length)
      throw new Error(
        `brand-elements.json "csp": no glob matches ${unmatched.join(", ")}; name the policy your host sends there`,
      );
  } finally {
    page.off("requestfailed", failed).off("response", status);
  }
  if (missing.length) throw new Error(`${url}: stylesheet not loaded: ${missing.join(", ")}`);
}

export type Refusal = { page: string; element: string; source: string; directive: string };
/** `csp` renders every page under the consumer's policy; the refusals go to `refused`. */
type Options = { scale?: number; width?: number; csp?: Csp; refused?: Refusal[] };
type Recorded = { uri: string; directive: string; target: EventTarget | null };

/** Runs before the page's own scripts: keeps every refusal of the page's policies. */
function recordRefusals() {
  const list: Recorded[] = [];
  Object.defineProperty(window, "__hwRefused", { value: list });
  document.addEventListener(
    "securitypolicyviolation",
    (e) => list.push({ uri: e.blockedURI, directive: e.effectiveDirective, target: e.target }),
    true,
  );
}

/** Each refusal `open` recorded, with the element it hit: the event's target where it is one,
 *  else, for a stylesheet's image, which the browser reports on the document, every element or
 *  pseudo-element whose computed style draws a url() from the refused source. */
function readRefusals() {
  const recorded = (window as unknown as { __hwRefused?: Recorded[] }).__hwRefused ?? [];
  // A source refused many times is looked up once.
  const list = [
    ...new Map(
      recorded.map((r) => [r.target instanceof Element ? r : `${r.uri} ${r.directive}`, r]),
    ).values(),
  ];
  if (!list.length) return [];
  const name = (el: Element, pseudo = "") => {
    const cls = [...el.classList].find((c) => c.startsWith("hw-")) ?? el.classList[0];
    return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}${pseudo}`;
  };
  const PROPS = [
    "background-image",
    "mask-image",
    "list-style-image",
    "border-image-source",
    "content",
    "cursor",
  ];
  const PSEUDOS = ["", "::before", "::after", "::marker"];
  const all = [...document.querySelectorAll("body *")];
  return list.flatMap(({ uri, directive, target }) => {
    if (target instanceof Element) return [{ element: name(target), source: uri, directive }];
    const want = `url("${/^[a-z-]+$/.test(uri) ? uri + ":" : uri}`;
    const hits = all.flatMap((el) =>
      PSEUDOS.filter((p) => {
        const g = getComputedStyle(el, p || null);
        return PROPS.some((k) => g.getPropertyValue(k).includes(want));
      }).map((p) => name(el, p)),
    );
    return (hits.length ? hits : ["the page"]).map((element) => ({
      element,
      source: uri,
      directive,
    }));
  });
}

export const refusalLine = (r: Refusal) =>
  `${r.page} ${r.element}: the page's Content-Security-Policy refuses ${r.source} (${r.directive}); allow it in the policy the host sends (and in brand-elements.json "csp"), or draw the element without it`;

/** The refusals on `page` and in its frames, each once, two frames after its last change so the
 *  images its styles now draw have been requested. A frame that cannot be read is skipped. */
export const refusals = async (page: Page, url: string): Promise<Refusal[]> => {
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  );
  const found = await Promise.all(
    page.frames().map((f) => f.evaluate(readRefusals).catch(() => [])),
  );
  return [...new Map(found.flat().map((r) => [JSON.stringify(r), { page: url, ...r }])).values()];
};

/** Adds `css` as a constructed sheet, which no style-src of the page's policy refuses. */
export const addCss = (page: Page, css: string) =>
  page.evaluate((text) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(text);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }, css);

export const launch = () =>
  puppeteer.launch({ executablePath: findChrome(), headless: true, args: NO_KEYCHAIN });

/** Every marker on one page, at one device scale, how far it sits off its line and how far its
 * first line starts right of the wrapped lines, in CSS px, after `css` is added. */
export async function measureMarkers(
  browser: Browser | BrowserContext,
  url: string,
  {
    scale = 4,
    width = 1280,
    newline = false,
    css = "",
    csp,
    refused,
  }: Options & { newline?: boolean; css?: string } = {},
): Promise<Reading[]> {
  const page = await prepare(browser, url, { scale, width, css, csp });
  try {
    const found = (await page.evaluateHandle(collect, [newline, MAX_SIDE] as [
      boolean,
      number,
    ])) as JSHandle<{ probes: Probe[]; anchors: Element[] }>;
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
    if (refused) refused.push(...(await refusals(page, url)));
    return out;
  } finally {
    await page.close();
  }
}

/** A new tab on `url` as both passes read it: settled (reduced motion), `css` added, fonts loaded
 * and every fold open, as a closed panel's lists are markers too. */

async function prepare(
  browser: Browser | BrowserContext,
  url: string,
  { scale = 4, width = 1280, css = "", csp }: Options & { css?: string } = {},
) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width, height: 900, deviceScaleFactor: scale });
    // The settled layout: a scroll reveal still moving at screenshot time reads a marker off.
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await open(page, url, csp);
    if (css) await addCss(page, css);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.evaluate(openFolds);
    return page;
  } catch (e) {
    await page.close();
    throw e;
  }
}

/** Whether a page shows a marker brand-markers would measure at `scale`, as served or with the
 * newline: one load, where measureMarkers takes one per newline. A superset of the pages that give
 * a reading, as a found marker may still be skipped as decoration. */
export async function hasMarkers(
  browser: Browser | BrowserContext,
  url: string,
  { scale = 4, width = 1280, csp, refused }: Options = {},
) {
  const page = await prepare(browser, url, { scale, width, csp });
  try {
    if (refused) refused.push(...(await refusals(page, url)));
    // The newline only adds blank text, so the second count runs on the same page.
    for (const newline of [false, true])
      if (await page.evaluate(collect, [newline, MAX_SIDE, true] as [boolean, number, boolean]))
        return true;
    return false;
  } finally {
    await page.close();
  }
}

// Written as "not within" so a NaN offset, from a marker and a text that both show no ink, fails.
export const failing = (r: Reading) =>
  r.double ||
  !(Math.abs(r.offset) <= TOLERANCE) ||
  (r.indent !== null && !(Math.abs(r.indent) <= TOLERANCE));

/** A declared marker exception: why the readings stay off, and how many may. */
export type MarkerException = { reason: string; off: number };

/** The off readings `exceptions` keeps, those it does not, and its findings: an entry over its
 * count, an entry without a reason or count, and an entry keeping nothing. A glob matches a page's
 * decoded path, such as "**\/content-slide/at-rest/". */
export function applyExceptions(
  off: Reading[],
  exceptions: Record<string, MarkerException> = {},
  measured: string[] = off.map((r) => r.page),
) {
  const entries = Object.entries(exceptions).map(([glob, e]) => ({
    glob,
    e,
    g: new Bun.Glob(glob),
  }));
  const by = new Map<string, Reading[]>(entries.map(({ glob }) => [glob, []]));
  const bad: Reading[] = [];
  for (const r of off) {
    const hit = !r.double && entries.find(({ g }) => g.match(pathOf(r.page)));
    if (hit) by.get(hit.glob)!.push(r);
    else bad.push(r);
  }
  const findings = entries.flatMap(({ glob, e }) => {
    const n = by.get(glob)!.length;
    if (!e?.reason || !Number.isInteger(e.off) || e.off < 1)
      return [`markers exception "${glob}": needs a "reason" and an "off" count of at least 1`];
    if (n === 0 && measured.some((page) => new Bun.Glob(glob).match(pathOf(page))))
      return [`markers exception "${glob}" is stale: it keeps no off reading`];
    if (n > e.off) return [`markers exception "${glob}": ${n} off readings, ${e.off} kept`];
    return [];
  });
  const kept = [...by.values()].flat();
  return { bad, kept, findings };
}

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

/** The "catalog" of brand-elements.json. */
export type Catalog = string | { dir: string; at?: string; exclude?: string[] };
/** The catalog and site a parsed brand-elements.json names, so brand-markers takes the catalog
 * brand-elements measures without a flag. Empty where it names no catalog. */
export const listedCatalog = (config: {
  catalog?: Catalog;
}): { dir?: string; at?: string; exclude?: string[] } =>
  config.catalog
    ? typeof config.catalog === "string"
      ? { dir: config.catalog }
      : config.catalog
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
    "usage: brand-markers [--scale 2,4] [--width 1280] [--site <folder> | --base <url>] [--catalog <folder> [--catalog-at <page>]] [--json] [<url, html file or site path>...]";
  if (flagBase && !/^https?:$/.test(URL.parse(flagBase)?.protocol ?? "")) {
    console.error(usage);
    process.exit(2);
  }
  const config = existsSync("brand-elements.json")
    ? JSON.parse(readFileSync("brand-elements.json", "utf8"))
    : {};
  const listed = flagCatalog ? {} : listedCatalog(config);
  const catalog = flagCatalog || listed.dir;
  const at = flagAt || listed.at;
  const site = flagSite || (flagBase || flagCatalog ? undefined : config.site);
  // The config's pages where none is named, each measured, like a story, where it shows a marker;
  // a site path only where a site or --base serves it, as brand-elements takes --base from its gate.
  const listedPages: string[] = named.length ? [] : (config.pages ?? []);
  const served = !!site || !!flagBase;
  const searched = listedPages.filter((p) => served || !p.startsWith("/"));
  for (const p of listedPages.filter((p) => !searched.includes(p)))
    console.error(`brand-markers: ${p}: a site path, but no site or --base; not measured`);
  let stories: string[] = [];
  try {
    if (config.csp !== undefined) policies(config.csp);
    if (catalog) stories = catalogPages(catalog, at, site, served, listed.exclude);
  } catch (e) {
    console.error(`brand-markers: ${(e as Error).message}`);
    process.exit(2);
  }
  stories = [...searched, ...stories];
  if (!named.length && !stories.length) {
    console.error(usage);
    process.exit(2);
  }
  const server = site ? serve(site) : undefined;
  const base = server?.url ?? (flagBase ? new URL(flagBase) : undefined);
  const browser = await launch();
  const pages = [...named, ...stories].map((a) => toUrl(a, base));
  const refused: Refusal[] = [];
  // Every page at every scale, with and without the newline, run side by side: one run per core, at
  // most 8, as a run at 4x holds a 5120 x 3600 surface. A first pass, one load per story at the
  // first scale, finds the stories with a marker, most having none; only those, and every page
  // named, take the measured runs. It mostly waits for the network to go quiet: four tabs per worker.
  const workers = Math.min(availableParallelism(), 8, pages.length);
  let readings: Reading[];
  try {
    // A context per worker: puppeteer shoots one page of a context at a time.
    const contexts = await Promise.all(
      Array.from({ length: workers }, () => browser.createBrowserContext()),
    );
    const stories = pages.slice(named.length);
    const marked = await pool(stories, 4 * workers, (url, w) =>
      hasMarkers(contexts[w % workers]!, url, {
        scale: scales[0],
        width,
        csp: config.csp,
        refused,
      }),
    );
    const runs = [...pages.slice(0, named.length), ...stories.filter((_, i) => marked[i])].flatMap(
      (url) => scales.flatMap((scale) => [false, true].map((newline) => ({ url, scale, newline }))),
    );
    readings = (
      await pool(runs, workers, ({ url, ...options }, w) =>
        measureMarkers(contexts[w]!, url, {
          ...options,
          width,
          csp: config.csp,
          // Once per page: a story's in the first pass, a named page's in its first run.
          refused:
            options.scale === scales[0] && !options.newline && !stories.includes(url)
              ? refused
              : undefined,
        }),
      )
    ).flat();
  } finally {
    await browser.close();
    await server?.stop(true);
  }
  const empty = pages.slice(0, named.length).filter((url) => !readings.some((r) => r.page === url));
  // Only searched pages, none showing a marker: a run that measures nothing passes nothing.
  const nothing = searched.length > 0 && !readings.length;
  if (nothing)
    console.error(
      `brand-markers: no marker on any page of brand-elements.json "pages"${catalog ? " or its catalog" : ""}`,
    );
  const { bad, kept, findings } = applyExceptions(readings.filter(failing), config.markers, pages);
  for (const f of findings) console.error(f);
  for (const r of refused) console.error(refusalLine(r));
  if (json) console.log(JSON.stringify(readings, null, 2));
  else {
    for (const r of kept)
      console.log(
        `kept: ${r.page} ${r.label} ${r.offset.toFixed(2)} px off (brand-elements.json "markers")`,
      );
    for (const r of bad)
      console.error(
        `${r.page} ${r.label} (${r.kind}, ${r.scale}x${r.newline ? ", newline after <li>" : ""}): ` +
          `${r.offset.toFixed(2)} px off${r.indent === null ? "" : `, first line ${r.indent.toFixed(2)} px in`}` +
          (r.double ? ", and the browser's own marker beside it" : ""),
      );
    for (const url of empty) console.error(`${url}: no marker found`);
    console.log(
      `brand-markers: ${readings.length} readings on ${pages.length} pages, ${bad.length} off by more than ${TOLERANCE} px, ${kept.length} kept`,
    );
  }
  process.exit(bad.length || empty.length || findings.length || refused.length || nothing ? 1 : 0);
}

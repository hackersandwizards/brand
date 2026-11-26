import type { JSHandle, Page } from "puppeteer-core";
import {
  markerLineFunctions,
  type contentLeft as ContentLeft,
  type lineStart as LineStart,
  type rectOf as RectOf,
} from "./marker-capture";

declare const contentLeft: typeof ContentLeft;
declare const lineStart: typeof LineStart;
declare const rectOf: typeof RectOf;

type Edges = Pick<DOMRectReadOnly, "left" | "right" | "top" | "bottom">;
type Origin = Pick<Edges, "left" | "top">;

const MAX_SIDE = 16; // CSS px; a larger square is an icon or a swatch, not a marker

export type Box = { x: number; y: number; width: number; height: number };

// text spans "xxxxHHHH"; split is where the H's start, in CSS px from its left edge. The boxes are
// in CSS px from the top left of the element nearest the line (the marker element, else the text's
// parent), which the read scrolls into view.
export type Probe = {
  label: string;
  kind: Kind;
  marker: Box;
  text: Box;
  split: number;
  indent: number | null;
  double: boolean;
  exception?: string;
};

/** The measured probes, the element each scrolls into view and the one holding its line, and whether a
 * marker sits inside a [data-hw-exception] whose name is in `declared`. */
export type Found = { probes: Probe[]; anchors: Element[]; texts: Element[]; excepted: boolean };

export type Kind = "before" | "element" | "native" | "glyph";

type Match = { host: Element; text: Text } & (
  { kind: Exclude<Kind, "element"> } | { kind: "element"; mark: Element }
);
type DeclaredMatch = Match & { exception?: string };
type LineGeometry = { start: number; text: DOMRect; anchor: DOMRect; em: number };

/** Inserts the source-formatting whitespace that can shift an inline-block marker. */
function insertListNewlines() {
  for (const li of document.querySelectorAll("li"))
    li.insertBefore(document.createTextNode("\n      "), li.firstChild);
}

/** Tests whether an element can contribute painted ink. */
function markerVisible(el: Element) {
  const r = el.getBoundingClientRect();
  // Hidden by opacity too: a progressive reveal's items wait at opacity 0.
  return (
    r.width > 0 &&
    r.height > 0 &&
    el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
  );
}

/** The element whose style and layout paint a marker's line. */
function markerTextParent(text: Text) {
  const parent = text.parentElement;
  if (parent === null) throw new Error("Text parent missing: marker line");
  return parent;
}

/** Filters a text node for the line measured beside the marker. */
function visibleProseText(node: Node, list: Element | null) {
  if (!(node instanceof Text)) return false;
  if (list && markerTextParent(node).closest("ul, ol") !== list) return false;
  if (!node.data.trim()) return false;
  const parent = markerTextParent(node);
  // Code (a mono chip, often smaller) has its own x-height; the line's is the text's.
  return markerVisible(parent) && !parent.closest("code, kbd, samp");
}

/** Finds the line's first visible prose Text node, within the same list. */
function firstText(el: Node) {
  // A marker's neighbour may be bare text, which a walker rooted at it never returns.
  if (el instanceof Text) return el.data.trim() && markerVisible(markerTextParent(el)) ? el : null;
  const list = el instanceof Element ? el.closest("ul, ol") : null;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      visibleProseText(n, list) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
  });
  return walker.nextNode() as Text | null;
}

// The browser draws its own marker on the item: a list-style type or image on a list item whose
// ::marker is not emptied.
function ownMarker(li: Element) {
  const s = getComputedStyle(li);
  const content = getComputedStyle(li, "::marker").content;
  return (
    s.display.includes("list-item") &&
    (s.listStyleType !== "none" || s.listStyleImage !== "none") &&
    content !== "none" &&
    content !== '""'
  );
}

/** Recognizes an empty square pseudo-element, up to the largest marker the check measures. */
function isSquareBefore(before: CSSStyleDeclaration) {
  const side = parseFloat(before.width);
  return (
    before.content === '""' &&
    before.display !== "none" &&
    before.width === before.height &&
    side > 0 &&
    side <= MAX_SIDE
  );
}

/** Identifies a marker drawn by the list item or its opening paragraph. */
function pseudoMarkerKind(host: Element): Exclude<Kind, "element"> | undefined {
  if (!isPseudoMarkerHost(host)) return;
  const before = getComputedStyle(host, "::before");
  if (isSquareBefore(before)) return "before";
  if (host.tagName !== "LI" || host.parentElement?.tagName !== "UL") return;
  if (ownMarker(host)) return "native";
  // A bullet glyph drawn as content, rather than the brand's square.
  if (before.display !== "none" && /^"[•·▪■◦‣–—-]"$/.test(before.content)) return "glyph";
}

/** A square pseudo-element belongs to a list item or its loose paragraph. */
function isPseudoMarkerHost(host: Element) {
  return host.tagName === "LI" || (host.tagName === "P" && host.parentElement?.tagName === "LI");
}

/** Pairs a list's pseudo or native marker with its first line. */
function pseudoMarker(host: Element): Match | undefined {
  const kind = pseudoMarkerKind(host);
  if (!kind) return;
  const text = firstText(host);
  if (text) return { host, text, kind };
}

/** Finds the first nonblank sibling of a painted marker. */
function markerSibling(mark: Element) {
  for (let next = mark.nextSibling; next; next = next.nextSibling) {
    const text = next.textContent;
    if (text === null) throw new Error("Text content missing: marker sibling");
    if (text.trim()) return next;
  }
  return null;
}

/** Finds a brand square or a list item's square, followed by a line of text. */
function elementMarker(mark: Element): Match | undefined {
  if (mark.childNodes.length || mark.classList.contains("hw-mark")) return;
  const host = mark.parentElement;
  if (!host) return;
  if (!isMarkerChild(mark, host) || !isPaintedSquare(mark)) return;
  const next = markerSibling(mark);
  const text = next ? firstText(next) : null;
  if (text) return { host, text, kind: "element", mark };
}

/** Only the first element of an item can be an unclassed marker. */
function isMarkerChild(mark: Element, host: Element) {
  return (
    mark.classList.contains("hw-marker") ||
    (host.tagName === "LI" && host.firstElementChild === mark)
  );
}

/** Checks that a measured element paints a marker-sized square. */
function isPaintedSquare(mark: Element) {
  const r = mark.getBoundingClientRect();
  return (
    Math.abs(r.width - r.height) < 0.01 &&
    r.width <= MAX_SIDE &&
    getComputedStyle(mark).backgroundColor !== "rgba(0, 0, 0, 0)"
  );
}

/** Finds the first marker of each visible line, in document order. */
function findMarkerMatches(declared: string[] = []): DeclaredMatch[] {
  const matches: DeclaredMatch[] = [];
  const seen = new Set<Text>();
  for (const host of document.querySelectorAll("body *")) {
    if (!markerVisible(host)) continue;
    for (const candidate of [pseudoMarker(host), elementMarker(host)]) {
      if (!candidate || seen.has(candidate.text)) continue;
      seen.add(candidate.text);
      matches.push({ ...candidate, exception: markerException(candidate, declared) });
    }
  }
  return matches;
}

/** Runs in the page: rewrites the line beside each marker with contrasting x-height and cap-height bands.
 * The boxes are read two frames after the rewrite, once a script that refits the page to its longer
 * lines (a slide's fit guard, run by a ResizeObserver) has done so. */
async function rewriteMarkerLines(matches: Match[]) {
  for (const f of matches) {
    f.text.data = "xxxxHHHH " + f.text.data.trimStart();
    // An underline or a shadow (a link item) would add ink below the x-height band. A decoration
    // reaches every descendant, so it goes on each element from the text up to the item.
    for (let el = f.text.parentElement; el && el !== f.host.parentElement; el = el.parentElement) {
      (el as HTMLElement).style.textDecorationLine = "none";
      (el as HTMLElement).style.textShadow = "none";
    }
  }
  await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
}

// An absolutely placed ::before, such as a timeline's waypoint, may sit anywhere left of the text
// and be turned or moved: its box is that of an element appended to the item with the pseudo's
// computed style, which the browser places, transforms and zooms alike, 1 px wider on each side.
function placed(host: Element) {
  const b = getComputedStyle(host, "::before");
  if (b.position !== "absolute") return null;
  const twin = document.createElement("span");
  for (const p of b) twin.style.setProperty(p, b.getPropertyValue(p));
  host.append(twin);
  const r = twin.getBoundingClientRect();
  twin.remove();
  return { left: r.left - 1, right: r.right + 1, top: r.top - 1, bottom: r.bottom + 1 };
}

/** Identifies the element relative to which both pixel clips are measured. */
function markerAnchor(match: Match) {
  return match.kind === "element" ? match.mark : markerTextParent(match.text);
}

/** Measures an anchor-relative box from four viewport edges. */
function relativeBox(edges: Edges, at: Origin): Box {
  return {
    x: edges.left - at.left,
    y: edges.top - at.top,
    width: edges.right - edges.left,
    height: edges.bottom - edges.top,
  };
}

/** Measures a square ::before within the space to the left of its line. */
function beforeEdges({ host }: Match, line: LineGeometry): Edges {
  const own = placed(host);
  if (own) {
    // Starting at or right of the line (a square above the item): decoration, skipped below.
    const right = own.left + 1 < line.start ? Math.min(own.right, line.start - 0.5) : own.left;
    return { ...own, right };
  }
  // The marker hangs left of the item's text, into the item's padding or past it into the list's
  // (a loose item's paragraph starts at the text, Tailwind prose pads an item less than the
  // marker's indent), so the box reaches to the list's edge.
  const left = Math.max(
    line.start - 2 * line.em,
    (host.closest("ul") ?? host).getBoundingClientRect().left - 1,
  );
  return { left, right: line.start - 0.5, top: line.text.top - 3, bottom: line.text.bottom + 3 };
}

/** Measures an element marker across its full width, on the same vertical band as the line. */
function elementEdges(_match: Match, { anchor, text }: LineGeometry): Edges {
  return {
    left: anchor.left - 1,
    right: anchor.right + 1,
    top: text.top - 3,
    bottom: text.bottom + 3,
  };
}

/** Measures the glyph band extending left of an unordered list item. */
function glyphEdges({ host }: Match, { start, text, em }: LineGeometry): Edges {
  const left = Math.max(start - 2 * em, host.getBoundingClientRect().left - 1.5 * em);
  return { left, right: start - 0.5, top: text.top - 3, bottom: text.bottom + 3 };
}

// A marker drawn on an item the browser still gives its own: two markers on one line.
// An element marker counts only as its item's first child, not inside a row deeper in it.
function doubleMarker({ kind, host }: Match, li: Element | null) {
  return kind !== "native" && !!li && (kind !== "element" || host === li) && ownMarker(li);
}

/** Makes the label printed with a marker reading. */
function markerLabel(el: Element) {
  const tag = el.tagName.toLowerCase();
  const cls = el.classList[0] ? "." + el.classList[0] : "";
  const text = el.textContent;
  if (text === null) throw new Error(`Text content missing: marker on ${tag}${cls}`);
  return `${tag}${cls} "${text.trim().slice(0, 30)}"`;
}

// A system's own mark, declared in brand-elements.json, is measured and marked with its name.
function markerException(match: Match, declared: string[]) {
  const source = match.kind === "element" ? match.mark : match.host;
  const name = source.closest("[data-hw-exception]")?.getAttribute("data-hw-exception");
  if (name && declared.includes(name)) return name;
}

/** Measures the text and marker clip geometry after the line has settled. */
function markerProbe(match: DeclaredMatch): Probe {
  const { host, text, kind } = match;
  const anchor = markerAnchor(match).getBoundingClientRect();
  const t = rectOf(text);
  const c = rectOf(text, 4);
  const em = parseFloat(getComputedStyle(markerTextParent(text)).fontSize);
  // The marker stands left of where the line starts, which is the text or an element before it,
  // such as a code chip; only its height comes from the text.
  const start = kind === "element" ? t.left : lineStart(host);
  const edges = {
    before: beforeEdges,
    element: elementEdges,
    native: glyphEdges,
    glyph: glyphEdges,
  };
  const marker = relativeBox(edges[kind](match, { start, text: t, anchor, em }), anchor);
  const li = host.closest("li");
  return {
    label: markerLabel(host),
    kind,
    marker,
    text: relativeBox({ left: t.left, right: c.right, top: t.top, bottom: t.bottom }, anchor),
    split: c.left - t.left,
    indent: host === li && kind === "before" ? start - contentLeft(host) : null,
    double: doubleMarker(match, li),
    exception: match.exception,
  };
}

/** Returns the boxes to read, with the element each probe of the same index scrolls into view. */
function buildMarkerProbes(matches: DeclaredMatch[]): Found {
  const probes = matches.map(markerProbe);
  return {
    probes,
    anchors: matches.map(markerAnchor),
    texts: matches.map(({ text }) => markerTextParent(text)),
    excepted: probes.some((probe) => probe.exception !== undefined),
  };
}

type MarkerDom = {
  insertNewlines: typeof insertListNewlines;
  findMarkers: typeof findMarkerMatches;
  rewriteLines: typeof rewriteMarkerLines;
  buildProbes: typeof buildMarkerProbes;
};

/** Installs marker discovery and geometry in a private handle via CDP, outside the page's CSP. */
export async function installMarkerDom(page: Page) {
  const functions = [
    insertListNewlines,
    markerVisible,
    markerTextParent,
    visibleProseText,
    firstText,
    ownMarker,
    isSquareBefore,
    pseudoMarkerKind,
    isPseudoMarkerHost,
    pseudoMarker,
    markerSibling,
    elementMarker,
    isMarkerChild,
    isPaintedSquare,
    findMarkerMatches,
    rewriteMarkerLines,
    ...markerLineFunctions,
    placed,
    markerAnchor,
    relativeBox,
    beforeEdges,
    elementEdges,
    glyphEdges,
    doubleMarker,
    markerLabel,
    markerException,
    markerProbe,
    buildMarkerProbes,
  ];
  const declarations = functions.map((fn) => fn.toString()).join("\n");
  return (await page.evaluateHandle(`(() => {
    const MAX_SIDE = ${MAX_SIDE};
    ${declarations}
    return {
      insertNewlines: insertListNewlines,
      findMarkers: findMarkerMatches,
      rewriteLines: rewriteMarkerLines,
      buildProbes: buildMarkerProbes,
    };
  })()`)) as JSHandle<MarkerDom>;
}

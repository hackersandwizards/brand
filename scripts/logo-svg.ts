import { colors } from "../generated/tokens";

const OUTLINE = 48;
export const INK = { x0: 96, y0: 96, x1: 6667, y1: 947 }; // the wordmark's letters in SVG units
const LINE = 572; // the wordmark's centre line, the middle of its 952-unit box
// The wordmark's centre line below the box centre, as a share of the box height; null: no rule.
export const LIFT: Record<string, number | null> = {
  wordmark: 0,
  lockup: 0.078,
  "lockup-compact": null,
};
export const WORDMARK = /<g fill="#1A7285">[\s\S]*(?=<\/svg>)/;
const tokenHex = (token: string) => colors[`--color-${token}` as keyof typeof colors].toUpperCase();
const NIGHT: [string, string][] = [
  ["teal", "teal-night"],
  ["purple", "purple-night"],
  ["ampersand", "ampersand-light"],
].map(([day, night]) => [tokenHex(day), tokenHex(night)]);

/** The SVG coordinate system as x, y, width and height. */
export const readViewBox = (svg: string) =>
  /viewBox="([^"]+)"/.exec(svg)![1].split(" ").map(Number);

/** The box holding `ink` (x0 y0 x1 y1), grown from `box` (x y w h) by the base's rule. */
export function grow(base: string, box: number[], ink: number[]) {
  const [x, y, w, h] = box;
  const x0 = Math.min(x, ink[0]);
  const x1 = Math.max(x + w, ink[2]);
  const lift = LIFT[base];
  let [y0, y1] = [Math.min(y, ink[1]), Math.max(y + h, ink[3])];
  if (lift !== null) {
    const height = Math.max((LINE - y0) / (0.5 + lift), (y1 - LINE) / (0.5 - lift));
    y0 = LINE - height * (0.5 + lift);
    y1 = y0 + height;
  }
  return [x0, y0, x1 - x0, y1 - y0].map((n) => +n.toFixed(3));
}

/** The SVG viewport and intrinsic size describe the same box. */
export function sizedSvg(svg: string, box: number[]) {
  return svg
    .replace(/viewBox="[^"]+"/, `viewBox="${box.join(" ")}"`)
    .replace(
      / width="\d+" height="\d+"/,
      ` width="${Math.round(box[2])}" height="${Math.round(box[3])}"`,
    );
}

/** The outer ink bounds across the layers of a cut. */
export function unionInk(a: number[], b: number[]) {
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
}

/** Fills each shape with the same ink for a one-colour surface. */
const monochrome = (src: string, colour: string) =>
  src.replace(/fill="#[0-9A-F]{6}"/g, `fill="${colour}"`);

/** Substitutes the night palette for the day fills. */
const nightWordmark = (src: string) =>
  NIGHT.reduce((svg, [day, night]) => svg.replaceAll(`fill="${day}"`, `fill="${night}"`), src);

/** Inserts the white stroke below the day wordmark so it keeps its colours. */
const outlinedWordmark = (src: string, letters: string) =>
  src.replace(
    WORDMARK,
    `<g stroke="#FFFFFF" stroke-width="${2 * OUTLINE}" stroke-linejoin="miter">${monochrome(letters, "#FFFFFF")}</g>${letters}`,
  );

type CutStyle = {
  wordmark: (src: string, letters: string) => string;
  edgeColour: string;
  outlineInk?: number[];
};

const CUTS = {
  night: { wordmark: nightWordmark, edgeColour: tokenHex("ampersand-light") },
  outline: {
    wordmark: outlinedWordmark,
    edgeColour: "#FFFFFF",
    outlineInk: [INK.x0 - OUTLINE, INK.y0 - OUTLINE, INK.x1 + OUTLINE, INK.y1 + OUTLINE],
  },
  white: { wordmark: (src) => monochrome(src, "#FFFFFF"), edgeColour: "#FFFFFF" },
  black: { wordmark: (src) => monochrome(src, "#000000"), edgeColour: "#FFFFFF" },
} satisfies Record<string, CutStyle>;

export type CutKind = keyof typeof CUTS;

/** The wordmark treatment, its extra ink and the matching wizard edge colour. */
export function styleLogoCut(src: string, base: string, kind: CutKind) {
  const letters = WORDMARK.exec(src)?.[0];
  if (!letters) throw new Error(`logos/${base}.svg carries no wordmark group`);
  const { wordmark, outlineInk, edgeColour }: CutStyle = CUTS[kind];
  return { svg: wordmark(src, letters), outlineInk, edgeColour };
}

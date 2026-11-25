// Brand colour palette, SVG tint ladder, CSS colour function evaluation, named colour resolution
// and radius/shadow token classification.
import { colors, tokens } from "../generated/tokens";

export type TokenKind = "radius" | "shadow";
export type ColourLiteral = { kind: "hex" | "rgb"; literal: string; value?: string };

const palette = new Set<string>([...Object.values(colors), "#ffffff", "#000000"]);

const rgbToHex = (rgb: number[]) =>
  "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

const hexChannels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const mixHex = (a: string, p: number, b: string) => {
  const [x, y] = [hexChannels(a), hexChannels(b)];
  return rgbToHex(x.map((v, i) => v * p + y[i] * (1 - p)));
};

// The mixes a standalone SVG may write as hex, since it cannot name a token: every token colour on
// white at Tailwind's opacity steps (5 % to 95 %) and at the 7 % wash tokens.css names, and each
// hue row's text colour at 70 % with ink (tokens.css, Hues). Within 1 per channel, for rounding.
const ROWS = [
  ["teal", "teal-dark"],
  ["purple", "purple"],
  ["amber", "amber-dark"],
  ["green", "green-dark"],
  ["factory", "factory"],
  ["red", "red"],
  ["ampersand", "muted"],
] as const;

const tokenColor = (name: string) => colors[`--color-${name}` as keyof typeof colors];
const STEPS = [0.07, ...Array.from({ length: 19 }, (_, i) => (i + 1) / 20)];
const LADDER = [
  ...palette,
  ...Object.values(colors).flatMap((hex) => STEPS.map((p) => mixHex(hex, p, "#ffffff"))),
  ...ROWS.map(([, text]) => mixHex(tokenColor(text), 0.7, tokenColor("ink"))),
].map(hexChannels);

/** Whether an SVG may write this hex: a token or a mix of one the package derives. */
export const onLadder = (hex: string) => {
  const x = hexChannels(hex);
  return LADDER.some((l) => l.every((v, i) => Math.abs(v - x[i]) <= 1));
};

const normaliseCssValue = (v: string) =>
  v
    .toLowerCase()
    .replace(/!important/, "")
    .replace(/(^|[^\d])\.(\d)/g, "$10.$2")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .trim();

const tokenValues = (prefix: string) =>
  new Set(
    Object.entries(tokens)
      .filter(([k]) => k.startsWith(prefix))
      .map(([, v]) => normaliseCssValue(v)),
  );

const TOKEN_FAMILIES: Record<TokenKind, { prefix: string; values: Set<string> }> = {
  radius: { prefix: "--radius-", values: tokenValues("--radius-") },
  shadow: { prefix: "--shadow-", values: tokenValues("--shadow-") },
};

const NEUTRAL = /^(0|0px|none|inherit|initial|unset|revert|revert-layer)$/;
const DYNAMIC_VALUE = /^(?:$|[a-z_][\w.]*$)|[${}]/;
const BRACKET_KEY = /^[a-z_$][\w$.]*\[(["'`])([^"'`]*)\1\]$/;

// A var() whose fallback is a literal or another such var(), at any depth, and theme().
const VAR = /var\(--[\w-]+(, [^()]+)?\)/g;
const isPureVar = (v: string) => {
  for (let prev = ""; prev !== v;) [prev, v] = [v, v.replace(VAR, "var")];
  return v === "var" || /^theme\([^()]+\)$/.test(v);
};

// The CSS named colours, white and black aside (tokens, counted as such); transparent and
// currentColor name no colour.
const NAMED = new Set(
  "aliceblue antiquewhite aqua aquamarine azure beige bisque blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat yellow yellowgreen".split(
    " ",
  ),
);

const TOKEN_NAMES = new Map([
  ["white", "#ffffff"],
  ["black", "#000000"],
]);

/** Resolves a CSS colour keyword, folding white and black to their token hex. */
export const resolveNamedColour = (word: string): ColourLiteral | undefined => {
  const literal = word.toLowerCase();
  const value = TOKEN_NAMES.get(literal);
  if (value || NAMED.has(literal)) return { value: value ?? literal, literal, kind: "hex" };
  return undefined;
};

/** Counts colour literals against the palette and returns the off-token diagnostics in scan order. */
export const summariseColours = (colours: ColourLiteral[], ext: string) => {
  const counts = { hex: 0, rgb: 0, tokenHex: 0 };
  const hexes: string[] = [];
  for (const { value, literal, kind } of colours) {
    if (value !== undefined) {
      if (ext === ".svg" && onLadder(value)) continue;
      if (palette.has(value)) {
        counts.tokenHex++;
        continue;
      }
    }
    counts[kind]++;
    hexes.push(literal);
  }
  return { counts, hexes };
};

/** The colour of an rgb()/hsl() literal as #rrggbb, or undefined where it names no literal. */
export const fnColour = (fn: string, args: string) => {
  const parts = args.trim().split(/[\s,/_]+/);
  if (parts.length < 3 || !parts.slice(0, 3).every((x) => /^-?[\d.]+(%|deg|g?rad|turn)?$/.test(x)))
    return;
  const n = parts.slice(0, 3).map((x) => parseFloat(x));
  const unit = /[a-z]+$/.exec(parts[0])?.[0];
  n[0] *= unit === "turn" ? 360 : unit === "rad" ? 180 / Math.PI : unit === "grad" ? 0.9 : 1;
  if (fn.toLowerCase().startsWith("rgb")) {
    const channels = parts.slice(0, 3).map((x, i) => (x.endsWith("%") ? (n[i] * 255) / 100 : n[i]));
    return rgbToHex(channels.map((channel) => Math.min(255, Math.max(0, channel))));
  }
  const [h, s, l] = [n[0], n[1] / 100, n[2] / 100];
  const k = (m: number) => (m + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  return rgbToHex(
    [0, 8, 4].map((m) => 255 * (l - a * Math.max(-1, Math.min(k(m) - 3, 9 - k(m), 1)))),
  );
};

/** Whether a radius or shadow value is a token, a neutral keyword or a reference to one, the
 *  generated tokens' own key (`tokens["--radius-brand"]`) included; undefined where the scan cannot
 *  read a value (an interpolation or a variable). */
export const isTokenValue = (value: string, kind: TokenKind): boolean | undefined => {
  const v = normaliseCssValue(value);
  const { prefix, values } = TOKEN_FAMILIES[kind];
  if (NEUTRAL.test(v) || isPureVar(v) || values.has(v)) return true;
  if (DYNAMIC_VALUE.test(v)) return undefined;
  const match = BRACKET_KEY.exec(v);
  if (!match) return false;
  const key = match[2];
  if (!key.startsWith("--")) return undefined;
  return key.startsWith(prefix) && key in tokens;
};

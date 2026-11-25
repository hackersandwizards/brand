// The code block's syntax colours as classes. Pass `codeClasses` to Shiki with the theme
// code-theme.json: each token in a code palette colour takes the class hw-code-<role> in place of
// its inline style, which code.css colours from --code-<role>, and the block takes hw-code. A
// surface that drops inline styles, such as a document, keeps its colours this way.
import theme from "../generated/code-theme.json";
import { colors, tokens } from "../generated/tokens";

type Node = { properties: Record<string, unknown> };
type Token = {
  color?: string;
  fontStyle?: number;
  htmlAttrs?: Record<string, string>;
  htmlStyle?: Record<string, string>;
};

// The text colour takes no class: the block sets it.
const ROLES = ["fg", "comment", "keyword", "string", "inserted", "deleted"] as const;
const roleOf = new Map<string, string>(
  ROLES.map((role) => {
    const color = tokens[`--code-${role}`].slice(4, -1) as keyof typeof colors;
    return [colors[color].toLowerCase(), role];
  }),
);
const ANSI = new Set(
  Object.entries(theme.colors)
    .filter(([k]) => k.startsWith("terminal.ansi"))
    .map(([, c]) => c.toLowerCase()),
);
// Shiki's FontStyle flags.
const STYLES = [
  [1, "italic"],
  [2, "bold"],
  [4, "underline"],
] as const;

const CLASSED_ROLES: readonly string[] = ROLES.filter((role) => role !== "fg");
const tokenClass = (name: string) => `hw-code-${name}`;

/** Every class codeClasses puts on a token, for a sanitizer's list of allowed classes. The block's
 *  own hw-code is not one of them, and a terminal colour outside the roles stays an inline style. */
export const codeTokenClasses: readonly string[] = [
  ...CLASSED_ROLES,
  ...STYLES.map(([, style]) => style),
].map(tokenClass);

function addClasses(properties: Record<string, unknown>, add: string[]) {
  const own = properties.class;
  const have = Array.isArray(own) ? own.map(String) : own ? String(own).split(/\s+/) : [];
  properties.class = [...new Set([...have, ...add])].join(" ");
}

/** Recognises inherited, palette, and terminal colours before rendering. */
function colorRole(color: string | undefined) {
  if (!color) return "fg";
  const hex = color.toLowerCase();
  const role = roleOf.get(hex);
  if (role) return role;
  // A terminal colour (Shiki's ansi language) outside the roles keeps its inline style: core
  // colours all, but no class of code.css carries them.
  if (ANSI.has(hex)) return "ansi";
  // A colour outside the palette would go grey unnoticed: another theme, or a stale one.
  throw new Error(`${color} is no code palette colour: highlight with code-theme.json`);
}

/** Writes palette and font classes and preserves ANSI rendering styles. */
function decorateCodeToken(token: Token) {
  const role = colorRole(token.color);
  const classes = STYLES.filter(([flag]) => (token.fontStyle ?? 0) & flag).map(([, s]) =>
    tokenClass(s),
  );
  if (role !== "fg" && role !== "ansi") classes.unshift(tokenClass(role));
  if (classes.length) addClasses((token.htmlAttrs ??= {}), classes);
  if (role === "ansi") return;
  delete token.htmlAttrs?.style;
  // An empty override keeps Shiki from deriving inline styles from the token's theme.
  token.htmlStyle = {};
}

/** The Shiki transformer: classes from the code palette, no inline style. */
export const codeClasses = {
  name: "hw-code-classes",
  pre(node: Node) {
    addClasses(node.properties, ["hw-code"]);
    delete node.properties.style;
  },
  tokens(lines: Token[][]) {
    for (const line of lines) for (const token of line) decorateCodeToken(token);
  },
};

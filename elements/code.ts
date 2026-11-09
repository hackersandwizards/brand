// The code block's syntax colours as classes. Pass `codeClasses` to Shiki with the theme
// code-theme.json: each token in a code palette colour takes the class hw-code-<role> in place of
// its inline style, which code.css colours from --code-<role>, and the block takes hw-code. A
// surface that drops inline styles, such as a document, keeps its colours this way.
import theme from "../generated/code-theme.json";
import { colors, tokens } from "../generated/tokens";

type Node = { properties: Record<string, unknown> };
type Token = { color?: string; fontStyle?: number };

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

function addClasses(node: Node, add: string[]) {
  const own = node.properties.class;
  const have = Array.isArray(own) ? own.map(String) : own ? String(own).split(/\s+/) : [];
  node.properties.class = [...new Set([...have, ...add])].join(" ");
}

/** The Shiki transformer: classes from the code palette, no inline style. */
export const codeClasses = {
  name: "hw-code-classes",
  pre(node: Node) {
    addClasses(node, ["hw-code"]);
    delete node.properties.style;
  },
  span(node: Node, _line: number, _col: number, _lineElement: Node, token: Token) {
    const role = roleOf.get(token.color?.toLowerCase() ?? "");
    // A terminal colour (Shiki's ansi language) outside the roles keeps its inline style: core
    // colours all, but no class of code.css carries them.
    const ansi = !!token.color && !role && ANSI.has(token.color.toLowerCase());
    // A colour outside the palette would go grey unnoticed: another theme, or a stale one.
    if (token.color && !role && !ansi)
      throw new Error(`${token.color} is no code palette colour: highlight with code-theme.json`);
    const add = [
      ...(role && CLASSED_ROLES.includes(role) ? [tokenClass(role)] : []),
      ...STYLES.filter(([flag]) => (token.fontStyle ?? 0) & flag).map(([, s]) => tokenClass(s)),
    ];
    if (add.length) addClasses(node, add);
    if (!ansi) delete node.properties.style;
  },
};

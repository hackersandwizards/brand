// The code block's syntax colours as classes. Pass `codeClasses` to Shiki with the theme
// code-theme.json: each token in a code palette colour takes the class hw-code-<role> in place of
// its inline style, which code.css colours from --code-<role>, and the block takes hw-code. A
// surface that drops inline styles, such as a document, keeps its colours this way.
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
// Shiki's FontStyle flags.
const STYLES = [
  [1, "italic"],
  [2, "bold"],
  [4, "underline"],
] as const;

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
    // A colour outside the palette would go grey unnoticed: another theme, or a stale one.
    if (token.color && !role)
      throw new Error(`${token.color} is no code palette colour: highlight with code-theme.json`);
    const add = [
      ...(role && role !== "fg" ? [`hw-code-${role}`] : []),
      ...STYLES.filter(([flag]) => (token.fontStyle ?? 0) & flag).map(([, s]) => `hw-code-${s}`),
    ];
    if (add.length) addClasses(node, add);
    delete node.properties.style;
  },
};

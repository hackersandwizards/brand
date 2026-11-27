/** github-dark's scopes, in its order, each under the --code-* role that colours it: the theme's
 *  structure stays, the colours are the brand's. Its function and variable colours take fg, its
 *  constants keyword. A role suffixed with /<style> sets that font style. */
const CODE_SCOPES: [string, string[]][] = [
  ["comment", ["comment", "punctuation.definition.comment", "string.comment"]],
  [
    "keyword",
    [
      "constant",
      "entity.name.constant",
      "variable.other.constant",
      "variable.other.enummember",
      "variable.language",
      "support",
      "meta.property-name",
      "string variable",
      "support.constant",
      "support.variable",
      "meta.module-reference",
      "markup.inline.raw",
      "meta.diff.header",
      "meta.output",
    ],
  ],
  ["fg", ["entity", "entity.name"]],
  [
    "fg",
    [
      "variable.parameter.function",
      "storage.modifier.package",
      "storage.modifier.import",
      "storage.type.java",
      "variable",
      "variable.other",
      "punctuation.definition.list.begin.markdown",
      "markup.changed",
      "punctuation.definition.changed",
      "brackethighlighter.tag",
      "brackethighlighter.curly",
      "brackethighlighter.round",
      "brackethighlighter.square",
      "brackethighlighter.angle",
      "brackethighlighter.quote",
    ],
  ],
  [
    "inserted",
    [
      "entity.name.tag",
      "markup.quote",
      "markup.inserted",
      "meta.diff.header.to-file",
      "punctuation.definition.inserted",
    ],
  ],
  ["keyword", ["keyword", "storage", "storage.type"]],
  [
    "string",
    [
      "string",
      "punctuation.definition.string",
      "string punctuation.section.embedded source",
      "source.regexp",
      "string.regexp",
      "string.regexp.character-class",
      "string.regexp constant.character.escape",
      "string.regexp source.ruby.embedded",
      "string.regexp string.regexp.arbitrary-repitition",
    ],
  ],
  [
    "deleted/italic",
    ["invalid.broken", "invalid.deprecated", "invalid.illegal", "invalid.unimplemented"],
  ],
  [
    "deleted",
    [
      "message.error",
      "markup.deleted",
      "meta.diff.header.from-file",
      "punctuation.definition.deleted",
      "brackethighlighter.unmatched",
    ],
  ],
  ["inserted/bold", ["string.regexp constant.character.escape"]],
  ["keyword/bold", ["markup.heading", "markup.heading entity.name", "meta.separator"]],
  ["fg/italic", ["markup.italic"]],
  ["fg/bold", ["markup.bold"]],
  ["fg/bold", ["meta.diff.range"]],
  ["string/underline", ["constant.other.reference.link", "string.other.link"]],
];

// A terminal's 16 ANSI colours on the code ground, each a core colour: Shiki's ansi language reads
// them. Normal and bright differ only where the brand has a lighter step.
const ANSI: [string, string][] = [
  ["Black", "night-subtle"],
  ["Red", "red-night"],
  ["Green", "green"],
  ["Yellow", "amber"],
  ["Blue", "teal-night"],
  ["Magenta", "purple-night"],
  ["Cyan", "teal-light"],
  ["White", "night-muted"],
  ["BrightBlack", "night-subtle"],
  ["BrightRed", "factory-light"],
  ["BrightGreen", "green"],
  ["BrightYellow", "amber"],
  ["BrightBlue", "teal-light"],
  ["BrightMagenta", "purple-light"],
  ["BrightCyan", "teal-light"],
  ["BrightWhite", "night-ink"],
];

/** The Shiki theme of the --code-* tokens, named hw-code. */
export const codeTheme = (tokens: Record<string, string>, colors: Record<string, string>) => {
  const code = (role: string) => {
    const value = tokens[`--code-${role}`];
    const hex = value?.startsWith("var(") ? colors[value.slice(4, -1)] : value;
    if (!hex)
      throw new Error(
        `--code-${role}: ${value} resolves to no colour for the Shiki theme. Set this role in tokens/tokens.css to a six-digit hex colour or a var() of a defined --color-* token.`,
      );
    return hex;
  };
  return {
    name: "hw-code",
    type: "dark",
    colors: {
      "editor.background": code("bg"),
      "editor.foreground": code("fg"),
      ...Object.fromEntries(ANSI.map(([k, c]) => [`terminal.ansi${k}`, colors[`--color-${c}`]])),
    },
    tokenColors: CODE_SCOPES.map(([role, scope]) => {
      const [name, fontStyle] = role.split("/");
      return { scope, settings: { foreground: code(name), ...(fontStyle && { fontStyle }) } };
    }),
  };
};

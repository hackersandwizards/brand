/** Utility families in dispatch order, with specific utilities before their broader families. */
const UTILITY_PROPERTIES: [RegExp, string[]][] = [
  [/^rounded(-|$)/, ["border-radius"]],
  [/^border(?!-(collapse|separate|spacing))(-|$)/, ["border"]],
  [
    /^bg-(?!(clip|origin|repeat|no-repeat|fixed|local|scroll|blend|cover|contain|auto|center|top|bottom|left|right))/,
    ["background"],
  ],
  [/^text-(left|center|right|justify|start|end)$/, ["text-align"]],
  [/^text-(xs|sm|base|lg|\d?xl|\[[\d.]+(px|r?em)\])$/, ["font-size"]],
  [/^text-(?!(wrap|nowrap|balance|pretty|ellipsis|clip)$)/, ["font-size", "color"]],
  [/^font-/, ["font"]],
  [/^leading-/, ["line-height"]],
  [/^tracking-/, ["letter-spacing"]],
  [/^(uppercase|lowercase|capitalize|normal-case)$/, ["text-transform"]],
  [/^min-h-/, ["min-height"]],
  [/^size-/, ["width", "height"]],
  [/^h-/, ["height"]],
  [/^w-/, ["width"]],
  [/^opacity-/, ["opacity"]],
];

const PADDING_SIDES: Record<string, string> = {
  "": "",
  x: "-inline",
  y: "-block",
  t: "-top",
  r: "-right",
  b: "-bottom",
  l: "-left",
  s: "-inline-start",
  e: "-inline-end",
};

/** The properties a Tailwind utility sets, as far as an element owns them: a state variant
 *  (hover:, focus:, ...) sets nothing at rest, a breakpoint, theme or print variant does. A text-*
 *  of a theme's own name may be a size or a colour, so it stands for both. */
export const utility = (token: string): string[] => {
  // Variants split at a colon outside an arbitrary value's brackets.
  const parts = token.split(/:(?![^[]*\])/);
  const name = parts.pop()!.replace(/^!|!$/g, "");
  if (parts.some((v) => !/^(sm|md|lg|xl|2xl|dark|print|motion-safe|(min|max)-.+|@.+)$/.test(v)))
    return [];
  const pad = /^p([xytrblse])?-/.exec(name);
  if (pad) return [`padding${PADDING_SIDES[pad[1] ?? ""]}`];
  return UTILITY_PROPERTIES.find(([pattern]) => pattern.test(name))?.[1] ?? [];
};

type StyleRule = { selectors: string[]; props: string[] };
type StyleBlock = { declarations: string; head: string; content: string; end: number };

/** The next complete block after a position, with preceding declarations kept for its parent. */
function nextStyleBlock(css: string, start: number): StyleBlock | undefined {
  const open = css.indexOf("{", start);
  if (open < 0) return;
  const before = css.slice(start, open);
  const cut = Math.max(before.lastIndexOf(";"), before.lastIndexOf("}")) + 1;
  let depth = 1;
  let end = open + 1;
  for (; end < css.length && depth; end++)
    depth += css[end] === "{" ? 1 : css[end] === "}" ? -1 : 0;
  return {
    head: before.slice(cut).trim(),
    declarations: before.slice(0, cut),
    content: css.slice(open + 1, end - 1),
    end,
  };
}

/** The selector scope inside a block: at-rules retain their parent's scope. */
function ruleSelectors(head: string, parents?: string[]) {
  if (head.startsWith("@")) return parents;
  const selectors = outside(head, ",").map((selector) => selector.trim());
  if (!parents) return selectors;
  return parents.flatMap((parent) =>
    selectors.map((selector) =>
      selector.includes("&") ? selector.replaceAll("&", parent) : `${parent} ${selector}`,
    ),
  );
}

/** Properties named by declarations and by Tailwind utilities in @apply. */
function declaredProperties(css: string) {
  return [
    ...[...css.matchAll(/(?:^|;)\s*([\w-]+)\s*:/g)].map((m) => m[1]!),
    ...[...css.matchAll(/@apply\s+([^;]+)/g)].flatMap((m) =>
      m[1]!.trim().split(/\s+/).flatMap(utility),
    ),
  ];
}

/** Walks style scopes inside out, keeping each scope's declarations with its own selectors. */
function* styleRules(css: string, selectors?: string[]): Generator<StyleRule> {
  let own = "";
  let at = 0;
  for (let block = nextStyleBlock(css, at); block; block = nextStyleBlock(css, at)) {
    own += block.declarations;
    yield* styleRules(block.content, ruleSelectors(block.head, selectors));
    at = block.end;
  }
  const props = declaredProperties(own + css.slice(at));
  if (selectors && props.length) yield { selectors, props };
}

/** Each rule's selectors and the properties it sets, @apply utilities as the properties they stand
 *  for, at-rule blocks opened and nested rules (SCSS, CSS nesting) resolved against their parent's
 *  selectors. */
export const rules = (css: string) => [...styleRules(css.replace(/\/\*[\s\S]*?\*\//g, ""))];

/** The parts of a selector split at the characters `seps`, outside any parentheses. */
export const outside = (selector: string, seps: string) => {
  const out = [""];
  let depth = 0;
  for (const ch of selector) {
    depth += ch === "(" ? 1 : ch === ")" ? -1 : 0;
    if (depth === 0 && seps.includes(ch)) out.push("");
    else out[out.length - 1] += ch;
  }
  return out.filter((x) => x.trim());
};

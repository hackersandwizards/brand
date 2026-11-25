// What each element (and each part, "<element> <part>") sets, and so what is compared: a property
// the element leaves to its surroundings, such as a card's text size, stays the surface's.
const CORNER = [
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
];
const FILL = ["background-color", "background-image"];
const SIDES = ["top", "right", "bottom", "left"];
const borders = (sides = SIDES) =>
  sides.flatMap((x) => [`border-${x}-width`, `border-${x}-style`, `border-${x}-color`]);
const PAD = SIDES.map((x) => `padding-${x}`);
const TYPE = [
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "text-transform",
];
const INLINE_CODE = [
  ...CORNER,
  ...FILL,
  ...PAD,
  "font-family",
  "font-size",
  "font-weight",
  "font-variant-ligatures",
];
// A length marked ":em" compares in em of the element's own font size, which the element leaves to
// its surface.
const LINK = [
  "align-items",
  "column-gap:em",
  "color",
  "text-decoration-line",
  "text-decoration-thickness",
  "text-underline-offset:em",
];
const CHECK = ["width", "height", "scale", "mask-image", ...CORNER, ...FILL, ...borders()];
export const OWNS: Record<string, string[]> = {
  label: [...TYPE, "color"],
  "label-box": [...CORNER, ...FILL, ...borders(), ...PAD],
  pill: [...CORNER, ...FILL, ...borders(), ...PAD, ...TYPE, "color"],
  "pill .hw-pill-chevron": ["width", "height", "color"],
  "pill .hw-pill-remove": ["width", "height", "color"],
  card: [...CORNER, ...FILL, ...borders(), ...PAD],
  callout: [...CORNER, ...FILL, ...borders(["left"]), ...PAD, "font-weight"],
  quote: [...borders(["left"]), "padding-left", "color"],
  table: ["font-size", "line-height"],
  "table th": [...borders(["bottom"]), ...PAD, ...TYPE, "color", "text-align", "vertical-align"],
  "table td": [...borders(["bottom"]), ...PAD, "text-align", "vertical-align"],
  link: LINK,
  "link :scope > svg": ["width:em", "height:em", "align-self"],
  "focus-ring": ["outline-style", "outline-width", "outline-color", "outline-offset"],
  "icon-button": ["width", "height", ...CORNER, ...FILL, ...PAD, "color"],
  "icon-button svg": ["width", "height"],
  strip: ["height", ...FILL],
  rule: ["height", ...FILL],
  code: [...CORNER, ...FILL, ...PAD, ...TYPE, "color"],
  "inline-code": INLINE_CODE,
  kbd: [...CORNER, ...FILL, ...borders(), ...PAD, ...TYPE, "color"],
  button: [...CORNER, ...FILL, ...borders(), ...PAD, ...TYPE, "color", "min-height"],
  "arrow-link": ["color", "text-decoration-line", "padding-top", "padding-bottom"],
  "arrow-link .hw-arrow": ["white-space", "font-family"],
  field: [
    ...CORNER,
    ...FILL,
    ...borders(),
    "padding-left",
    "padding-right",
    "font-family",
    "font-size",
    "color",
    "min-height",
  ],
  check: CHECK,
  "form-field": ["display", "row-gap"],
  "form-field .hw-form-label": ["font-size", "font-weight", "line-height"],
  "form-field :scope > label:has(> .hw-check)": [
    "display",
    "column-gap",
    "font-size",
    "line-height",
    "padding-top",
    "padding-bottom",
  ],
  "form-field .hw-form-mark": ["font-weight", "color"],
  "form-field .hw-form-hint": ["font-size", "line-height", "color"],
  "form-field .hw-form-error": ["font-size", "font-weight", "line-height", "color", "padding-left"],
  "form-field .hw-form-warning": ["font-size", "font-weight", "color", "padding-left"],
  "form-field .hw-form-success": ["font-size", "font-weight", "color", "padding-left"],
  "form-field .hw-form-count": ["font-size", "font-weight", "color"],
  "form-field .hw-form-float > .hw-field": ["min-height", "padding-top", "padding-bottom"],
  switch: ["width", "height", ...CORNER, ...FILL, ...borders()],
  range: ["height", "font-size", ...FILL],
  "error-summary": [...CORNER, ...borders(), ...PAD, "font-size", "line-height"],
  "error-summary .hw-error-summary-title": ["font-weight"],
  "error-summary a": ["color", "font-weight", "text-decoration-line"],
  dialog: [...CORNER, ...borders(), ...PAD, ...FILL],
  drawer: [...CORNER, ...borders(), ...PAD, ...FILL],
  menu: [...CORNER, ...borders(), ...FILL, "font-size"],
  "menu .hw-menu-item": ["min-height", ...CORNER, "font-size"],
  popover: [...CORNER, ...borders(), ...PAD, ...FILL, "font-size"],
  tooltip: [...CORNER, ...PAD, ...FILL, "color", "font-size"],
  command: [...CORNER, ...borders(), ...FILL],
  "command .hw-command-option": ["min-height", ...CORNER],
  toast: [...CORNER, ...borders(), ...FILL, ...PAD, "font-size", "font-weight"],
  tabs: [...borders(["bottom"])],
  "tabs .hw-tab": ["min-height", "font-size", "font-weight", ...borders(["bottom"])],
  progress: ["height", ...CORNER],
  spinner: ["width", "height", ...CORNER, ...borders()],
  skeleton: [...CORNER],
  empty: [...CORNER, ...borders(), ...PAD],
  "empty .hw-empty-title": ["font-size", "font-weight"],
  accordion: [...borders(["top"]), "font-size"],
  "accordion summary": ["min-height", "font-weight"],
  avatar: ["width", "height", ...CORNER, "font-family", "font-weight"],
  pagination: ["font-size"],
  "pagination a": ["min-height", ...CORNER, "color"],
  stepper: ["font-size"],
  tree: ["font-size"],
  "tree .hw-tree-row": ["min-height", ...CORNER],
  carousel: ["display"],
  "carousel .hw-carousel-track": ["overflow-x", "scroll-snap-type"],
  "carousel .hw-carousel-tray": [...CORNER, ...FILL],
  facts: ["margin-top", "margin-bottom"],
  "dot-list": ["flex-wrap", "align-items", "margin-left"],
  "facts div": ["display", "row-gap", ...borders(["top"]), "padding-top", "padding-bottom"],
  "facts dd": ["margin-left"],
  segmented: [...CORNER, ...FILL, ...borders(), ...PAD, "font-size"],
  "segmented a": [...CORNER, ...FILL, ...PAD, "color"],
  "segmented button": [...CORNER, ...FILL, ...PAD, "color"],
  row: ["display", ...FILL, ...borders(["bottom"]), ...PAD, "column-gap"],
  "row .hw-row-stripe": ["align-self"],
  "row .hw-row-trail": ["font-size", "color", "white-space"],
  nav: ["font-size", "line-height"],
  "nav a": [...CORNER, ...FILL, ...PAD, "font-weight", "color", "text-decoration-line"],
  "nav summary": [...CORNER, ...FILL, ...PAD, "font-weight", "color"],
  "nav .hw-nav-count": ["color", "font-variant-numeric"],
  "nav .hw-nav-group": ["padding-left", "padding-right", "margin-bottom"],
  "nav :is(ul, ol) + .hw-nav-group": ["margin-top"],
  "nav :is(ul, ol) :is(ul, ol)": [...borders(["left"]), "padding-left", "margin-left"],
  choice: [
    ...CORNER,
    ...FILL,
    ...borders(),
    "padding-left",
    "padding-right",
    "font-size",
    "color",
    "min-height",
  ],
  "choice .hw-choice-count": ["opacity", "font-variant-numeric"],
  search: ["position"],
  breadcrumb: ["font-size", "color"],
  "breadcrumb a": ["color", "text-decoration-line"],
  disclosure: [],
  // The marker's removal and the count pill: the summary's layout, type and colour are the surface's.
  "disclosure summary": ["list-style-type"],
  "disclosure .hw-disclosure-count": [...CORNER, ...FILL, "font-family"],
  status: [...CORNER, ...FILL, ...borders(), ...PAD],
  frame: [...CORNER, ...FILL, ...borders()],
  kpi: ["display", "flex-direction", "row-gap"],
  "kpi .hw-kpi-value": [
    "font-family",
    "font-size",
    "font-weight",
    "line-height",
    "letter-spacing",
    "font-variant-numeric",
  ],
  prose: ["overflow-wrap", "max-width"],
  "prose h1": ["font-size", "line-height"],
  "prose h2": [...borders(["top"]), "padding-top", "font-size", "line-height"],
  "prose h3": ["font-size", "font-weight", "line-height"],
  "prose :not(pre) > code": INLINE_CODE,
  // Typography's own link weight and list indent come in a later layer than the hub elements.
  "prose a:not(.not-prose, .not-prose *)": [...LINK, "font-weight"],
  "prose ul:not(.not-prose, .not-prose *)": ["padding-left"],
  "prose ol:not(.not-prose, .not-prose *)": ["padding-left"],
  "prose li.task-list-item input": CHECK,
};

const LOGICAL: Record<string, string[]> = {
  block: ["top", "bottom"],
  inline: ["left", "right"],
  "block-start": ["top"],
  "block-end": ["bottom"],
  "inline-start": ["left"],
  "inline-end": ["right"],
};
/** The physical properties a gap, flex-flow or logical property stands for, else the property. */
const physical = (prop: string) => {
  if (prop === "gap") return ["row-gap", "column-gap"];
  if (prop === "flex-flow") return ["flex-direction", "flex-wrap"];
  if (/^border-(start|end)-(start|end)-radius$/.test(prop)) return ["border-radius"];
  const m = /^(padding|margin|border)-(block|inline)(-start|-end)?(-width|-style|-color)?$/.exec(
    prop,
  );
  return m ? LOGICAL[m[2]! + (m[3] ?? "")]!.map((side) => `${m[1]}-${side}${m[4] ?? ""}`) : [prop];
};
/** Whether a declared property, a shorthand or logical one included, sets one the element owns. */
export const setsOwned = (element: string, declared: string) =>
  physical(declared).some((prop) =>
    OWNS[element]!.map((q) => q.replace(/:em$/, "")).some(
      (q) =>
        q === prop ||
        q.startsWith(`${prop}-`) ||
        (prop === "border-radius" && q.endsWith("-radius")) ||
        (/^border-(width|style|color)$/.test(prop) && q.endsWith(prop.slice(6))),
    ),
  );

export type ElementStyleRules = {
  own: string[];
  parts: { selector: string; properties: string[] }[];
};

/** Property rules indexed by element so each instance reads only its own parts. */
export function elementStyleRules(owned: Record<string, string[]>) {
  const rules: Record<string, ElementStyleRules> = {};
  for (const [key, properties] of Object.entries(owned)) {
    const [element, ...rest] = key.split(" ");
    const entry = (rules[element] ??= { own: [], parts: [] });
    if (rest.length) entry.parts.push({ selector: rest.join(" "), properties });
    else entry.own = properties;
  }
  return rules;
}

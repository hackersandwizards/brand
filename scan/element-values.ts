export type ElementStyleRules = {
  own: string[];
  parts: { selector: string; properties: string[] }[];
};

export type StyleSnapshot = Record<string, string>;

export type ComputedStylePair = {
  element: string;
  label: string;
  actual: StyleSnapshot;
  reference: StyleSnapshot;
  properties: string[];
};

export type StyleDifference = Pick<ComputedStylePair, "element" | "label"> & {
  prop: string;
  got: string;
  want: string;
};

/** The length of a computed value in CSS pixels, when the browser reports px. */
function pixelValue(value: string) {
  return /^-?[\d.]+px$/.test(value) ? parseFloat(value) : null;
}

// A length in em compares within the tolerance at 16 px.
function referencePixels(value: string) {
  return pixelValue(value) ?? (/^-?[\d.]+em$/.test(value) ? parseFloat(value) * 16 : null);
}

// One colour, one text: a build that rewrites color-mix() (Lightning CSS) leaves rgba() where the
// reference computes color(srgb ...), so each colour reads as rgba() of whole channels.
function comparableColour(value: string) {
  return value.replace(
    /rgba?\(([^)]*)\)|color\(srgb ([^)]*)\)/g,
    (match, rgb?: string, srgb?: string) => {
      const n = (rgb ?? srgb)!
        .split(/[\s,/]+/)
        .filter(Boolean)
        .map(parseFloat);
      if (n.length < 3 || n.some(Number.isNaN)) return match;
      const k = srgb ? 255 : 1;
      const [r, g, b] = n.slice(0, 3).map((c) => Math.round(c * k));
      return `rgba(${r}, ${g}, ${b}, ${Math.round((n[3] ?? 1) * 100) / 100})`;
    },
  );
}

/** Style values compare by length tolerance or by their normalised text. */
function sameStyleValue(got: string, want: string, tolerance: number) {
  const [x, y] = [referencePixels(got), referencePixels(want)];
  return x !== null && y !== null
    ? Math.abs(x - y) <= tolerance
    : comparableColour(got) === comparableColour(want);
}

/** The border side whose width determines whether a style or colour is visible. */
function borderSide(prop: string) {
  return /^(border-[a-z]+)-(style|color)$/.exec(prop)?.[1];
}

/** The computed values of `list` on `x`, with the width of each border side it names; a
 *  property marked ":em" in em of x's font size. */
function snapshotStyles(x: Element, list: string[]): StyleSnapshot {
  const g = getComputedStyle(x);
  const props = list.flatMap((prop) => {
    const side = borderSide(prop);
    return side ? [prop, `${side}-width`] : [prop];
  });
  return Object.fromEntries(
    props.map((prop) => {
      const value = g.getPropertyValue(prop.replace(/:em$/, ""));
      const px = pixelValue(value);
      const read =
        prop.endsWith(":em") && px !== null
          ? `${+(px / parseFloat(g.fontSize)).toFixed(4)}em`
          : value;
      return [prop, read];
    }),
  );
}

/** Differences between the measured styles of an element or part and its brand reference. */
export function diffElementStyles(
  { element, label, actual, reference, properties }: ComputedStylePair,
  tolerance: number,
): StyleDifference[] {
  const findings: StyleDifference[] = [];
  for (const prop of properties) {
    // A border of no width draws nothing, so its style and colour are no difference (Tailwind's
    // preflight gives every element a solid zero-width border the reference has as none).
    const side = borderSide(prop);
    if (side && actual[`${side}-width`] === "0px" && reference[`${side}-width`] === "0px") continue;
    const got = actual[prop]!;
    const want = reference[prop]!;
    if (!sameStyleValue(got, want, tolerance))
      findings.push({ element, label, prop: prop.replace(/:em$/, ""), got, want });
  }
  return findings;
}

export type ElementStyles = {
  snapshot: typeof snapshotStyles;
  diff: typeof diffElementStyles;
};

/** Declares style readers in the browser's private measurement scope. */
export const elementStyleFunctions = [
  pixelValue,
  referencePixels,
  comparableColour,
  sameStyleValue,
  borderSide,
  snapshotStyles,
  diffElementStyles,
];

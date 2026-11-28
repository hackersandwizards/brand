import type { StyleDifference } from "./element-values";

export type CornerFinding = { element: string; label: string } & StyleDifference;

declare function elementLabel(el: Element): string;

/** Whether the computed corners have the brand's large and small diagonals. */
function hasBrandCorner(el: Element) {
  const g = getComputedStyle(el);
  const [tl, tr, br, bl] = [
    g.borderTopLeftRadius,
    g.borderTopRightRadius,
    g.borderBottomRightRadius,
    g.borderBottomLeftRadius,
  ].map(parseFloat);
  return tl > tr && tl === br && tr === bl;
}

// Corner rules over every element of the page (a closed panel, html and body too), before any
// reference: no brand corner inside an internal surface ([data-hw-surface="internal"], unless
// inside a nested print or stage subtree), none on a repeated item (--_hw-repeated-corner or
// [data-hw-repeat]), and none inside another brand corner. [data-hw-exception] is still checked.
export function nestedCornerFindings(): CornerFinding[] {
  const branded = new Set(
    [document.documentElement, document.body, ...document.querySelectorAll("body *")].filter(
      hasBrandCorner,
    ),
  );
  const findings: CornerFinding[] = [];
  for (const el of branded) {
    if (el.closest("[data-hw-reference], [data-hw-shell]")) continue;
    const scope = el.closest(
      '[data-hw-surface="internal"], [data-hw-scale="print"], [data-hw-scale="stage"]',
    );
    if (scope?.getAttribute("data-hw-surface") === "internal") {
      findings.push({
        element: "corner",
        label: elementLabel(el),
        prop: "border-radius",
        got: "the brand corner on an internal surface",
        want: "the small corner",
      });
      continue;
    }
    if (
      getComputedStyle(el).getPropertyValue("--_hw-repeated-corner").trim() === "1" ||
      el.closest("[data-hw-repeat]")
    ) {
      findings.push({
        element: "corner",
        label: elementLabel(el),
        prop: "border-radius",
        got: "the brand corner on a repeated item",
        want: "the small corner",
      });
      continue;
    }
    for (let p = el.parentElement; p; p = p.parentElement)
      if (branded.has(p)) {
        findings.push({
          element: "corner",
          label: elementLabel(el),
          prop: "border-radius",
          got: `the brand corner inside ${elementLabel(p)}`,
          want: "the small corner",
        });
        break;
      }
  }
  return findings;
}

/** Declares corner readers in the browser's private measurement scope. */
export const elementCornerFunctions = [hasBrandCorner, nestedCornerFindings];

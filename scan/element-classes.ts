import { rules } from "./element-stylesheet";

/** Every class other than an hw-* one that brand's stylesheets define or once defined: a page
 * using one, or an hw-* class, that no loaded stylesheet defines shows it unstyled. */
export const BRAND_CLASSES = [
  "btn-primary",
  "btn-secondary",
  "chip-link",
  "chip-link-muted",
  "chip-remove",
  "filter-chip",
  "form-input",
  "page-subtitle",
  "page-title",
  "page-title-action",
  "page-title-lead",
  "page-title-row",
  "rounded-brand",
  "theme-switching",
];
export const isBrandClass = (c: string) => c.startsWith("hw-") || BRAND_CLASSES.includes(c);

/** Reports the first use of each brand class absent from the loaded stylesheet definitions. */
export function unstyledBrandClasses(
  used: ReadonlyMap<string, string>,
  defined: ReadonlySet<string>,
) {
  return [...used]
    .filter(([cls]) => isBrandClass(cls) && !defined.has(cls))
    .map(([cls, label]) => ({ cls, label }));
}

/** The classes a stylesheet's rules name, anywhere in a selector but inside :not(). */
export const definedClasses = (css: string) =>
  rules(css).flatMap((r) =>
    r.selectors.flatMap((sel) => {
      let s = sel;
      for (let i = s.indexOf(":not("); i >= 0; i = s.indexOf(":not(")) {
        let j = i + 5;
        for (let depth = 1; depth && j < s.length; j++)
          depth += s[j] === "(" ? 1 : s[j] === ")" ? -1 : 0;
        s = s.slice(0, i) + s.slice(j);
      }
      return [...s.matchAll(/\.((?:\\.|[\w-])+)/g)].map(([, cls]) => cls.replace(/\\(.)/g, "$1"));
    }),
  );

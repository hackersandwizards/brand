// An SVG <image> loads even inside a hidden section, so the merch and device mockups (1.9 MB of
// print files) name theirs in data-href, and show() sets href once their section opens.
export const deferImages = (svg: string) =>
  svg.replace(/(<image\b[^>]*?\s)href="/g, '$1data-href="');

// An SVG inlined more than once keeps its internal ids unique on the page: each one takes a prefix.
export const scopeIds = (svg: string, prefix: string) =>
  svg.replace(/(id="|url\(#|href="#)([^")]+)/g, `$1${prefix}-$2`);

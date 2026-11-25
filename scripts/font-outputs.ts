import { readFileSync } from "node:fs";
import { join } from "node:path";
import { declarations } from "./css-declarations";
import { ROOT } from "./git";

const FONT_FACE = /@font-face\s*\{([^}]*)\}/g;
/** The @font-face matches of a stylesheet, a face commented out left out. */
const faces = (css: string) => [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(FONT_FACE)];
/** The @font-face rules of a stylesheet, as written. */
export const faceRules = (css: string) => faces(css).map(([face]) => face);
/** A src of local() fonts alone: a fallback face. A src mixing local() and url() is no fallback. */
const LOCAL = /src:(?:\s*local\("[^"]+"\),?)+;/;

/** The fallback faces of fonts.css, as written. */
export const fallbackFaces = (css: string) => faceRules(css).filter((face) => LOCAL.test(face));

/** The @font-face rules of fonts.css (or print.css), each descriptor camel-cased (fontFamily
 *  unquoted, unicodeRange unspaced), src as the file under ./fonts/ and its format. A face without
 *  unicodeRange takes every character. A fallback face (a src of local() fonts alone) is left
 *  out: fallbackData lists those. */
export const fontFaces = (css: string) =>
  faces(css)
    .filter(([face]) => !LOCAL.test(face))
    .map(([, body]): Record<string, string> => {
      const { src, ...rest } = declarations(body);
      const [, file, format] = src.match(/url\("fonts\/([^"]+)"\) format\("([^"]+)"\)/)!;
      return { file, format, ...camelCased(rest) };
    });

/** fonts.css's fallback faces as data, descriptors as fontFaces gives them, src as the local font
 *  names in order. */
const fallbackData = (css: string) =>
  faces(css)
    .filter(([face]) => LOCAL.test(face))
    .map(([, body]): Record<string, string | string[]> => {
      const { src, ...rest } = declarations(body);
      return {
        local: [...src.matchAll(/local\("([^"]+)"\)/g)].map((m) => m[1]),
        ...camelCased(rest),
      };
    });

/** @font-face descriptors camel-cased, fontFamily unquoted, unicodeRange unspaced. */
const camelCased = (descriptors: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(descriptors).map(([k, v]) => [
      k.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()),
      k === "font-family"
        ? v.replace(/^"|"$/g, "")
        : k === "unicode-range"
          ? v.replace(/ /g, "")
          : v,
    ]),
  );

/** The sans and mono stacks of the mail signature template, the fonts a mail client shows with no
 *  web font. Throws where the template carries no such pair, or a third stack. */
const mailStacks = () => {
  const html = readFileSync(join(ROOT, "applications/mail-signature/template.html"), "utf8");
  const stacks = [...html.replaceAll("&quot;", '"').matchAll(/font-family:\s*([^;]+);/g)].map((m) =>
    m[1]!.trim(),
  );
  const sans = stacks.find((s) => s.endsWith("sans-serif"));
  const mono = stacks.find((s) => s.endsWith("monospace"));
  if (!sans || !mono || stacks.some((s) => s !== sans && s !== mono))
    throw new Error(
      "mail-signature/template.html: every font-family is one sans or one mono stack",
    );
  return { sans, mono };
};

/** generated/font-faces.ts: fonts.css's rules, as written, in a function of the font files' url. */
const fontFaceModule = (screen: string) => {
  const rulesByFace = faceRules(screen);
  const rules = rulesByFace.join("\n\n");
  if (rules.match(/url\(/g)?.length !== rules.match(/url\("fonts\/[^"]+"\)/g)?.length)
    throw new Error('tokens/fonts.css: a url() not written url("fonts/<file>")');
  return `// Generated from tokens/fonts.css by scripts/tokens.ts. Edit the source, never this file.

const FACES = ${JSON.stringify(rulesByFace, null, 2)} as const;

/** fonts.css's @font-face rules, its web faces and fallback faces with every descriptor, for a
 *  surface that serves the font files from its own path: each file's url is \`base\` followed by the
 *  file name, or what \`base\` returns for the file name, such as a data: URL. */
export const fontFaceRules = (base: string | ((file: string) => string)) => {
  const url = typeof base === "string" ? (file: string) => base + file : base;
  return FACES.map((face) =>
    face.replace(/url\\("fonts\\/([^"]+)"\\)/g, (_, file: string) => \`url("\${url(file)}")\`),
  ).join("\\n\\n");
};

/** The font files to preload: the web faces without unicode-range, which every page draws. A
 *  surface preloads each at the url its fontFaceRules base gives the file. */
export const preloadFiles = ${JSON.stringify(
    fontFaces(screen)
      .filter((face) => !face.unicodeRange)
      .map((face) => face.file),
  )} as const;
`;
};

/** The data, web module and standalone stylesheets for the screen and print faces. */
export const fontOutputs = (screen: string, print: string) => {
  const fallbacks = fallbackFaces(screen);
  return {
    "fonts.json":
      JSON.stringify(
        { faces: fontFaces(screen), fallbacks: fallbackData(screen), mail: mailStacks() },
        null,
        2,
      ) + "\n",
    "font-faces.ts": fontFaceModule(screen),
    "static-fonts.css": `/* Generated from tokens/print.css and tokens/fonts.css by scripts/tokens.ts. Edit the
   sources, never this file. print.css's static faces without the print scale (static files, never
   variable ones, so Chrome embeds real glyphs in a PDF), then fonts.css's fallback faces.
   Import it as @hackersandwizards/brand/static-fonts.css. */
${faceRules(print)
  .map((face) => face.replaceAll('url("fonts/', 'url("../tokens/fonts/'))
  .concat(fallbacks)
  .join("\n\n")}
`,
    "fallback-faces.css": `/* Generated from tokens/fonts.css by scripts/tokens.ts. Edit the source, never this file.
   fonts.css's fallback faces alone, the local fonts its stacks name after each web face, which
   print.css imports so a printed page whose face is missing a character, or fails to load, keeps
   the web face's widths. */
${fallbacks.join("\n\n")}
`,
  };
};

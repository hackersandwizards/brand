import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import i from "../verbal/imprint.json";
import { join } from "node:path";
import { EXAMPLE, fillSignature } from "../applications/mail-signature/fill";
import { colors } from "../generated/tokens";
import { ROOT } from "../scripts/git";

const template = (ext: string) =>
  readFileSync(join(ROOT, "applications/mail-signature", `template.${ext}`), "utf-8");
const GMBH = "HRB&nbsp;198840";

test("an h&w account carries wordmark, contact line (phone, website, LinkedIn) and the GmbH lines", () => {
  const html = fillSignature(template("html"), EXAMPLE, "html");
  expect(html).toContain(">hackers</span>");
  expect(html).toContain(GMBH);
  expect(html).toContain('href="tel:+494012345678"');
  expect(html).not.toContain("{{");
  expect(html).not.toContain("mailto:");
  const links = [...html.matchAll(/<a\s+href="([^"]+)"/g)].map((m) => m[1]);
  expect(links).toEqual([
    "tel:+494012345678",
    "https://www.hackersandwizards.dev/",
    "https://www.linkedin.com/in/kim-beispiel",
  ]);
  // A web link is underlined, so it reads as a link without its colour; the phone number is not.
  const decoration = [...html.matchAll(/<a\s[^>]*>/g)].map(
    (m) => m[0].match(/text-decoration: (\w+)/)?.[1],
  );
  expect(decoration).toEqual(["none", "underline", "underline"]);
  expect(fillSignature(template("txt"), EXAMPLE, "text")).toBe(
    "Kim Beispiel\nFreie Trainerin, hackers&wizards\n+49 40 1234 5678 | hackersandwizards.dev | linkedin.com/in/kim-beispiel\n\nhackers&wizards GmbH, Sitz Hamburg, Osterstraße 95, 20259 Hamburg\nAmtsgericht Hamburg, HRB 198840\nGeschäftsführer: Benedikt Stemmildt, Stefan Munz\n",
  );
});

test("a value is escaped and an unknown field fails", () => {
  expect(fillSignature("{{name}}", { name: '<b>"x"</b>', role: "" }, "html")).toBe(
    "&#60;b&#62;&#34;x&#34;&#60;/b&#62;",
  );
  expect(() => fillSignature("{{nmae}}", EXAMPLE, "html")).toThrow("unknown field");
});

test("the tel link drops a trunk zero written as (0)", () => {
  const html = fillSignature(
    template("html"),
    { ...EXAMPLE, phone: "+49 (0)40 1234 5678" },
    "html",
  );
  expect(html).toContain('href="tel:+494012345678"');
});

test("a character outside the BMP is one numeric reference, not two surrogate halves", () => {
  expect(fillSignature("{{role}}", { name: "x", role: "a😀" }, "html")).toBe("a&#128512;");
});

test("the LinkedIn field takes only an https: URL", () => {
  for (const linkedin of [
    "javascript:alert(1)",
    "data:text/html,x",
    "http://linkedin.com/in/x",
    "linkedin.com/in/x",
  ])
    expect(() => fillSignature(template("html"), { ...EXAMPLE, linkedin }, "html")).toThrow(
      "https: URL",
    );
});

test("trims pasted contact details and prints a LinkedIn address without its scheme", () => {
  const fields = {
    name: "  Example Person ",
    role: " Engineer  ",
    phone: "  +49 40 1234 5678  ",
    linkedin: "  https://linkedin.com/in/example  ",
  };
  const text = fillSignature(template("txt"), fields, "text");
  expect(text.split("\n").slice(0, 3)).toEqual([
    "Example Person",
    "Engineer, hackers&wizards",
    "+49 40 1234 5678 | hackersandwizards.dev | linkedin.com/in/example",
  ]);
  expect(text).toMatch(/\S\n$/);
  expect(fillSignature(template("html"), fields, "html")).toContain(
    'href="https://linkedin.com/in/example"',
  );
});

test("leaves only the website when the phone and LinkedIn fields are blank or absent", () => {
  const fields = { name: "Example Person", role: "Engineer" };
  for (const optional of [fields, { ...fields, phone: "  ", linkedin: "  " }]) {
    const text = fillSignature(template("txt"), optional, "text");
    const html = fillSignature(template("html"), optional, "html");
    expect(text.split("\n")[2]).toBe("hackersandwizards.dev");
    expect([...html.matchAll(/<a\s+href="([^"]+)"/g)].map((match) => match[1])).toEqual([
      "https://www.hackersandwizards.dev/",
    ]);
  }
});

test("an accented name stays plain in text and is escaped in HTML", () => {
  const custom = "\n  {{name}}{{#tel}} ({{tel}}){{/tel}}\n\n";
  const fields = { name: "Joël & Co.", role: "Engineer" };
  expect(fillSignature(custom, fields, "text")).toBe("Joël & Co.\n");
  expect(fillSignature(custom, fields, "html")).toBe("\n  Jo&#235;l &#38; Co.\n\n");
});

// ISO 3166-1 alpha-2, for a form's country field or structured data.
test("the imprint names its country's ISO code", () => {
  expect(i.countryCode).toBe("DE");
});

// The imprint's one source is verbal/imprint.json; the template writes it out for mail clients.
test("both templates' GmbH lines state imprint.json", () => {
  const lines = `Sitz ${i.seat}, ${i.street}, ${i.postcode} ${i.city}\n${i.court}, ${i.register}\nGeschäftsführer: ${i.managingDirectors.join(", ")}`;
  expect(template("txt")).toContain(`${lines}\n`);
  const entities: Record<string, string> = {
    nbsp: " ",
    szlig: "ß",
    auml: "ä",
    uuml: "ü",
    amp: "&",
  };
  const html = template("html")
    .replace(/<br \/>/g, " ")
    .replace(/&(\w+);/g, (e, name: string) => entities[name] ?? e)
    .replace(/\s+/g, " ");
  expect(html).toContain(lines.replace(/\n/g, " "));
});

// A mail cannot read a token, so the template types its colours: each one is a brand colour.
test("every colour the template types is a token colour", () => {
  const tokenHexes = new Set(Object.values(colors).map((c) => c.toLowerCase()));
  const typed = readFileSync(join(ROOT, "applications/mail-signature/template.html"), "utf8")
    .match(/#[0-9a-f]{6}\b/gi)!
    .map((c) => c.toLowerCase());
  expect(typed.length).toBeGreaterThan(0);
  expect(typed.filter((c) => !tokenHexes.has(c))).toEqual([]);
});

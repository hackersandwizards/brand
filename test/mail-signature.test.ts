import { beforeAll, describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import i from "../verbal/imprint.json";
import { join } from "node:path";
import { EXAMPLE, fillSignature, signatureValues } from "../applications/mail-signature/fill";
import { colors } from "../generated/tokens";
import { ROOT } from "../scripts/git";

const template = (ext: string) =>
  readFileSync(join(ROOT, "applications/mail-signature", `template.${ext}`), "utf-8");
const GMBH = "HRB&nbsp;198840";

describe("the HTML signature for an h&w account", () => {
  let html: string;

  beforeAll(() => {
    html = fillSignature(template("html"), EXAMPLE, "html");
  });

  test("includes the account wordmark", () => {
    expect(html).toContain(">hackers</span>");
  });

  test("includes the GmbH register number", () => {
    expect(html).toContain(GMBH);
  });

  test("renders the international phone href", () => {
    expect(html).toContain('href="tel:+494012345678"');
  });

  test("resolves all template placeholders", () => {
    expect(html).not.toContain("{{");
  });

  test("omits an email link from the contact line", () => {
    expect(html).not.toContain("mailto:");
  });

  test("links the phone, website and LinkedIn, underlining the web links", () => {
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
  });
});

test("renders the full plain-text contact line and GmbH imprint", () => {
  expect(fillSignature(template("txt"), EXAMPLE, "text")).toBe(
    "Kim Beispiel\nFreie Trainerin, hackers&wizards\n+49 40 1234 5678 | hackersandwizards.dev | linkedin.com/in/kim-beispiel\n\nhackers&wizards GmbH, Sitz Hamburg, Osterstraße 95, 20259 Hamburg\nAmtsgericht Hamburg, HRB 198840\nGeschäftsführer: Benedikt Stemmildt, Stefan Munz\n",
  );
});

test("a prototype name is an unknown template field", () => {
  expect(() => fillSignature("{{__proto__}}", EXAMPLE, "html")).toThrow(
    "mail signature: unknown field {{__proto__}}",
  );
});

test("the tel link drops a trunk zero written as (0)", () => {
  const html = fillSignature(
    template("html"),
    { ...EXAMPLE, phone: "+49 (0)40 1234 5678" },
    "html",
  );
  expect(html).toContain('href="tel:+494012345678"');
});

test("a character outside the BMP is one numeric reference", () => {
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
  const street = i.street.replaceAll("ß", "&szlig;").split(" ").join("&nbsp;");
  const register = i.register.split(" ").join("&nbsp;");
  const html = `Sitz ${i.seat}, ${street}, ${i.postcode}&nbsp;${i.city}<br />${i.court}, ${register}<br />Gesch&auml;ftsf&uuml;hrer: ${i.managingDirectors.join(", ")}`;
  expect(template("html").replace(/\s+/g, " ")).toContain(html);
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

describe("normalized signature fields", () => {
  test.each([
    {
      name: "pasted contact details",
      input: {
        name: " A Person ",
        role: " Trainer ",
        phone: " +49 (0)40 12 34 ",
        linkedin: " https://www.linkedin.com/in/person ",
      },
      values: {
        name: "A Person",
        role: "Trainer",
        phone: "+49 (0)40 12 34",
        tel: "+49401234",
        linkedin: "https://www.linkedin.com/in/person",
        linkedinShort: "linkedin.com/in/person",
      },
    },
    {
      name: "absent optional fields",
      input: { name: "A Person", role: "Trainer" },
      values: {
        name: "A Person",
        role: "Trainer",
        phone: "",
        tel: "",
        linkedin: "",
        linkedinShort: "",
      },
    },
    {
      name: "blank optional fields",
      input: { name: "A Person", role: "Trainer", phone: " ", linkedin: " " },
      values: {
        name: "A Person",
        role: "Trainer",
        phone: "",
        tel: "",
        linkedin: "",
        linkedinShort: "",
      },
    },
    {
      name: "an HTTPS URL without www",
      input: { name: "A Person", role: "Trainer", linkedin: "https://linkedin.com/in/person" },
      values: {
        name: "A Person",
        role: "Trainer",
        phone: "",
        tel: "",
        linkedin: "https://linkedin.com/in/person",
        linkedinShort: "linkedin.com/in/person",
      },
    },
  ])("normalizes $name", ({ input, values }) => {
    expect(signatureValues(input)).toEqual(values);
  });

  test.each([
    "http://linkedin.com/in/person",
    "linkedin.com/in/person",
    "javascript:alert(1)",
    "data:text/html,x",
  ])("rejects the LinkedIn URL %s before rendering", (linkedin) => {
    expect(() => signatureValues({ name: "A Person", role: "Trainer", linkedin })).toThrow(
      `mail signature: linkedin must be an https: URL, got ${linkedin}`,
    );
  });
});

test("an unknown format from JavaScript preserves raw template whitespace", () => {
  const format = JSON.parse('"raw"') as Parameters<typeof fillSignature>[2];
  expect(fillSignature("  {{name}}  ", { name: "A & B", role: "Trainer" }, format)).toBe(
    "  A & B  ",
  );
});

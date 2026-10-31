import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { EXAMPLE, fillSignature, TRAINER_ROLE } from "../applications/mail-signature/fill";
import { ROOT } from "../scripts/git";

const template = (ext: string) =>
  readFileSync(join(ROOT, "applications/mail-signature", `template.${ext}`), "utf-8");
const GMBH = "HRB&nbsp;198840";

test("an h&w account carries wordmark, contact line and the GmbH lines", () => {
  const html = fillSignature(template("html"), EXAMPLE, "html");
  expect(html).toContain(">hackers</span>");
  expect(html).toContain(GMBH);
  expect(html).toContain('href="tel:+494012345678"');
  expect(html).not.toContain("{{");
  expect(fillSignature(template("txt"), EXAMPLE, "text")).toBe(
    "Kim Beispiel\nFreie Trainerin, hackers&wizards\n+49 40 1234 5678 | kim@hackersandwizards.dev | hackersandwizards.dev\n\nhackers&wizards GmbH, Sitz Hamburg, Osterstraße 95, 20259 Hamburg\nAmtsgericht Hamburg, HRB 198840\nGeschäftsführer: Benedikt Stemmildt, Stefan Munz\n",
  );
});

// A trainer's own address must not present them as part of the GmbH.
test("a trainer's own address leaves out the wordmark and the GmbH lines", () => {
  const fields = { name: "Kim Beispiel", role: TRAINER_ROLE };
  const html = fillSignature(template("html"), fields, "html");
  expect(html).not.toContain(">hackers</span>");
  expect(html).not.toContain(GMBH);
  expect(html).not.toContain("tel:");
  expect(html).toContain("Freier Trainer f&#252;r hackers&#38;wizards");
  expect(fillSignature(template("txt"), fields, "text")).toBe(
    `Kim Beispiel\n${TRAINER_ROLE}\nhackersandwizards.dev\n`,
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

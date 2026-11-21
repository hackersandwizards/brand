import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { fillSignature } from "../applications/mail-signature/fill";

test.prop([unicodeString], {
  examples: [[""], ['  a😀 & "<é>\n\tb  '], ["ä".repeat(1024)], [" !~' "]],
})("HTML escapes the field by code point and text preserves the trimmed value", (name) => {
  const fields = { name, role: "" };
  const expected = Array.from(name.trim(), (char) => {
    const code = char.codePointAt(0)!;
    return code < 32 || code > 126 || [34, 38, 60, 62].includes(code) ? `&#${code};` : char;
  }).join("");
  expect(fillSignature("{{name}}", fields, "html")).toBe(expected);
  expect(fillSignature("{{name}}", fields, "text")).toBe(name.trim() + "\n");
});

test.prop([fc.stringMatching(/^x_[\w]{0,32}$/)], {
  examples: [["__proto__"], ["constructor"], ["toString"], ["hasOwnProperty"]],
})("rejects every placeholder outside the signature fields", (key) => {
  const fields = { name: "", role: "" };
  expect(() => fillSignature(`{{${key}}}`, fields, "html")).toThrow(
    `mail signature: unknown field {{${key}}}`,
  );
  expect(() => fillSignature(`{{#${key}}}visible{{/${key}}}`, fields, "text")).toThrow(
    `mail signature: unknown field {{${key}}}`,
  );
});

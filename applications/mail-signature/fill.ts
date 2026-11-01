/**
 * Fills the mail signature template (template.html, template.txt beside this file). Pure, no file
 * access, so a browser bundle can import it as well as the command in cli.ts.
 *
 * `{{field}}` takes a value, `{{#field}}…{{/field}}` keeps its content only where the field is set.
 * The signature is for a mail from an h&w account: wordmark, name, role, contact line and the
 * three lines § 35a GmbHG requires.
 */
export type SignatureFields = {
  name: string;
  role: string;
  phone?: string;
  linkedin?: string;
};

/** The fictitious person the catalogue and every example render. */
export const EXAMPLE: SignatureFields = {
  name: "Kim Beispiel",
  role: "Freie Trainerin",
  phone: "+49 40 1234 5678",
  linkedin: "https://www.linkedin.com/in/kim-beispiel",
};

// ASCII out, every other character as a numeric reference: a signature file opened from disk
// without a charset still shows ß and ü.
const escapeHtml = (s: string) =>
  s.replace(/[&<>"]|[^\x20-\x7e]/gu, (c) => `&#${c.codePointAt(0)};`);

export function fillSignature(
  template: string,
  fields: SignatureFields,
  format: "html" | "text",
): string {
  const values: Record<string, string> = {
    name: fields.name.trim(),
    role: fields.role.trim(),
    phone: fields.phone?.trim() ?? "",
    tel: fields.phone?.replace(/\(0\)|[^\d+]/g, "") ?? "",
    linkedin: fields.linkedin?.trim() ?? "",
    linkedinShort: fields.linkedin?.trim().replace(/^https?:\/\/(www\.)?/, "") ?? "",
  };
  const value = (key: string) => {
    if (!(key in values)) throw new Error(`mail signature: unknown field {{${key}}}`);
    return values[key];
  };
  const filled = template
    .replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key: string, body: string) =>
      value(key) ? body : "",
    )
    .replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
      format === "html" ? escapeHtml(value(key)) : value(key),
    );
  return format === "text" ? `${filled.trim()}\n` : filled;
}

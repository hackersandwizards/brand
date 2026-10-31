/**
 * Fills the mail signature template (template.html, template.txt beside this file). Pure, no file
 * access, so a browser bundle can import it as well as the command in cli.ts.
 *
 * `{{field}}` takes a value, `{{#field}}…{{/field}}` keeps its content only where the field is set.
 * `hw` marks a mail from an h&w account: the wordmark and the three § 35a GmbHG lines appear only
 * there, since a trainer writing from their own address must not look like part of the GmbH.
 */
export type SignatureFields = {
  name: string;
  role: string;
  phone?: string;
  mail?: string;
  linkedin?: string;
  hw?: boolean;
};

/** The fictitious person the catalogue and every example render. */
export const EXAMPLE: SignatureFields = {
  name: "Kim Beispiel",
  role: "Freie Trainerin",
  phone: "+49 40 1234 5678",
  mail: "kim@hackersandwizards.dev",
  hw: true,
};

/** The role line of a trainer writing from their own address. */
export const TRAINER_ROLE = "Freier Trainer für hackers&wizards";

// ASCII out, every other character as a numeric reference: a signature file opened from disk
// without a charset still shows ß and ü.
const escapeHtml = (s: string) =>
  s.replace(/[&<>"]|[^\x20-\x7e]/g, (c) => `&#${c.codePointAt(0)};`);

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
    mail: fields.mail?.trim() ?? "",
    linkedin: fields.linkedin?.trim() ?? "",
    linkedinShort: fields.linkedin?.trim().replace(/^https?:\/\/(www\.)?/, "") ?? "",
    hw: fields.hw ? "1" : "",
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

#!/usr/bin/env bun
/**
 * Writes a mail signature from the template beside this file: <out>.html to open in a browser and
 * copy into the mail client, <out>.txt for a client that takes plain text only.
 *
 *   bun run brand-mail-signature --name "Kim Beispiel" --role "Freie Trainerin" \
 *     [--phone "+49 40 1234 5678"] [--mail kim@hackersandwizards.dev] [--linkedin <url>] \
 *     --out <path without extension>
 *
 * The signature is for an h&w account: wordmark and the GmbH lines. Without --out it prints the plain text.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { fillSignature } from "./fill";

const { values: a } = parseArgs({
  options: {
    name: { type: "string" },
    role: { type: "string" },
    phone: { type: "string" },
    mail: { type: "string" },
    linkedin: { type: "string" },
    out: { type: "string" },
  },
});
if (!a.name || !a.role) {
  console.error("brand-mail-signature: --name and --role are required");
  process.exit(1);
}
const fields = { ...a, name: a.name, role: a.role };
const template = (ext: string) => readFileSync(join(import.meta.dir, `template.${ext}`), "utf-8");
const text = fillSignature(template("txt"), fields, "text");
if (!a.out) console.log(text);
else {
  writeFileSync(`${a.out}.html`, fillSignature(template("html"), fields, "html"));
  writeFileSync(`${a.out}.txt`, text);
  console.log(`${a.out}.html\n${a.out}.txt`);
}

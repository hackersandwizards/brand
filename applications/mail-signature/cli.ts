#!/usr/bin/env bun
/** Writes a mail signature from the template beside this file; `--help` prints how. */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { fillSignature } from "./fill";

const USAGE = `Writes a mail signature for an h&w account (wordmark and the GmbH lines) from the template
beside this command: <out>.html to open in a browser and copy into the mail client, <out>.txt for a
client that takes plain text only. Without --out it prints the plain text.

  bun run brand-mail-signature --name "Kim Beispiel" --role "Freie Trainerin" \\
    [--phone "+49 40 1234 5678"] [--linkedin <url>] [--out <path without extension>]`;

const options = {
  name: { type: "string" },
  role: { type: "string" },
  phone: { type: "string" },
  linkedin: { type: "string" },
  out: { type: "string" },
  help: { type: "boolean", short: "h" },
} as const;
function fail(message: string): never {
  console.error(`brand-mail-signature: ${message}\n\n${USAGE}`);
  process.exit(1);
}
let a: ReturnType<typeof parseArgs<{ options: typeof options }>>["values"] = {};
try {
  a = parseArgs({ options }).values;
} catch (e) {
  fail((e as Error).message);
}
if (a.help) {
  console.log(USAGE);
  process.exit(0);
}
const { name, role, phone, linkedin, out } = a;
if (!name || !role) fail("--name and --role are required");
const fields = { name, role, phone, linkedin };
const template = (ext: string) => readFileSync(join(import.meta.dir, `template.${ext}`), "utf-8");
try {
  const text = fillSignature(template("txt"), fields, "text");
  if (!out) console.log(text);
  else {
    writeFileSync(`${out}.html`, fillSignature(template("html"), fields, "html"));
    writeFileSync(`${out}.txt`, text);
    console.log(`${out}.html\n${out}.txt`);
  }
} catch (e) {
  fail((e as Error).message);
}

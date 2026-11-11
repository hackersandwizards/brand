// Every command in bin answers --help and -h with its usage on stdout and exit 0, before it reads a
// file, a config or the git tree, so it runs from an empty folder.
import { afterAll, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import own from "../package.json";

const root = join(import.meta.dir, "..");
const empty = mkdtempSync(join(tmpdir(), "brand-help-"));
afterAll(() => rmSync(empty, { recursive: true, force: true }));

for (const [name, file] of Object.entries(own.bin))
  for (const flag of ["--help", "-h"])
    test(`${name} ${flag}`, async () => {
      const p = Bun.spawn(["bun", join(root, file), flag], {
        cwd: empty,
        stdout: "pipe",
        stderr: "pipe",
      });
      const [out, err, code] = await Promise.all([
        new Response(p.stdout).text(),
        new Response(p.stderr).text(),
        p.exited,
      ]);
      expect({ code, err }).toEqual({ code: 0, err: "" });
      expect(out).toContain(name);
    });

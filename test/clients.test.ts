import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { clients, height } from "../scripts/clients";
import { ROOT } from "../scripts/git";

test("every client mark exists and its height is fresh", async () => {
  for (const c of clients()) {
    expect(existsSync(join(ROOT, "clients", c.file))).toBe(true);
    expect({ file: c.file, height: c.height }).toEqual({
      file: c.file,
      height: await height(c.file),
    });
  }
});

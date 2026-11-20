import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const FRAME = resolve(import.meta.dir, "../applications/linkedin-visuals/frame.ts");

describe("applications/linkedin-visuals/frame.ts", () => {
  it("refuses a call without a headline", () => {
    expect(() => execFileSync("bun", [FRAME, "a.png", "b.png"], { stdio: "pipe" })).toThrow(
      /usage/,
    );
  });
});

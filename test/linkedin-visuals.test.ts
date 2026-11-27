import { rejection } from "@hackersandwizards/scaffolding/rejection";
import { describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { screenshot } from "../applications/linkedin-visuals/render";

const FRAME = resolve(import.meta.dir, "../applications/linkedin-visuals/frame.ts");

describe("applications/linkedin-visuals/frame.ts", () => {
  it("refuses a call without a headline", () => {
    expect(() => execFileSync("bun", [FRAME, "a.png", "b.png"], { stdio: "pipe" })).toThrow(
      /usage/,
    );
  });
});

it("points to the browser executable when the renderer writes no screenshot", async () => {
  const out = resolve(
    import.meta.dir,
    "../node_modules/.cache/check-msgs/tokens-no-screenshot.png",
  );
  vi.stubEnv("CHROME_BINARY", "/usr/bin/true");
  try {
    expect(await rejection(screenshot("page.html", { width: 1, height: 1 }, out))).toBe(
      `Error: Chrome produced no image at ${out}, so rendering stopped. Set CHROME_BINARY to a working Chrome for Testing executable and rerun the render command.`,
    );
  } finally {
    vi.unstubAllEnvs();
  }
});

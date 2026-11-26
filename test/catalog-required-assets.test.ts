import { rejection } from "@hackersandwizards/scaffolding/rejection";
import type { APIContext } from "astro";
import { expect, test, vi } from "vitest";
import { GET } from "../catalog/pages/catalog-assets/[name]";

vi.mock("../catalog/portal-run.ts", () => ({
  portal: () => ({ assets: { "sample.unknown": "YQ==" } }),
}));

vi.mock("../scripts/tokens", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../scripts/tokens")>()),
  resolveColors: () => ({}),
}));

test("a catalog asset with an unknown extension names its missing content type", async () => {
  const request = { params: { name: "sample.unknown" } } as unknown as APIContext;
  expect(await rejection(Promise.resolve().then(() => GET(request)))).toBe(
    "Error: Content type missing: sample.unknown",
  );
});

test("a palette entry without a resolved color names its missing token", async () => {
  expect(await rejection(import("../catalog/portal/token-reference"))).toBe(
    "Error: Colour token missing: --color-bg",
  );
});

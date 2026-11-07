import { expect, test } from "bun:test";
import type { IncomingMessage, ServerResponse } from "node:http";
import { serveFile } from "../catalog/files";

// A browser refuses an SVG without its type, in <img> and as an icon alike.
test.each([
  ["/logos/lockup-screen.svg", "image/svg+xml"],
  ["/logos/icon-192.png", "image/png"],
  ["/tokens/print.css", "text/css"],
])("dev serves %s as %s", (url, type) => {
  const headers: Record<string, string> = {};
  const res = { setHeader: (k: string, v: string) => (headers[k] = v), end: () => {} };
  serveFile({ url } as IncomingMessage, res as unknown as ServerResponse, () => {});
  expect(headers["Content-Type"]).toStartWith(type);
});

test("dev passes a malformed escape on", () => {
  let passed = false;
  serveFile({ url: "/%E0%A4%A" } as IncomingMessage, {} as ServerResponse, () => (passed = true));
  expect(passed).toBe(true);
});

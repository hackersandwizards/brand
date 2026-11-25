import { expect, test, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromeSocket, RenderPage } from "../applications/backgrounds/render";

test("reads the port and WebSocket path from Chrome's profile", async () => {
  const profile = mkdtempSync(join(tmpdir(), "hw-devtools-port-"));
  try {
    writeFileSync(join(profile, "DevToolsActivePort"), "9214\n/devtools/browser/fixture\n");
    expect(await chromeSocket(profile)).toBe("ws://127.0.0.1:9214/devtools/browser/fixture");
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
});

test("waits for the socket path when Chrome has written only the port", async () => {
  const profile = mkdtempSync(join(tmpdir(), "hw-devtools-port-"));
  const portFile = join(profile, "DevToolsActivePort");
  writeFileSync(portFile, "9214");
  const finish = setTimeout(() => writeFileSync(portFile, "9214\n/devtools/browser/fixture\n"), 0);
  try {
    expect(await chromeSocket(profile)).toBe("ws://127.0.0.1:9214/devtools/browser/fixture");
  } finally {
    clearTimeout(finish);
    rmSync(profile, { recursive: true, force: true });
  }
});

test("sets the viewport, waits for the page and captures PNG bytes", async () => {
  const loaded = Promise.withResolvers<void>();
  const navigating = Promise.withResolvers<void>();
  const send = vi
    .fn(
      async (
        _method: string,
        _params?: object,
        _sessionId?: string,
      ): Promise<Record<string, unknown>> => ({}),
    )
    .mockResolvedValueOnce({})
    .mockImplementationOnce(async () => {
      navigating.resolve();
      return {};
    })
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({ data: "UE5H" });
  const once = vi.fn(() => loaded.promise);
  const page = new RenderPage({ lastRequestId: 4, send, once }, "page-a");
  try {
    const shot = page.shot("https://example.test", { width: 320, height: 240, scale: 2 }, "ready");
    await navigating.promise;
    expect(send.mock.calls).toEqual([
      [
        "Emulation.setDeviceMetricsOverride",
        { width: 320, height: 240, deviceScaleFactor: 2, mobile: false },
        "page-a",
      ],
      ["Page.navigate", { url: "https://example.test" }, "page-a"],
    ]);
    expect(once).toHaveBeenCalledExactlyOnceWith("Page.loadEventFired", "page-a");
    expect(once.mock.invocationCallOrder[0]).toBeLessThan(send.mock.invocationCallOrder[1]);
    loaded.resolve();
    expect(await shot).toEqual(Buffer.from("PNG"));
    expect(send.mock.calls.slice(2)).toEqual([
      ["Runtime.evaluate", { expression: "ready", awaitPromise: true }, "page-a"],
      [
        "Page.captureScreenshot",
        { format: "png", clip: { x: 0, y: 0, width: 320, height: 240, scale: 1 } },
        "page-a",
      ],
    ]);
  } finally {
    loaded.resolve();
    page.clearDocuments();
  }
});

test("prints the supplied HTML at the requested physical paper size", async () => {
  const send = vi.fn(async (_method: string, _params?: object, _sessionId?: string) => ({
    data: "UERG",
  }));
  const once = vi.fn(async () => {});
  const page = new RenderPage({ lastRequestId: 3, send, once }, "page-b");
  const html = "<p>Print fixture</p>";
  try {
    expect(await page.pdf(html, 25.4, 50.8)).toEqual(Buffer.from("PDF"));
    const navigation = send.mock.calls[0][1] as { url: string };
    const url = new URL(navigation.url);
    expect(url.pathname.endsWith("/3.html")).toBe(true);
    expect(readFileSync(fileURLToPath(url), "utf8")).toBe(html);
    expect(send.mock.calls.slice(1)).toEqual([
      ["Runtime.evaluate", { expression: "document.fonts.ready", awaitPromise: true }, "page-b"],
      [
        "Page.printToPDF",
        {
          paperWidth: 1,
          paperHeight: 2,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          printBackground: true,
          preferCSSPageSize: true,
        },
        "page-b",
      ],
    ]);
  } finally {
    page.clearDocuments();
  }
});

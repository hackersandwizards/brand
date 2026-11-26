import { assert, expect, test, vi } from "vitest";
import { rejection } from "@hackersandwizards/scaffolding/rejection";
import { limit } from "@hackersandwizards/scaffolding/test-timeout";
import { browser, openChrome, RenderPage } from "../../applications/backgrounds/render";

test("opens a headless Chrome process with a live DevTools connection", async () => {
  const { cdp, stop } = await openChrome();
  try {
    const { product, userAgent } = await cdp.send("Browser.getVersion");
    expect(product).toMatch(/^(?:Headless)?Chrome\//);
    expect(userAgent).toMatch(/\bHeadlessChrome\//);
  } finally {
    cdp.close();
    stop();
  }
}, 20_000);

test(
  "renderer shutdown completes when the DevTools socket closes before its reply",
  async () => {
    const session = await browser();
    const clear = vi.spyOn(RenderPage.prototype, "clearDocuments");
    const send = vi.spyOn(WebSocket.prototype, "send").mockImplementationOnce(function (
      this: WebSocket,
    ) {
      this.dispatchEvent(new Event("close"));
    });
    try {
      expect(await session.close()).toBeUndefined();
      expect(clear).toHaveBeenCalledOnce();
    } finally {
      send.mockRestore();
      clear.mockRestore();
    }
  },
  limit(20_000),
);

test(
  "renderer shutdown propagates an unexpected rejection after clearing its documents",
  async () => {
    const session = await browser();
    const clear = vi.spyOn(RenderPage.prototype, "clearDocuments");
    const nativeSend = WebSocket.prototype.send;
    const send = vi.spyOn(WebSocket.prototype, "send").mockImplementationOnce(function (
      this: WebSocket,
      data,
    ) {
      assert(typeof data === "string", "The DevTools request is JSON text");
      nativeSend.call(this, data.replace('"Browser.close"', '"Browser.unknownShutdownCommand"'));
    });
    try {
      expect(await rejection(session.close())).toMatch(
        /Browser\.unknownShutdownCommand.*wasn't found/,
      );
      expect(clear).toHaveBeenCalledOnce();
    } finally {
      send.mockRestore();
      clear.mockRestore();
    }
  },
  limit(20_000),
);

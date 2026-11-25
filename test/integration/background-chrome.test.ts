import { expect, test } from "vitest";
import { openChrome } from "../../applications/backgrounds/render";

test("opens a headless Chrome process with a live DevTools connection", async () => {
  const { cdp, stop } = await openChrome();
  try {
    const { product, userAgent } = await cdp.send("Browser.getVersion");
    expect(product).toMatch(/^(?:Headless)?Chrome\//);
    expect(userAgent).toMatch(/\bHeadlessChrome\//);
  } finally {
    await cdp.send("Browser.close").catch(() => {});
    cdp.close();
    stop();
  }
}, 20_000);

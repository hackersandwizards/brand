import { expect, test } from "bun:test";
import sharp from "sharp";
import { clients, height, render } from "../scripts/clients";

// Each mark's box ends on its drawn edge, one pixel at 2400 px of rim and an antialiased pixel per renderer
// apart, and some pixel on its edge is transparent, so its ground is too. Its height is fresh.
test("every client mark is tight on a transparent ground and its height is fresh", async () => {
  for (const c of clients()) {
    const mark = await render(c.file);
    const { width, height: tall, channels } = mark.info;
    const { info } = await sharp(mark.data, { raw: mark.info })
      .trim({ threshold: 0 })
      .toBuffer({ resolveWithObject: true });
    const slack = (2 * Math.max(width, tall)) / 2400 + 4;
    const alpha = (x: number, y: number) => mark.data[(y * width + x) * channels + 3];
    const edge = [
      ...Array.from({ length: width }, (_, x) => [alpha(x, 0), alpha(x, tall - 1)]),
      ...Array.from({ length: tall }, (_, y) => [alpha(0, y), alpha(width - 1, y)]),
    ].flat();
    expect({
      file: c.file,
      tight: width - info.width <= slack && tall - info.height <= slack,
      transparent: edge.includes(0),
    }).toEqual({ file: c.file, tight: true, transparent: true });
    expect(c.height).toBeCloseTo(await height(mark), 2);
  }
}, 30_000);

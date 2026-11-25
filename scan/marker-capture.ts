import type { JSHandle, Page } from "puppeteer-core";
import type { Box, Found, Probe } from "./marker-dom";

/** Selects the clips with measurable boxes, keeping their corresponding anchor index. */
export function readableProbes(found: JSHandle<Found>) {
  return found.evaluate(({ probes }) =>
    probes.flatMap((probe, index) => {
      // A square ::before that is not beside its first line (an absolute dot above the item) leaves
      // no room left of the text: it is decoration, not this line's marker.
      if (probe.marker.width < 1 || probe.text.width <= 0) return [];
      return [{ probe, index }];
    }),
  );
}

// Each box is shot inside the viewport, its host scrolled into view in every scroll container
// it sits in, the window or an element such as a catalog's main: capturing beyond the viewport
// resizes it, and a layout sized by the viewport's height then moves under the measured boxes.
// Instant, whatever the page's scroll-behavior, 200px below the top as a sticky header may
// cover it, and a frame for the paint to follow. The anchor's top left and the viewport's four
// edges, in page px.
export function placeAnchor(found: JSHandle<Found>, index: number) {
  return found.evaluate(
    ({ anchors }, i) =>
      new Promise<{
        x: number;
        y: number;
        top: number;
        bottom: number;
        left: number;
        right: number;
      }>((done) => {
        const anchor = anchors[i] as HTMLElement;
        anchor.style.scrollMarginTop = "200px";
        anchor.scrollIntoView({ block: "start", inline: "nearest", behavior: "instant" });
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const r = anchor.getBoundingClientRect();
            const [x, y] = [r.left + scrollX, r.top + scrollY];
            done({
              x,
              y,
              top: scrollY,
              bottom: scrollY + innerHeight,
              left: scrollX,
              right: scrollX + innerWidth,
            });
          }),
        );
      }),
    index,
  );
}

type Placement = Awaited<ReturnType<typeof placeAnchor>>;
type Shot = { png: string; clip: Box; scale: number };

/** Translates an anchor-relative clip into page coordinates. */
function clipOnPage(at: Placement, rel: Box): Box {
  return { ...rel, x: at.x + rel.x, y: at.y + rel.y };
}

/** Checks whether a box can be captured inside the current viewport. */
function insideViewport(at: Placement, box: Box) {
  return (
    box.y >= at.top &&
    box.y + box.height <= at.bottom &&
    box.x >= at.left &&
    box.x + box.width <= at.right
  );
}

/** Rounds a page box to the pixels Chrome uses for a screenshot. */
function screenshotClip(box: Box): Box {
  // Whole px, as puppeteer would round it, so the shot starts where the offsets below count from.
  const [x, y] = [Math.round(box.x), Math.round(box.y)];
  return {
    x,
    y,
    width: Math.round(box.x + box.width) - x,
    height: Math.round(box.y + box.height) - y,
  };
}

/** Captures a clip against the page's current viewport. */
function shootWithinViewport(page: Page, clip: Box) {
  return page.screenshot({ clip, encoding: "base64", captureBeyondViewport: false });
}

/** Captures the full clip even when it extends beyond the current viewport. */
function shootBeyondViewport(page: Page, clip: Box) {
  return page.screenshot({ clip, encoding: "base64", captureBeyondViewport: true });
}

/** Records the pixels, rounded clip and device scale of a page screenshot. */
async function captureBox(page: Page, box: Box, shoot: typeof shootWithinViewport): Promise<Shot> {
  const clip = screenshotClip(box);
  const png = await shoot(page, clip);
  const scale = page.viewport()?.deviceScaleFactor;
  if (scale === undefined) throw new Error("Set the page's device scale before measuring markers");
  return { png, clip, scale };
}

// The ink middles left and right of split (CSS px from the clip's left edge), in page px.
async function readInkMiddles(page: Page, shot: Shot, split: number): Promise<[number, number]> {
  const [left, right] = await page.evaluate(inkMiddle, shot.png, shot.scale, split);
  // No ink where the marker should be: a marker drawn elsewhere, which fails as NaN.
  return [left < 0 ? NaN : shot.clip.y + left, right < 0 ? NaN : shot.clip.y + right];
}

/** Reads the marker and both text bands from the same viewport policy and anchor. */
export async function readMarkerPixels(page: Page, probe: Probe, at: Placement) {
  const text = clipOnPage(at, probe.text);
  const marker = clipOnPage(at, probe.marker);
  // Where the page will not scroll a box into view (a script holding it, a page wider than the
  // viewport), both boxes are shot beyond the viewport, so both read the same layout.
  const shoot =
    insideViewport(at, text) && insideViewport(at, marker)
      ? shootWithinViewport
      : shootBeyondViewport;
  const textShot = await captureBox(page, text, shoot);
  const [x, caps] = await readInkMiddles(page, textShot, probe.split + text.x - textShot.clip.x);
  const markerShot = await captureBox(page, marker, shoot);
  const [middle] = await readInkMiddles(page, markerShot, Infinity);
  return { x, caps, middle };
}

/** Runs in the page: the y in CSS px, from the top of the shot, of the ink's middle left of `split`
 * (CSS px from the shot's left edge) and right of it, each pixel weighted by its distance from the
 * shot's most common colour. */
async function inkMiddle(png: string, scale: number, split: number): Promise<[number, number]> {
  // Decoded from bytes, which no img-src of the page's policy governs, as it would a data: URL.
  const img = await createImageBitmap(
    new Blob([Uint8Array.from(atob(png), (c) => c.charCodeAt(0))], { type: "image/png" }),
  );
  const ctx = new OffscreenCanvas(img.width, img.height).getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);
  const counts = new Map<number, number>();
  for (let i = 0; i < data.length; i += 4) {
    const key = (data[i]! << 16) | (data[i + 1]! << 8) | data[i + 2]!;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const bg = [...counts].sort((a, b) => b[1] - a[1])[0]![0];
  const total = [0, 0];
  const sum = [0, 0];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const ink = Math.hypot(
        data[i]! - (bg >> 16),
        data[i + 1]! - ((bg >> 8) & 255),
        data[i + 2]! - (bg & 255),
      );
      const side = x + 0.5 < split * scale ? 0 : 1;
      total[side]! += ink;
      sum[side]! += ink * (y + 0.5);
    }
  // -1 for no ink, as NaN and Infinity leave the page as null.
  const middle = (side: number) => (total[side] ? sum[side]! / total[side]! / scale : -1);
  return [middle(0), middle(1)];
}

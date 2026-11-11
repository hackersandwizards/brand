import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import rules from "../logos/logos.json";
import { colors } from "../generated/tokens";
import { ROOT } from "../scripts/git";

test("each logo's clear space is the h's height over the file's height", () => {
  expect(Object.keys(rules.logos).length).toBeGreaterThan(0);
  for (const [name, logo] of Object.entries(rules.logos)) {
    const svg = readFileSync(join(ROOT, `logos/${name}.svg`), "utf8");
    const h = /<path d="M288 312H456V360H504V(\d+)H312V504H288V\1H96V(\d+)H288V312Z"/.exec(svg);
    const height = Number(/viewBox="[^"]*?([\d.]+)"/.exec(svg)?.[1]);
    expect({ name, h: h && Number(h[1]) - Number(h[2]) }).toEqual({
      name,
      h: rules.clearSpaceUnits,
    });
    expect({ name, share: Math.round((rules.clearSpaceUnits / height) * 1000) / 1000 }).toEqual({
      name,
      share: logo.clearSpace,
    });
  }
});

test("sizes names each logo SVG's and logo PNG's width and height, as the file sets them", () => {
  const files = readdirSync(join(ROOT, "logos"));
  const svgs = files.filter((f) => f.endsWith(".svg"));
  // The lockup and wordmark PNGs the package ships (package.json files); a PNG's header holds its
  // width and height at bytes 16 to 24.
  const pngs = files.filter((f) => /^(lockup|wordmark).*\.png$/.test(f));
  const measured = Object.fromEntries([
    ...svgs.flatMap((f) => {
      const root = /<svg[^>]*>/.exec(readFileSync(join(ROOT, "logos", f), "utf8"))![0];
      const [w, h] = [/ width="(\d+)"/, / height="(\d+)"/].map((r) => r.exec(root)?.[1]);
      return w && h ? [[f, { width: Number(w), height: Number(h) }]] : [];
    }),
    ...pngs.map((f) => {
      const head = readFileSync(join(ROOT, "logos", f)).subarray(0, 24);
      expect(head.subarray(1, 4).toString()).toBe("PNG");
      return [f, { width: head.readUInt32BE(16), height: head.readUInt32BE(20) }];
    }),
  ]);
  expect(pngs.length).toBeGreaterThan(0);
  expect(rules.sizes as Record<string, unknown>).toEqual(measured);
  expect(rules.sizes["lockup-screen.svg"]).toEqual({ width: 8042, height: 1489 });
  expect(rules.sizes["lockup.png"]).toEqual({ width: 2416, height: 447 });
});

// scripts/outline.ts writes the night cuts from the day files and the tokens, and nothing runs it
// in the gate: each night cut's fills, in order, are its day file's turned to the hue's night tone.
test("each night cut fills its day file's shapes with their night tones", () => {
  const hex = (t: string) => colors[`--color-${t}` as keyof typeof colors].toUpperCase();
  const night = new Map(
    (["teal", "purple", "ampersand"] as const).map((t) => [
      hex(t),
      hex(t === "ampersand" ? "ampersand-light" : `${t}-night`),
    ]),
  );
  const fills = (f: string) =>
    [...readFileSync(join(ROOT, `logos/${f}.svg`), "utf8").matchAll(/fill="(#[0-9A-F]{6})"/gi)].map(
      (m) => m[1]!.toUpperCase(),
    );
  for (const day of ["wordmark", "lockup", "lockup-compact", "lockup-screen"]) {
    const want = fills(day).map((c) => night.get(c) ?? c);
    expect({ day, fills: fills(`${day}-night`) }).toEqual({ day, fills: want });
    expect(want.length).toBeGreaterThan(0);
  }
});

// The header's img sizes are typed beside the markup: they are the screen cuts' boxes, rounded up.
test("the header's typed logo sizes are the screen cuts' boxes", () => {
  const size = (f: string) => {
    const [, , w, h] = /viewBox="([^"]+)"/
      .exec(readFileSync(join(ROOT, `logos/${f}.svg`), "utf8"))![1]!
      .split(" ")
      .map(Number);
    return `width="${Math.ceil(w!)}" height="${Math.ceil(h!)}"`;
  };
  const read = (f: string) => readFileSync(join(ROOT, f), "utf8");
  for (const f of ["expert/components/AppHeader.astro", "expert/header.css", "catalog/portal.ts"])
    expect({ f, day: read(f).includes(size("lockup-screen")) }).toEqual({ f, day: true });
  for (const f of ["expert/components/AppHeader.astro", "expert/header.css"])
    expect({ f, night: read(f).includes(size("lockup-screen-night")) }).toEqual({ f, night: true });
  for (const f of ["lockup-screen", "lockup-screen-night"]) {
    const { width, height } = rules.sizes[`${f}.svg` as keyof typeof rules.sizes];
    expect(`width="${width}" height="${height}"`).toBe(size(f));
  }
});

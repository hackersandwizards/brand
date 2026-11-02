import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import rules from "../logos/logos.json";
import { ROOT } from "../scripts/git";

// The clear space is the height of the h in the name, as a share of each day file's height.
test("each logo's clear space is the h's height over the file's height", () => {
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

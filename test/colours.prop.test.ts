import { fc, test, unicodeString } from "@hackersandwizards/scaffolding/property";
import { expect } from "vitest";
import { fnColour } from "../scan/colour-tokens";
import { tighten } from "../scan/colours";

const channel = fc.integer({ min: -255, max: 510 });
test.prop([fc.tuple(channel, channel, channel), fc.constantFrom(" ", ", ", "_"), fc.boolean()], {
  examples: [
    [[0, 127, 255], ", ", true],
    [[-1, 256, 1], "_", false],
    [[255, 0, 255], " ", false],
  ],
})(
  "converts numeric RGB channels to clamped hex regardless of separator or opacity",
  (channels, separator, alpha) => {
    const bytes = Buffer.from(channels.map((channel) => Math.max(0, Math.min(255, channel))));
    expect(
      fnColour(alpha ? "RGBA" : "rgb", channels.join(separator) + (alpha ? " / .5" : "")),
    ).toBe("#" + bytes.toString("hex"));
  },
);

const pathKey = fc.oneof(fc.constantFrom("__proto__", "constructor", "toString"), unicodeString);
const hexCounts = fc.record({ live: fc.nat(20), allowed: fc.nat(20), ceiling: fc.nat(20) });
test.prop([pathKey, hexCounts], {
  examples: [
    ["__proto__", { live: 2, allowed: 1, ceiling: 0 }],
    ["constructor", { live: 3, allowed: 1, ceiling: 2 }],
    ["toString", { live: 0, allowed: 4, ceiling: 2 }],
    ["長".repeat(1024) + "/style.css", { live: 1, allowed: 0, ceiling: 0 }],
    ["", { live: 1, allowed: 0, ceiling: 2 }],
  ],
})(
  "tightens each file's count to the live count or its allowance ceiling",
  (file, { live, allowed, ceiling }) => {
    const counts = (hex: number) => ({
      hex,
      tokenHex: 0,
      font: 0,
      palette: 0,
      rgb: 0,
      radius: 0,
      shadow: 0,
    });
    const list = tighten(
      Object.fromEntries([[file, counts(live)]]),
      Object.fromEntries([[file, { reason: "recorded", hex: allowed }]]),
      Object.fromEntries([[file, counts(ceiling)]]),
    );
    const hex = Math.min(live, Math.max(allowed, ceiling));
    expect(Object.entries(list)).toEqual(hex ? [[file, { reason: "recorded", hex }]] : []);
  },
);

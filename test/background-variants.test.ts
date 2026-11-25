import { expect, test } from "vitest";
import { darkWallpapers, parseBackgroundArgs } from "../applications/backgrounds/generate";
import { pairedScreens, screenMock } from "../applications/backgrounds/mocks";

test("requires an output directory for variants", () => {
  expect(() => parseBackgroundArgs([])).toThrow(
    "usage: generate.ts <out dir> [variant ...] [--mocks]",
  );
});

test.each([
  { args: ["/output", "--mocks", "white", "mid"], chosen: ["white", "mid"], mocks: true },
  { args: ["/output", "mid", "--other"], chosen: ["mid"], mocks: false },
  {
    args: ["/output"],
    chosen: [
      "white",
      "mist",
      "mid",
      "pastel-2",
      "mid-fade",
      "pastel",
      "gradient-classic",
      "gradient-d",
      "peek-band",
      "dawn",
      "giant",
      "watermark",
    ],
    mocks: false,
  },
])("parses the variant selection from $args", ({ args, chosen, mocks }) => {
  expect(parseBackgroundArgs(args)).toEqual({ out: "/output", chosen, mocks });
});

test("names the dark comparison files, with separate homes for iPad and iPhone", () => {
  expect(darkWallpapers("/assets")).toEqual({
    name: "dark",
    tone: "dark",
    files: {
      mac: "/assets/macbook-background.png",
      ipad: "/assets/ipad-lock-background.png",
      "ipad-home": "/assets/ipad-home-background.png",
      iphone: "/assets/iphone-lock-background.png",
      "iphone-home": "/assets/iphone-home-background.png",
      call: "/assets/call-background.png",
    },
  });
});

test.each([
  {
    screen: "mac-desktop",
    width: 1728,
    height: 1117,
    regions: [
      [1128, 0, 600, 300],
      [440, 1000, 850, 117],
    ],
  },
  {
    screen: "mac-lock",
    width: 1728,
    height: 1117,
    regions: [
      [464, 96, 800, 180],
      [664, 920, 400, 140],
    ],
  },
  { screen: "ipad-lock", width: 1032, height: 1376, regions: [[216, 100, 600, 340]] },
  { screen: "ipad-home", width: 1376, height: 1032, regions: [[188, 520, 1000, 512]] },
  { screen: "iphone-lock", width: 440, height: 956, regions: [] },
  { screen: "iphone-home", width: 440, height: 956, regions: [] },
  {
    screen: "call",
    width: 1700,
    height: 820,
    regions: [
      [20, 600, 640, 140],
      [1320, 20, 360, 800],
    ],
  },
] satisfies {
  screen: Parameters<typeof screenMock>[0];
  width: number;
  height: number;
  regions: number[][];
}[])("pins the $screen viewport and close crops", ({ screen, width, height, regions }) => {
  const mock = screenMock(screen, "/assets/wall.png", "light");
  expect(mock).toMatchObject({ viewport: { width, height }, regions });
  expect(mock.html).toContain("file:///assets/wall.png");
});

const pairedFixtures: {
  label: string;
  files: Record<string, string>;
  tablet: string[];
  phone: string[];
}[] = [
  {
    label: "reuses both lock wallpapers when home files are absent",
    files: { ipad: "/assets/tablet-lock.png", iphone: "/assets/phone-lock.png" },
    tablet: ["tablet-lock.png", "tablet-lock.png"],
    phone: ["phone-lock.png", "phone-lock.png"],
  },
  {
    label: "uses the supplied home wallpapers",
    files: {
      ipad: "/assets/tablet-lock.png",
      iphone: "/assets/phone-lock.png",
      "ipad-home": "/assets/tablet-home.png",
      "iphone-home": "/assets/phone-home.png",
    },
    tablet: ["tablet-lock.png", "tablet-home.png"],
    phone: ["phone-lock.png", "phone-home.png"],
  },
];

test.each(pairedFixtures)("$label", ({ files, tablet, phone }) => {
  const panels = pairedScreens({ name: "example", tone: "light", files });
  expect(panels).toHaveLength(2);
  expect(
    panels.map(({ panel, viewport, html }) => ({
      panel,
      viewport,
      walls: [...html.matchAll(/background:url\(&quot;file:\/\/\/assets\/([^&]+)&quot;\)/g)].map(
        (match) => match[1],
      ),
    })),
  ).toEqual([
    { panel: "ipad", viewport: { width: 2448, height: 1376 }, walls: tablet },
    { panel: "iphone", viewport: { width: 920, height: 956 }, walls: phone },
  ]);
});

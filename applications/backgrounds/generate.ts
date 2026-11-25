// Light and mid-tone device backgrounds in logo system D, plus device mocks to compare them.
// bun applications/backgrounds/generate.ts <out dir> [variant ...] [--mocks]
// Writes <out>/<variant>/<device>[-home].png and, with --mocks, <out>/mocks/<variant>-<panel>.jpg;
// the mocks include the current dark files beside this script as "dark".
// Layout round: bun generate.ts <out dir> --layouts [--base dark|light] [--only <file>:<layout>,...]
// writes <out>/<base>/<file>/<layout>.png and per screen <out>/mocks/<base>~<layout>~<screen>.jpg
// (1000 px long edge) plus -detail.jpg (the system text at real size, where the mock is larger).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { brand, browser, tint } from "./render";
import {
  C,
  DEVICES,
  GRADIENT,
  HOME_GROUND,
  img,
  MID,
  PASTEL,
  wallPage,
  type Device,
  type Layer,
} from "./wall";
import { renderVariantMocks, type VariantWallpaperSet } from "./mocks";
import { generateLayouts } from "./layouts";

const DARK = import.meta.dir;

// Where the big wizard stands per device: bottom-anchored on an edge or a band, clear of the
// Dock (Mac), the lock-screen buttons' centre (iPhone), the crop overlap (iPad) and the head (call).
const WIZ: Record<Device, { size: number; x: number; bottom: number }> = {
  mac: { size: 420, x: 1728 - 50 - 420, bottom: 0 },
  ipad: { size: 600, x: 1204 - 20 - 600, bottom: 0 },
  iphone: { size: 280, x: 80, bottom: 0 },
  call: { size: 560, x: 1920 - 70 - 560, bottom: 0 },
};
const LOCKUP: Record<Device, { h: number; x: number; y: number }> = {
  mac: { h: 60, x: 64, y: 1117 - 150 - 60 },
  ipad: { h: 56, x: (1376 - 56 * 5.365) / 2, y: 470 },
  iphone: { h: 44, x: (440 - 44 * 5.365) / 2, y: 500 },
  call: { h: 76, x: 1440 - 76 * 5.365, y: 100 },
};

const wizard = (d: Device, scale = 1, dx = 0) => {
  const { size, x, bottom } = WIZ[d];
  const s = size * scale;
  return img(
    brand.emoji,
    `width:${s}px;height:${s}px;left:${x + size - s + dx}px;bottom:${bottom}px`,
  );
};
const lockupAt = (d: Device, night = false) => {
  const { h, x, y } = LOCKUP[d];
  return img(night ? brand.lockupNight : brand.lockup, `height:${h}px;left:${x}px;top:${y}px`);
};

// tone decides the system's clock ink in the mocks; pair gives iPhone and iPad a mid-tone home
// screen file, since iOS sets app labels in white.
type Variant = {
  tone: "light" | "mid";
  pair?: boolean;
  home?: string;
  bigHome?: boolean; // a larger lockup on the paired home screen
  wall: (d: Device) => { bg: string; layers: Layer[] };
};

const light = (bg: string): Variant => ({
  tone: "light",
  pair: true,
  wall: (d) => ({ bg, layers: [wizard(d), lockupAt(d)] }),
});

export const VARIANTS: Record<string, Variant> = {
  white: light("#FFFFFF"),
  mist: light(`linear-gradient(135deg, ${tint(C.teal, 10)}, ${tint(C.purple, 9)})`),
  // Brand tints deep enough for the system's white clock and labels; the home screen keeps the
  // ground and drops the wizard.
  mid: {
    tone: "mid",
    pair: true,
    home: MID,
    wall: (d) => ({
      bg: MID,
      layers: [wizard(d), lockupAt(d)],
    }),
  },
  // Pastel refined: a smaller wizard between the iPhone's lock-screen buttons, a home screen in the
  // same hues made deep enough for white labels, a deeper corner under the call's name label.
  "pastel-2": {
    tone: "light",
    pair: true,
    bigHome: true,
    home: `linear-gradient(135deg, ${tint(C.teal, 88)}, ${tint(C.purple, 84)})`,
    wall: (d) => ({
      bg: PASTEL,
      layers: [
        d === "call"
          ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 900px 380px at 0% 100%, ${tint(C.teal, 80)}, transparent)"></div>`
          : "",
        wizard(d, d === "iphone" ? 230 / 280 : 1, d === "iphone" ? -25 : 0),
        lockupAt(d),
      ],
    }),
  },
  // Mid-tone at the top for the white clock and desktop labels, fading to pastel where the
  // wizard and the lockup stand.
  "mid-fade": {
    tone: "mid",
    pair: true,
    bigHome: true,
    home: `linear-gradient(135deg, ${tint(C.teal, 88)}, ${tint(C.purple, 84)})`,
    wall: (d) => ({
      bg: `linear-gradient(180deg, ${tint(C.teal, 66)} 0%, ${tint(C.purple, 48)} 55%, ${tint(C.purple, 24)} 100%)`,
      layers: [wizard(d), lockupAt(d)],
    }),
  },
  pastel: light(`linear-gradient(135deg, ${tint(C.teal, 38)}, ${tint(C.purple, 36)})`),
  // The brand gradient in logo system D: wizard large and centred, wordmark under it.
  "gradient-classic": {
    tone: "mid",
    wall: (d) => {
      const { width: w, height: h } = DEVICES[d];
      const size = { mac: 600, ipad: 600, iphone: 360, call: 620 }[d];
      const top = { mac: 200, ipad: 290, iphone: 300, call: 170 }[d];
      const wm = size * 0.16;
      return {
        bg: GRADIENT,
        layers: [
          img(brand.emoji, `width:${size}px;left:${(w - size) / 2}px;top:${top}px`),
          img(
            brand.wordmarkNight,
            `height:${wm}px;left:50%;transform:translateX(-50%);top:${Math.min(top + size + wm * 0.6, h - wm * 2.4)}px`,
          ),
        ],
      };
    },
  },
  "gradient-d": {
    tone: "mid",
    pair: true,
    home: GRADIENT,
    wall: (d) => ({ bg: GRADIENT, layers: [wizard(d), lockupAt(d, true)] }),
  },
  // The wizard looks over a brand band, so the cut edge of the emoji never floats; the night
  // lockup sits in the band.
  "peek-band": {
    tone: "light",
    pair: true,
    wall: (d) => {
      const { width: w, height: h } = DEVICES[d];
      const band = { mac: 200, ipad: 330, iphone: 230, call: 230 }[d];
      const wiz = WIZ[d];
      const size = wiz.size * 0.9;
      const lh = { mac: 58, ipad: 56, iphone: 40, call: 64 }[d];
      const lx = { mac: 64, ipad: (w - lh * 5.365) / 2, iphone: (w - lh * 5.365) / 2, call: 90 }[d];
      const ly = { mac: h - band + 46, ipad: h - 172 - 100, iphone: h - 160, call: h - band + 50 }[
        d
      ];
      return {
        bg: C.bg,
        layers: [
          `<div style="position:absolute;left:0;right:0;bottom:0;height:${band}px;background:linear-gradient(90deg,${C.teal},${C.purple})"></div>`,
          img(
            brand.emoji,
            `width:${size}px;left:${d === "iphone" ? (w - size) / 2 : wiz.x + wiz.size - size}px;bottom:${band}px`,
          ),
          img(brand.lockupNight, `height:${lh}px;left:${lx}px;top:${ly}px`),
        ],
      };
    },
  },
  // Brand colour behind the clock, light where the wizard stands.
  dawn: {
    tone: "mid",
    pair: true,
    wall: (d) => ({
      bg: `linear-gradient(180deg, ${C.purple} 0%, ${tint(C.purple, 70)} 22%, ${tint(C.teal, 22)} 52%, ${C.bg} 78%)`,
      layers: [wizard(d), lockupAt(d)],
    }),
  },
  // Bold: a giant wizard cut by the screen edge, the lockup on the free side.
  giant: {
    tone: "light",
    pair: true,
    wall: (d) => {
      const { width: w, height: h } = DEVICES[d];
      const size = { mac: 1250, ipad: 1150, iphone: 720, call: 1100 }[d];
      const right = { mac: -300, ipad: -250, iphone: -300, call: -260 }[d];
      const bottom = { mac: -330, ipad: -280, iphone: -40, call: -330 }[d];
      return {
        bg: tint(C.teal, 12),
        layers: [
          img(brand.emoji, `width:${size}px;left:${w - size - right}px;top:${h - size - bottom}px`),
          lockupAt(d),
        ],
      };
    },
  },
  // Bold: the wordmark as a tonal field across the ground, the wizard large over it.
  watermark: {
    tone: "light",
    pair: true,
    wall: (d) => {
      const { width: w, height: h } = DEVICES[d];
      const field =
        d === "iphone"
          ? `height:${w * 0.3}px;left:${w * 0.5}px;top:${h * 0.47}px;transform:translate(-50%,-50%) rotate(-90deg)`
          : `width:${(d === "ipad" ? 0.7 : 0.82) * w}px;left:50%;top:${h * (d === "call" ? 0.3 : 0.42)}px;transform:translate(-50%,-50%)`;
      return {
        bg: "#FFFFFF",
        layers: [img(brand.wordmark, `${field};opacity:0.09`), wizard(d), lockupAt(d)],
      };
    },
  },
};

const homePage = (d: Device, ground = HOME_GROUND, big = false) =>
  wallPage(DEVICES[d], ground, [
    img(
      brand.lockupNight,
      `height:${(d === "iphone" ? 30 : 46) * (big ? 1.35 : 1)}px;left:50%;transform:translateX(-50%);top:${d === "iphone" ? (big ? 752 : 770) : 960}px`,
    ),
  ]);

// Read the variant selection and whether to render comparison screens.
function parseBackgroundArgs(args: string[]) {
  const out = args[0];
  if (!out) throw new Error("usage: generate.ts <out dir> [variant ...] [--mocks]");
  const names = args.slice(1).filter((arg) => !arg.startsWith("--"));
  return {
    out,
    chosen: names.length ? names : Object.keys(VARIANTS),
    mocks: args.includes("--mocks"),
  };
}

// The current dark wallpapers are included for comparison with the rendered variants.
function darkWallpapers(): VariantWallpaperSet {
  return {
    name: "dark",
    tone: "dark",
    files: {
      mac: join(DARK, "macbook-background.png"),
      ipad: join(DARK, "ipad-lock-background.png"),
      "ipad-home": join(DARK, "ipad-home-background.png"),
      iphone: join(DARK, "iphone-lock-background.png"),
      "iphone-home": join(DARK, "iphone-home-background.png"),
      call: join(DARK, "call-background.png"),
    },
  };
}

// Write one variant's device wallpapers, including the paired home screens where requested.
async function renderVariantWalls(
  b: Awaited<ReturnType<typeof browser>>,
  out: string,
  name: string,
): Promise<VariantWallpaperSet> {
  const variant = VARIANTS[name];
  if (!variant) throw new Error(`unknown variant ${name}`);
  const dir = join(out, name);
  mkdirSync(dir, { recursive: true });
  const files: Record<string, string> = {};
  for (const device of Object.keys(DEVICES) as Device[]) {
    const viewport = DEVICES[device];
    const { bg, layers } = variant.wall(device);
    const file = join(dir, `${device}.png`);
    writeFileSync(file, await b.shot(wallPage(viewport, bg, layers), viewport));
    files[device] = file;
    if (variant.pair && (device === "iphone" || device === "ipad")) {
      const home = join(dir, `${device}-home.png`);
      writeFileSync(home, await b.shot(homePage(device, variant.home, variant.bigHome), viewport));
      files[`${device}-home`] = home;
    }
  }
  return { name, tone: variant.tone, files };
}

async function generateBackgrounds() {
  const { out, chosen, mocks } = parseBackgroundArgs(process.argv.slice(2));
  const b = await browser();
  try {
    const wallpapers = new Map<string, VariantWallpaperSet>();
    for (const name of chosen) wallpapers.set(name, await renderVariantWalls(b, out, name));
    if (!mocks) return;
    wallpapers.set("dark", darkWallpapers());
    for (const wallpaper of wallpapers.values()) await renderVariantMocks(b, out, wallpaper);
  } finally {
    await b.close();
  }
}

if (import.meta.main)
  await (process.argv.includes("--layouts") ? generateLayouts() : generateBackgrounds());

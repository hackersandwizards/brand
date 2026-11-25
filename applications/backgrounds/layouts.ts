// Measured wallpaper layouts and the renderer for their variant and screen comparisons.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { crc32 } from "node:zlib";
import { brand, browser, tint } from "./render";
import {
  C,
  fileDevice,
  fileSize,
  img,
  MID,
  NIGHT,
  PASTEL,
  PASTEL_HOME,
  wallPage,
  type WallFile,
} from "./wall";
import { renderLayoutMocks, type LayoutWallpaper } from "./mocks";

type Base = "dark" | "light";
type Point = { x: number; y: number };
type LayoutJob = {
  base: Base;
  layout: string;
  elements: El[];
  wallpaper: LayoutWallpaper;
  mockStem: string;
};

// A pHYs chunk after IHDR, so macOS reads a 2x desktop file at its point size and fills the screen
// even with "Center". The pixels and every other byte stay as Chrome wrote them.
function withDpi(png: Buffer, dpi: number) {
  const ppm = Math.round(dpi / 0.0254);
  const body = Buffer.alloc(13);
  body.write("pHYs");
  body.writeUInt32BE(ppm, 4);
  body.writeUInt32BE(ppm, 8);
  body[12] = 1;
  const chunk = Buffer.alloc(21);
  chunk.writeUInt32BE(9);
  body.copy(chunk, 4);
  chunk.writeUInt32BE(crc32(body), 17);
  return Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)]);
}

// An element in the file's points, top left: wizard by width, lockup and wordmark by height,
// the stacked lockup (wizard over wordmark) by width. Lockup 5.365:1, wordmark 6.9:1, stack 2.01:1.
type El = ["w" | "l" | "m" | "k", number, number, number];
// Arrangements: lw = wizard and logo, logo = the lockup or (wm) the wordmark alone, wiz = the
// wizard alone. Zones kept clear: Mac Dock (x 484-1244 below y 1030), desktop files top right, lock
// clock (y 100-260) and login (y 936-1050); iPad portrait lock shows x 172-1204, clock to y 300,
// widgets to y 424; iPad landscape home shows y 172-1204, free band y 812-1072; iPhone clock to
// y 222, widgets to y 316, lock buttons at the bottom corners; iPhone home free band y 740-800;
// call head x 810-1110 from y 250, name label bottom left.
const LAYOUTS: Record<WallFile, Record<string, El[]>> = {
  // The MacBook's logo-r at the same point size, 130 pt from the right and the bottom edge as there.
  "mac-studio": {
    "logo-r": [["l", 99.7, 1895.1, 1206.3]],
  },
  mac: {
    "lw-split": [
      ["w", 420, 1258, 697],
      ["l", 60, 64, 907],
    ],
    "lw-stack-c": [["k", 520, 604, 430]],
    // The one-line lockup, its wordmark as large as in a 440 pt compact lockup
    // (99.7 = 440 x 1489 / 6571), its ink 130 pt from the right and the bottom edge.
    "logo-r": [["l", 99.7, 1063.1, 883.3]],
    "logo-ll": [["l", 56, 64, 880]],
    "logo-c": [["l", 90, 622, 515]],
    "logo-lr": [["l", 56, 1364, 960]],
    "logo-ul": [["l", 50, 64, 80]],
    "wm-c": [["m", 70, 622, 520]],
    "wiz-lr": [["w", 420, 1258, 697]],
    "wiz-giant": [["w", 900, 1008, 337]],
    "wiz-c": [["w", 380, 674, 408]],
  },
  ipad: {
    "lw-split": [
      ["w", 600, 584, 776],
      ["l", 56, 538, 470],
    ],
    "lw-stack-c": [["k", 560, 408, 620]],
    "lw-stack-low": [["k", 480, 448, 1017]],
    // Measured on the iPad: the lock screen shows the file 1.155 times enlarged around (688, 704);
    // the clock ends at y 470 of the file, notifications rise from the bottom. A smaller stack under
    // the clock, as wide as the clock.
    "lw-stack-up": [["k", 360, 508, 500]],
    // Measured on the iPad, landscape: the lock screen shows the file 1.28 times enlarged with its
    // top left at file point (91, 91), so the clock axis lies at file x 625, the clock ends at y 256
    // and a notification starts at y 800. The stack on that axis, a third of the way down the gap.
    "lw-stack-axis": [["k", 360, 445, 350]],
    // After setting lw-stack-axis: 1.146 times, horizontally centred, top at file y 153; clock
    // ends at y 337, the notifications start at y 945. iPadOS picks a new crop each time the file is
    // set, so the stack sits on the file's centre axis and inside the band both crops keep clear
    // (y 337-800).
    "lw-stack-centre": [["k", 360, 508, 440]],
    // The one-line lockup low, bottom centre. Both measured landscape crops show rows down to 897
    // and 1053 and their notifications start at 800 and 945, so the ink ends at 790; the portrait
    // crop's bottom rows never show in the landscape lock screen.
    "logo-band-low": [["l", 56, 537.8, 734]],
    "logo-c": [["l", 80, 473, 800]],
    "logo-low": [["l", 56, 538, 1200]],
    "logo-ll": [["l", 56, 228, 1200]],
    "wm-c": [["m", 64, 467, 800]],
    "wiz-br": [["w", 600, 584, 776]],
    "wiz-c": [["w", 520, 428, 640]],
    "wiz-giant": [["w", 1100, 364, 476]],
  },
  "ipad-home-wide": {
    // Five landscape home screenshots showed the square file at full width with its top 220 to 345
    // points down: 125 points of play against the 104 the band between labels and Dock leaves a
    // 36-point lockup, so no row of the square file clears all. Screen points of the landscape home
    // screen: the lowest app labels end at y 789.5, the Dock starts at 925.8. The lockup's ink
    // (841.5-875) centred between them, 52 and 51 points from each.
    "logo-gap": [["l", 36, 586.4, 838.7]],
    // The same lockup bottom right beside the Dock, its ink (878-912) 14 points above the Dock and
    // 80 from the right edge.
    "logo-br": [["l", 36, 1092.8, 875.5]],
    // A larger lockup bottom right, its ink (y 835.5-880.5) centred between the last app labels and
    // the Dock, 46 and 45 points from each. Measured on the iPad: the home screen shows this file
    // 1:1. In portrait iPadOS enlarges the file 1.334 times to the screen's height and, centred,
    // shows x 299-1067, so the ink starts at x 1075 and leaves no part of the wizard at that edge.
    "logo-br-out": [["l", 44, 1081, 834.8]],
  },
  "ipad-home": {
    "logo-band": [["l", 62, 521, 960]],
    // Measured on the iPad: landscape home shows rows 219-1251 unscaled; the lockup sat behind the
    // last icon row. Free band between the widgets (to y 1052) and the Dock (from y 1153).
    "logo-gap": [["l", 44, 570, 1081]],
    // Landscape home shows rows 275-1298 unscaled; the lockup centred between the
    // last app labels (y 1064) and the Dock (y 1201).
    "logo-gap-c": [["l", 44, 570, 1110]],
    // Rows 352-1374. The two measured crops differ by 77 points, so a smaller lockup sits
    // where it clears the app labels and the Dock under both.
    "logo-gap-r": [["l", 36, 591.4, 1153]],
    // The third landscape screenshot with logo-gap-r set: rows 344-1376 unscaled (bottom-aligned,
    // as the second), last app labels end at y 1143, Dock from y 1279. The lockup's centre on the
    // band's centre (y 1211). Under the first crop (rows 275-1298) its lower half sits behind the
    // Dock.
    "logo-gap-low": [["l", 36, 591.4, 1191]],
    "logo-band-s": [["l", 44, 570, 972]],
    "logo-ll": [["l", 44, 90, 1000]],
    "logo-lr": [["l", 44, 1050, 1000]],
    "wm-band": [["m", 46, 529, 968]],
    "wiz-band": [["w", 220, 578, 832]],
    "wiz-br": [["w", 260, 1040, 812]],
    "lw-split": [
      ["w", 240, 1060, 830],
      ["l", 44, 90, 1000],
    ],
    "lw-stack-c": [["k", 400, 488, 850]],
  },
  iphone: {
    "lw-split": [
      ["w", 230, 105, 726],
      ["l", 44, 102, 500],
    ],
    "lw-stack-c": [["k", 300, 70, 470]],
    // Measured on the iPhone: notifications cover y 516-727, so the stack sits under the clock.
    "lw-stack-up": [["k", 270, 85, 277]],
    "lw-stack-low": [["k", 240, 100, 777]],
    // Measured on the iPhone: it shows the file 1.1525 times enlarged around its centre; the stack
    // 53 pt lower, clear of the clock and still above two expanded notifications, the wizard's edge
    // 5 pt below the widget row (y 316).
    "lw-stack-mid": [["k", 270, 85, 330]],
    "logo-c": [["l", 44, 102, 520]],
    "logo-up": [["l", 40, 113, 360]],
    "logo-low": [["l", 40, 113, 816]],
    // The iPhone home's lockup (40.5 pt) bottom centre. The 1.1525 enlargement around the centre
    // puts its ink at screen y 783-830, 18 pt above the flashlight and camera row (848) and 56 pt
    // below two notifications (to 727).
    "logo-bottom": [["l", 40.5, 111, 742.9]],
    // The same lockup under the clock, its ink centred on x 220. Measured on the iPhone with the
    // tall clock and the widget row at the bottom: the wallpaper editor shows the file 1:1, the clock
    // ends at y 245, the widget row starts at 714, two notifications above it reach up to 474. Ink at
    // y 349-390 there, 330-376 under the lock screen's 1.1525 enlargement: clear of the clock, of a
    // widget row under the clock (to screen y 291, file y 316) and of two notifications; a third in
    // the list reaches it.
    "logo-high": [["l", 40.5, 114.7, 348]],
    "wm-c": [["m", 34, 103, 520]],
    "wiz-low": [["w", 230, 105, 726]],
    "wiz-c": [["w", 260, 90, 420]],
    "wiz-giant": [["w", 620, -10, 426]],
  },
  "iphone-home": {
    "logo-band": [["l", 40.5, 111, 752]],
    // Measured on the iPhone: the Search pill sits at y 770-798, so the lockup moves into the gap
    // between the last icon row (to y 688) and the pill.
    "logo-gap": [["l", 40.5, 111, 708]],
    "logo-band-s": [["l", 30, 139, 762]],
    "wm-band": [["m", 26, 130, 764]],
    "wiz-band": [["w", 64, 188, 738]],
    "wiz-giant": [["w", 520, -40, 300]],
  },
  call: {
    "lw-split": [
      ["w", 560, 1290, 520],
      ["l", 76, 1032, 100],
    ],
    "lw-stack-r": [["k", 420, 1410, 300]],
    "logo-ur-in": [["l", 64, 1130, 110]],
    "logo-ul": [["l", 64, 90, 90]],
    "logo-ur": [["l", 64, 1487, 90]],
    "logo-lr": [["l", 64, 1487, 926]],
    "wm-ur": [["m", 56, 1444, 92]],
    "wiz-lr": [["w", 560, 1290, 520]],
    "wiz-ur": [["w", 300, 1540, 80]],
    "wiz-giant": [["w", 1000, 1140, 260]],
  },
};

// The boxes the layouts measure the lockup and the compact lockup by, in SVG units: each cut sits
// so its letters land where they sit in these, whatever its own box holds round the wizard.
const LAYOUT_BOX: Record<string, number[]> = {
  lockup: [-1321.814, -288.642, 7988.814, 1489],
  "lockup-compact": [96, -2322.396, 6571, 3269.396],
};

// A lockup inlined with the 4096 px wizard master in place of the 512 px PNG the brand SVG embeds:
// the iPad lock draws the wizard at 435 px and iPadOS enlarges it 1.155 times. Width, height and
// position name the layout box.
function inlineLockup(url: string, size: { width: number } | { height: number }, { x, y }: Point) {
  const box = (file: string) =>
    readFileSync(new URL(file), "utf8")
      .match(/viewBox="([^"]+)"/)![1]
      .split(" ")
      .map(Number);
  const svg = readFileSync(new URL(url), "utf8");
  const [vx, vy, vw, vh] = box(url);
  const [dx, dy, dw, dh] = LAYOUT_BOX[/(lockup(-compact)?)(-night)?\.svg$/.exec(url)![1]];
  const k = "width" in size ? size.width / dw : size.height / dh;
  const pos = `left:${x - (dx - vx) * k}px;top:${y - (dy - vy) * k}px`;
  return svg
    .replace(/ width="[\d.]+" height="[\d.]+"/, ` width="${vw * k}" height="${vh * k}"`)
    .replace("<svg ", `<svg style="position:absolute;${pos}" `)
    .replace(/(<image x=[^>]*href=)"data:image\/png;base64,[^"]+"/, `$1"${brand.emoji}"`);
}

// Render the measured elements over the ground for the given device.
function layoutWall({ base, wallpaper: { file: f }, elements }: LayoutJob) {
  // White-ink marks on the dark ground and on the deep light home ground.
  const night = base === "dark" || f.includes("-home");
  const bg =
    base === "dark"
      ? NIGHT
      : fileDevice(f) === "mac"
        ? MID
        : f.includes("-home")
          ? PASTEL_HOME
          : PASTEL;
  const glow =
    base === "light" && f === "call"
      ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 900px 380px at 0% 100%, ${tint(C.teal, 80)}, transparent)"></div>`
      : "";
  const layers = elements.map(([k, n, x, y]) => {
    const pos = `left:${x}px;top:${y}px`;
    if (k === "w") return img(brand.emoji, `width:${n}px;height:${n}px;${pos}`);
    if (k === "l")
      return inlineLockup(night ? brand.lockupNight : brand.lockup, { height: n }, { x, y });
    if (k === "m") return img(night ? brand.wordmarkNight : brand.wordmark, `height:${n}px;${pos}`);
    return inlineLockup(night ? brand.compactNight : brand.compact, { width: n }, { x, y });
  });
  return wallPage(fileSize(f), bg, [glow, ...layers]);
}

// Read the base tones and optional set of layout IDs from the command line.
export function parseLayoutArgs(args: string[]) {
  const opt = (key: string) => (args.includes(key) ? args[args.indexOf(key) + 1] : undefined);
  const base = opt("--base") as Base | undefined;
  const bases: Base[] = base ? [base] : ["dark", "light"];
  return { out: args[0], bases, only: opt("--only")?.split(",") };
}

// Enumerate matching layouts in the table's device and layout order, once per chosen base.
export function planLayouts(out: string, bases: Base[], only?: string[]): LayoutJob[] {
  const selected = (Object.keys(LAYOUTS) as WallFile[])
    .flatMap((file) =>
      Object.entries(LAYOUTS[file]).map(([layout, elements]) => ({ file, layout, elements })),
    )
    .filter(({ file, layout }) => !only || only.includes(`${file}:${layout}`));
  return bases.flatMap((base) =>
    selected.map(({ file, layout, elements }) => ({
      base,
      layout,
      elements,
      wallpaper: {
        file,
        path: join(out, base, file, `${layout}.png`),
        tone: base === "dark" ? "dark" : fileDevice(file) === "mac" ? "mid" : "light",
      },
      mockStem: join(out, "mocks", `${base}~${layout}`),
    })),
  );
}

// Write the wallpapers and previews for every selected base and measured layout.
export async function generateLayouts() {
  const { out, bases, only } = parseLayoutArgs(process.argv.slice(2));
  const b = await browser();
  try {
    for (const job of planLayouts(out, bases, only)) {
      const { wallpaper, mockStem } = job;
      const viewport = fileSize(wallpaper.file);
      mkdirSync(dirname(wallpaper.path), { recursive: true });
      const mac = fileDevice(wallpaper.file) === "mac";
      const png = await b.shot(layoutWall(job), viewport);
      writeFileSync(wallpaper.path, mac ? withDpi(png, 72 * viewport.scale) : png);
      await renderLayoutMocks(b, mockStem, wallpaper);
    }
  } finally {
    await b.close();
  }
}

// Light and mid-tone device backgrounds in logo system D, plus device mocks for the blind review.
// bun applications/backgrounds/generate.ts <out dir> [variant ...] [--mocks]
// Writes <out>/<variant>/<device>[-home].png and, with --mocks, <out>/mocks/<variant>-<panel>.jpg;
// the mocks include the current dark files beside this script as "dark".
// the dark reference mocks come from the PNGs in <dark dir>.
// Layout round: bun generate.ts <out dir> --layouts [--base dark|light] [--only <file>:<layout>,...]
// writes <out>/<base>/<file>/<layout>.png and per screen <out>/mocks/<base>~<layout>~<screen>.jpg
// (1000 px long edge) plus -detail.jpg (the system text at real size, where the mock is larger).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { crc32 } from "node:zlib";
import sharp from "sharp";
import { brand, browser, fileUrl, fontFaces, tint, toJpeg } from "./render";

const DARK = import.meta.dir;

type Device = "mac" | "ipad" | "iphone" | "call";
// Size in points, scale to pixels: MacBook Pro 16", iPad Pro 13" (square, so both orientations
// crop it), iPhone 17 Pro Max, and a 1080p call background.
const DEVICES: Record<Device, { w: number; h: number; s: number }> = {
  mac: { w: 1728, h: 1117, s: 2 },
  ipad: { w: 1376, h: 1376, s: 2 },
  iphone: { w: 440, h: 956, s: 3 },
  call: { w: 1920, h: 1080, s: 1 },
};
// iPad Pro 12.9" in landscape, the screen's own size: a 4:3 file leaves iPadOS no vertical play.
const IPAD_WIDE = { w: 1366, h: 1024, s: 2 };
// Apple Studio Display 27", 5120 x 2880 at 2x: its own file, as a MacBook file left bars there.
const STUDIO = { w: 2560, h: 1440, s: 2 };

const C = {
  teal: "#1A7285",
  purple: "#9333EA",
  bg: "#F7F9FA",
  tealNight: "#47AEC6",
  purpleNight: "#B97AF1",
};
const GRADIENT = `linear-gradient(180deg, ${C.purple}, ${C.teal})`;
// Mid-tone ground for paired home screens: white iOS labels stay legible on it.
const HOME_GROUND = `linear-gradient(135deg, ${C.teal}, ${C.purple})`;
const PASTEL = `linear-gradient(135deg, ${tint(C.teal, 38)}, ${tint(C.purple, 36)})`;
const MID = `linear-gradient(135deg, ${tint(C.teal, 62)}, ${tint(C.purple, 58)})`;

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

type Layer = string;
const img = (src: string, css: string, extra = "") =>
  `<img src="${src}" style="position:absolute;${css}" ${extra}>`;
const wizard = (d: Device, scale = 1, dx = 0, dy = 0) => {
  const { size, x, bottom } = WIZ[d];
  const s = size * scale;
  return img(
    brand.emoji,
    `width:${s}px;height:${s}px;left:${x + size - s + dx}px;bottom:${bottom - dy}px`,
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
  // The March gradient, brought to logo system D: wizard large and centred, wordmark under it.
  "gradient-classic": {
    tone: "mid",
    wall: (d) => {
      const { w, h } = DEVICES[d];
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
      const { w, h } = DEVICES[d];
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
      const { w, h } = DEVICES[d];
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
      const { w, h } = DEVICES[d];
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

function page(d: Device, bg: string, layers: Layer[], { w, h } = DEVICES[d]) {
  return `<!doctype html><meta charset="utf-8"><style>${fontFaces}*{margin:0}body{width:${w}px;height:${h}px;overflow:hidden;position:relative;background:${bg}}</style>${layers.join("")}`;
}

const homePage = (d: Device, ground = HOME_GROUND, big = false) =>
  page(d, ground, [
    img(
      brand.lockupNight,
      `height:${(d === "iphone" ? 30 : 46) * (big ? 1.35 : 1)}px;left:50%;transform:translateX(-50%);top:${d === "iphone" ? (big ? 752 : 770) : 960}px`,
    ),
  ]);

// ---------- mocks at real display size (points, 1x) ----------

const ICON = [
  "#34C759,#30B0C7",
  "#FF9500,#FF2D55",
  "#5856D6,#AF52DE",
  "#007AFF,#5AC8FA",
  "#FFCC00,#FF9500",
  "#FF3B30,#FF2D55",
  "#8E8E93,#636366",
  "#30D158,#34C759",
];
const APPS =
  "Mail Calendar Photos Camera Maps Weather Notes Slack Meet Music Settings Files Clock Wallet Teams Linear Notion Podcasts Health News Books Zoom Fathom Arc".split(
    " ",
  );
const icon = (i: number, size: number) =>
  `<div style="width:${size}px;height:${size}px;border-radius:${size * 0.23}px;background:linear-gradient(135deg,${ICON[i % ICON.length]});box-shadow:0 1px 3px rgba(0,0,0,.2)"></div>`;
const appLabel = (t: string, size: number) =>
  `<div style="font:500 ${size}px Inter;color:#fff;text-shadow:0 0 3px rgba(0,0,0,.35);margin-top:5px;text-align:center">${t}</div>`;

function mockPage(w: number, h: number, wall: string, overlay: string, wallCss = "") {
  return `<!doctype html><meta charset="utf-8"><style>${fontFaces}*{margin:0;box-sizing:border-box}body{width:${w}px;height:${h}px;overflow:hidden;position:relative;font-family:Inter;background:#ddd}.wall{position:absolute;inset:0;background:url("${wall}") center/cover;${wallCss}}</style><div class="wall"></div>${overlay}`;
}

function macDesktop(dark: boolean) {
  const ink = dark ? "#fff" : "#111";
  const dock = Array.from({ length: 11 }, (_, i) => icon(i, 56)).join("");
  return `<div style="position:absolute;left:0;right:0;top:0;height:37px;background:rgba(255,255,255,${dark ? 0.08 : 0.35});backdrop-filter:blur(20px);display:flex;align-items:center;gap:22px;padding:0 20px;font:600 14px Inter;color:${ink}"><span>&#63743;</span><span>Finder</span><span style="font-weight:400">File</span><span style="font-weight:400">Edit</span><span style="font-weight:400">View</span><span style="font-weight:400">Go</span><span style="font-weight:400">Window</span><span style="margin-left:auto;font-weight:400">Thu 29 Oct 09:41</span></div>
<div style="position:absolute;left:764px;top:0;width:200px;height:37px;background:#000;border-radius:0 0 14px 14px"></div>
<div style="position:absolute;right:28px;top:60px;display:flex;flex-direction:column;align-items:center;gap:22px">${[0, 1].map((i) => `<div style="display:flex;flex-direction:column;align-items:center">${icon(i + 3, 60)}<div style="font:500 12px Inter;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.6);margin-top:4px">${["Screenshot.png", "Angebot.pdf"][i]}</div></div>`).join("")}</div>
<div style="position:absolute;left:150px;top:110px;width:760px;height:500px;background:#fff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.35)"><div style="height:44px;border-bottom:1px solid #e5e5e5;display:flex;align-items:center;gap:8px;padding:0 16px"><i style="width:12px;height:12px;border-radius:6px;background:#ff5f57"></i><i style="width:12px;height:12px;border-radius:6px;background:#febc2e"></i><i style="width:12px;height:12px;border-radius:6px;background:#28c840"></i><div style="margin-left:120px;width:360px;height:26px;background:#f0f0f0;border-radius:7px"></div></div><div style="padding:30px 40px;display:flex;flex-direction:column;gap:14px">${Array.from({ length: 11 }, (_, i) => `<div style="height:10px;width:${[60, 95, 92, 97, 88, 94, 90, 96, 85, 93, 70][i]}%;background:#e3e5e8;border-radius:5px"></div>`).join("")}</div></div>
<div style="position:absolute;left:800px;top:430px;width:460px;height:330px;background:#1e1e1e;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.4);padding:44px 18px;font:13px/1.7 'JetBrains Mono';color:#d4d4d4">$ bun run check<br>&#10003; 412 tests passed<br>$ claude<br>&gt; refactor the billing run</div>
<div style="position:absolute;left:50%;transform:translateX(-50%);bottom:8px;display:flex;gap:10px;padding:9px 12px;background:rgba(255,255,255,.28);backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,.35);border-radius:24px">${dock}</div>`;
}

function macLock(dark: boolean) {
  const ink = dark ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.88)";
  return `<div style="position:absolute;right:24px;top:10px;font:500 13px Inter;color:${ink}">DE &nbsp; 100% &nbsp; Wi-Fi</div>
<div style="position:absolute;left:0;right:0;top:108px;text-align:center;font:600 24px Inter;color:${ink};text-shadow:0 1px 6px rgba(0,0,0,.18)">Thursday 29 October</div>
<div style="position:absolute;left:0;right:0;top:136px;text-align:center;font:700 118px/1 Inter;color:${ink};text-shadow:0 1px 10px rgba(0,0,0,.18);letter-spacing:-2px">9:41</div>
<div style="position:absolute;left:836px;top:936px;width:57px;height:57px;border-radius:50%;background:linear-gradient(#b8bec8,#8a93a0);border:2px solid rgba(255,255,255,.6)"></div>
<div style="position:absolute;left:0;right:0;top:1000px;text-align:center;font:600 14px Inter;color:${ink};text-shadow:0 1px 4px rgba(0,0,0,.3)">Benedikt Stemmildt</div>
<div style="position:absolute;left:792px;top:1024px;width:143px;height:24px;border-radius:12px;background:rgba(255,255,255,.3);backdrop-filter:blur(10px);font:12px/24px Inter;color:rgba(255,255,255,.8);padding-left:10px">Enter Password</div>`;
}

function iphoneLock(clockInk: string) {
  return `<div style="position:absolute;left:157px;top:11px;width:126px;height:37px;border-radius:19px;background:#000"></div>
<div style="position:absolute;left:34px;top:18px;font:600 16px Inter;color:${clockInk}">Telekom</div><div style="position:absolute;right:30px;top:18px;font:600 15px Inter;color:${clockInk}">5G &#9646;&#9646;&#9646;</div>
<div style="position:absolute;left:0;right:0;top:92px;text-align:center;font:600 21px Inter;color:${clockInk}">Thursday 29 October</div>
<div style="position:absolute;left:0;right:0;top:112px;text-align:center;font:700 104px/1.05 Inter;color:${clockInk};letter-spacing:-3px">9:41</div>
<div style="position:absolute;left:0;right:0;top:250px;display:flex;justify-content:center;gap:14px">${[0, 1, 2, 3].map(() => `<div style="width:66px;height:66px;border-radius:33px;background:rgba(255,255,255,.28);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.3)"></div>`).join("")}</div>
<div style="position:absolute;left:48px;bottom:58px;width:50px;height:50px;border-radius:25px;background:rgba(0,0,0,.28);backdrop-filter:blur(12px)"></div><div style="position:absolute;right:48px;bottom:58px;width:50px;height:50px;border-radius:25px;background:rgba(0,0,0,.28);backdrop-filter:blur(12px)"></div>
<div style="position:absolute;left:150px;bottom:9px;width:140px;height:5px;border-radius:3px;background:${clockInk}"></div>`;
}

function iphoneHome() {
  const grid = APPS.map(
    (a, i) =>
      `<div style="display:flex;flex-direction:column;align-items:center;width:80px">${icon(i, 64)}${appLabel(a, 11.5)}</div>`,
  ).join("");
  return `<div style="position:absolute;left:157px;top:11px;width:126px;height:37px;border-radius:19px;background:#000"></div><div style="position:absolute;left:40px;top:18px;font:600 16px Inter;color:#fff">9:41</div>
<div style="position:absolute;left:22px;right:22px;top:80px;display:grid;grid-template-columns:repeat(4,1fr);row-gap:26px;justify-items:center">${grid}</div>
<div style="position:absolute;left:180px;top:808px;width:80px;height:28px;border-radius:14px;background:rgba(0,0,0,.25);backdrop-filter:blur(10px);font:500 13px/28px Inter;color:#fff;text-align:center">Search</div>
<div style="position:absolute;left:12px;right:12px;bottom:12px;height:96px;border-radius:36px;background:rgba(255,255,255,.25);backdrop-filter:blur(20px);display:flex;justify-content:space-around;align-items:center">${[5, 7, 3, 1].map((i) => icon(i, 64)).join("")}</div>`;
}

function ipadHomeLandscape() {
  const grid = APPS.slice(0, 24)
    .map(
      (a, i) =>
        `<div style="display:flex;flex-direction:column;align-items:center;width:110px">${icon(i, 76)}${appLabel(a, 13)}</div>`,
    )
    .join("");
  return `<div style="position:absolute;left:24px;top:10px;font:600 15px Inter;color:#fff">09:41 Thu 29 Oct</div>
<div style="position:absolute;left:90px;right:90px;top:70px;display:grid;grid-template-columns:repeat(6,1fr);row-gap:40px;justify-items:center">${grid}</div>
<div style="position:absolute;left:50%;transform:translateX(-50%);bottom:18px;display:flex;gap:18px;padding:14px 18px;border-radius:32px;background:rgba(255,255,255,.28);backdrop-filter:blur(24px)">${Array.from({ length: 9 }, (_, i) => icon(i + 2, 70)).join("")}</div>`;
}

function ipadLockPortrait(ink: string) {
  return `<div style="position:absolute;right:24px;top:12px;font:600 15px Inter;color:${ink}">Wi-Fi 100%</div>
<div style="position:absolute;left:0;right:0;top:120px;text-align:center;font:600 26px Inter;color:${ink}">Thursday 29 October</div>
<div style="position:absolute;left:0;right:0;top:150px;text-align:center;font:700 150px/1 Inter;color:${ink};letter-spacing:-4px">9:41</div>
<div style="position:absolute;left:0;right:0;top:340px;display:flex;justify-content:center;gap:18px">${[0, 1, 2, 3].map(() => `<div style="width:84px;height:84px;border-radius:42px;background:rgba(255,255,255,.28);backdrop-filter:blur(12px)"></div>`).join("")}</div>
<div style="position:absolute;left:446px;bottom:10px;width:140px;height:5px;border-radius:3px;background:${ink}"></div>`;
}

const person = (w: number, h: number) =>
  `<svg viewBox="0 0 1920 1080" width="${w}" height="${h}" style="position:absolute;left:0;top:0"><ellipse cx="960" cy="470" rx="150" ry="185" fill="#c99a7c"/><path d="M810 420 Q820 250 960 250 Q1100 250 1110 420 Q1080 330 960 330 Q840 330 810 420Z" fill="#3b2f2a"/><rect x="905" y="620" width="110" height="90" fill="#b98a6c"/><path d="M560 1080 Q570 760 800 700 L960 760 L1120 700 Q1350 760 1360 1080Z" fill="#26313f"/><path d="M880 700 L960 800 L1040 700 Z" fill="#e8e8e8"/></svg>`;

function callMock(wall: string) {
  const tile = (w: number, h: number, inner: string, name: string) =>
    `<div style="position:relative;width:${w}px;height:${h}px;border-radius:10px;overflow:hidden;background:#3c4043">${inner}<div style="position:absolute;left:10px;bottom:8px;font:500 ${Math.max(11, w / 60)}px Inter;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.7)">${name}</div></div>`;
  const ours = (w: number, h: number) =>
    `<div style="position:absolute;inset:0;background:url('${wall}') center/cover"></div>${person(w, h)}`;
  const other = (c: string) => `<div style="position:absolute;inset:0;background:${c}"></div>`;
  const square = `<div style="position:absolute;inset:0;background:url('${wall}') center/cover"></div><svg viewBox="420 0 1080 1080" width="330" height="330" style="position:absolute;left:0;top:0"><use href="#p"/></svg>`;
  return `<!doctype html><meta charset="utf-8"><style>${fontFaces}*{margin:0;box-sizing:border-box}body{width:1700px;height:820px;background:#202124;font-family:Inter;position:relative;overflow:hidden}</style>
<svg width="0" height="0" style="position:absolute"><defs><g id="p">${person(1920, 1080).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g></defs></svg>
<div style="position:absolute;left:20px;top:20px">${tile(1280, 720, ours(1280, 720), "Benedikt Stemmildt")}</div>
<div style="position:absolute;left:1320px;top:20px;display:flex;flex-direction:column;gap:12px">${tile(360, 203, ours(360, 203), "Benedikt Stemmildt")}${tile(360, 203, other("linear-gradient(#6b5b4b,#3e352d)"), "Client CTO")}<div style="font:500 13px Inter;color:#9aa0a6;margin-top:6px">Phone, square tile:</div>${tile(330, 330, square, "Benedikt")}</div>`;
}

async function generateBackgrounds() {
  const args = process.argv.slice(2);
  const out = args[0];
  if (!out) throw new Error("usage: generate.ts <out dir> [variant ...] [--mocks]");
  const mocks = args.includes("--mocks");
  const names = args.slice(1).filter((a) => !a.startsWith("--"));
  const chosen = names.length ? names : Object.keys(VARIANTS);
  const b = await browser();
  try {
    const files: Record<string, Record<string, string>> = {};
    for (const name of chosen) {
      const v = VARIANTS[name];
      if (!v) throw new Error(`unknown variant ${name}`);
      mkdirSync(join(out, name), { recursive: true });
      files[name] = {};
      for (const d of Object.keys(DEVICES) as Device[]) {
        const { w, h, s } = DEVICES[d];
        const { bg, layers } = v.wall(d);
        const file = join(out, name, `${d}.png`);
        writeFileSync(file, await b.shot(page(d, bg, layers), w, h, s));
        files[name][d] = file;
        if (v.pair && (d === "iphone" || d === "ipad")) {
          const home = join(out, name, `${d}-home.png`);
          writeFileSync(home, await b.shot(homePage(d, v.home, v.bigHome), w, h, s));
          files[name][`${d}-home`] = home;
        }
      }
    }
    if (mocks) {
      files.dark = {
        mac: join(DARK, "macbook-background.png"),
        ipad: join(DARK, "ipad-background.png"),
        iphone: join(DARK, "iphone-wallpaper.png"),
        call: join(DARK, "call-background.png"),
      };
    }
    if (mocks) {
      const dir = join(out, "mocks");
      mkdirSync(dir, { recursive: true });
      for (const [name, f] of Object.entries(files)) {
        const dark = name === "dark";
        const tone = dark ? "dark" : VARIANTS[name].tone;
        const u = (k: string) => fileUrl(f[k] ?? f[k.replace("-home", "")]);
        const ink = tone === "light" ? "#1d2733" : "#fff";
        const save = async (panel: string, html: string, w: number, h: number) =>
          writeFileSync(
            join(dir, `${name}-${panel}.jpg`),
            await toJpeg(await b.shot(html, w, h, 1)),
          );
        await save(
          "mac-desktop",
          mockPage(1728, 1117, u("mac"), macDesktop(tone !== "light")),
          1728,
          1117,
        );
        await save(
          "mac-lock",
          mockPage(1728, 1117, u("mac"), macLock(tone !== "light")),
          1728,
          1117,
        );
        // iPad: portrait lock crops the square's middle columns, landscape home its middle rows.
        await save(
          "ipad",
          `<!doctype html><meta charset="utf-8"><style>body{margin:0;width:2448px;height:1376px;background:#fff;position:relative}</style>
<iframe style="position:absolute;left:0;top:0;width:1032px;height:1376px;border:0" srcdoc="${attrEscape(mockPage(1032, 1376, u("ipad"), ipadLockPortrait(ink)))}"></iframe>
<iframe style="position:absolute;left:1072px;top:172px;width:1376px;height:1032px;border:0" srcdoc="${attrEscape(mockPage(1376, 1032, u("ipad-home"), ipadHomeLandscape()))}"></iframe>`,
          2448,
          1376,
        );
        await save(
          "iphone",
          `<!doctype html><meta charset="utf-8"><style>body{margin:0;width:920px;height:956px;background:#fff;position:relative}iframe{position:absolute;top:0;width:440px;height:956px;border:0;border-radius:56px}</style>
<iframe style="left:0" srcdoc="${attrEscape(mockPage(440, 956, u("iphone"), iphoneLock(ink)))}"></iframe>
<iframe style="left:480px" srcdoc="${attrEscape(mockPage(440, 956, u("iphone-home"), iphoneHome()))}"></iframe>`,
          920,
          956,
        );
        await save("call", callMock(u("call")), 1700, 820);
      }
    }
  } finally {
    await b.close();
  }
}

// ---------- layout round: arrangement x position on one colour base ----------

// The Night ground of the dark files in the design guide, rebuilt without the lockup: #111A24 to
// #0B1118, a teal glow top left and a purple glow bottom right, the direction of --gradient-magic.
const NIGHT = `radial-gradient(ellipse 60% 50% at 100% 100%, rgba(147,51,234,.24), transparent 70%), radial-gradient(ellipse 45% 45% at 0% 0%, rgba(26,114,133,.32), transparent 70%), linear-gradient(180deg, #111A24, #0B1118)`;
const PASTEL_HOME = `linear-gradient(135deg, ${tint(C.teal, 88)}, ${tint(C.purple, 84)})`;
type Base = "dark" | "light";
type WallFile =
  | "mac"
  | "mac-studio"
  | "ipad"
  | "ipad-home"
  | "ipad-home-wide"
  | "iphone"
  | "iphone-home"
  | "call";
type Screen =
  "mac-desktop" | "mac-lock" | "ipad-lock" | "ipad-home" | "iphone-lock" | "iphone-home" | "call";
const SCREEN_FILE: Record<Screen, WallFile> = {
  "mac-desktop": "mac",
  "mac-lock": "mac",
  "ipad-lock": "ipad",
  "ipad-home": "ipad-home",
  "iphone-lock": "iphone",
  "iphone-home": "iphone-home",
  call: "call",
};
const fileDevice = (f: WallFile) => f.replace(/-(home(-wide)?|studio)$/, "") as Device;
const fileSize = (f: WallFile) =>
  f === "ipad-home-wide" ? IPAD_WIDE : f === "mac-studio" ? STUDIO : DEVICES[fileDevice(f)];

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
// wizard alone. lw-split on the lock files and logo-band on the home files are today's light
// winner. Zones kept clear: Mac Dock (x 484-1244 below y 1030), desktop files top right, lock
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
    // The one-line lockup, its wordmark as large as in the 440 pt compact lockup it replaced
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
    // Measured on Benedikt's iPad: the lock screen shows the file 1.155 times enlarged around (688, 704);
    // the clock ends at y 470 of the file, notifications rise from the bottom. A smaller stack under
    // the clock, as wide as the clock.
    "lw-stack-up": [["k", 360, 508, 500]],
    // Measured on Benedikt's iPad, landscape: the lock screen shows the file 1.28 times enlarged
    // with its top left at file point (91, 91), so the clock axis lies at file x 625, the clock ends at
    // y 256 and a notification starts at y 800. The stack on that axis, a third of the way down the gap.
    "lw-stack-axis": [["k", 360, 445, 350]],
    // 21:13, after setting lw-stack-axis: 1.146 times, horizontally centred, top at file y 153; clock
    // ends at y 337, the notifications start at y 945. iPadOS picks a new crop each time the file is
    // set, so the stack sits on the file's centre axis and inside the band both crops keep clear
    // (y 337-800).
    "lw-stack-centre": [["k", 360, 508, 440]],
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
    // 36-point lockup, so no row of the square file clears all. Screen points of his landscape home
    // screen: the lowest app labels end at y 789.5, the Dock starts at 925.8. The lockup's ink
    // (841.5-875) centred between them, 52 and 51 points from each.
    "logo-gap": [["l", 36, 586.4, 838.7]],
  },
  "ipad-home": {
    "logo-band": [["l", 62, 521, 960]],
    // Measured on Benedikt's iPad: landscape home shows rows 219-1251 unscaled; the lockup sat behind the
    // last icon row. Free band between the widgets (to y 1052) and the Dock (from y 1153).
    "logo-gap": [["l", 44, 570, 1081]],
    // Same evening: landscape home shows rows 275-1298 unscaled; the lockup centred between the
    // last app labels (y 1064) and the Dock (y 1201).
    "logo-gap-c": [["l", 44, 570, 1110]],
    // 21:13: rows 352-1374. The two measured crops differ by 77 points, so a smaller lockup sits
    // where it clears the app labels and the Dock under both.
    "logo-gap-r": [["l", 36, 591.4, 1153]],
    // His third landscape screenshot with logo-gap-r set: rows 344-1376 unscaled (bottom-aligned, as
    // the second), last app labels end at y 1143, Dock from y 1279. The lockup's centre on the
    // band's centre (y 1211). Under the first crop (rows 275-1298) its lower half sits behind the Dock.
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
    // Measured on Benedikt's phone: notifications cover y 516-727, so the stack sits under the clock.
    "lw-stack-up": [["k", 270, 85, 277]],
    "lw-stack-low": [["k", 240, 100, 777]],
    // Measured on Benedikt's phone: it shows the file 1.1525 times enlarged around its centre;
    // the stack 53 pt lower, clear of the clock and still above two expanded notifications, the
    // wizard's edge 5 pt below the widget row (y 316).
    "lw-stack-mid": [["k", 270, 85, 330]],
    "logo-c": [["l", 44, 102, 520]],
    "logo-up": [["l", 40, 113, 360]],
    "logo-low": [["l", 40, 113, 816]],
    "wm-c": [["m", 34, 103, 520]],
    "wiz-low": [["w", 230, 105, 726]],
    "wiz-c": [["w", 260, 90, 420]],
    "wiz-giant": [["w", 620, -10, 426]],
  },
  "iphone-home": {
    "logo-band": [["l", 40.5, 111, 752]],
    // Measured on Benedikt's phone: the Search pill sits at y 770-798, so the lockup moves into the gap
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
function inlineLockup(url: string, width: number, height: number, x: number, y: number) {
  const box = (file: string) =>
    readFileSync(new URL(file), "utf8")
      .match(/viewBox="([^"]+)"/)![1]
      .split(" ")
      .map(Number);
  const svg = readFileSync(new URL(url), "utf8");
  const [vx, vy, vw, vh] = box(url);
  const [dx, dy, dw, dh] = LAYOUT_BOX[/(lockup(-compact)?)(-night)?\.svg$/.exec(url)![1]];
  const k = width ? width / dw : height / dh;
  const pos = `left:${x - (dx - vx) * k}px;top:${y - (dy - vy) * k}px`;
  return svg
    .replace(/ width="[\d.]+" height="[\d.]+"/, ` width="${vw * k}" height="${vh * k}"`)
    .replace("<svg ", `<svg style="position:absolute;${pos}" `)
    .replace(/(<image x=[^>]*href=)"data:image\/png;base64,[^"]+"/, `$1"${brand.emoji}"`);
}

function layoutWall(base: Base, f: WallFile, layout: string) {
  const els = LAYOUTS[f][layout];
  if (!els) throw new Error(`unknown layout ${f}:${layout}`);
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
  const layers = els.map(([k, n, x, y]) => {
    const pos = `left:${x}px;top:${y}px`;
    if (k === "w") return img(brand.emoji, `width:${n}px;height:${n}px;${pos}`);
    if (k === "l") return inlineLockup(night ? brand.lockupNight : brand.lockup, 0, n, x, y);
    if (k === "m") return img(night ? brand.wordmarkNight : brand.wordmark, `height:${n}px;${pos}`);
    return inlineLockup(night ? brand.compactNight : brand.compact, n, 0, x, y);
  });
  return page(fileDevice(f), bg, [glow, ...layers], fileSize(f));
}

const phoneFrame = (html: string) =>
  `<!doctype html><meta charset="utf-8"><style>body{margin:0;width:440px;height:956px;background:#fff}iframe{width:440px;height:956px;border:0;border-radius:56px}</style><iframe srcdoc="${attrEscape(html)}"></iframe>`;

// The mock of one screen: html, size, and the regions holding system text, cut out at real size.
function screenMock(screen: Screen, wall: string, tone: "light" | "mid" | "dark") {
  const u = fileUrl(wall);
  const ink = tone === "light" ? "#1d2733" : "#fff";
  const m: Record<Screen, () => [string, number, number, number[][]]> = {
    "mac-desktop": () => [
      mockPage(1728, 1117, u, macDesktop(tone !== "light")),
      1728,
      1117,
      [
        [1128, 0, 600, 300],
        [440, 1000, 850, 117],
      ],
    ],
    "mac-lock": () => [
      mockPage(1728, 1117, u, macLock(tone !== "light")),
      1728,
      1117,
      [
        [464, 96, 800, 180],
        [664, 920, 400, 140],
      ],
    ],
    "ipad-lock": () => [
      mockPage(1032, 1376, u, ipadLockPortrait(ink)),
      1032,
      1376,
      [[216, 100, 600, 340]],
    ],
    "ipad-home": () => [
      mockPage(1376, 1032, u, ipadHomeLandscape()),
      1376,
      1032,
      [[188, 520, 1000, 512]],
    ],
    "iphone-lock": () => [phoneFrame(mockPage(440, 956, u, iphoneLock(ink))), 440, 956, []],
    "iphone-home": () => [phoneFrame(mockPage(440, 956, u, iphoneHome())), 440, 956, []],
    call: () => [
      callMock(u),
      1700,
      820,
      [
        [20, 600, 640, 140],
        [1320, 20, 360, 800],
      ],
    ],
  };
  return m[screen]();
}

// Regions stacked top to bottom on white, 12 px apart.
async function detail(png: Buffer, regions: number[][]) {
  const parts = await Promise.all(
    regions.map(([left, top, width, height]) =>
      sharp(png).extract({ left, top, width, height }).png().toBuffer(),
    ),
  );
  const width = Math.max(...regions.map((r) => r[2]));
  const height = regions.reduce((a, r) => a + r[3], 0) + 12 * (regions.length - 1);
  let y = 0;
  const composite = regions.map((r, i) => {
    const c = { input: parts[i], left: 0, top: y };
    y += r[3] + 12;
    return c;
  });
  return sharp({ create: { width, height, channels: 3, background: "#fff" } })
    .composite(composite)
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function generateLayouts() {
  const args = process.argv.slice(2);
  const out = args[0];
  const opt = (k: string) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
  const bases: Base[] = opt("--base") ? [opt("--base") as Base] : ["dark", "light"];
  const only = opt("--only")?.split(",");
  const b = await browser();
  try {
    for (const base of bases) {
      for (const f of Object.keys(LAYOUTS) as WallFile[]) {
        const { w, h, s } = fileSize(f);
        for (const layout of Object.keys(LAYOUTS[f])) {
          if (only && !only.includes(`${f}:${layout}`)) continue;
          mkdirSync(join(out, base, f), { recursive: true });
          const wall = join(out, base, f, `${layout}.png`);
          const png = await b.shot(layoutWall(base, f, layout), w, h, s);
          writeFileSync(wall, fileDevice(f) === "mac" ? withDpi(png, 72 * s) : png);
          const tone = base === "dark" ? "dark" : fileDevice(f) === "mac" ? "mid" : "light";
          for (const screen of Object.keys(SCREEN_FILE) as Screen[]) {
            if (SCREEN_FILE[screen] !== f) continue;
            const [html, mw, mh, regions] = screenMock(screen, wall, tone);
            const png = await b.shot(html, mw, mh, 1);
            const stem = join(out, "mocks", `${base}~${layout}~${screen}`);
            mkdirSync(join(out, "mocks"), { recursive: true });
            writeFileSync(
              `${stem}.jpg`,
              await sharp(png)
                .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
                .jpeg({ quality: 88 })
                .toBuffer(),
            );
            if (regions.length) writeFileSync(`${stem}-detail.jpg`, await detail(png, regions));
          }
        }
      }
    }
  } finally {
    await b.close();
  }
}

const attrEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

if (import.meta.main)
  await (process.argv.includes("--layouts") ? generateLayouts() : generateBackgrounds());

export {
  NIGHT,
  attrEscape,
  callMock,
  detail,
  ipadHomeLandscape,
  ipadLockPortrait,
  iphoneHome,
  iphoneLock,
  macDesktop,
  mockPage,
  phoneFrame,
};

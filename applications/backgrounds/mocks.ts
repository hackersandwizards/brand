// Device mock screens, with the wallpaper behind the same system controls seen on each device.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";
import type { Viewport } from "../linkedin-visuals/render";
import { type browser, fileUrl, fontFaces, toJpeg } from "./render";
import type { WallFile } from "./wall";

type Renderer = Awaited<ReturnType<typeof browser>>;
export type Tone = "light" | "mid" | "dark";
// The PNG a layout writes and the tone its mock screens use.
export type LayoutWallpaper = { file: WallFile; path: string; tone: Tone };
export type VariantWallpaperSet = { name: string; tone: Tone; files: Record<string, string> };
type ScreenMock = { html: string; viewport: Viewport; regions: number[][] };
type Mock = { panel: string; html: string; viewport: Viewport };

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

function mockPage({ width: w, height: h }: Viewport, wall: string, overlay: string) {
  return `<!doctype html><meta charset="utf-8"><style>${fontFaces}*{margin:0;box-sizing:border-box}body{width:${w}px;height:${h}px;overflow:hidden;position:relative;font-family:Inter;background:#ddd}.wall{position:absolute;inset:0;background:url("${wall}") center/cover;}</style><div class="wall"></div>${overlay}`;
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
  const tile = ({ width: w, height: h }: Viewport, inner: string, name: string) =>
    `<div style="position:relative;width:${w}px;height:${h}px;border-radius:10px;overflow:hidden;background:#3c4043">${inner}<div style="position:absolute;left:10px;bottom:8px;font:500 ${Math.max(11, w / 60)}px Inter;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.7)">${name}</div></div>`;
  const ours = (w: number, h: number) =>
    `<div style="position:absolute;inset:0;background:url('${wall}') center/cover"></div>${person(w, h)}`;
  const other = (c: string) => `<div style="position:absolute;inset:0;background:${c}"></div>`;
  const square = `<div style="position:absolute;inset:0;background:url('${wall}') center/cover"></div><svg viewBox="420 0 1080 1080" width="330" height="330" style="position:absolute;left:0;top:0"><use href="#p"/></svg>`;
  return `<!doctype html><meta charset="utf-8"><style>${fontFaces}*{margin:0;box-sizing:border-box}body{width:1700px;height:820px;background:#202124;font-family:Inter;position:relative;overflow:hidden}</style>
<svg width="0" height="0" style="position:absolute"><defs><g id="p">${person(1920, 1080).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g></defs></svg>
<div style="position:absolute;left:20px;top:20px">${tile({ width: 1280, height: 720 }, ours(1280, 720), "Benedikt Stemmildt")}</div>
<div style="position:absolute;left:1320px;top:20px;display:flex;flex-direction:column;gap:12px">${tile({ width: 360, height: 203 }, ours(360, 203), "Benedikt Stemmildt")}${tile({ width: 360, height: 203 }, other("linear-gradient(#6b5b4b,#3e352d)"), "Client CTO")}<div style="font:500 13px Inter;color:#9aa0a6;margin-top:6px">Phone, square tile:</div>${tile({ width: 330, height: 330 }, square, "Benedikt")}</div>`;
}

const attrEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const phoneFrame = (html: string) =>
  `<!doctype html><meta charset="utf-8"><style>body{margin:0;width:440px;height:956px;background:#fff}iframe{width:440px;height:956px;border:0;border-radius:56px}</style><iframe srcdoc="${attrEscape(html)}"></iframe>`;

type Screen =
  "mac-desktop" | "mac-lock" | "ipad-lock" | "ipad-home" | "iphone-lock" | "iphone-home" | "call";
const SCREENS_BY_FILE: Partial<Record<WallFile, Screen[]>> = {
  mac: ["mac-desktop", "mac-lock"],
  ipad: ["ipad-lock"],
  "ipad-home": ["ipad-home"],
  iphone: ["iphone-lock"],
  "iphone-home": ["iphone-home"],
  call: ["call"],
};

const clockInk = (tone: Tone) => (tone === "light" ? "#1d2733" : "#fff");

// The mock of one screen: html, size, and the regions holding system text, cut out at real size.
const SCREEN_MOCKS: Record<Screen, (wall: string, tone: Tone) => ScreenMock> = {
  "mac-desktop": (u, tone) => ({
    html: mockPage({ width: 1728, height: 1117 }, u, macDesktop(tone !== "light")),
    viewport: { width: 1728, height: 1117 },
    regions: [
      [1128, 0, 600, 300],
      [440, 1000, 850, 117],
    ],
  }),
  "mac-lock": (u, tone) => ({
    html: mockPage({ width: 1728, height: 1117 }, u, macLock(tone !== "light")),
    viewport: { width: 1728, height: 1117 },
    regions: [
      [464, 96, 800, 180],
      [664, 920, 400, 140],
    ],
  }),
  "ipad-lock": (u, tone) => ({
    html: mockPage({ width: 1032, height: 1376 }, u, ipadLockPortrait(clockInk(tone))),
    viewport: { width: 1032, height: 1376 },
    regions: [[216, 100, 600, 340]],
  }),
  "ipad-home": (u) => ({
    html: mockPage({ width: 1376, height: 1032 }, u, ipadHomeLandscape()),
    viewport: { width: 1376, height: 1032 },
    regions: [[188, 520, 1000, 512]],
  }),
  "iphone-lock": (u, tone) => ({
    html: phoneFrame(mockPage({ width: 440, height: 956 }, u, iphoneLock(clockInk(tone)))),
    viewport: { width: 440, height: 956 },
    regions: [],
  }),
  "iphone-home": (u) => ({
    html: phoneFrame(mockPage({ width: 440, height: 956 }, u, iphoneHome())),
    viewport: { width: 440, height: 956 },
    regions: [],
  }),
  call: (u) => ({
    html: callMock(u),
    viewport: { width: 1700, height: 820 },
    regions: [
      [20, 600, 640, 140],
      [1320, 20, 360, 800],
    ],
  }),
};

// Select the mock that fits a device and its system screen.
export function screenMock(screen: Screen, wall: string, tone: Tone) {
  return SCREEN_MOCKS[screen](fileUrl(wall), tone);
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

// Side-by-side lock and home screens for iPad and iPhone comparison.
export function pairedScreens({ tone, files }: VariantWallpaperSet): Mock[] {
  const u = (key: string) => fileUrl(files[key] ?? files[key.replace("-home", "")]);
  const ink = clockInk(tone);
  return [
    // iPad: portrait lock crops the square's middle columns, landscape home its middle rows.
    {
      panel: "ipad",
      viewport: { width: 2448, height: 1376 },
      html: `<!doctype html><meta charset="utf-8"><style>body{margin:0;width:2448px;height:1376px;background:#fff;position:relative}</style>
<iframe style="position:absolute;left:0;top:0;width:1032px;height:1376px;border:0" srcdoc="${attrEscape(mockPage({ width: 1032, height: 1376 }, u("ipad"), ipadLockPortrait(ink)))}"></iframe>
<iframe style="position:absolute;left:1072px;top:172px;width:1376px;height:1032px;border:0" srcdoc="${attrEscape(mockPage({ width: 1376, height: 1032 }, u("ipad-home"), ipadHomeLandscape()))}"></iframe>`,
    },
    {
      panel: "iphone",
      viewport: { width: 920, height: 956 },
      html: `<!doctype html><meta charset="utf-8"><style>body{margin:0;width:920px;height:956px;background:#fff;position:relative}iframe{position:absolute;top:0;width:440px;height:956px;border:0;border-radius:56px}</style>
<iframe style="left:0" srcdoc="${attrEscape(mockPage({ width: 440, height: 956 }, u("iphone"), iphoneLock(ink)))}"></iframe>
<iframe style="left:480px" srcdoc="${attrEscape(mockPage({ width: 440, height: 956 }, u("iphone-home"), iphoneHome()))}"></iframe>`,
    },
  ];
}

// Render each device mock from the wallpaper files in a single variant.
export async function renderVariantMocks(b: Renderer, out: string, wallpaper: VariantWallpaperSet) {
  const dir = join(out, "mocks");
  mkdirSync(dir, { recursive: true });
  const mac = wallpaper.files.mac;
  const shots: Mock[] = [
    { panel: "mac-desktop", ...screenMock("mac-desktop", mac, wallpaper.tone) },
    { panel: "mac-lock", ...screenMock("mac-lock", mac, wallpaper.tone) },
    ...pairedScreens(wallpaper),
    { panel: "call", ...screenMock("call", wallpaper.files.call, wallpaper.tone) },
  ];
  for (const { panel, html, viewport } of shots) {
    const jpg = await toJpeg(await b.shot(html, viewport));
    writeFileSync(join(dir, `${wallpaper.name}-${panel}.jpg`), jpg);
  }
}

// Render the screens that use a layout's wallpaper and the close crops that show legibility.
export async function renderLayoutMocks(
  b: Renderer,
  stem: string,
  { file, path, tone }: LayoutWallpaper,
) {
  for (const panel of SCREENS_BY_FILE[file] ?? []) {
    const { html, viewport, regions } = screenMock(panel, path, tone);
    const png = await b.shot(html, viewport);
    const output = `${stem}~${panel}`;
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(
      `${output}.jpg`,
      await sharp(png)
        .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 88 })
        .toBuffer(),
    );
    if (regions.length) writeFileSync(`${output}-detail.jpg`, await detail(png, regions));
  }
}

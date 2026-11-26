// Wallpaper canvases in device points, with their grounds and absolutely positioned layers.
import type { Viewport } from "../linkedin-visuals/render";
import { colors } from "../../generated/tokens";
import { fontFaces, tint } from "./render";

type Canvas = Viewport & { scale: number };
export type Device = "mac" | "ipad" | "iphone" | "call";
// Size in points, scale to pixels: MacBook Pro 16", iPad Pro 13" (square, so both orientations
// crop it), iPhone 17 Pro Max, and a 1080p call background.
export const DEVICES: Record<Device, Canvas> = {
  mac: { width: 1728, height: 1117, scale: 2 },
  ipad: { width: 1376, height: 1376, scale: 2 },
  iphone: { width: 440, height: 956, scale: 3 },
  call: { width: 1920, height: 1080, scale: 1 },
};
// iPad Pro 12.9" in landscape, the screen's own size: a 4:3 file leaves iPadOS no vertical play.
const IPAD_WIDE = { width: 1366, height: 1024, scale: 2 };
// Apple Studio Display 27", 5120 x 2880 at 2x: its own file, as a MacBook file left bars there.
const STUDIO = { width: 2560, height: 1440, scale: 2 };

export type WallFile =
  | "mac"
  | "mac-studio"
  | "ipad"
  | "ipad-home"
  | "ipad-home-wide"
  | "iphone"
  | "iphone-home"
  | "call";

export const fileDevice = (f: WallFile) => f.replace(/-(home(-wide)?|studio)$/, "") as Device;
export const fileSize = (f: WallFile) =>
  f === "ipad-home-wide" ? IPAD_WIDE : f === "mac-studio" ? STUDIO : DEVICES[fileDevice(f)];

export const C = {
  teal: colors["--color-teal"],
  purple: colors["--color-purple"],
  bg: colors["--color-bg"],
  tealNight: colors["--color-teal-night"],
  purpleNight: colors["--color-purple-night"],
};
export const GRADIENT = `linear-gradient(180deg, ${C.purple}, ${C.teal})`;
// Mid-tone ground for paired home screens: white iOS labels stay legible on it.
export const HOME_GROUND = `linear-gradient(135deg, ${C.teal}, ${C.purple})`;
export const PASTEL = `linear-gradient(135deg, ${tint(C.teal, 38)}, ${tint(C.purple, 36)})`;
export const MID = `linear-gradient(135deg, ${tint(C.teal, 62)}, ${tint(C.purple, 58)})`;

// The Night ground of the dark files in the design guide, rebuilt without the lockup: night-2 to
// night, a teal glow top left and a purple glow bottom right, the direction of --gradient-magic.
export const NIGHT = `radial-gradient(ellipse 60% 50% at 100% 100%, color-mix(in srgb, ${C.purple} 24%, transparent), transparent 70%), radial-gradient(ellipse 45% 45% at 0% 0%, color-mix(in srgb, ${C.teal} 32%, transparent), transparent 70%), linear-gradient(180deg, ${colors["--color-night-2"]}, ${colors["--color-night"]})`;
export const PASTEL_HOME = `linear-gradient(135deg, ${tint(C.teal, 88)}, ${tint(C.purple, 84)})`;

export type Layer = string;
export const img = (src: string, css: string, extra = "") =>
  `<img src="${src}" style="position:absolute;${css}" ${extra}>`;

// A wallpaper canvas in CSS points, with layers painted in order.
export function wallPage({ width: w, height: h }: Viewport, bg: string, layers: Layer[]) {
  return `<!doctype html><meta charset="utf-8"><style>${fontFaces}*{margin:0}body{width:${w}px;height:${h}px;overflow:hidden;position:relative;background:${bg}}</style>${layers.join("")}`;
}

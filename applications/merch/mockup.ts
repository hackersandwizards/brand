// The merch mockups: each product drawn in millimetres with its print file placed as printed, as SVG
// markup. w1.ts renders the textile ones for review, the catalogue draws every product from the print
// files in this folder.

// Stanley/Stella textile colours, as in the merch rounds
export const TEXTILE = { stargazer: "#39505C", "purple-love": "#6C5A9E" };

// A garment in mm: body 520 wide, sleeves to 760, 740 long; hood and long sleeves for the hoodie.
export function garment(col: string, hood: boolean, back: boolean) {
  const neck = back ? "Q380,26 460,0" : "Q380,90 460,0";
  const sleeves = hood
    ? "L690,40 L770,580 L690,595 L645,250 L640,740 L120,740 L115,250 L70,595 L-10,580 L70,40"
    : "L760,140 L690,260 L640,220 L640,740 L120,740 L120,220 L70,260 L0,140";
  const hoodShape = hood
    ? back
      ? `<path d="M240,40 Q240,-125 380,-125 Q520,-125 520,40 Z" fill="${col}" stroke="rgba(0,0,0,.25)" stroke-width="3"/>`
      : `<path d="M240,40 Q240,-125 380,-125 Q520,-125 520,40 Z" fill="${col}" stroke="rgba(0,0,0,.25)" stroke-width="3"/><path d="M285,30 Q290,-80 380,-85 Q470,-80 475,30 Z" fill="rgba(0,0,0,.35)"/>`
    : "";
  // hoodie front: the kangaroo pocket and the hem rib
  const pocket =
    hood && !back
      ? `<path d="M250,455 L510,455 L548,668 L212,668 Z" fill="rgba(0,0,0,.05)" stroke="rgba(0,0,0,.28)" stroke-width="3"/><path d="M122,680 L638,680" stroke="rgba(0,0,0,.2)" stroke-width="3"/>`
      : "";
  return `${hoodShape}<path d="M180,0 L300,0 ${neck} L580,0 ${sleeves} Z" fill="${col}" stroke="rgba(0,0,0,.18)" stroke-width="3"/>${pocket}`;
}

// The hoodie's drawcords, about 190 mm long with metal ends, drawn over the print.
const CORDS = `<path d="M352,38 Q350,120 347,190" stroke="rgba(0,0,0,.32)" stroke-width="6" fill="none"/><path d="M408,38 Q410,120 413,190" stroke="rgba(0,0,0,.32)" stroke-width="6" fill="none"/><rect x="343" y="188" width="8" height="16" rx="2" fill="#b0b5c4"/><rect x="409" y="188" width="8" height="16" rx="2" fill="#b0b5c4"/>`;

export type Print = { href: string; W: number; H: number };

// The garment with the print centred on ax, its top at ay.
export const wear = (col: string, p: Print, ax: number, ay: number, hood: boolean, back: boolean) =>
  `<svg viewBox="-20 -130 800 890" width="100%" height="100%">${garment(col, hood, back)}<image href="${p.href}" x="${ax - p.W / 2}" y="${ay}" width="${p.W}" height="${p.H}"/>${hood && !back ? CORDS : ""}</svg>`;

// A flat product whose print file is its whole face with 3 mm bleed (cloth, notebook cover): the
// final format with its corner radius and a shadow.
export function face(p: Print, radius: number) {
  const w = p.W - 6;
  const h = p.H - 6;
  const id = `f${Math.round(w)}x${Math.round(h)}r${radius}`;
  return `<svg viewBox="-6 -6 ${w + 12} ${h + 12}" width="100%" height="100%"><defs><clipPath id="${id}"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${radius}"/></clipPath></defs><rect x="0.8" y="1.6" width="${w}" height="${h}" rx="${radius}" fill="rgba(0,0,0,.18)"/><image href="${p.href}" x="-3" y="-3" width="${p.W}" height="${p.H}" clip-path="url(#${id})"/></svg>`;
}

// The mug M6 from one side: the half of the 200 mm wrap that faces the viewer, with the handle.
export function mug(p: Print, half: 0 | 1) {
  const id = `mug${half}`;
  const hw = (p.W - 6) / 2;
  const h = p.H - 6;
  const handle = half
    ? `<path d="M0,18 C-30,18 -30,${h - 12} 0,${h - 12}" fill="none" stroke="#e4e6ea" stroke-width="9"/>`
    : `<path d="M${hw},18 C${hw + 30},18 ${hw + 30},${h - 12} ${hw},${h - 12}" fill="none" stroke="#e4e6ea" stroke-width="9"/>`;
  return `<svg viewBox="-32 -10 ${hw + 64} ${h + 22}" width="100%" height="100%"><defs><clipPath id="${id}"><rect x="0" y="0.5" width="${hw}" height="${h - 1}"/></clipPath><linearGradient id="${id}s"><stop offset="0" stop-color="#000" stop-opacity=".14"/><stop offset=".25" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs>${handle}<rect x="0" y="-6" width="${hw}" height="${h + 12}" rx="5" fill="#fff" stroke="#d0d2d8"/><image href="${p.href}" x="${-3 - half * hw}" y="-3" width="${p.W}" height="${p.H}" clip-path="url(#${id})"/><rect x="0" y="-6" width="${hw}" height="${h + 12}" rx="5" fill="url(#${id}s)"/></svg>`;
}

// Kiss-cut stickers on a 300 x 200 mm laptop lid (--color-ampersand-light to --color-ampersand), each
// clipped to its cut line, so the magenta contour of the print file stays off the mockup.
export function lid(stickers: Print[]) {
  let y = 40;
  const placed = stickers
    .map((p, i) => {
      const w = p.W - 6;
      const h = p.H - 6;
      const at = `<svg x="${150 - w / 2}" y="${y}" width="${p.W}" height="${p.H}" viewBox="-3 -3 ${p.W} ${p.H}" overflow="visible"><defs><clipPath id="st${i}"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="3"/></clipPath></defs><rect x="0.4" y="1" width="${w}" height="${h}" rx="3" fill="rgba(0,0,0,.25)"/><image href="${p.href}" x="-3" y="-3" width="${p.W}" height="${p.H}" clip-path="url(#st${i})"/></svg>`;
      y += h + 22;
      return at;
    })
    .join("");
  return `<svg viewBox="-10 -10 320 220" width="100%" height="100%"><defs><linearGradient id="lid" x2="1" y2="1"><stop offset="0" stop-color="#b0b5c4"/><stop offset="1" stop-color="#7c849c"/></linearGradient></defs><rect width="300" height="200" rx="12" fill="url(#lid)"/>${placed}</svg>`;
}

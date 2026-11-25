// Binary raster masks that define the cut contour of a die-cut sticker.
export type Mask = { data: Uint8Array; width: number; height: number };

// Squared distance of every pixel to the nearest set pixel (Felzenszwalb and Huttenlocher).
function distances({ data, width: w, height: h }: Mask) {
  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  const d = Float64Array.from(data, (m) => (m ? 0 : 1e20));
  const pass = (len: number, idx: (i: number) => number) => {
    for (let i = 0; i < len; i++) f[i] = d[idx(i)];
    const meet = (q: number, p: number) => (f[q] + q * q - f[p] - p * p) / (2 * q - 2 * p);
    let k = 0;
    v[0] = 0;
    z[0] = -1e20;
    z[1] = 1e20;
    for (let q = 1; q < len; q++) {
      while (meet(q, v[k]) <= z[k]) k--;
      k++;
      v[k] = q;
      z[k] = meet(q, v[k - 1]);
      z[k + 1] = 1e20;
    }
    k = 0;
    for (let q = 0; q < len; q++) {
      while (z[k + 1] < q) k++;
      d[idx(q)] = (q - v[k]) ** 2 + f[v[k]];
    }
  };
  for (let x = 0; x < w; x++) pass(h, (y) => y * w + x);
  for (let y = 0; y < h; y++) pass(w, (x) => y * w + x);
  return d;
}
// Grow the set pixels by the given radius in pixels.
export const dilate = (mask: Mask, radius: number): Mask => ({
  ...mask,
  data: Uint8Array.from(distances(mask), (d) => (d <= radius ** 2 ? 1 : 0)),
});

// Swap the inside and outside of a binary mask.
const invertMask = (mask: Mask): Mask => ({
  ...mask,
  data: Uint8Array.from(mask.data, (x) => 1 - x),
});

// Shrink the mask by growing its exterior.
export const erode = (mask: Mask, radius: number): Mask =>
  invertMask(dilate(invertMask(mask), radius));

// The outer edge of the set pixels along the pixel corners, then Douglas-Peucker to 1 px.
export function trace({ data: m, width: w, height: h }: Mask) {
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && m[y * w + x] === 1;
  const start = m.indexOf(1);
  const [sx, sy] = [start % w, Math.floor(start / w)];
  const DX = [1, 0, -1, 0];
  const DY = [0, 1, 0, -1];
  const pts: [number, number][] = [];
  let [x, y, dir] = [sx, sy, 0];
  do {
    pts.push([x, y]);
    x += DX[dir];
    y += DY[dir];
    // the pixels ahead to the left and to the right of the walk, the set side on the right
    const left = [on(x, y - 1), on(x, y), on(x - 1, y), on(x - 1, y - 1)][dir];
    const right = [on(x, y), on(x - 1, y), on(x - 1, y - 1), on(x, y - 1)][dir];
    if (left) dir = (dir + 3) % 4;
    else if (!right) dir = (dir + 1) % 4;
  } while (x !== sx || y !== sy || dir !== 0);
  const keep = new Uint8Array(pts.length);
  const simplify = (a: number, b: number) => {
    const [[ax, ay], [bx, by]] = [pts[a], pts[b]];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let [far, at] = [1, -1];
    for (let i = a + 1; i < b; i++) {
      const dist = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len;
      if (dist > far) [far, at] = [dist, i];
    }
    if (at < 0) return;
    keep[at] = 1;
    simplify(a, at);
    simplify(at, b);
  };
  const half = pts.length >> 1;
  keep[0] = keep[half] = keep[pts.length - 1] = 1;
  simplify(0, half);
  simplify(half, pts.length - 1);
  return pts.filter((_, i) => keep[i]);
}

#!/usr/bin/env bun
// Writes each client mark's `height` into clients/clients.json: the share of a row's height at which
// the mark reads at the same visual weight as the others. Every mark covers row² × 1.1, a wide mark
// a little more per unit of log aspect, a light, thin mark more than a dense one (ink share against
// a typical 0.27, the factor clamped to 0.8 to 1.6), never taller than the row. The mark's width is
// that height times the aspect of its file; test/clients.test.ts fails on a stale height.
// Usage: bun scripts/clients.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { ROOT } from "./git";

const FILE = join(ROOT, "clients/clients.json");

type Client = { name: string; file: string; height?: number; [key: string]: unknown };

/** Share of the mark's box covered by ink: opaque and dark counts fully. */
async function ink(png: Buffer) {
  const { data, info } = await sharp(png)
    .resize({ height: 80 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sum = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const light = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    sum += (data[i + 3] / 255) * (1 - light);
  }
  return sum / (info.width * info.height);
}

export async function height(file: string) {
  const { data, info } = await sharp(join(ROOT, "clients", file), { density: 600 })
    .ensureAlpha()
    .png()
    .toBuffer({ resolveWithObject: true });
  const aspect = info.width / info.height;
  const weight = Math.min(1.6, Math.max(0.8, Math.sqrt(0.27 / (await ink(data)))));
  return Math.round(Math.min(1, Math.sqrt((1.1 * weight * aspect ** 0.1) / aspect)) * 1000) / 1000;
}

export const clients = (): Client[] => JSON.parse(readFileSync(FILE, "utf8"));

if (import.meta.main) {
  const list = clients();
  for (const c of list) c.height = await height(c.file);
  writeFileSync(FILE, JSON.stringify(list, null, 2) + "\n");
}

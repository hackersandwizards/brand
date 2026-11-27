import { createHash } from "node:crypto";
import { resolve } from "node:path";

export const ROOT = resolve(import.meta.dir, "..");

export const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");

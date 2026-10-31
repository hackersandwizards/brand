// Shared helpers for this repo's scripts and tests.
import { createHash } from "node:crypto";
import { resolve } from "node:path";

export const ROOT = resolve(import.meta.dir, "..");

export const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");

const LFS = /^version https:\/\/git-lfs\.github\.com\/spec\/v1\noid sha256:([0-9a-f]{64})\n/;

/** The LFS object id a pointer names, which is the sha256 of the real file. */
export const lfsOid = (b: Buffer) => LFS.exec(b.subarray(0, 200).toString("latin1"))?.[1];

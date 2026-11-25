// Brand asset inventory, Git LFS pointer parsing, content hashing and byte-copy matching shared by
// the brand-colours and brand-copies scans and the repository's own asset checks.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import manifest from "../manifest.json";

// The spec puts any ext-* lines between version and oid.
const LFS =
  /^version https:\/\/git-lfs\.github\.com\/spec\/v1\r?\n(?:ext-[^\n]*\n)*oid sha256:([0-9a-f]{64})\r?\n/;

/** The object id a Git LFS pointer names, the sha256 of the real file; undefined for any other. */
export const lfsOid = (b: Buffer) => LFS.exec(b.subarray(0, 1024).toString("latin1"))?.[1];

/** A file's sha256, read through a Git LFS pointer to the object it names. */
export const contentHash = (b: Buffer) => lfsOid(b) ?? createHash("sha256").update(b).digest("hex");

const PKG = join(import.meta.dir, "..");

const walkPackageDir = (dir: string): string[] =>
  existsSync(join(PKG, dir))
    ? readdirSync(join(PKG, dir), { recursive: true, encoding: "utf8" })
        .map((f) => join(dir, f))
        .filter((f) => statSync(join(PKG, f)).isFile())
    : [];

/** Every file this package ships as a brand asset, by sha256: manifest.json's files (the print
 *  masters among them by hash alone) plus the generated token formats and the mail signature
 *  template. Files under 64 bytes are left out: too small to be a copy. */
export const brandFiles = () => {
  const out = new Map<string, string>(manifest.files.map((f) => [f.sha256, f.path]));
  for (const f of ["generated", "applications/mail-signature"].flatMap(walkPackageDir))
    if (statSync(join(PKG, f)).size >= 64) out.set(contentHash(readFileSync(join(PKG, f))), f);
  return out;
};

const isLfsPointer = (path: string) => statSync(path).size < 1024 && !!lfsOid(readFileSync(path));

/** The sizes of the brand files present on disk, to hash only consumer files that could match, and
 *  the extensions of those known by hash alone (the print masters: not shipped, or an LFS pointer
 *  here), whose every file is hashed. */
export const brandSizes = (files: Map<string, string>) => {
  const sizes = new Set<number>();
  const unsized = new Set<string>();
  for (const f of files.values()) {
    const p = join(PKG, f);
    if (existsSync(p) && !isLfsPointer(p)) sizes.add(statSync(p).size);
    else unsized.add(extname(f).toLowerCase());
  }
  return { sizes, unsized };
};

/** Whether a consumer file is byte-identical to a brand file, the size checked before the hash. */
export const isBrandCopy = (
  path: string,
  files: Map<string, string>,
  { sizes, unsized }: ReturnType<typeof brandSizes>,
): string | undefined => {
  const stat = statSync(path);
  if (!stat.isFile()) return;
  if (!sizes.has(stat.size) && !isLfsPointer(path) && !unsized.has(extname(path).toLowerCase()))
    return;
  return files.get(contentHash(readFileSync(path)));
};

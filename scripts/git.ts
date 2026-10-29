// Read-only access to the committed state of a sibling checkout. Nothing here writes to a repo.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const ROOT = resolve(import.meta.dir, "..");

const git = (repo: string, args: string[], input?: string) => {
  const out = spawnSync("git", ["-C", repo, ...args], { input, maxBuffer: 1 << 30 });
  return out.status === 0 ? out.stdout : undefined;
};

export const isRepo = (repo: string) =>
  existsSync(repo) && git(repo, ["rev-parse", "--verify", "HEAD"]) !== undefined;

export const head = (repo: string) => git(repo, ["rev-parse", "HEAD"])!.toString().trim();

export const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");

const LFS = /^version https:\/\/git-lfs\.github\.com\/spec\/v1\noid sha256:([0-9a-f]{64})\n/;

/** The LFS object id a pointer names, which is the sha256 of the real file. */
export const lfsOid = (b: Buffer) => LFS.exec(b.subarray(0, 200).toString("latin1"))?.[1];

/** A path's bytes at HEAD, or undefined where HEAD has no such file. */
export const show = (repo: string, path: string) => git(repo, ["show", `HEAD:${path}`]);

/** The sha256 of a path's content at HEAD, read through an LFS pointer without fetching. */
export const contentHash = (repo: string, path: string) => {
  const b = show(repo, path);
  return b && (lfsOid(b) ?? sha256(b));
};

/** The real bytes behind an LFS pointer, from the repo's local object store. */
export const lfsObject = (repo: string, oid: string) => {
  const dir = git(repo, ["rev-parse", "--git-common-dir"])!.toString().trim();
  const file = join(resolve(repo, dir), "lfs/objects", oid.slice(0, 2), oid.slice(2, 4), oid);
  const b = readFileSync(file);
  if (sha256(b) !== oid) throw new Error(`LFS object ${oid} in ${repo} fails its hash`);
  return b;
};

/** Every file path at HEAD under a directory, relative to the directory. Throws where `repo` is no
 *  checkout, so a missing owner never reads as an empty folder. */
export const listDir = (repo: string, dir: string) => {
  const out = git(repo, ["ls-tree", "-r", "-z", "--name-only", "HEAD", "--", `${dir}/`]);
  if (!out) throw new Error(`${repo} is not a git checkout`);
  return out
    .toString()
    .split("\0")
    .filter(Boolean)
    .map((p) => p.slice(dir.length + 1));
};

/** Every blob at HEAD as [path, blob id]. */
export const tree = (repo: string): [string, string][] =>
  (git(repo, ["ls-tree", "-r", "-z", "--full-tree", "HEAD"])?.toString() ?? "")
    .split("\0")
    .filter(Boolean)
    .flatMap((line) => {
      const [meta, path] = line.split("\t");
      const [, type, id] = meta.split(" ");
      return type === "blob" ? [[path, id] as [string, string]] : [];
    });

/** The contents of many blobs in one `git cat-file --batch` call. */
export const blobs = (repo: string, ids: string[]) => {
  const out = git(repo, ["cat-file", "--batch"], ids.join("\n") + "\n")!;
  const result = new Map<string, Buffer>();
  let at = 0;
  for (const id of ids) {
    const nl = out.indexOf(10, at);
    const size = Number(out.subarray(at, nl).toString().split(" ")[2]);
    result.set(id, out.subarray(nl + 1, nl + 1 + size));
    at = nl + 1 + size + 1;
  }
  return result;
};

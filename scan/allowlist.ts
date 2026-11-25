// Consumer scan allowlists and the HEAD baseline that governs their growth.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import own from "../package.json";
import { isRecord } from "./help";
import { runGit } from "./tree";

/** Parses the working-tree and HEAD copies of the same allowlist. */
export function readAllowlists<T>(file: string, parse: (json: string) => T) {
  const allow = existsSync(file) ? parse(readFileSync(file, "utf8")) : undefined;
  const head = runGit(["show", `HEAD:./${file}`]);
  const committed = head.status === 0 ? parse(head.stdout) : undefined;
  return { allow, committed };
}

/** The working-tree and HEAD versions of a reason-only allowance file. */
export type ReasonAllowlists = {
  allow: Record<string, string>;
  committed: Record<string, string> | undefined;
};

/** Reads reason-only allowlists, using an empty working list when it is absent. */
export function readReasonAllowlists(file: string): ReasonAllowlists {
  const { allow = {}, committed } = readAllowlists(file, (json): Record<string, string> => {
    const value: unknown = JSON.parse(json);
    if (!isRecord(value)) throw new Error(`${file}: expected an object of reasons`);
    return Object.fromEntries(
      Object.entries(value).map(([name, reason]) => {
        if (typeof reason !== "string") throw new Error(`${file}: "${name}" needs a string reason`);
        return [name, reason] as const;
      }),
    );
  });
  return { allow, committed };
}

/** The brand version a package.json pins as a Git tag (`#v<version>`), if any. */
export const pinnedVersion = (packageJson: string) => {
  const pkg: unknown = JSON.parse(packageJson);
  if (!isRecord(pkg)) return;
  for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
    const dependencies = pkg[field];
    const pin = isRecord(dependencies) ? dependencies["@hackersandwizards/brand"] : undefined;
    if (typeof pin !== "string") continue;
    const m = /#v([^#\s]+)$/.exec(pin);
    if (m) return m[1];
  }
};

/** The brand version package.json pinned at HEAD where the working tree pins this scanner's
 *  version instead; undefined otherwise, a stale install included. */
export const pinChange = (cmd: string) => {
  const head = runGit(["show", "HEAD:./package.json"]);
  const from = head.status === 0 ? pinnedVersion(head.stdout) : undefined;
  const to = existsSync("package.json")
    ? pinnedVersion(readFileSync("package.json", "utf8"))
    : undefined;
  if (!from || from === own.version || to !== own.version) return;
  console.log(
    `${cmd}: pin change v${from} to v${own.version}: the list may take what this scanner finds in the files as committed at HEAD`,
  );
  return from;
};

/** Whether a path is committed at HEAD and unchanged in the working tree. */
export const committedAsIs = (p: string) =>
  runGit(["cat-file", "-e", `HEAD:./${p}`]).status === 0 &&
  runGit(["diff", "--quiet", "HEAD", "--", p]).status === 0;

/** Writes a tightened allowlist when a file already exists or entries remain; returns whether it wrote. */
export const writeAllowlist = (path: string, next: object): boolean => {
  if (!existsSync(path) && !Object.keys(next).length) return false;
  writeFileSync(path, JSON.stringify(next, null, 2) + "\n");
  return true;
};

/** The status line when tightening leaves an absent allowlist absent. */
export const nothingToAllow = (cmd: string, file: string) =>
  `${cmd}: nothing to allow; no ${file} written`;

/** The status line when tightening writes an allowlist. */
export const allowlistTightened = (cmd: string, file: string) => `${cmd}: ${file} tightened`;

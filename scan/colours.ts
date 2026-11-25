#!/usr/bin/env bun
// The brand colour scan a consumer runs in its own gate, over its working tree from the current
// directory down (tracked and untracked files, .gitignore honoured). Compares each file's counts
// against brand-colours.json and exits 1 on any count above or below its entry, any unlisted file
// with a count, an entry without a reason, a stale entry on a clean file, a misplaced partner mark,
// or an entry that grew against HEAD beyond the allowlist total (or, during a brand pin change,
// beyond what this scanner finds in the file as committed at HEAD).
import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { brandFiles, brandSizes, isBrandCopy } from "./assets";
import { METRICS, scanSource, type Counts, type Metric } from "./colour-scan";
import { answerHelp, isRecord } from "./help";
import {
  BRAND_COPY,
  exception,
  exceptionReport,
  listTree,
  NOT_STYLING,
  pinChange,
  readAllowlists,
  runGit,
  STYLING_EXTENSIONS,
  writeAllowlist,
} from "./tree";

const USAGE = `usage: brand-colours [--tighten]
Counts colours, radii, shadows and fonts off the brand tokens in the working tree and compares
them with brand-colours.json; exits 1 on a finding.
  --tighten  lowers every entry to today's count and drops metrics and entries at zero; creates
             the allowlist from today's counts where none exists and a count is found. Raises an
             entry, or adds one with an empty reason, only during a pin change, to what HEAD's
             file holds.`;

export type Allowlist = Record<string, Partial<Counts> & { reason: string; partner?: string }>;
/** HEAD baseline against which allowlist growth is checked, with optional committed-file ceilings
 *  populated during a brand pin change. */
export type AllowlistBaseline = {
  committed: Allowlist;
  ceiling?: Record<string, Counts>;
};
export const ALLOWLIST = "brand-colours.json";

/** Whether an entry is a partner's mark: an SVG naming the third party it belongs to. */
export const isPartner = (file: string, e: Allowlist[string] | undefined) =>
  Boolean(e?.partner?.trim()) && extname(file) === ".svg";

/** The allowlist's sum of one metric, the files in `skip` left out. */
const metricTotal = (allow: Allowlist, k: Metric, skip: Set<string>) =>
  Object.entries(allow).reduce((sum, [f, e]) => sum + (skip.has(f) ? 0 : (e[k] ?? 0)), 0);

const partnerFiles = (allow: Allowlist) =>
  Object.keys(allow).filter((file) => isPartner(file, allow[file]));

/** Findings where a scanned file's counts sit above or below its allowlist entry. */
const countViolations = (files: Record<string, Counts>, allow: Allowlist) => {
  const out: string[] = [];
  for (const [file, counts] of Object.entries(files)) {
    if (isPartner(file, allow[file])) continue;
    const entry = allow[file];
    for (const k of METRICS) {
      const allowed = entry?.[k] ?? 0;
      if (counts[k] > allowed) out.push(`${file}: ${k} ${counts[k]}, allowed ${allowed}`);
      // An allowance above the count would let a new finding there pass unseen.
      else if (counts[k] < allowed)
        out.push(
          `${ALLOWLIST}: ${file}: ${k} ${counts[k]}, allowed ${allowed}; lower it (brand-colours --tighten)`,
        );
    }
  }
  return out;
};

/** Metadata and staleness findings for one allowlist entry. */
const entryViolations = (file: string, entry: Allowlist[string], counts: Counts | undefined) => {
  const out: string[] = [];
  const partner = isPartner(file, entry);
  if (!entry.reason?.trim()) out.push(`${ALLOWLIST}: ${file} names no reason`);
  // A stale entry could hide a new finding on the same file.
  if (!partner && METRICS.every((k) => !counts?.[k]))
    out.push(`${ALLOWLIST}: ${file} is clean; drop its entry (brand-colours --tighten)`);
  if (entry.partner !== undefined && !partner)
    out.push(`${ALLOWLIST}: ${file}: "partner" names a third party's mark, an SVG, by name`);
  return out;
};

/** Metrics whose non-partner allowlist total grew against HEAD. Partner marks count in no total;
 *  one turned partner in the working tree counts in neither so it frees no total for another file. */
const grownMetrics = (allow: Allowlist, committed: Allowlist) => {
  const now = new Set(partnerFiles(allow));
  const before = new Set([...now, ...partnerFiles(committed)]);
  return new Set(
    METRICS.filter((k) => metricTotal(allow, k, now) > metricTotal(committed, k, before)),
  );
};

/** Metrics where an entry exceeds both its committed allowance and its pin-change ceiling. */
const grownEntryMetrics = (
  entry: Allowlist[string],
  committed: Allowlist[string] | undefined,
  ceiling: Counts | undefined,
) => METRICS.filter((k) => (entry[k] ?? 0) > Math.max(committed?.[k] ?? 0, ceiling?.[k] ?? 0));

/** Every way the counts exceed the allowlist, and every entry without a reason, stale, misplaced,
 *  or grown against HEAD beyond `baseline`'s ceiling where the list's total for that metric grew
 *  too: within the total, a value moved from one file to another. */
export const violations = (
  files: Record<string, Counts>,
  allow: Allowlist,
  baseline?: AllowlistBaseline,
) => {
  const out = countViolations(files, allow);
  const grown = baseline ? grownMetrics(allow, baseline.committed) : new Set<Metric>();
  for (const [file, entry] of Object.entries(allow)) {
    out.push(...entryViolations(file, entry, files[file]));
    if (!baseline || isPartner(file, entry)) continue;
    const raised = grownEntryMetrics(entry, baseline.committed[file], baseline.ceiling?.[file]);
    for (const k of raised.filter((metric) => grown.has(metric)))
      out.push(
        `${ALLOWLIST}: ${file} ${k} grew against HEAD; the allowlist's total may only shrink, or during a pin change an entry grow to the count of the file as committed`,
      );
  }
  return out;
};

export const tighten = (
  files: Record<string, Counts>,
  allow: Allowlist | undefined,
  ceiling: Record<string, Counts> = {},
) => {
  const next = new Map<string, Allowlist[string]>();
  for (const [file, counts] of Object.entries(files)) {
    const prior = allow?.[file];
    if (isPartner(file, prior)) {
      next.set(file, prior!);
      continue;
    }
    const limit = (k: Metric) =>
      allow ? Math.max(prior?.[k] ?? 0, ceiling[file]?.[k] ?? 0) : Infinity;
    // Only the metrics with a count: a zero allows nothing.
    const c = Object.fromEntries(
      METRICS.map((k) => [k, Math.min(limit(k), counts[k])]).filter(([, n]) => n),
    ) as Partial<Counts>;
    // A misplaced partner stays, so the next run still reports it.
    if (Object.keys(c).length)
      next.set(file, {
        ...c,
        reason: prior?.reason ?? "",
        ...(prior?.partner !== undefined && { partner: prior.partner }),
      });
  }
  return Object.fromEntries(next);
};

function validateColourCounts(entry: Record<string, unknown>, label: string) {
  for (const metric of METRICS) {
    const count = entry[metric];
    if (count === undefined) continue;
    if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0)
      throw new Error(`${label}: "${metric}" needs a non-negative integer`);
  }
}

function parseAllowlistEntry(file: string, entry: unknown): Allowlist[string] {
  const label = `${ALLOWLIST}: "${file}"`;
  if (!isRecord(entry)) throw new Error(`${label} needs an object of counts and a reason`);
  const { reason, partner } = entry;
  if (reason !== undefined && typeof reason !== "string")
    throw new Error(`${label}: "reason" needs a string`);
  if (partner !== undefined && typeof partner !== "string")
    throw new Error(`${label}: "partner" needs a string`);
  validateColourCounts(entry, label);
  // Tightening keeps an existing partner entry, including its metadata and key order.
  return { ...entry, reason: reason ?? "" };
}

function parseColourAllowlist(json: string): Allowlist {
  const value: unknown = JSON.parse(json);
  if (!isRecord(value)) throw new Error(`${ALLOWLIST}: expected an object of allowances`);
  return Object.fromEntries(
    Object.entries(value).map(([file, entry]) => [file, parseAllowlistEntry(file, entry)]),
  );
}

/** This scanner's counts of a file as committed at HEAD, none where HEAD has no such file. */
const committedCounts = (p: string) => {
  const head = runGit(["show", `HEAD:./${p}`]);
  return head.status === 0 ? scanSource(head.stdout, extname(p)).counts : undefined;
};

/** The counts of every scanned file under the current directory that has any, and how many files
 *  each built-in exception kept out. */
export const scanTree = () => {
  const brand = brandFiles();
  const sizes = brandSizes(brand);
  const files: Record<string, Counts> = {};
  const skipped: Record<string, number> = {};
  for (const path of listTree("brand-colours")) {
    const why =
      exception(path) ??
      (!STYLING_EXTENSIONS.has(extname(path))
        ? NOT_STYLING.name
        : isBrandCopy(path, brand, sizes)
          ? BRAND_COPY.name
          : undefined);
    if (why) {
      skipped[why] = (skipped[why] ?? 0) + 1;
      continue;
    }
    const { counts } = scanSource(readFileSync(path, "utf8"), extname(path));
    if (METRICS.some((k) => counts[k])) files[path] = counts;
  }
  return { files, skipped };
};

if (import.meta.main) {
  answerHelp(USAGE);
  const { allow, committed } = readAllowlists(ALLOWLIST, parseColourAllowlist);
  const { files, skipped } = scanTree();
  const report = exceptionReport("brand-colours", skipped);
  if (report) console.log(report);
  for (const [file, e] of Object.entries(allow ?? {}))
    if (isPartner(file, e))
      console.log(`brand-colours: partner mark ${file} (${e.partner}): ${e.reason}`);
  // Only a file holding more than the committed list allows is read at HEAD.
  const ceiling: Record<string, Counts> = {};
  if (committed && pinChange("brand-colours"))
    for (const [file, counts] of Object.entries(files)) {
      const c =
        METRICS.some((k) => counts[k] > (committed[file]?.[k] ?? 0)) && committedCounts(file);
      if (c) ceiling[file] = c;
    }
  if (process.argv.includes("--tighten")) {
    const wrote = writeAllowlist(ALLOWLIST, tighten(files, allow, ceiling));
    console.log(
      wrote
        ? `brand-colours: ${ALLOWLIST} tightened; give every new entry its reason`
        : `brand-colours: nothing to allow; no ${ALLOWLIST} written`,
    );
  } else {
    const baseline = committed ? { committed, ceiling } : undefined;
    const bad = violations(files, allow ?? {}, baseline);
    if (bad.length) {
      console.error(
        `${bad.join("\n")}\nbrand-colours: ${bad.length} findings. Use the brand token, or name the exception with its reason in ${ALLOWLIST}.`,
      );
      process.exit(1);
    }
    console.log(`brand-colours: ${Object.keys(files).length} files within ${ALLOWLIST}`);
  }
}

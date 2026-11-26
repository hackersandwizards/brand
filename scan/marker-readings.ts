import { isRecord } from "./help";
import type { Kind } from "./marker-dom";
import { pathOf } from "./site";

export type Reading = {
  page: string;
  label: string;
  kind: Kind;
  scale: number;
  newline: boolean;
  offset: number;
  indent: number | null;
  double: boolean;
  /** The declared [data-hw-exception] the marker sits in: reported apart, never failing. */
  exception?: string;
};

export const readingLine = (r: Reading) =>
  `${r.page} ${r.label} (${r.kind}, ${r.scale}x${r.newline ? ", newline after <li>" : ""}): ` +
  `${r.offset.toFixed(2)} px off${r.indent === null ? "" : `, first line ${r.indent.toFixed(2)} px in`}` +
  (r.double ? ", and the browser's own marker beside it" : "");

/** A declared marker exception: why the readings stay off, and how many may. */
export type MarkerException = { reason: string; off: number };

/** The off readings `exceptions` keeps, those it does not, and its findings: an entry over its
 * count, an entry without a reason or count, and an entry keeping nothing. A glob matches a page's
 * decoded path, such as "**\/content-slide/at-rest/". */
export function applyExceptions(
  off: Reading[],
  exceptions: Record<string, unknown> = {},
  measured: string[] = off.map((r) => r.page),
) {
  const entries: { glob: string; e: unknown; g: Bun.Glob; readings: Reading[] }[] = Object.entries(
    exceptions,
  ).map(([glob, e]) => ({
    glob,
    e,
    g: new Bun.Glob(glob),
    readings: [],
  }));
  const bad: Reading[] = [];
  for (const r of off) {
    const hit = !r.double && entries.find(({ g }) => g.match(pathOf(r.page)));
    if (hit) hit.readings.push(r);
    else bad.push(r);
  }
  const findings = entries.flatMap(({ glob, e, readings }) => {
    const n = readings.length;
    if (
      !isRecord(e) ||
      typeof e.reason !== "string" ||
      !e.reason.trim() ||
      typeof e.off !== "number" ||
      !Number.isInteger(e.off) ||
      e.off < 1
    )
      return [`markers exception "${glob}": needs a "reason" and an "off" count of at least 1`];
    if (n === 0 && measured.some((page) => new Bun.Glob(glob).match(pathOf(page))))
      return [`markers exception "${glob}" is stale: it keeps no off reading`];
    if (n > e.off) return [`markers exception "${glob}": ${n} off readings, ${e.off} kept`];
    return [];
  });
  const kept = entries.flatMap(({ readings }) => readings);
  return { bad, kept, findings };
}

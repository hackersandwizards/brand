import { LIST, type Config, type Exception } from "./elements-config";
import { isRecord, isStringList } from "./help";

const reasonOf = (e: Exception) => (typeof e === "string" ? e : e.reason);

/** The exceptions: each declared one names its reason, and each one a page carries is declared,
 *  since an exception's instance is neither measured nor source-checked. */
export const exceptionFindings = (config: Config, results: { exceptions: string[] }[]) => {
  const out: string[] = [];
  for (const [name, exception] of Object.entries(config.exceptions ?? {}))
    if (!reasonOf(exception)?.trim()) out.push(`${LIST}: exception "${name}" names no reason`);
  for (const name of new Set(results.flatMap((r) => r.exceptions)))
    if (!Object.hasOwn(config.exceptions ?? {}, name))
      out.push(
        `${name}: a [data-hw-exception="${name}"] on a page, but ${LIST} declares no such exception`,
      );
  return out;
};

/** Validates each named exception before the scan reads it. */
export function listedElementExceptions(value: unknown): Record<string, Exception> | undefined {
  if (value == null) return;
  if (!isRecord(value)) throw new Error(`${LIST} "exceptions": expected an object`);
  return Object.fromEntries(
    Object.entries(value).map(([name, exception]): [string, Exception] => {
      if (typeof exception === "string") return [name, exception];
      if (
        !isRecord(exception) ||
        (exception.reason != null && typeof exception.reason !== "string") ||
        (exception.files != null && !isStringList(exception.files))
      )
        throw new Error(`${LIST} "exceptions": "${name}" needs a reason and optional file list`);
      return [name, { reason: exception.reason ?? "", files: exception.files ?? undefined }];
    }),
  );
}

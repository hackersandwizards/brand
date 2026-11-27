import { LIST, type Config, type Exception } from "./elements-config";
import { isRecord, isStringList } from "./help";

const reasonOf = (e: Exception) => (typeof e === "string" ? e : e.reason);

/** The exceptions: each declared one names its reason, and each one a page carries is declared,
 *  since an exception's instance is neither measured nor source-checked. */
export const exceptionFindings = (config: Config, results: { exceptions: string[] }[]) => {
  const out: string[] = [];
  for (const [name, exception] of Object.entries(config.exceptions ?? {}))
    if (!reasonOf(exception)?.trim())
      out.push(
        `${LIST}: exception "${name}" skips measurements without a reason. In "exceptions", explain why "${name}" is exempt in its string value or "reason" field.`,
      );
  for (const name of new Set(results.flatMap((r) => r.exceptions)))
    if (!Object.hasOwn(config.exceptions ?? {}, name))
      out.push(
        `${name}: [data-hw-exception="${name}"] hides elements from measurement without a declared reason. Remove the attribute or give "${name}" a reason in ${LIST} "exceptions".`,
      );
  return out;
};

/** Validates each named exception before the scan reads it. */
export function listedElementExceptions(value: unknown): Record<string, Exception> | undefined {
  if (value == null) return;
  if (!isRecord(value))
    throw new Error(
      `${LIST} "exceptions": the check cannot read the named exceptions. Set "exceptions" to an object keyed by data-hw-exception name.`,
    );
  return Object.fromEntries(
    Object.entries(value).map(([name, exception]): [string, Exception] => {
      if (typeof exception === "string") return [name, exception];
      if (
        !isRecord(exception) ||
        (exception.reason != null && typeof exception.reason !== "string") ||
        (exception.files != null && !isStringList(exception.files))
      )
        throw new Error(
          `${LIST} "exceptions": the check cannot read the exemption for "${name}". Set it to a reason string or an object with a string "reason" and an optional array of paths in "files".`,
        );
      return [name, { reason: exception.reason ?? "", files: exception.files ?? undefined }];
    }),
  );
}

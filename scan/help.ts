/** A command in bin calls this first: on --help or -h before any "--" it prints its usage and exits 0. */
export const answerHelp = (usage: string) => {
  const args = process.argv.slice(2);
  const end = args.indexOf("--");
  const own = end < 0 ? args : args.slice(0, end);
  if (!own.includes("--help") && !own.includes("-h")) return;
  console.log(usage);
  process.exit(0);
};
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

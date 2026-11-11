/** A command in bin calls this first: on --help or -h before any "--" it prints its usage and exits 0. */
export const answerHelp = (usage: string) => {
  const args = process.argv.slice(2);
  const end = args.indexOf("--");
  const own = end < 0 ? args : args.slice(0, end);
  if (!own.includes("--help") && !own.includes("-h")) return;
  console.log(usage);
  process.exit(0);
};

/** The declarations of a CSS block, comments dropped, whitespace collapsed. */
export const declarations = (body: string) => {
  const out: Record<string, string> = {};
  for (const decl of body.replace(/\/\*[\s\S]*?\*\//g, "").split(";")) {
    const m = decl.match(/^\s*([\w-]+)\s*:\s*([\s\S]+?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")");
  }
  return out;
};

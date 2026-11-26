/** A srcset with each candidate's address passed through `at`, split as the HTML parser does:
 *  an address runs to whitespace, and a comma inside it stays, as in a data: or CDN URL. */
export function rebaseSrcset(srcset: string, at: (url: string) => string) {
  let out = "";
  let rest = srcset;
  while (rest) {
    const start = rest.search(/[^\s,]/);
    const gap = rest.slice(0, start < 0 ? rest.length : start);
    rest = rest.slice(gap.length);
    const end = rest.search(/\s/);
    const url = rest.slice(0, end < 0 ? rest.length : end);
    const bare = url.replace(/,*$/, "");
    const commas = url.slice(bare.length);
    rest = rest.slice(url.length);
    // Without a trailing comma, descriptors such as "2x" run to the next comma.
    const comma = rest.indexOf(",");
    const descriptors = commas ? "" : rest.slice(0, comma < 0 ? rest.length : comma);
    rest = rest.slice(descriptors.length);
    out += gap + (bare ? at(bare) : "") + commas + descriptors;
  }
  return out;
}

/** Relative addresses resolve against the source page, not this one; a fragment (an SVG
 *  sprite's #icon) and an address that does not parse stay as written. */
export function sourceAddress(url: string, base: string) {
  if (url.startsWith("#")) return url;
  if (typeof URL.canParse === "function")
    return URL.canParse(url, base) ? new URL(url, base).href : url;
  try {
    return new URL(url, base).href;
  } catch (error) {
    if (error instanceof TypeError) return url;
    throw error;
  }
}

/** Rebase a row or group and its descendant links and images to the fetched document. */
function rebaseSourceNode(node: Node, base: string) {
  if (!(node instanceof Element)) return;
  for (const el of [node, ...node.querySelectorAll("[href], [src], [srcset]")]) {
    for (const name of ["href", "src"]) {
      const value = el.getAttribute(name);
      if (value !== null) el.setAttribute(name, sourceAddress(value, base));
    }
    const srcset = el.getAttribute("srcset");
    if (srcset)
      el.setAttribute(
        "srcset",
        rebaseSrcset(srcset, (url) => sourceAddress(url, base)),
      );
  }
}

export interface SourceRows {
  nodes: Node[];
  replace: boolean;
}

function sourceUnavailable(error: unknown) {
  return (
    error instanceof TypeError || (error instanceof DOMException && error.name === "AbortError")
  );
}

/** A browser fetch rejects with TypeError on network or invalid-request failures. */
async function sourceResponse(source: string) {
  try {
    return await fetch(source);
  } catch (error) {
    if (!sourceUnavailable(error)) throw error;
  }
}

/** A network failure while reading the body still leaves the source unavailable. */
async function sourceBody(response: Response) {
  try {
    return await response.text();
  } catch (error) {
    if (!sourceUnavailable(error)) throw error;
  }
}

/** Read the fetched markup and resolve its links before placing it in another document. */
async function fetchSourceRows(source: string): Promise<SourceRows | undefined> {
  const response = await sourceResponse(source);
  if (!response?.ok) return undefined;
  const html = await sourceBody(response);
  if (html === undefined) return undefined;
  const page = new DOMParser().parseFromString(html, "text/html");
  // The source's list as it stands, groups included, else its rows alone.
  const from = page.querySelector("[data-filter-list]");
  const nodes = from ? [...from.childNodes] : [...page.querySelectorAll("[data-filter-item]")];
  for (const node of nodes) rebaseSourceNode(node, response.url);
  return { nodes, replace: from !== null };
}

/** The source page's rows arrive on first use; until then nothing filters, and should they never
 *  arrive the form goes to that page. */
export class FilterSource {
  readonly address: string | undefined;
  loaded: boolean;
  failed = false;
  private loading?: Promise<void>;

  constructor(address: string | undefined) {
    this.address = address;
    this.loaded = !address;
  }

  /** Share the first request between focus and filtering, including when that request failed. */
  load(install: (rows: SourceRows) => void, apply: () => void, onFailure: () => void) {
    if (!this.address) return;
    this.loading ??= fetchSourceRows(this.address).then((rows) => {
      if (rows === undefined) {
        this.failed = true;
        onFailure();
        return;
      }
      install(rows);
      this.loaded = true;
      apply();
    });
    return this.loading;
  }
}

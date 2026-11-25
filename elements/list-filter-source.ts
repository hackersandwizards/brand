/** A srcset with each candidate's address passed through `at`, split as the HTML parser does:
 *  an address runs to whitespace, and a comma inside it stays, as in a data: or CDN URL. */
export function rebaseSrcset(srcset: string, at: (url: string) => string) {
  let out = "";
  let rest = srcset;
  while (rest) {
    const gap = /^[\s,]*/.exec(rest)![0];
    const url = /^\S*/.exec(rest.slice(gap.length))![0];
    const commas = /,*$/.exec(url)![0];
    rest = rest.slice(gap.length + url.length);
    // Without a trailing comma, descriptors such as "2x" run to the next comma.
    const descriptors = commas ? "" : /^[^,]*/.exec(rest)![0];
    rest = rest.slice(descriptors.length);
    const bare = url.slice(0, url.length - commas.length);
    out += gap + (bare ? at(bare) : "") + commas + descriptors;
  }
  return out;
}

/** Relative addresses resolve against the source page, not this one; a fragment (an SVG
 *  sprite's #icon) and an address that does not parse stay as written. */
function sourceAddress(url: string, base: string) {
  if (url.startsWith("#")) return url;
  try {
    return new URL(url, base).href;
  } catch {
    return url;
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

/** Read the fetched markup and resolve its links before placing it in another document. */
async function fetchSourceRows(source: string): Promise<SourceRows> {
  const response = await fetch(source);
  if (!response.ok) throw new Error(String(response.status));
  const page = new DOMParser().parseFromString(await response.text(), "text/html");
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
    this.loading ??= fetchSourceRows(this.address)
      .then((rows) => {
        install(rows);
        this.loaded = true;
        apply();
      })
      .catch(() => {
        this.failed = true;
        onFailure();
      });
  }
}

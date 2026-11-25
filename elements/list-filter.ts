// The list filter's protocol, framework-free: the matching a server render and the browser share,
// so a shared link renders the rows the typing showed.
// An item is its text and, per facet parameter, the values it carries; the state is the
// search words and one chosen value per facet, "" for all. Each row of the list carries
// data-filter-item, its text in data-filter-text, its facet values as JSON in
// data-filter-facets ({"topic":["tools"]}), its place in the server's order in data-filter-order;
// a [data-filter-title] inside, holding text only, gets the matched words marked, and a
// [data-filter-group] hides while none of its rows shows. A server render sets `hidden` on each row
// where `matches(item, state)` is false, so a shared link shows the same rows without JavaScript.
export interface FilterItem {
  text: string;
  facets: Record<string, string[]>;
}

export interface FilterState {
  q: string;
  facets: Record<string, string>;
}

/** The search words of a query: every word counts from its first character. */
export const searchWords = (q: string) => q.trim().toLowerCase().split(/\s+/).filter(Boolean);

// Quoted keys: a page may load this script without a charset, and a bare non-ASCII key then breaks
// the parse. LETTERS are those without a decomposition to drop an accent from (ø, æ, œ, ł, đ, ı).
const SPELLED: Record<string, string> = { "\u00e4": "ae", "\u00f6": "oe", "\u00fc": "ue" };
const LETTERS: Record<string, string> = {
  "\u00df": "ss",
  "\u00f8": "o",
  "\u00e6": "ae",
  "\u0153": "oe",
  "\u0142": "l",
  "\u0111": "d",
  "\u0131": "i",
};
const folds = new Map<string, [string, string]>();

/** A text's two search forms, lowercase with ß as ss: accents dropped (Müller: muller) and German
 *  umlauts spelled out (Müller: mueller). A word is found where one of its forms sits in one of the
 *  text's, so muller, mueller and müller each find Müller, and mueller and müller find Mueller;
 *  muller does not, as ue stays two letters (blue). Each text folds once: a keystroke matches every
 *  row again. */
function searchForms(text: string): [string, string] {
  let forms = folds.get(text);
  if (forms) return forms;
  const lower = text
    .toLowerCase()
    .normalize("NFC")
    .replace(/[\u00df\u00f8\u00e6\u0153\u0142\u0111\u0131]/g, (char) => LETTERS[char]!);
  const bare = (form: string) => form.normalize("NFD").replace(/\p{M}/gu, "");
  forms = [bare(lower), bare(lower.replace(/[\u00e4\u00f6\u00fc]/g, (char) => SPELLED[char]!))];
  if (folds.size > 10_000) folds.clear();
  folds.set(text, forms);
  return forms;
}

/** Whether one of a word's forms meets one of the text's forms by `test`. */
const meets = (text: string, word: string, test: (form: string, part: string) => boolean) => {
  const forms = searchForms(text);
  return searchForms(word).some((part) => forms.some((form) => test(form, part)));
};

/** Whether every search word sits in the text, accents, umlauts and ß folded. */
export const hasWords = (text: string, words: string[]) =>
  words.every((word) => meets(text, word, (form, part) => form.includes(part)));

/** The state a URL carries: `q` and each facet's parameter, a value no option offers read as "". */
export function readState(
  params: URLSearchParams,
  options: Record<string, readonly string[]>,
): FilterState {
  const facets = Object.fromEntries(
    Object.entries(options).map(([param, values]) => {
      const value = params.get(param);
      return [param, values.find((option) => option === value) ?? ""];
    }),
  );
  return { q: params.get("q")?.trim() ?? "", facets };
}

export const isActive = (state: FilterState) =>
  searchWords(state.q).length > 0 || Object.values(state.facets).some(Boolean);

const facetValues = (item: FilterItem, param: string) =>
  Object.hasOwn(item.facets, param) ? item.facets[param] : [];

/** Every word in the text and every chosen facet value on the item. `except` leaves one facet out,
 *  which is how that facet's own counts are taken. */
export function matches(item: FilterItem, state: FilterState, except?: string): boolean {
  const words = searchWords(state.q);
  if (!hasWords(item.text, words)) return false;
  return Object.entries(state.facets).every(
    ([param, value]) => param === except || !value || facetValues(item, param).includes(value),
  );
}

/** Per value of one facet, the items the search and the other facets let through; "" is all. */
export function tally(items: FilterItem[], state: FilterState, param: string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (!matches(item, state, param)) continue;
    for (const value of new Set(["", ...facetValues(item, param)]))
      counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/** The count line: a template such as "{shown} of {total}", or one for a single match and one for
 *  any other number, filled in. */
export type CountCopy = string | { one: string; other: string };

export const countLine = (template: CountCopy, shown: number, total: number) =>
  (typeof template === "string" ? template : shown === 1 ? template.one : template.other)
    .replace("{shown}", String(shown))
    .replace("{total}", String(total));

/** The phone's Filters button: the chosen values' labels in the facets' order, else its own word,
 *  and the accessible name joining the two once a value is chosen. */
export function filtersLabel(filters: string, chosen: (string | undefined)[]) {
  const picked = chosen.filter(Boolean).join(", ");
  return { text: picked || filters, aria: picked ? `${filters}: ${picked}` : undefined };
}

/** The full-text search's address for a query, keeping any parameter the base already has. */
export const fullTextUrl = (base: string, q: string) =>
  `${base}${base.includes("?") ? "&" : "?"}q=${encodeURIComponent(q)}`;

/** Where a matching item ranks for a query, higher first: a title equal to the whole query wins
 *  outright, then each word found in the title, more for a title starting with it. Searching
 *  "context engineering" wants the page of that name above the pages that mention it. */
function rank(title: string, q: string): number {
  const query = q.trim();
  let score = query && meets(title, query, (form, part) => form === part) ? 100 : 0;
  for (const word of searchWords(q)) {
    if (hasWords(title, [word])) score += 10;
    if (meets(title, word, (form, part) => form.startsWith(part))) score += 5;
  }
  return score;
}

/** The items' order under a query: by rank, then the shorter title, then the page's own order. */
export function ranked<T>(rows: T[], title: (row: T) => string, q: string): T[] {
  if (!searchWords(q).length) return rows;
  return rows
    .map((row, index) => ({ row, index, score: rank(title(row), q), length: title(row).length }))
    .sort((a, b) => b.score - a.score || a.length - b.length || a.index - b.index)
    .map(({ row }) => row);
}

/** The URL with the state written in: empty values leave their parameter out. */
export function stateUrl(href: string, state: FilterState): string {
  const url = new URL(href);
  for (const param of ["q", ...Object.keys(state.facets)]) url.searchParams.delete(param);
  if (state.q) url.searchParams.set("q", state.q);
  for (const [param, value] of Object.entries(state.facets))
    if (value) url.searchParams.set(param, value);
  return url.href;
}

const escapeMarkup = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );

interface FoldedText {
  folded: string;
  from: number[];
  to: number[];
}

// Each form of the text character by character, with where in the source each folded character
// starts and ends.
/** Index the two search spellings against spans in the original text. */
function indexFoldedText(source: string): FoldedText[] {
  const forms = [0, 1].map(() => ({ folded: "", from: [] as number[], to: [] as number[] }));
  let at = 0;
  for (const char of source) {
    searchForms(char).forEach((form, index) => {
      const each = forms[index]!;
      each.folded += form;
      for (let i = 0; i < form.length; i++) {
        each.from.push(at);
        each.to.push(at + char.length);
      }
    });
    at += char.length;
  }
  return forms;
}

/** Project every occurrence of the folded words onto its full span in the source. */
function searchSpans(source: string, words: string[]): boolean[] {
  const forms = indexFoldedText(source);
  const needles = Array.from(words, searchForms)
    .flat()
    .filter((needle) => needle.length > 0);
  const marked = new Array<boolean>(source.length).fill(false);
  for (const needle of needles)
    for (const { folded, from, to } of forms)
      for (let hit = folded.indexOf(needle); hit !== -1; hit = folded.indexOf(needle, hit + 1))
        marked.fill(true, from[hit], to[hit + needle.length - 1]);
  return marked;
}

/** Escape the text and wrap each contiguous span marked by the search. */
function renderSearchSpans(source: string, marked: boolean[]): string {
  let html = "";
  for (let start = 0; start < source.length;) {
    let end = start;
    while (end < source.length && marked[end] === marked[start]) end++;
    const part = escapeMarkup(source.slice(start, end));
    html += marked[start] ? `<mark>${part}</mark>` : part;
    start = end;
  }
  return html;
}

/** The text as HTML with each search word in a <mark>, every part escaped. A word matches as
 *  `hasWords` finds it, so "muller" marks "Müller". */
export function highlight(text: string, words: string[]): string {
  if (!words.length) return escapeMarkup(text);
  const source = text.normalize("NFC");
  return renderSearchSpans(source, searchSpans(source, words));
}

/** The rows from which a list skips the layout of its rows off screen (data-long, list-filter.css):
 *  from here, rendering every row, one filter step on a slow phone takes longer than a frame. */
export const LONG_LIST = 100;

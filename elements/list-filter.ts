// The list filter's protocol, framework-free: the matching a server render and the browser share,
// so a shared link renders the rows the typing showed, and `initListFilter`, the browser side of
// expert/components/ListFilter.astro, which a page without Astro can run over the same markup.
// An item is its lowercase text and, per facet parameter, the values it carries; the state is the
// search words and one chosen value per facet, "" for all. Each row of the list carries
// data-filter-item, its lowercase text in data-filter-text, its facet values as JSON in
// data-filter-facets ({"topic":["tools"]}), its place in the server's order in data-filter-order;
// a [data-filter-title] inside gets the matched words marked, and a [data-filter-group] hides
// while none of its rows shows.
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

/** The state a URL carries: `q` and each facet's parameter, a value no option offers read as "". */
export function readState(
  params: URLSearchParams,
  options: Record<string, readonly string[]>,
): FilterState {
  const facets: Record<string, string> = {};
  for (const [param, values] of Object.entries(options)) {
    const value = params.get(param) ?? "";
    facets[param] = values.includes(value) ? value : "";
  }
  return { q: params.get("q")?.trim() ?? "", facets };
}

export const isActive = (state: FilterState) =>
  searchWords(state.q).length > 0 || Object.values(state.facets).some(Boolean);

/** Every word in the text and every chosen facet value on the item. `except` leaves one facet out,
 *  which is how that facet's own counts are taken. */
export function matches(item: FilterItem, state: FilterState, except?: string): boolean {
  const words = searchWords(state.q);
  if (!words.every((word) => item.text.includes(word))) return false;
  return Object.entries(state.facets).every(
    ([param, value]) => param === except || !value || (item.facets[param] ?? []).includes(value),
  );
}

/** Per value of one facet, the items the search and the other facets let through; "" is all. */
export function tally(items: FilterItem[], state: FilterState, param: string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (!matches(item, state, param)) continue;
    for (const value of ["", ...(item.facets[param] ?? [])])
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

/** The full-text search's address for a query, keeping any parameter the base already has. */
export const fullTextUrl = (base: string, q: string) =>
  `${base}${base.includes("?") ? "&" : "?"}q=${encodeURIComponent(q)}`;

/** Where a matching item ranks for a query, higher first: a title equal to the whole query wins
 *  outright, then each word found in the title, more for a title starting with it. Searching
 *  "context engineering" wants the page of that name above the pages that mention it. */
function rank(title: string, q: string): number {
  const lower = title.toLowerCase();
  const query = q.trim().toLowerCase();
  let score = query && lower === query ? 100 : 0;
  for (const word of searchWords(q)) {
    if (lower.includes(word)) score += 10;
    if (lower.startsWith(word)) score += 5;
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

/** The text as HTML with each search word in a <mark>, every part escaped. */
export function highlight(text: string, words: string[]): string {
  if (words.length === 0) return escapeMarkup(text);
  const pattern = new RegExp(
    `(${[...words]
      .sort((a, b) => b.length - a.length)
      .map((word) => word.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&"))
      .join("|")})`,
    "gi",
  );
  return text
    .split(pattern)
    .map((part, index) => (index % 2 ? `<mark>${escapeMarkup(part)}</mark>` : escapeMarkup(part)))
    .join("");
}

/** The browser side of ListFilter.astro, over its markup (root [data-list-filter], its value
 *  "always" or "active"): typing (200 ms debounce), a choice and the select filter in place, the
 *  state lives in `?q=` and each facet's parameter, Back and Forward restore it, and the counts
 *  follow the search. One search is one history entry, arrowing across the choices is one too. */
export function initListFilter(root: HTMLElement) {
  const form = root.querySelector("form")!;
  const input = form.querySelector<HTMLInputElement>('input[name="q"]')!;
  const radios = [...form.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  const select = form.querySelector("select");
  const list = root.querySelector<HTMLElement>("[data-filter-list]")!;
  const empty = root.querySelector<HTMLElement>("[data-filter-empty]")!;
  const count = root.querySelector<HTMLElement>("[data-filter-count]")!;
  const clears = root.querySelectorAll<HTMLElement>("[data-filter-clear]");
  const fullTexts = root.querySelectorAll<HTMLAnchorElement>("[data-filter-fulltext]");
  const toggle = root.querySelector<HTMLButtonElement>("[data-filter-toggle]");
  const panel = root.querySelector<HTMLElement>("[data-filter-panel]")!;
  const overview = root.dataset.overview ? document.getElementById(root.dataset.overview) : null;
  const browseAlways = root.dataset.listFilter !== "active";
  const copy: CountCopy = JSON.parse(root.dataset.count!);
  const chipParam = radios[0]!.name;
  const options: Record<string, string[]> = { [chipParam]: radios.map((radio) => radio.value) };
  if (select) options[select.name] = [...select.options].map((option) => option.value);

  const rows = [...list.querySelectorAll<HTMLElement>("[data-filter-item]")]
    .sort((a, b) => Number(a.dataset.filterOrder ?? 0) - Number(b.dataset.filterOrder ?? 0))
    .map((el) => {
      const title = el.querySelector<HTMLElement>("[data-filter-title]");
      const item: FilterItem = {
        text: el.dataset.filterText ?? "",
        facets: JSON.parse(el.dataset.filterFacets ?? "{}"),
      };
      return { el, title, plain: title?.textContent ?? "", item };
    });
  const items = rows.map((row) => row.item);
  const groups = [...list.querySelectorAll<HTMLElement>("[data-filter-group]")];

  const state = (): FilterState => {
    const facets = { [chipParam]: radios.find((radio) => radio.checked)?.value ?? "" };
    if (select) facets[select.name] = select.value;
    return { q: input.value.trim(), facets };
  };

  const apply = () => {
    const current = state();
    const words = searchWords(current.q);
    const faceted = Object.values(current.facets).some(Boolean);
    const active = words.length > 0 || faceted;
    let shown = 0;
    const order = ranked(rows, (row) => row.plain, current.q);
    // Rows reorder only within their own parent, so a grouped list keeps its groups.
    for (const row of order) row.el.parentElement?.append(row.el);
    for (const { el, title, plain, item } of order) {
      el.hidden = !matches(item, current);
      if (!el.hidden) shown += 1;
      if (title) title.innerHTML = highlight(plain, words);
    }
    for (const group of groups)
      group.hidden = !group.querySelector("[data-filter-item]:not([hidden])");
    const listed = browseAlways || active;
    list.hidden = !listed || shown === 0;
    empty.hidden = !listed || shown > 0;
    count.textContent = listed ? countLine(copy, shown, items.length) : "";
    for (const clear of clears) if (clear.closest("form")) clear.hidden = !active || shown === 0;
    for (const link of fullTexts) {
      link.href = fullTextUrl(link.dataset.filterFulltext!, current.q);
      link.hidden = !current.q;
    }
    const chips = tally(items, current, chipParam);
    for (const each of form.querySelectorAll<HTMLElement>("[data-facet-count]"))
      each.textContent = String(chips.get(each.dataset.facetCount!) ?? 0);
    if (select) {
      const counts = tally(items, current, select.name);
      for (const option of select.options)
        option.textContent = `${option.dataset.label} (${counts.get(option.value) ?? 0})`;
    }
    if (overview) overview.hidden = active;
    // A set facet fills the phone's Filters button: its facets are folded away behind it.
    if (faceted) toggle?.removeAttribute("data-variant");
    else toggle?.setAttribute("data-variant", "secondary");
  };

  const restore = () => {
    const { q, facets } = readState(new URLSearchParams(location.search), options);
    input.value = q;
    for (const radio of radios) radio.checked = radio.value === facets[chipParam];
    if (select) select.value = facets[select.name] ?? "";
    apply();
  };

  let timer = 0;
  let session: "typing" | "picking" | "" = "";
  const record = (kind: typeof session) => {
    const next = stateUrl(location.href, state());
    if (next === location.href) return;
    if (session === kind) history.replaceState(history.state, "", next);
    else history.pushState(history.state, "", next);
    session = kind;
  };
  /** A change that is its own history entry. */
  const once = (kind: typeof session) => {
    session = "";
    apply();
    record(kind);
    session = "";
  };
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      apply();
      record("typing");
    }, 200);
  });
  panel.addEventListener("pointerdown", () => (session = ""));
  for (const radio of radios)
    radio.addEventListener("change", () => {
      apply();
      record("picking");
    });
  select?.addEventListener("change", () => once("picking"));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearTimeout(timer);
    once("typing");
    input.blur();
  });
  for (const clear of clears)
    clear.addEventListener("click", (event) => {
      event.preventDefault();
      input.value = "";
      radios[0]!.checked = true;
      if (select) select.value = "";
      once("typing");
      input.focus();
    });
  addEventListener("popstate", () => {
    session = "";
    restore();
  });
  // A server renders the URL's state, a static page does not: the URL wins while the form is as
  // rendered, what someone typed or picked before this ran wins otherwise.
  const untouched =
    input.value === input.defaultValue &&
    radios.every((radio) => radio.checked === radio.defaultChecked) &&
    (!select || [...select.options].every((option) => option.selected === option.defaultSelected));
  if (untouched) restore();
  else apply();
  history.replaceState(history.state, "", stateUrl(location.href, state()));

  // The phone's facets: the toggle opens and closes them, Escape and a click outside close them,
  // Escape returning focus to the toggle.
  root.dataset.js = "";
  if (!toggle) return;
  const open = (next: boolean) => {
    root.toggleAttribute("data-closed", !next);
    toggle.setAttribute("aria-expanded", String(next));
  };
  open(false);
  toggle.addEventListener("click", () => open(root.hasAttribute("data-closed")));
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || root.hasAttribute("data-closed")) return;
    open(false);
    if (toggle.checkVisibility()) toggle.focus();
  });
  document.addEventListener("click", (event) => {
    const target = event.target as Node;
    if (!toggle.contains(target) && !panel.contains(target)) open(false);
  });
}

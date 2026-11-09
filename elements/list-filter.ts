// The list filter's protocol, framework-free: the matching a server render and the browser share,
// so a shared link renders the rows the typing showed, and `initListFilter`, the browser side of
// expert/components/ListFilter.astro, which a page without Astro can run over the same markup.
// An item is its lowercase text and, per facet parameter, the values it carries; the state is the
// search words and one chosen value per facet, "" for all. Each row of the list carries
// data-filter-item, its lowercase text in data-filter-text, its facet values as JSON in
// data-filter-facets ({"topic":["tools"]}), its place in the server's order in data-filter-order;
// a [data-filter-title] inside, holding text only, gets the matched words marked, and a
// [data-filter-group] hides while none of its rows shows. A server render sets `hidden` on each row
// where `matches(item, state)` is false, so a shared link shows the same rows without JavaScript.
// One list filter per page: each reads and writes `?q=`.
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

/** The rows from which a list skips the layout of its rows off screen (data-long, list-filter.css):
 *  from here, rendering every row, one filter step on a slow phone takes longer than a frame. */
export const LONG_LIST = 100;

/** The browser side of ListFilter.astro, over its markup (root [data-list-filter], its value
 *  "always" or "active"): typing (200 ms debounce), each facet's choice or select filter in place, the
 *  state lives in `?q=` and each facet's parameter, Back and Forward restore it, and the counts
 *  follow the search. One search is one history entry, arrowing across one facet's choices is one too.
 *  Ctrl+K or Cmd+K focuses the search; on a phone a tapped choice folds the facets, and the Filters
 *  button names the chosen values.
 *  Rows in a template[data-filter-rows] enter the list; with data-source on the root, the rows of
 *  that page load on first use, and until they do the form's submit goes there. Once wired the
 *  root carries data-ready. */
export function initListFilter(root: HTMLElement) {
  const form = root.querySelector("form")!;
  const input = form.querySelector<HTMLInputElement>('input[name="q"]')!;
  const radios = [...form.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  const selects = [...form.querySelectorAll("select")];
  const list = root.querySelector<HTMLElement>("[data-filter-list]")!;
  const empty = root.querySelector<HTMLElement>("[data-filter-empty]")!;
  const count = root.querySelector<HTMLElement>("[data-filter-count]")!;
  const clears = root.querySelectorAll<HTMLElement>("[data-filter-clear]");
  const fullTexts = root.querySelectorAll<HTMLAnchorElement>("[data-filter-fulltext]");
  const toggle = root.querySelector<HTMLButtonElement>("[data-filter-toggle]");
  // The button's text sits in its [data-filter-label], its own word in data-filters; markup
  // without them keeps the button's text as that word.
  const toggleLabel = toggle?.querySelector<HTMLElement>("[data-filter-label]");
  const filtersWord = toggle?.dataset.filters ?? toggle?.textContent?.trim() ?? "";
  const panel = root.querySelector<HTMLElement>("[data-filter-panel]")!;
  const overview = root.dataset.overview ? document.getElementById(root.dataset.overview) : null;
  const browseAlways = root.dataset.listFilter !== "active";
  const copy: CountCopy = JSON.parse(root.dataset.count!);
  // Each facet's values in the form's order: a fieldset of radios sharing its name, or a select.
  const options: Record<string, string[]> = {};
  for (const el of form.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
    'input[type="radio"], select',
  ))
    (options[el.name] ??= []).push(
      ...(el instanceof HTMLSelectElement
        ? [...el.options].map((option) => option.value)
        : [el.value]),
    );
  const value = (param: string) =>
    selects.find((select) => select.name === param)?.value ??
    radios.find((radio) => radio.name === param && radio.checked)?.value ??
    "";
  const choiceSets = [...form.querySelectorAll("fieldset")].flatMap((set) => {
    const param = set.querySelector<HTMLInputElement>('input[type="radio"]')?.name;
    return param ? [{ set, param }] : [];
  });
  form.hidden = false;
  const template = list.querySelector<HTMLTemplateElement>("template[data-filter-rows]");
  template?.replaceWith(template.content);

  type Row = { el: HTMLElement; title: HTMLElement | null; plain: string; item: FilterItem };
  let rows: Row[] = [];
  let items: FilterItem[] = [];
  // The rows as the page placed them, which may be a query's order.
  let placed: Row[] = [];
  let groups: HTMLElement[] = [];
  const collect = () => {
    rows = [...list.querySelectorAll<HTMLElement>("[data-filter-item]")]
      .sort((a, b) => Number(a.dataset.filterOrder ?? 0) - Number(b.dataset.filterOrder ?? 0))
      .map((el) => {
        const title = el.querySelector<HTMLElement>("[data-filter-title]");
        const item: FilterItem = {
          text: el.dataset.filterText ?? "",
          facets: JSON.parse(el.dataset.filterFacets ?? "{}"),
        };
        return { el, title, plain: title?.textContent ?? "", item };
      });
    items = rows.map((row) => row.item);
    const rowOf = new Map(rows.map((row) => [row.el, row]));
    placed = [...list.querySelectorAll<HTMLElement>("[data-filter-item]")].map((el) =>
      rowOf.get(el)!,
    );
    groups = [...list.querySelectorAll<HTMLElement>("[data-filter-group]")];
    list.toggleAttribute("data-long", rows.length >= LONG_LIST);
  };
  // In a long list a row off screen skips layout (list-filter.css) and stands in at the mean
  // content height of the rows the browser renders, measured whenever the list's width changes
  // (from 0 too, as a hidden list shows); a row once rendered keeps its own height.
  let width = -1;
  new ResizeObserver(([entry]) => {
    if (entry!.contentRect.width === width) return;
    width = entry!.contentRect.width;
    if (!list.hasAttribute("data-long")) return;
    const rendered = rows.filter(
      ({ el }) =>
        !el.hidden &&
        [...el.children].some((child) => child.checkVisibility?.({ contentVisibilityAuto: true })),
    );
    if (!rendered.length) return;
    // The stand-in is the content box's height: padding and border come on top.
    const box = getComputedStyle(rendered[0]!.el);
    const inset = [box.paddingTop, box.paddingBottom, box.borderTopWidth, box.borderBottomWidth]
      .map(parseFloat)
      .reduce((a, b) => a + b);
    const mean =
      rendered.reduce((sum, { el }) => sum + el.getBoundingClientRect().height, 0) /
      rendered.length;
    list.style.setProperty("--hw-list-filter-row", `${mean - inset}px`);
  }).observe(list);
  collect();

  // The source page's rows arrive on first use; until then nothing filters, and should they never
  // arrive the form goes to that page.
  const source = root.dataset.source;
  let loaded = !source;
  let failed = false;
  let loading: Promise<void> | undefined;
  const load = () =>
    (loading ??= fetch(source!)
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return { html: await response.text(), base: response.url };
      })
      .then(({ html, base }) => {
        const page = new DOMParser().parseFromString(html, "text/html");
        // The source's list as it stands, groups included, else its rows alone.
        const from = page.querySelector("[data-filter-list]");
        const nodes = from
          ? [...from.childNodes]
          : [...page.querySelectorAll("[data-filter-item]")];
        // Relative addresses resolve against the source page, not this one; a fragment (an SVG
        // sprite's #icon) and an address that does not parse stay as written.
        const at = (url: string) => {
          if (url.startsWith("#")) return url;
          try {
            return new URL(url, base).href;
          } catch {
            return url;
          }
        };
        for (const node of nodes) {
          if (!(node instanceof Element)) continue;
          for (const el of [node, ...node.querySelectorAll("[href], [src], [srcset]")]) {
            for (const name of ["href", "src"]) {
              const value = el.getAttribute(name);
              if (value !== null) el.setAttribute(name, at(value));
            }
            const srcset = el.getAttribute("srcset");
            if (srcset) el.setAttribute("srcset", rebaseSrcset(srcset, at));
          }
        }
        if (from) list.replaceChildren(...nodes);
        else list.append(...nodes);
        collect();
        loaded = true;
        apply();
      })
      .catch(() => {
        failed = true;
        // A search already typed goes to the source page, which lists every row.
        if (isActive(state())) form.submit();
      }));

  const state = (): FilterState => {
    const facets: Record<string, string> = {};
    for (const param in options) facets[param] = value(param);
    return { q: input.value.trim(), facets };
  };

  const apply = () => {
    const current = state();
    const words = searchWords(current.q);
    const faceted = Object.values(current.facets).some(Boolean);
    const active = words.length > 0 || faceted;
    if (overview) overview.hidden = active;
    // A set facet fills the phone's Filters button and names itself there: its facets are folded
    // away behind it.
    if (toggle) {
      if (faceted) toggle.removeAttribute("data-variant");
      else toggle.setAttribute("data-variant", "secondary");
      const { text, aria } = filtersLabel(
        filtersWord,
        [
          ...form.querySelectorAll<HTMLInputElement | HTMLOptionElement>(
            'input[type="radio"]:checked, option:checked',
          ),
        ]
          .filter((el) => el.value)
          .map((el) => el.dataset.label),
      );
      (toggleLabel ?? toggle).textContent = text;
      if (aria) toggle.setAttribute("aria-label", aria);
      else toggle.removeAttribute("aria-label");
    }
    if (!loaded) {
      if (active && failed) form.submit();
      else if (active) void load();
      list.hidden = true;
      for (const clear of clears) if (clear.closest("form")) clear.hidden = !active;
      return;
    }
    let shown = 0;
    const order = ranked(rows, (row) => row.plain, current.q);
    // Rows move only when the order changes, and only within their own parent, so a grouped list
    // keeps its groups.
    if (order.some((row, i) => row !== placed[i])) {
      for (const row of order) row.el.parentElement?.append(row.el);
      placed = order;
    }
    for (const { el, title, plain, item } of order) {
      el.hidden = !matches(item, current);
      if (el.hidden) continue;
      shown += 1;
      // A hidden row's title is rewritten when it shows again.
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
    for (const { set, param } of choiceSets) {
      const chips = tally(items, current, param);
      for (const each of set.querySelectorAll<HTMLElement>("[data-facet-count]"))
        each.textContent = String(chips.get(each.dataset.facetCount!) ?? 0);
    }
    for (const select of selects) {
      const counts = tally(items, current, select.name);
      for (const option of select.options)
        option.textContent = `${option.dataset.label} (${counts.get(option.value) ?? 0})`;
    }
  };

  const restore = () => {
    const { q, facets } = readState(new URLSearchParams(location.search), options);
    input.value = q;
    for (const radio of radios) radio.checked = radio.value === (facets[radio.name] ?? "");
    for (const select of selects) select.value = facets[select.name] ?? "";
    apply();
  };

  let timer = 0;
  // "typing", or "picking" and the facet's parameter: arrowing across one facet's choices.
  let session = "";
  // A pick by pointer, which folds the phone's facets; a pick by key keeps them open.
  let tapped = false;
  const record = (kind: string) => {
    const next = stateUrl(location.href, state());
    if (next === location.href) return;
    if (session === kind) history.replaceState(history.state, "", next);
    else history.pushState(history.state, "", next);
    session = kind;
  };
  /** A change that is its own history entry. */
  const once = (kind: string) => {
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
  panel.addEventListener("pointerdown", () => {
    session = "";
    tapped = true;
  });
  for (const radio of radios)
    radio.addEventListener("change", () => {
      apply();
      record(`picking ${radio.name}`);
    });
  for (const select of selects) select.addEventListener("change", () => once("picking"));
  if (source) form.addEventListener("focusin", () => void load());
  form.addEventListener("submit", (event) => {
    if (failed) return;
    event.preventDefault();
    clearTimeout(timer);
    once("typing");
    input.blur();
  });
  for (const clear of clears)
    clear.addEventListener("click", (event) => {
      event.preventDefault();
      input.value = "";
      for (const radio of radios) radio.checked = radio.value === "";
      for (const select of selects) select.value = "";
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
    selects.every((select) =>
      [...select.options].every((option) => option.selected === option.defaultSelected),
    );
  if (untouched) restore();
  else apply();
  history.replaceState(history.state, "", stateUrl(location.href, state()));

  // Ctrl+K or Cmd+K outside a text field puts the cursor in the search, unless the page's command
  // palette (dialog[data-hw-shortcut="k"], command.css) takes the key. A single key such as "/"
  // would need a switch to turn it off (WCAG 2.1.4); one with a modifier does not.
  document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement;
    if (
      event.key?.toLowerCase() !== "k" ||
      !(event.ctrlKey || event.metaKey) ||
      event.altKey ||
      event.shiftKey ||
      target.isContentEditable ||
      target.matches("textarea, select, input:not([type=radio], [type=checkbox])") ||
      !input.checkVisibility() ||
      document.querySelector('dialog[data-hw-shortcut="k"]')
    )
      return;
    event.preventDefault();
    input.focus();
  });

  // The phone's facets: the toggle opens and closes them, Escape and a click outside close them,
  // Escape returning focus to the toggle. A pick by pointer closes them too, so the rows show,
  // the focus on the toggle; a pick by key keeps them open, the focus where it was.
  root.dataset.js = "";
  root.dataset.ready = "";
  if (!toggle) return;
  const open = (next: boolean) => {
    root.toggleAttribute("data-closed", !next);
    toggle.setAttribute("aria-expanded", String(next));
  };
  open(false);
  toggle.addEventListener("click", () => open(root.hasAttribute("data-closed")));
  panel.addEventListener("keydown", () => (tapped = false));
  panel.addEventListener("change", () => {
    if (tapped && toggle.checkVisibility()) {
      open(false);
      toggle.focus();
    }
    tapped = false;
  });
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

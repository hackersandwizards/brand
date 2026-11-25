// The list filter's protocol, framework-free: the matching a server render and the browser share,
// so a shared link renders the rows the typing showed, and `initListFilter`, the browser side of
// expert/components/ListFilter.astro, which a page without Astro can run over the same markup.
// An item is its text and, per facet parameter, the values it carries; the state is the
// search words and one chosen value per facet, "" for all. Each row of the list carries
// data-filter-item, its text in data-filter-text, its facet values as JSON in
// data-filter-facets ({"topic":["tools"]}), its place in the server's order in data-filter-order;
// a [data-filter-title] inside, holding text only, gets the matched words marked, and a
// [data-filter-group] hides while none of its rows shows. A server render sets `hidden` on each row
// where `matches(item, state)` is false, so a shared link shows the same rows without JavaScript.
// One list filter per page: each reads and writes `?q=`.
import { isActive, readState, stateUrl, type FilterState } from "./list-filter.ts";
import { FilterForm } from "./list-filter-form.ts";
import { FilterSource } from "./list-filter-source.ts";
import { FilterView } from "./list-filter-view.ts";

/** Whether `el` renders: checkVisibility where the browser has it (Safari from 17.4), else its
 *  boxes, which a fixed element has too. */
const visible = (el: HTMLElement) => el.checkVisibility?.() ?? el.getClientRects().length > 0;

/** The search key chord works with either platform's modifier. */
function isSearchChord(event: KeyboardEvent) {
  return (
    event.key?.toLowerCase() === "k" &&
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey
  );
}

/** Text entry and native select controls keep their own keystrokes. */
function acceptsText(target: HTMLElement) {
  return (
    target.isContentEditable ||
    target.matches("textarea, select, input:not([type=radio], [type=checkbox])")
  );
}

/** Ctrl+K or Cmd+K outside a text field puts the cursor in the search, unless the page's command
 *  palette (dialog[data-hw-shortcut="k"], command.css) takes the key. A single key such as "/"
 *  would need a switch to turn it off (WCAG 2.1.4); one with a modifier does not. */
function bindSearchShortcut(input: HTMLInputElement) {
  document.addEventListener("keydown", (event) => {
    if (!isSearchChord(event) || acceptsText(event.target as HTMLElement)) return;
    if (!visible(input) || document.querySelector('dialog[data-hw-shortcut="k"]')) return;
    event.preventDefault();
    input.focus();
  });
}

/** The phone's facets: the toggle opens and closes them, Escape and a click outside close them,
 *  Escape returning focus to the toggle. A pick by pointer closes them too, so the rows show,
 *  the focus on the toggle; a pick by key keeps them open, the focus where it was. */
function bindFacetDrawer(root: HTMLElement, panel: HTMLElement, toggle: HTMLButtonElement) {
  // A pick by pointer, which folds the phone's facets; a pick by key keeps them open.
  let tapped = false;
  const open = (next: boolean) => {
    root.toggleAttribute("data-closed", !next);
    toggle.setAttribute("aria-expanded", String(next));
  };
  open(false);
  toggle.addEventListener("click", () => open(root.hasAttribute("data-closed")));
  panel.addEventListener("pointerdown", () => (tapped = true));
  panel.addEventListener("keydown", () => (tapped = false));
  panel.addEventListener("change", () => {
    if (tapped && visible(toggle)) {
      open(false);
      toggle.focus();
    }
    tapped = false;
  });
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || root.hasAttribute("data-closed")) return;
    open(false);
    if (visible(toggle)) toggle.focus();
  });
  document.addEventListener("click", (event) => {
    const target = event.target as Node;
    if (!toggle.contains(target) && !panel.contains(target)) open(false);
  });
}

/** Form events and the history entry shared by the changes in one typing or picking session. */
class FilterHistory {
  private readonly controls: FilterForm;
  private readonly source: FilterSource;
  private readonly apply: () => void;
  private timer = 0;
  // "typing", or "picking" and the facet's parameter: arrowing across one facet's choices.
  private session = "";

  constructor(controls: FilterForm, source: FilterSource, apply: () => void) {
    this.controls = controls;
    this.source = source;
    this.apply = apply;
  }

  /** Record a change in the current session, unless a failed source already took the search. */
  private record(kind: string) {
    // A failed load has just sent an active search to the source page: no entry on the way out.
    const state = this.controls.read();
    if (this.source.failed && isActive(state)) return;
    const next = stateUrl(location.href, state);
    if (next === location.href) return;
    if (this.session === kind) history.replaceState(history.state, "", next);
    else history.pushState(history.state, "", next);
    this.session = kind;
  }

  /** A change that is its own history entry. */
  private once(kind: string) {
    this.session = "";
    this.apply();
    this.record(kind);
    this.session = "";
  }

  /** Read Back or Forward from the URL and restore the form and results. */
  private restore() {
    this.controls.write(readState(new URLSearchParams(location.search), this.controls.options));
    this.apply();
  }

  /** Prefer the URL on an untouched form, then normalize the current history entry. */
  initialize() {
    if (this.controls.isUntouched()) this.restore();
    else this.apply();
    history.replaceState(history.state, "", stateUrl(location.href, this.controls.read()));
  }

  /** Refresh immediately on source failure unless a debounce is about to apply newer input. */
  sourceFailed() {
    // apply() sends a search already typed to the source page, which lists every row; a pending
    // debounce calls it instead, with what has been typed by then.
    if (!this.timer) this.apply();
  }

  /** Record search, facet and navigation events at their existing interaction boundaries. */
  bind(load: () => void) {
    const { input, panel, radios, selects, form, clears } = this.controls;
    input.addEventListener("input", () => {
      clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        this.timer = 0;
        this.apply();
        this.record("typing");
      }, 200);
    });
    panel.addEventListener("pointerdown", () => (this.session = ""));
    for (const radio of radios)
      radio.addEventListener("change", () => {
        this.apply();
        this.record(`picking ${radio.name}`);
      });
    for (const select of selects) select.addEventListener("change", () => this.once("picking"));
    if (this.source.address) form.addEventListener("focusin", load);
    form.addEventListener("submit", (event) => {
      clearTimeout(this.timer);
      this.timer = 0;
      if (this.source.failed) return;
      event.preventDefault();
      this.once("typing");
      input.blur();
    });
    for (const clear of clears)
      clear.addEventListener("click", (event) => {
        event.preventDefault();
        const facets: Record<string, string> = {};
        Object.setPrototypeOf(facets, null);
        this.controls.write({ q: "", facets });
        this.once("typing");
        input.focus();
      });
    addEventListener("popstate", () => {
      this.session = "";
      this.restore();
    });
  }
}

/** Connect the results, controls and optional source page for one list. */
class BrowserListFilter {
  readonly controls: FilterForm;
  private readonly view: FilterView;
  private readonly source: FilterSource;
  private readonly navigation: FilterHistory;

  constructor(root: HTMLElement) {
    this.controls = new FilterForm(root);
    this.view = new FilterView(root);
    this.controls.form.hidden = false;
    this.view.activate();
    this.source = new FilterSource(root.dataset.source);
    this.navigation = new FilterHistory(this.controls, this.source, this.apply);
    this.navigation.bind(this.load);
    this.navigation.initialize();
  }

  /** Load and install the optional source page's rows, then refresh the filter. */
  private readonly load = () => {
    this.source.load(
      (rows) => this.view.install(rows),
      this.apply,
      () => this.navigation.sourceFailed(),
    );
  };

  /** Use the source page itself when fetching its rows fails. */
  private goToSource(current: FilterState) {
    // An entry here carrying a search would load the source again on Back and leave once more:
    // the source page takes its place.
    const carried = isActive(
      readState(new URLSearchParams(location.search), this.controls.options),
    );
    location[carried ? "replace" : "assign"](stateUrl(this.controls.form.action, current));
  }

  /** Render the controls first, then either the local results or the pending-source state. */
  private readonly apply = () => {
    const current = this.controls.read();
    const active = isActive(current);
    this.view.showOverview(active);
    this.controls.nameSelection(current);
    if (this.source.loaded) {
      const shown = this.view.render(current, active);
      this.controls.showClear(active && shown > 0);
      this.controls.showFullText(current.q);
      this.controls.showCounts(this.view.items, current);
      return;
    }
    if (active && this.source.failed) this.goToSource(current);
    else if (active) this.load();
    this.view.hidePending();
    this.controls.showClear(active);
  };
}

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
  // Wired once: a second call would stack every listener.
  if ("ready" in root.dataset) return;
  const { input, panel, toggle } = new BrowserListFilter(root).controls;
  bindSearchShortcut(input);
  root.dataset.js = "";
  root.dataset.ready = "";
  if (toggle) bindFacetDrawer(root, panel, toggle);
}

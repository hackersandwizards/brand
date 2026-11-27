import {
  filtersLabel,
  fullTextUrl,
  tally,
  type FilterItem,
  type FilterState,
} from "./list-filter-state.ts";

/** Each facet's values in the form's order: a fieldset of radios sharing its name, or a select. */
function facetOptions(form: HTMLFormElement) {
  const options: Record<string, string[]> = {};
  Object.setPrototypeOf(options, null);
  for (const el of form.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
    'input[type="radio"], select',
  ))
    (options[el.name] ??= []).push(
      ...(el instanceof HTMLSelectElement
        ? [...el.options].map((option) => option.value)
        : [el.value]),
    );
  return options;
}

/** Radio counts are grouped by the parameter named in their fieldset. */
function choiceSets(form: HTMLFormElement) {
  return [...form.querySelectorAll("fieldset")].flatMap((set) => {
    const param = set.querySelector<HTMLInputElement>('input[type="radio"]')?.name;
    return param ? [{ set, param }] : [];
  });
}

/** The search form's controls and the facet state they carry. */
export class FilterForm {
  readonly form: HTMLFormElement;
  readonly input: HTMLInputElement;
  readonly radios: HTMLInputElement[];
  readonly selects: HTMLSelectElement[];
  readonly clears: NodeListOf<HTMLElement>;
  readonly panel: HTMLElement;
  readonly toggle: HTMLButtonElement | null;
  readonly options: Record<string, string[]>;
  private readonly fullTexts: NodeListOf<HTMLAnchorElement>;
  private readonly sets: ReturnType<typeof choiceSets>;
  private readonly toggleLabel: HTMLElement | null | undefined;
  private readonly filtersWord: string;

  constructor(root: HTMLElement) {
    const form = root.querySelector("form");
    if (form === null) throw new Error("List filter form missing");
    this.form = form;
    const input = form.querySelector<HTMLInputElement>('input[name="q"]');
    if (input === null) throw new Error('List filter query field missing: input[name="q"]');
    this.input = input;
    this.radios = [...this.form.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    this.selects = [...this.form.querySelectorAll("select")];
    this.clears = root.querySelectorAll<HTMLElement>("[data-filter-clear]");
    this.fullTexts = root.querySelectorAll<HTMLAnchorElement>("[data-filter-fulltext]");
    const panel = root.querySelector<HTMLElement>("[data-filter-panel]");
    if (panel === null) throw new Error("List filter panel missing: [data-filter-panel]");
    this.panel = panel;
    this.toggle = root.querySelector<HTMLButtonElement>("[data-filter-toggle]");
    // The button's text sits in its [data-filter-label], its own word in data-filters; markup
    // without them keeps the button's text as that word.
    this.toggleLabel = this.toggle?.querySelector<HTMLElement>("[data-filter-label]");
    this.filtersWord = this.toggle?.dataset.filters ?? this.toggle?.textContent?.trim() ?? "";
    this.options = facetOptions(this.form);
    this.sets = choiceSets(this.form);
  }

  /** A facet reads its select first, then the checked radio, then the All value. */
  private value(param: string) {
    return (
      this.selects.find((select) => select.name === param)?.value ??
      this.radios.find((radio) => radio.name === param && radio.checked)?.value ??
      ""
    );
  }

  /** Read the current form, including a facet whose name matches an Object property. */
  read(): FilterState {
    const facets: Record<string, string> = {};
    Object.setPrototypeOf(facets, null);
    for (const param in this.options) facets[param] = this.value(param);
    return { q: this.input.value.trim(), facets };
  }

  /** Apply URL state, including resetting all controls for an empty state. */
  write({ q, facets }: FilterState) {
    this.input.value = q;
    for (const radio of this.radios) radio.checked = radio.value === (facets[radio.name] ?? "");
    for (const select of this.selects) select.value = facets[select.name] ?? "";
  }

  /** A server renders the URL's state, a static page does not: the URL wins while the form is as
   *  rendered, what someone typed or picked before this ran wins otherwise. */
  isUntouched() {
    return (
      this.input.value === this.input.defaultValue &&
      this.radios.every((radio) => radio.checked === radio.defaultChecked) &&
      this.selects.every((select) =>
        [...select.options].every((option) => option.selected === option.defaultSelected),
      )
    );
  }

  /** A set facet fills the phone's Filters button and names itself there: its facets are folded
   *  away behind it. */
  nameSelection(state: FilterState) {
    const toggle = this.toggle;
    if (!toggle) return;
    if (Object.values(state.facets).some(Boolean)) toggle.removeAttribute("data-variant");
    else toggle.setAttribute("data-variant", "secondary");
    const { text, aria } = filtersLabel(
      this.filtersWord,
      [
        ...this.form.querySelectorAll<HTMLInputElement | HTMLOptionElement>(
          'input[type="radio"]:checked, option:checked',
        ),
      ]
        .filter((el) => el.value)
        .map((el) => el.dataset.label),
    );
    (this.toggleLabel ?? toggle).textContent = text;
    if (aria) toggle.setAttribute("aria-label", aria);
    else toggle.removeAttribute("aria-label");
  }

  /** Toggle the form's clear action without changing the empty result's return link. */
  showClear(show: boolean) {
    for (const clear of this.clears) if (clear.closest("form")) clear.hidden = !show;
  }

  /** Offer to continue an active query in the full-text search. */
  showFullText(q: string) {
    for (const link of this.fullTexts) {
      const base = link.dataset.filterFulltext;
      if (base === undefined)
        throw new Error("Full-text search address missing: data-filter-fulltext");
      link.href = fullTextUrl(base, q);
      link.hidden = !q;
    }
  }

  /** Each facet counts the items that pass the search and all the other facets. */
  showCounts(items: FilterItem[], state: FilterState) {
    for (const { set, param } of this.sets) {
      const chips = tally(items, state, param);
      for (const each of set.querySelectorAll<HTMLElement>("[data-facet-count]")) {
        const value = each.dataset.facetCount;
        each.textContent = String((value === undefined ? undefined : chips.get(value)) ?? 0);
      }
    }
    for (const select of this.selects) {
      const counts = tally(items, state, select.name);
      for (const option of select.options)
        option.textContent = `${option.dataset.label} (${counts.get(option.value) ?? 0})`;
    }
  }
}

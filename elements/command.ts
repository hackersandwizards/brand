import { hasWords, searchWords } from "./list-filter.ts";
import { moveInList } from "./list-navigation.ts";

// Command palette: focus stays in the field, the highlight moves over the visible options.
export const commandInput = '.hw-command-field > [role="combobox"]';
const optionsOf = (input: Element) => [
  ...document
    .getElementById(input.getAttribute("aria-controls") ?? "")!
    .querySelectorAll<HTMLElement>('[role="option"]:not([hidden])'),
];
function markOption(input: HTMLInputElement, option: HTMLElement | undefined) {
  for (const o of document
    .getElementById(input.getAttribute("aria-controls") ?? "")!
    .querySelectorAll('[role="option"]'))
    o.setAttribute("aria-selected", String(o === option));
  if (!option) return input.removeAttribute("aria-activedescendant");
  if (!option.id) option.id = `hw-option-${Math.random().toString(36).slice(2)}`;
  input.setAttribute("aria-activedescendant", option.id);
  option.scrollIntoView({ block: "nearest" });
}
/** Moves the active option without moving focus from the command field. */
export function onCommandKey(e: KeyboardEvent, input: HTMLInputElement) {
  const options = optionsOf(input);
  const now = options.findIndex((o) => o.getAttribute("aria-selected") === "true");
  if (e.key === "Enter") {
    // Enter with no marked option keeps its own meaning.
    if (now < 0) return;
    e.preventDefault();
    options[now]!.click();
    return;
  }
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  markOption(input, options[moveInList(options, e.key, now)]);
}
/** Filters local options and marks the first visible result. */
export function filterCommand(input: HTMLInputElement) {
  const list = document.getElementById(input.getAttribute("aria-controls") ?? "")!;
  if (list.hasAttribute("data-hw-remote")) return;
  const words = searchWords(input.value);
  let shown = 0;
  for (const o of list.querySelectorAll<HTMLElement>('[role="option"]')) {
    o.hidden = !hasWords(o.textContent ?? "", words);
    shown += Number(!o.hidden);
  }
  for (const g of list.querySelectorAll<HTMLElement>(".hw-command-group")) {
    let next = g.nextElementSibling as HTMLElement | null;
    let any = false;
    while (next && !next.matches(".hw-command-group")) {
      any ||= next.matches('[role="option"]:not([hidden])');
      next = next.nextElementSibling as HTMLElement | null;
    }
    g.hidden = !any;
  }
  const empty = list.querySelector<HTMLElement>(".hw-command-empty");
  if (empty) empty.hidden = shown > 0;
  markOption(input, optionsOf(input)[0]);
}

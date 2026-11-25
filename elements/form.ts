// The form elements' behaviour where CSS alone cannot do it: the character count, the password
// field's show button and the range's fill (elements/form-field.css, field.css, range.css). Call
// enhanceForms() once the page is parsed, or with the root of markup added later; it wires each
// instance once. A value set from script needs an input event to show.
import { wireOnce } from "./copy.ts";

const once = (e: Element) => wireOnce(e, "form");
/** Runs `update` now, on every input, and after its form's reset. */
const follow = (field: HTMLInputElement | HTMLTextAreaElement, update: () => void) => {
  field.addEventListener("input", update);
  field.form?.addEventListener("reset", () => setTimeout(update));
  update();
};

function markCountOver(count: HTMLElement, field: HTMLTextAreaElement) {
  count.dataset.state = "over";
  // The count clears only the invalid state it set, never one the page set.
  if (field.getAttribute("aria-invalid") === "true") return;
  field.dataset.hwCountInvalid = "";
  field.setAttribute("aria-invalid", "true");
}

function clearCountOver(count: HTMLElement, field: HTMLTextAreaElement) {
  if (count.dataset.state === "over") delete count.dataset.state;
  if (field.dataset.hwCountInvalid === undefined) return;
  delete field.dataset.hwCountInvalid;
  field.removeAttribute("aria-invalid");
}

function countAnnouncement(count: HTMLElement) {
  let pause: ReturnType<typeof setTimeout>;
  let wiring = true;
  return (text: string) => {
    // Silent on load and while typing, read once the reader pauses.
    count.setAttribute("aria-live", "off");
    count.textContent = text;
    clearTimeout(pause);
    if (!wiring)
      pause = setTimeout(() => {
        count.setAttribute("aria-live", "polite");
        count.textContent = text;
      }, 1000);
    wiring = false;
  };
}

function wireCount(count: HTMLElement) {
  const field = document.getElementById(count.dataset.for!) as HTMLTextAreaElement | null;
  if (!field || !once(count)) return;
  const max = Number(count.dataset.max);
  const announce = countAnnouncement(count);
  follow(field, () => {
    const left = max - field.value.length;
    const template = left < 0 ? count.dataset.over! : count.dataset.left!;
    announce(template.replace("{n}", String(Math.abs(left))));
    if (left < 0) markCountOver(count, field);
    else clearCountOver(count, field);
  });
}

function wirePasswordToggle(button: HTMLButtonElement) {
  const field = document.getElementById(button.getAttribute("aria-controls")!);
  if (!(field instanceof HTMLInputElement) || !once(button)) return;
  button.hidden = false;
  button.addEventListener("click", () => {
    const show = field.type === "password";
    field.type = show ? "text" : "password";
    button.setAttribute("aria-pressed", String(show));
  });
}

function wireRange(range: HTMLInputElement) {
  if (!once(range)) return;
  const min = Number(range.min || 0);
  const span = Number(range.max || 100) - min || 1;
  follow(range, () =>
    range.style.setProperty("--hw-range-fill", `${((range.valueAsNumber - min) / span) * 100}%`),
  );
}

export function enhanceForms(root: ParentNode = document) {
  for (const count of root.querySelectorAll<HTMLElement>(
    ".hw-form-count[data-for][data-max][data-left][data-over]",
  ))
    wireCount(count);
  for (const button of root.querySelectorAll<HTMLButtonElement>(".hw-field-toggle[aria-controls]"))
    wirePasswordToggle(button);
  for (const range of root.querySelectorAll<HTMLInputElement>("input.hw-range")) wireRange(range);
}

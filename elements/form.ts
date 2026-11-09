// The form elements' behaviour where CSS alone cannot do it: the character count, the password
// field's show button and the range's fill (elements/form-field.css, field.css, range.css). Call
// enhanceForms() once the page is parsed, or with the root of markup added later; it wires each
// instance once. A value set from script needs an input event to show.
const wired = new WeakSet<Element>();
const once = (e: Element) => !wired.has(e) && !!wired.add(e);
/** Runs `update` now, on every input, and after its form's reset. */
const follow = (field: HTMLInputElement | HTMLTextAreaElement, update: () => void) => {
  field.addEventListener("input", update);
  field.form?.addEventListener("reset", () => setTimeout(update));
  update();
};

export function enhanceForms(root: ParentNode = document) {
  const counts = root.querySelectorAll<HTMLElement>(
    ".hw-form-count[data-for][data-max][data-left][data-over]",
  );
  for (const count of counts) {
    const field = document.getElementById(count.dataset.for!) as HTMLTextAreaElement | null;
    if (!field || !once(count)) continue;
    const max = Number(count.dataset.max);
    let pause: ReturnType<typeof setTimeout>;
    follow(field, () => {
      const left = max - field.value.length;
      const over = left < 0;
      const text = (over ? count.dataset.over! : count.dataset.left!).replace(
        "{n}",
        String(Math.abs(left)),
      );
      // Silent while typing, read once the reader pauses.
      count.setAttribute("aria-live", "off");
      count.textContent = text;
      clearTimeout(pause);
      pause = setTimeout(() => {
        count.setAttribute("aria-live", "polite");
        count.textContent = text;
      }, 1000);
      if (over) count.dataset.state = "over";
      else delete count.dataset.state;
      // The count clears only the invalid state it set, never one the page set.
      if (over && field.getAttribute("aria-invalid") !== "true") {
        field.dataset.hwCountInvalid = "";
        field.setAttribute("aria-invalid", "true");
      } else if (!over && field.dataset.hwCountInvalid !== undefined) {
        delete field.dataset.hwCountInvalid;
        field.removeAttribute("aria-invalid");
      }
    });
  }
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    ".hw-field-toggle[aria-controls]",
  )) {
    const field = document.getElementById(button.getAttribute("aria-controls")!);
    if (!(field instanceof HTMLInputElement) || !once(button)) continue;
    button.hidden = false;
    button.addEventListener("click", () => {
      const show = field.type === "password";
      field.type = show ? "text" : "password";
      button.setAttribute("aria-pressed", String(show));
    });
  }
  for (const range of root.querySelectorAll<HTMLInputElement>("input.hw-range")) {
    if (!once(range)) continue;
    const min = Number(range.min || 0);
    const span = Number(range.max || 100) - min || 1;
    follow(range, () =>
      range.style.setProperty("--hw-range-fill", `${((range.valueAsNumber - min) / span) * 100}%`),
    );
  }
}

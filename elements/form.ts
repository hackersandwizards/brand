// The form elements' behaviour where CSS alone cannot do it: the character count, the password
// field's show button and the range's fill (elements/form-field.css, field.css, range.css). Call
// enhanceForms() once the page is parsed, or with the root of markup added later; it wires each
// instance once.
const wired = new WeakSet<Element>();
const once = (e: Element) => !wired.has(e) && !!wired.add(e);

export function enhanceForms(root: ParentNode = document) {
  for (const count of root.querySelectorAll<HTMLElement>(".hw-form-count[data-for][data-max]")) {
    const field = document.getElementById(count.dataset.for!) as HTMLTextAreaElement | null;
    if (!field || !once(count)) continue;
    const max = Number(count.dataset.max);
    const update = () => {
      const left = max - field.value.length;
      const over = left < 0;
      count.textContent = (over ? count.dataset.over : count.dataset.left)!.replace(
        "{n}",
        String(Math.abs(left)),
      );
      count.toggleAttribute("data-over", over);
      // Only the count's own invalid state is cleared, never one the server set.
      if (over) {
        field.dataset.hwCountInvalid = "";
        field.setAttribute("aria-invalid", "true");
      } else if (field.dataset.hwCountInvalid !== undefined) {
        delete field.dataset.hwCountInvalid;
        field.removeAttribute("aria-invalid");
      }
    };
    field.addEventListener("input", update);
    update();
  }
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    ".hw-field-toggle[aria-controls]",
  )) {
    const field = document.getElementById(
      button.getAttribute("aria-controls")!,
    ) as HTMLInputElement | null;
    if (!field || !once(button)) continue;
    button.hidden = false;
    button.addEventListener("click", () => {
      const show = field.type === "password";
      field.type = show ? "text" : "password";
      button.setAttribute("aria-pressed", String(show));
    });
  }
  for (const range of root.querySelectorAll<HTMLInputElement>("input.hw-range")) {
    if (!once(range)) continue;
    const update = () => {
      const [min, max] = [Number(range.min || 0), Number(range.max || 100)];
      range.style.setProperty(
        "--hw-range-fill",
        `${((Number(range.value) - min) / (max - min)) * 100}%`,
      );
    };
    range.addEventListener("input", update);
    update();
  }
}

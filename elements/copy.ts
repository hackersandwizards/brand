// Copy buttons alone, for a page that needs nothing else of behaviour.ts: call copyButtons() once
// the page is parsed. Its only stylesheet is sr-only.css, for the live region that announces the
// result. Each press dispatches a bubbling "hw-copy" event on the button, detail { ok }, so a page
// records a copy only where ok is true.
// A copy button says its result on itself, where the eye already is. One button at a time reads as
// copied: only that one says what the clipboard holds. A failure shows on the failed button only.

const labels = new WeakMap<HTMLElement, Node[]>();
const latest = new WeakMap<HTMLElement, number>();
const shown = new Set<HTMLElement>();
let presses = 0;

/** Where a page's overlay content goes: the open modal, whose page behind is inert, or the body. */
export const modalOrBody = () => document.querySelector("dialog:modal") ?? document.body;
export const german = () => (document.documentElement.lang || "de").startsWith("de");

/** Whether `text` stands on the page outside the copy buttons, so selecting it is a way out. */
function onPage(text: string) {
  const t = text.trim();
  if (!t) return false;
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const el = n.parentElement;
    if (n.textContent!.includes(t) && el && !el.closest("[data-hw-copy]") && el.checkVisibility())
      return true;
  }
  return false;
}

// A live region is only announced if it exists before its first message, so it moves into a
// modal as the modal opens, not as a copy inside it is announced.
let following = false;
function copyStatus() {
  let box = document.querySelector<HTMLElement>("[data-hw-copy-status]");
  if (!box) {
    box = document.createElement("div");
    box.className = "hw-sr-only";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    box.setAttribute("data-hw-copy-status", "");
  }
  if (box.parentElement !== modalOrBody()) modalOrBody().append(box);
  if (!following) {
    following = true;
    const follow = (e: Event) => e.target instanceof HTMLDialogElement && copyStatus();
    document.addEventListener("toggle", follow, true);
    document.addEventListener("close", follow, true);
  }
  return box;
}

/** Writes `text` to the clipboard, through a hidden field where the Clipboard API is missing or
 *  refuses. */
async function write(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.readOnly = true;
    // 16 px keeps a phone's Safari from zooming in on the focused field.
    field.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
    const back = document.activeElement as HTMLElement | null;
    modalOrBody().append(field);
    field.select();
    // A phone's Safari selects nothing in a read-only field without a range.
    field.setSelectionRange(0, text.length);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      // ok stays false
    }
    field.remove();
    back?.focus({ preventScroll: true });
    return ok;
  }
}

function restore(button: HTMLElement) {
  button.replaceChildren(...labels.get(button)!);
  shown.delete(button);
}

/** Wires a button that copies its data-hw-copy text and shows it was copied, or that it failed, on
 *  itself in words, its own content coming back once another copy succeeds. A button that starts
 *  hidden shows once wired, so a page without script never offers it. */
export function copyButton(button: HTMLElement) {
  if (labels.has(button)) return;
  labels.set(button, [...button.childNodes]);
  button.hidden = false;
  copyStatus();
  button.addEventListener("click", async () => {
    const press = ++presses;
    latest.set(button, press);
    const de = german();
    const text = button.dataset.hwCopy ?? "";
    const ok = await write(text);
    button.dispatchEvent(new CustomEvent("hw-copy", { bubbles: true, detail: { ok } }));
    // A newer press of the same button decides what it says.
    if (latest.get(button) !== press) return;
    let said: string;
    if (ok) {
      // The write that lands last holds the clipboard, so its button alone reads as copied.
      for (const b of shown) if (b !== button) restore(b);
      said = de ? "Kopiert" : "Copied";
    } else if (onPage(text))
      said = de ? "Kopieren fehlgeschlagen: Text markieren" : "Copy failed: select the text";
    else said = de ? "Kopieren fehlgeschlagen" : "Copy failed";
    for (const b of shown) if (!b.isConnected) shown.delete(b);
    shown.add(button);
    button.textContent = said;
    const note = document.createElement("span");
    note.textContent = said;
    copyStatus().append(note);
    setTimeout(() => note.remove(), 1000);
  });
}

/** Wires every copy button in `root`. Safe to call again after adding markup. */
export function copyButtons(root: ParentNode = document) {
  for (const button of root.querySelectorAll<HTMLElement>("[data-hw-copy]")) copyButton(button);
}

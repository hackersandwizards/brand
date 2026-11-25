// The script the common elements need where HTML alone cannot do it: dialog and drawer openers,
// menu, popover and tooltip placement and keys, tabs, tree, command palette, carousel, toasts,
// a scrolling table's tab stop (table.ts), copy buttons (copy.ts, which a page needing only those
// imports alone).
// Call enhance() once the page is parsed, or enhance(root) after adding markup; listeners on the
// document are installed once, per-element state is set up per call.
import { carousels } from "./carousel.ts";
import { commandInput, filterCommand, onCommandKey } from "./command.ts";
import { copyButtons, german, modalOrBody, wireOnce } from "./copy.ts";
import { reducedMotion } from "./motion-preference.ts";
import { holdWhileUsed } from "./usage-hold.ts";
import {
  closeMenuOnItemClick,
  installContextMenusAndTooltips,
  onPopoverKey,
  onPopoverToggle,
} from "./popover.ts";
import { scrollStops } from "./table.ts";
import { initTrees, onTreeKey, onTreeRowClick } from "./tree.ts";

export { copyButton } from "./copy.ts";

const byId = (id: string | null) => (id ? document.getElementById(id) : null);

// A phone's Safari scrolls the page behind a modal unless the body is pinned.
let pinnedAt: number | null = null;
function pin() {
  if (pinnedAt !== null || !matchMedia("(pointer: coarse)").matches) return;
  pinnedAt = scrollY;
  Object.assign(document.body.style, { position: "fixed", top: `-${pinnedAt}px`, width: "100%" });
}
function unpin() {
  if (pinnedAt === null || document.querySelector("dialog:modal")) return;
  Object.assign(document.body.style, { position: "", top: "", width: "" });
  scrollTo({ top: pinnedAt, behavior: "instant" });
  pinnedAt = null;
}

/** Opens a dialog or drawer as a modal, and focuses its command field if it has one. */
export function openDialog(dialog: HTMLDialogElement) {
  if (dialog.open) return;
  dialog.showModal();
  pin();
  dialog.addEventListener("close", unpin, { once: true });
  dialog.querySelector<HTMLInputElement>('[role="combobox"]')?.focus();
}

/** Opens the named dialog on Ctrl or Command when Alt is absent. */
function onDialogShortcut(e: KeyboardEvent) {
  const shortcut =
    !e.altKey && (e.metaKey || e.ctrlKey)
      ? document.querySelector<HTMLDialogElement>(
          `dialog[data-hw-shortcut="${CSS.escape(e.key.toLowerCase())}"]`,
        )
      : null;
  if (shortcut) {
    e.preventDefault();
    openDialog(shortcut);
  }
}

const outsidePanel = (d: Element, e: MouseEvent) => {
  const r = d.getBoundingClientRect();
  return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
};

/** A backdrop close needs the press outside too: a text selection may end past the panel's edge. */
function dialogBackdrop() {
  let pressedDialog: HTMLDialogElement | null = null;
  return {
    press(e: PointerEvent) {
      pressedDialog =
        e.target instanceof HTMLDialogElement && outsidePanel(e.target, e) ? e.target : null;
    },
    dismiss(e: MouseEvent) {
      // A click outside the panel lands on the dialog itself.
      if (
        pressedDialog &&
        e.target === pressedDialog &&
        pressedDialog.classList.contains("hw-dialog") &&
        pressedDialog.dataset.hwDismiss !== "none" &&
        outsidePanel(pressedDialog, e)
      )
        pressedDialog.close();
    },
  };
}

/** Opens and closes dialogs through their declared controls. */
function onDialogClick(target: HTMLElement) {
  const opener = target.closest<HTMLElement>("[data-hw-open]");
  if (opener) {
    const dialog = byId(opener.dataset.hwOpen!);
    if (dialog instanceof HTMLDialogElement) openDialog(dialog);
  }
  if (target.closest("[data-hw-close]")) target.closest("dialog")?.close();
}

// Tabs: arrow keys move focus and show the panel; the list is one stop in the Tab order.
function tabsOf(tab: HTMLElement) {
  return [
    ...tab
      .closest('[role="tablist"]')!
      .querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'),
  ];
}
function selectTab(tab: HTMLElement) {
  for (const t of tabsOf(tab)) {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = byId(t.getAttribute("aria-controls"));
    if (panel) panel.hidden = !on;
  }
  tab.scrollIntoView({
    block: "nearest",
    inline: "nearest",
    behavior: reducedMotion() ? "auto" : "smooth",
  });
}
function onTabKey(e: KeyboardEvent, tab: HTMLElement) {
  const tabs = tabsOf(tab);
  const i = tabs.indexOf(tab);
  const to =
    e.key === "ArrowRight"
      ? (i + 1) % tabs.length
      : e.key === "ArrowLeft"
        ? (i - 1 + tabs.length) % tabs.length
        : e.key === "Home"
          ? 0
          : e.key === "End"
            ? tabs.length - 1
            : -1;
  if (to < 0) return;
  e.preventDefault();
  tabs[to]!.focus();
  selectTab(tabs[to]!);
}

/** Selects the clicked tab and reveals its panel. */
function onTabClick(target: HTMLElement) {
  const tab = target.closest<HTMLElement>('.hw-tabs [role="tab"]');
  if (tab) selectTab(tab);
}

/** Starts each tablist with one tab stop and its panel visible. */
function initTabs(root: ParentNode) {
  for (const list of root.querySelectorAll<HTMLElement>('.hw-tabs[role="tablist"]')) {
    const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
    const current = tabs.find((t) => t.getAttribute("aria-selected") === "true") ?? tabs[0];
    for (const t of tabs) {
      t.tabIndex = t === current ? 0 : -1;
      const panel = byId(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = t !== current;
    }
  }
}

// The toast's region: one per page, raised inside an open modal, whose page behind is inert.
function region() {
  let box = document.querySelector<HTMLElement>(".hw-toasts");
  if (!box) {
    box = document.createElement("div");
    box.className = "hw-toasts";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
  }
  if (box.parentElement !== modalOrBody()) modalOrBody().append(box);
  return box;
}
export type Toast = {
  tone?: "info" | "success" | "warning" | "error";
  /** Milliseconds; an error never closes itself. */
  duration?: number;
  action?: { label: string; run: () => void };
};
/** Builds an alert or status message with literal text and its controls. */
function createToast(message: string, { tone = "info", action }: Toast) {
  const el = document.createElement("div");
  el.className = "hw-toast";
  if (tone !== "info") el.dataset.tone = tone;
  // The region is polite; an error interrupts, or a reload right after it goes unheard.
  if (tone === "error") el.setAttribute("role", "alert");
  const text = document.createElement("span");
  text.className = "hw-toast-text";
  text.textContent = message;
  el.append(text);
  if (action) {
    const a = document.createElement("button");
    a.type = "button";
    a.className = "hw-toast-action";
    a.textContent = action.label;
    a.addEventListener("click", () => {
      action.run();
      el.remove();
    });
    el.append(a);
  }
  const close = document.createElement("button");
  close.type = "button";
  close.className = "hw-toast-close";
  close.setAttribute("aria-label", german() ? "Schließen" : "Close");
  close.addEventListener("click", () => el.remove());
  el.append(close);
  return el;
}

/** Counts readable time, holding dismissal while the toast is hovered or focused. */
function dismissToastAfter(el: HTMLElement, duration: number) {
  let left = duration;
  let started = Date.now();
  let timer = 0;
  const holds = new Set<string>();
  const fade = () => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), reducedMotion() ? 0 : 200);
  };
  const hold = (by: string, on: boolean) => {
    if (on) holds.add(by);
    else holds.delete(by);
    if (holds.size && timer) {
      clearTimeout(timer);
      timer = 0;
      left -= Date.now() - started;
    } else if (!holds.size && !timer) {
      started = Date.now();
      timer = window.setTimeout(fade, Math.max(left, 1500));
    }
  };
  holdWhileUsed(el, hold);
  timer = window.setTimeout(fade, left);
}

/** Shows a toast and returns it. Set its text from data or copy; it is never parsed as markup. */
export function toast(message: string, { tone = "info", duration = 4000, action }: Toast = {}) {
  const box = region();
  const el = createToast(message, { tone, action });
  box.append(el);
  // An error may be the only place that names the failure, so it stays until closed.
  if (tone !== "error") dismissToastAfter(el, duration);
  return el;
}

/** Keeps the toast region reachable when a dialog changes state. */
function followToastModal(e: Event) {
  if (e.target instanceof HTMLDialogElement) region();
}

function installDocument() {
  // A second bundle of this file on the page installs nothing again.
  if (!wireOnce(document, "behaviour")) return;
  const backdrop = dialogBackdrop();
  document.addEventListener("pointerdown", backdrop.press, true);
  // A toast stays reachable: its region follows the open modal, and leaves it when that closes.
  document.addEventListener("close", region, true);
  document.addEventListener("toggle", followToastModal, true);
  document.addEventListener("toggle", onPopoverToggle, true);
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    onDialogClick(target);
    backdrop.dismiss(e);
    closeMenuOnItemClick(target);
    onTreeRowClick(target);
    onTabClick(target);
  });
  installContextMenusAndTooltips();
  document.addEventListener("keydown", (e) => {
    onPopoverKey(e);
    onDialogShortcut(e);
  });
  document.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement;
    if (target.matches?.('.hw-tabs [role="tab"]')) onTabKey(e, target);
    if (target.matches?.('.hw-tree [role="treeitem"]')) onTreeKey(e, target);
    if (target.matches?.(commandInput)) onCommandKey(e, target as HTMLInputElement);
  });
  document.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    if (target.matches?.(commandInput)) filterCommand(target);
  });
}

/** Wires every common element in `root`. Safe to call again after adding markup. */
export function enhance(root: ParentNode = document) {
  installDocument();
  // A live region is only announced if it exists before its first message.
  region();
  initTabs(root);
  initTrees(root);
  carousels(root);
  scrollStops(root);
  copyButtons(root);
}

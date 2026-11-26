import { moveInList, typeahead } from "./list-navigation.ts";

const placed = ":is(.hw-menu,.hw-popover):not(.hw-tooltip)";
const GAP = 4;
const MARGIN = 8;

/** Beside `rect`, flipped above where the window ends and kept in the window. */
function place(pop: HTMLElement, rect: { left: number; top: number; bottom: number }) {
  pop.setAttribute("data-hw-placed", "");
  const box = pop.getBoundingClientRect();
  const below = rect.bottom + GAP;
  const top = below + box.height > innerHeight - MARGIN ? rect.top - box.height - GAP : below;
  pop.style.left = `${Math.max(MARGIN, Math.min(rect.left, innerWidth - box.width - MARGIN))}px`;
  pop.style.top = `${Math.max(MARGIN, top)}px`;
}

const menuItems = (menu: Element) => [
  ...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]:not(:disabled,[aria-disabled="true"])'),
];

function onMenuKey(e: KeyboardEvent, menu: HTMLElement) {
  if (e.key === "Tab") {
    (menu as HTMLElement & { hidePopover(): void }).hidePopover();
    return;
  }
  const items = menuItems(menu);
  // A menu whose every item is disabled has nowhere to move.
  if (!items.length) return;
  const now = items.indexOf(document.activeElement as HTMLElement);
  let next = moveInList(items, e.key, now);
  if (next < 0 && e.key.length === 1 && !e.ctrlKey && !e.metaKey && e.key !== " ")
    next = typeahead(items, e.key, now);
  if (next < 0) return;
  e.preventDefault();
  const item = items[next];
  if (item === undefined) throw new Error(`Menu item missing: index ${next}`);
  item.focus();
}

const firstFocus = new WeakMap<HTMLElement, "first" | "last">();

const openingFocus = new Map<string, "first" | "last">([
  ["ArrowDown", "first"],
  ["ArrowUp", "last"],
] as const);

/** Opens the trigger's menu at the first or last enabled item according to the arrow. */
function openMenuFromTrigger(e: KeyboardEvent, target: HTMLElement) {
  const focus = openingFocus.get(e.key);
  if (!focus) return;
  const trigger = target.closest?.('[aria-haspopup="menu"][popovertarget]');
  const menu = document.getElementById(trigger?.getAttribute("popovertarget") ?? "");
  if (!menu) return;
  e.preventDefault();
  firstFocus.set(menu, focus);
  menu.showPopover();
}

/** Routes menu navigation, trigger arrows, and tooltip Escape. */
export function onPopoverKey(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const menu = target.closest?.<HTMLElement>(".hw-menu[popover]:popover-open");
  if (menu) onMenuKey(e, menu);
  openMenuFromTrigger(e, target);
  if (e.key === "Escape")
    document
      .querySelectorAll<HTMLElement>(".hw-tooltip:popover-open")
      .forEach((t) => t.hidePopover());
}

/** Dismisses the containing popover after a menu item click. */
export function closeMenuOnItemClick(target: HTMLElement) {
  target.closest('.hw-menu [role^="menuitem"]')?.closest<HTMLElement>("[popover]")?.hidePopover();
}

/** Consumes the opening focus direction when a menu becomes visible. */
function focusInitialMenuItem(menu: HTMLElement) {
  const items = menuItems(menu);
  (firstFocus.get(menu) === "last" ? items.at(-1) : items[0])?.focus();
  firstFocus.delete(menu);
}

/** Reflects open state on the trigger and places menus and popovers beside it. */
export function onPopoverToggle(e: Event) {
  const pop = e.target as HTMLElement;
  if (!pop.matches?.(placed)) return;
  const trigger = document.querySelector<HTMLElement>(`[popovertarget="${CSS.escape(pop.id)}"]`);
  const open = (e as ToggleEvent).newState === "open";
  trigger?.setAttribute("aria-expanded", String(open));
  if (!open) return;
  if (trigger) place(pop, trigger.getBoundingClientRect());
  if (pop.matches(".hw-menu")) focusInitialMenuItem(pop);
}

// Tooltips show after a pause under the mouse and at once on keyboard focus, and stay while the
// pointer is on them; a touch or a focus from a click shows none.
let hideTimer = 0;
let showTimer = 0;
const tipOf = (el: Element) => {
  for (const id of (el.getAttribute("aria-describedby") ?? "").split(/\s+/)) {
    const tip = document.getElementById(id);
    if (tip?.classList.contains("hw-tooltip")) return tip;
  }
  return null;
};
function showTip(host: Element, tip: HTMLElement) {
  clearTimeout(hideTimer);
  document
    .querySelectorAll<HTMLElement>(".hw-tooltip:popover-open")
    .forEach((t) => t !== tip && t.hidePopover());
  if (!tip.matches(":popover-open")) tip.showPopover();
  place(tip, host.getBoundingClientRect());
}
const hideTip = (tip: HTMLElement) => {
  clearTimeout(showTimer);
  clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => tip.matches(":popover-open") && tip.hidePopover(), 100);
};

/** Installs pointer and focus listeners for context menus and tooltips. */
export function installContextMenusAndTooltips() {
  document.addEventListener("contextmenu", (e) => {
    const host = (e.target as HTMLElement).closest<HTMLElement>("[data-hw-context]");
    if (!host) return;
    const id = host.dataset.hwContext;
    if (id === undefined) return;
    const pop = document.getElementById(id);
    if (!pop) return;
    e.preventDefault();
    pop.showPopover();
    // A keyboard's menu key reports no point: use the host's corner.
    const r = host.getBoundingClientRect();
    const at = e.clientX || e.clientY ? { left: e.clientX, top: e.clientY, bottom: e.clientY } : r;
    place(pop, at);
  });

  document.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const host = (e.target as Element).closest("[aria-describedby]");
    const tip = host && tipOf(host);
    if (tip) {
      clearTimeout(showTimer);
      showTimer = window.setTimeout(() => showTip(host, tip), 400);
    } else if ((e.target as Element).closest(".hw-tooltip")) clearTimeout(hideTimer);
  });
  document.addEventListener("pointerout", (e) => {
    const from = (e.target as Element).closest("[aria-describedby], .hw-tooltip");
    if (!from || from.contains(e.relatedTarget as Node | null)) return;
    const tip = from.matches(".hw-tooltip") ? (from as HTMLElement) : tipOf(from);
    if (tip) hideTip(tip);
  });
  document.addEventListener("focusin", (e) => {
    const host = (e.target as Element).closest?.("[aria-describedby]");
    const tip = host && tipOf(host);
    if (tip && host.matches(":focus-visible")) showTip(host, tip);
  });
  document.addEventListener("focusout", (e) => {
    const host = (e.target as Element).closest?.("[aria-describedby]");
    const tip = host && tipOf(host);
    if (tip) hideTip(tip);
  });
}

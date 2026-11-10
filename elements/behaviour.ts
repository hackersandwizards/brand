// The script the common elements need where HTML alone cannot do it: dialog and drawer openers,
// menu, popover and tooltip placement and keys, tabs, tree, command palette, carousel, toasts,
// copy buttons (copy.ts, which a page needing only those imports alone).
// Call enhance() once the page is parsed, or enhance(root) after adding markup; listeners on the
// document are installed once, per-element state is set up per call.
import { copyButtons, german, modalOrBody } from "./copy.ts";
import { hasWords, searchWords } from "./list-filter.ts";

export { copyButton } from "./copy.ts";

const placed = ".hw-menu,.hw-popover,.hw-tooltip";
const GAP = 4;
const MARGIN = 8;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const byId = (id: string | null) => (id ? document.getElementById(id) : null);

/** Calls `hold(by, true)` while the pointer or the focus is inside `el`, and `false` as it leaves. */
function holdWhileUsed(el: HTMLElement, hold: (by: string, on: boolean) => void) {
  const events = [
    ["mouseenter", "pointer", true],
    ["mouseleave", "pointer", false],
    ["focusin", "focus", true],
    ["focusout", "focus", false],
  ] as const;
  for (const [type, by, on] of events) el.addEventListener(type, () => hold(by, on));
}

/** Beside `rect`, flipped above where the window ends and kept in the window. */
function place(pop: HTMLElement, rect: { left: number; top: number; bottom: number }) {
  pop.setAttribute("data-hw-placed", "");
  const box = pop.getBoundingClientRect();
  const below = rect.bottom + GAP;
  const top = below + box.height > innerHeight - MARGIN ? rect.top - box.height - GAP : below;
  pop.style.left = `${Math.max(MARGIN, Math.min(rect.left, innerWidth - box.width - MARGIN))}px`;
  pop.style.top = `${Math.max(MARGIN, top)}px`;
}

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

const menuItems = (menu: Element) => [
  ...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]:not(:disabled,[aria-disabled="true"])'),
];

function moveInList(items: HTMLElement[], key: string, current: number) {
  if (key === "ArrowDown") return (current + 1) % items.length;
  if (key === "ArrowUp")
    return current < 0 ? items.length - 1 : (current - 1 + items.length) % items.length;
  if (key === "Home") return 0;
  if (key === "End") return items.length - 1;
  return -1;
}

/** Index of the next item whose text starts with `char`, after `from`. */
function typeahead(items: HTMLElement[], char: string, from: number) {
  const c = char.toLowerCase();
  for (let i = 1; i <= items.length; i++) {
    const at = (from + i) % items.length;
    if (items[at]!.textContent!.trim().toLowerCase().startsWith(c)) return at;
  }
  return -1;
}

function onMenuKey(e: KeyboardEvent, menu: HTMLElement) {
  if (e.key === "Tab") {
    (menu as HTMLElement & { hidePopover(): void }).hidePopover();
    return;
  }
  const items = menuItems(menu);
  const now = items.indexOf(document.activeElement as HTMLElement);
  let next = moveInList(items, e.key, now);
  if (next < 0 && e.key.length === 1 && !e.ctrlKey && !e.metaKey && e.key !== " ")
    next = typeahead(items, e.key, now);
  if (next < 0) return;
  e.preventDefault();
  items[next]!.focus();
}

const firstFocus = new WeakMap<HTMLElement, "first" | "last">();

function onDocumentKey(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const menu = target.closest?.<HTMLElement>(".hw-menu[popover]:popover-open");
  if (menu) onMenuKey(e, menu);

  const trigger = target.closest?.<HTMLElement>('[aria-haspopup="menu"][popovertarget]');
  if (trigger && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    const pop = byId(trigger.getAttribute("popovertarget"));
    if (pop) {
      e.preventDefault();
      firstFocus.set(pop, e.key === "ArrowDown" ? "first" : "last");
      (pop as HTMLElement & { showPopover(): void }).showPopover();
    }
  }

  if (e.key === "Escape")
    document
      .querySelectorAll<HTMLElement>(".hw-tooltip:popover-open")
      .forEach((t) => t.hidePopover());

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

// Tooltips show after a pause under the mouse and at once on keyboard focus, and stay while the
// pointer is on them; a touch or a focus from a click shows none.
let hideTimer = 0;
let showTimer = 0;
const tipOf = (el: Element) => {
  for (const id of (el.getAttribute("aria-describedby") ?? "").split(/\s+/)) {
    const tip = byId(id);
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

const outsidePanel = (d: Element, e: MouseEvent) => {
  const r = d.getBoundingClientRect();
  return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
};

function installDocument() {
  if ((installDocument as unknown as { done?: true }).done) return;
  (installDocument as unknown as { done?: true }).done = true;

  document.addEventListener("keydown", onDocumentKey);

  // A backdrop close needs the press outside too: a text selection may end past the panel's edge.
  let pressedDialog: Element | null = null;
  document.addEventListener(
    "pointerdown",
    (e) => {
      pressedDialog =
        e.target instanceof HTMLDialogElement && outsidePanel(e.target, e) ? e.target : null;
    },
    true,
  );
  // A toast stays reachable: its region follows the open modal, and leaves it when that closes.
  document.addEventListener("close", region, true);

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const opener = target.closest<HTMLElement>("[data-hw-open]");
    if (opener) {
      const d = byId(opener.dataset.hwOpen!);
      if (d instanceof HTMLDialogElement) openDialog(d);
    }
    if (target.closest("[data-hw-close]")) target.closest("dialog")?.close();
    // A click outside the panel lands on the dialog itself.
    if (
      target === pressedDialog &&
      target.classList.contains("hw-dialog") &&
      target.dataset.hwDismiss !== "none" &&
      outsidePanel(target, e)
    )
      (target as HTMLDialogElement).close();
    target.closest('.hw-menu [role^="menuitem"]')?.closest<HTMLElement>("[popover]")?.hidePopover();
    const row = target.closest<HTMLElement>(".hw-tree-row");
    if (row) activateNode(row.parentElement as HTMLElement);
    const tab = target.closest<HTMLElement>('.hw-tabs [role="tab"]');
    if (tab) selectTab(tab);
  });

  document.addEventListener(
    "toggle",
    (e) => {
      const pop = e.target as HTMLElement;
      if (pop instanceof HTMLDialogElement) region();
      if (!pop.matches?.(placed) || pop.matches(".hw-tooltip")) return;
      const trigger = document.querySelector<HTMLElement>(
        `[popovertarget="${CSS.escape(pop.id)}"]`,
      );
      const open = (e as ToggleEvent).newState === "open";
      trigger?.setAttribute("aria-expanded", String(open));
      if (!open) return;
      if (trigger) place(pop, trigger.getBoundingClientRect());
      if (pop.matches(".hw-menu")) {
        const items = menuItems(pop);
        (firstFocus.get(pop) === "last" ? items[items.length - 1] : items[0])?.focus();
        firstFocus.delete(pop);
      }
    },
    true,
  );

  document.addEventListener("contextmenu", (e) => {
    const host = (e.target as HTMLElement).closest<HTMLElement>("[data-hw-context]");
    const pop = host && byId(host.dataset.hwContext!);
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
    behavior: reduced() ? "auto" : "smooth",
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

// Tree: the APG keys, one tab stop on the current node.
const visibleNodes = (tree: Element) =>
  [...tree.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter(
    (n) => n.offsetParent !== null,
  );
function activateNode(node: HTMLElement) {
  const tree = node.closest('[role="tree"]');
  if (!tree) return;
  if (node.hasAttribute("aria-expanded"))
    node.setAttribute("aria-expanded", String(node.getAttribute("aria-expanded") !== "true"));
  // A folder without aria-selected only opens; the current document stays selected.
  if (!node.hasAttribute("aria-expanded") || node.hasAttribute("aria-selected")) {
    for (const n of tree.querySelectorAll('[aria-selected="true"]'))
      n.setAttribute("aria-selected", "false");
    node.setAttribute("aria-selected", "true");
  }
  focusNode(node);
}
function focusNode(node: HTMLElement) {
  node
    .closest('[role="tree"]')!
    .querySelectorAll<HTMLElement>('[tabindex="0"]')
    .forEach((n) => (n.tabIndex = -1));
  node.tabIndex = 0;
  node.focus();
}
function onTreeKey(e: KeyboardEvent, node: HTMLElement) {
  if (e.target !== node) return;
  const list = visibleNodes(node.closest('[role="tree"]')!);
  const i = list.indexOf(node);
  const expanded = node.getAttribute("aria-expanded");
  let to = -1;
  if (e.key === "ArrowDown") to = Math.min(i + 1, list.length - 1);
  else if (e.key === "ArrowUp") to = Math.max(i - 1, 0);
  else if (e.key === "Home") to = 0;
  else if (e.key === "End") to = list.length - 1;
  else if (e.key === "ArrowRight") {
    if (expanded === "false") node.setAttribute("aria-expanded", "true");
    else if (expanded === "true") to = i + 1;
  } else if (e.key === "ArrowLeft") {
    if (expanded === "true") node.setAttribute("aria-expanded", "false");
    else {
      const parent = node.parentElement?.closest<HTMLElement>('[role="treeitem"]');
      if (parent) to = list.indexOf(parent);
    }
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    const link = node.querySelector<HTMLElement>(":scope > .hw-tree-row a");
    if (link) link.click();
    else activateNode(node);
    return;
  } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) to = typeahead(list, e.key, i);
  else return;
  e.preventDefault();
  if (to >= 0) focusNode(list[to]!);
}

// Command palette: focus stays in the field, the highlight moves over the visible options.
const commandInput = '.hw-command-field > [role="combobox"]';
const optionsOf = (input: Element) => [
  ...byId(input.getAttribute("aria-controls"))!.querySelectorAll<HTMLElement>(
    '[role="option"]:not([hidden])',
  ),
];
function markOption(input: HTMLInputElement, option: HTMLElement | undefined) {
  for (const o of byId(input.getAttribute("aria-controls"))!.querySelectorAll('[role="option"]'))
    o.setAttribute("aria-selected", String(o === option));
  if (!option) return input.removeAttribute("aria-activedescendant");
  if (!option.id) option.id = `hw-option-${Math.random().toString(36).slice(2)}`;
  input.setAttribute("aria-activedescendant", option.id);
  option.scrollIntoView({ block: "nearest" });
}
function onCommandKey(e: KeyboardEvent, input: HTMLInputElement) {
  const options = optionsOf(input);
  const now = options.findIndex((o) => o.getAttribute("aria-selected") === "true");
  if (e.key === "Enter") {
    e.preventDefault();
    options[now]?.click();
    return;
  }
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  markOption(input, options[moveInList(options, e.key, now)]);
}
function filterCommand(input: HTMLInputElement) {
  const list = byId(input.getAttribute("aria-controls"))!;
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
/** Shows a toast and returns it. Set its text from data or copy; it is never parsed as markup. */
export function toast(message: string, { tone = "info", duration = 4000, action }: Toast = {}) {
  const box = region();
  const de = german();
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
  close.setAttribute("aria-label", de ? "Schließen" : "Close");
  close.addEventListener("click", () => el.remove());
  el.append(close);
  box.append(el);
  // An error may be the only place that names the failure, so it stays until closed.
  if (tone === "error") return el;
  let left = duration;
  let started = Date.now();
  let timer = 0;
  const holds = new Set<string>();
  const fade = () => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), reduced() ? 0 : 200);
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
  return el;
}

const wiredCarousels = new WeakSet<Element>();
function enhanceCarousel(carousel: HTMLElement) {
  if (wiredCarousels.has(carousel)) return;
  wiredCarousels.add(carousel);
  const track = carousel.querySelector<HTMLElement>(".hw-carousel-track");
  const controls = carousel.querySelector<HTMLElement>(".hw-carousel-controls");
  if (!track || !controls) return;
  const items = [...track.children] as HTMLElement[];
  const position = controls.querySelector<HTMLElement>("[data-hw-position]");
  const status = controls.querySelector<HTMLElement>(":scope > .hw-sr-only");
  const of = german() ? "von" : "of";
  const useDots = items.length <= 5;
  position?.replaceChildren();
  const dots =
    useDots && position
      ? items.map((_, i) => {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "hw-carousel-dot";
          dot.setAttribute("aria-label", `${i + 1} ${of} ${items.length}`);
          dot.append(document.createElement("span"));
          dot.addEventListener("click", () => go(i, true));
          position.append(dot);
          return dot;
        })
      : [];
  if (!useDots && position) position.className = "hw-carousel-count";
  const prev = controls.querySelector<HTMLButtonElement>('[data-hw-step="-1"]');
  const next = controls.querySelector<HTMLButtonElement>('[data-hw-step="1"]');
  let active = 0;
  const show = (i: number, say = false) => {
    active = i;
    dots.forEach((d, n) =>
      n === i ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current"),
    );
    if (!useDots && position) position.textContent = `${i + 1} / ${items.length}`;
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i === items.length - 1;
    if (say && status) status.textContent = `${i + 1} ${of} ${items.length}`;
  };
  // An item's scroll position: its distance from the first item, so the track's padding (the
  // focus ring's room) stays out of the sum.
  const at = (item: HTMLElement) => item.offsetLeft - items[0]!.offsetLeft;
  const go = (i: number, say = false) => {
    const wrap = (i + items.length) % items.length;
    track.scrollTo({
      left: at(items[wrap]!),
      behavior: reduced() ? "auto" : "smooth",
    });
    show(wrap, say);
  };
  prev?.addEventListener("click", () => go(active - 1, true));
  next?.addEventListener("click", () => go(active + 1, true));
  let scrollTimer = 0;
  track.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const left = track.scrollLeft;
      // The end of the track cannot bring the last items to its start: keep the one asked for.
      if (left >= track.scrollWidth - track.clientWidth - 2 && active > 0) return;
      const nearest = items.reduce(
        (best, item, i) =>
          Math.abs(at(item) - left) < Math.abs(at(items[best]!) - left) ? i : best,
        0,
      );
      show(nearest);
    }, 80);
  });
  show(0);
  if (!("hwAutoplay" in carousel.dataset) || reduced()) return;
  const pause = controls.querySelector<HTMLButtonElement>("[data-hw-pause]");
  const holds = new Set<string>();
  let stopped = false;
  const hold = (by: string, on: boolean) => (on ? holds.add(by) : holds.delete(by));
  holdWhileUsed(carousel, hold);
  new IntersectionObserver(([e]) => hold("offscreen", !e!.isIntersecting)).observe(carousel);
  pause?.addEventListener("click", () => {
    stopped = !stopped;
    pause.setAttribute("aria-pressed", String(stopped));
  });
  setInterval(() => {
    if (!stopped && !holds.size && !document.hidden) go(active + 1);
  }, 6000);
}

/** Wires every common element in `root`. Safe to call again after adding markup. */
export function enhance(root: ParentNode = document) {
  installDocument();
  // A live region is only announced if it exists before its first message.
  region();
  for (const list of root.querySelectorAll<HTMLElement>('.hw-tabs[role="tablist"]')) {
    const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
    const current = tabs.find((t) => t.getAttribute("aria-selected") === "true") ?? tabs[0];
    for (const t of tabs) {
      t.tabIndex = t === current ? 0 : -1;
      const panel = byId(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = t !== current;
    }
  }
  for (const tree of root.querySelectorAll<HTMLElement>('.hw-tree[role="tree"]')) {
    const nodes = [...tree.querySelectorAll<HTMLElement>('[role="treeitem"]')];
    const current = tree.querySelector<HTMLElement>('[aria-selected="true"]') ?? nodes[0];
    for (const n of nodes) n.tabIndex = n === current ? 0 : -1;
  }
  for (const carousel of root.querySelectorAll<HTMLElement>(".hw-carousel"))
    enhanceCarousel(carousel);
  copyButtons(root);
}

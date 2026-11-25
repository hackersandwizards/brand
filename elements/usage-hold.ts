/** Calls `hold(by, true)` while the pointer or the focus is inside `el`, and `false` as it leaves. */
export function holdWhileUsed(el: HTMLElement, hold: (by: string, on: boolean) => void) {
  const events = [
    ["mouseenter", "pointer", true],
    ["mouseleave", "pointer", false],
    ["focusin", "focus", true],
    ["focusout", "focus", false],
  ] as const;
  for (const [type, by, on] of events) el.addEventListener(type, () => hold(by, on));
}

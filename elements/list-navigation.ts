/** Returns the next index for an arrow or boundary key in an ordered list. */
export function moveInList(items: HTMLElement[], key: string, current: number) {
  if (key === "ArrowDown") return (current + 1) % items.length;
  if (key === "ArrowUp")
    return current < 0 ? items.length - 1 : (current - 1 + items.length) % items.length;
  if (key === "Home") return 0;
  if (key === "End") return items.length - 1;
  return -1;
}

/** Index of the next item whose text starts with `char`, after `from`. */
export function typeahead(items: HTMLElement[], char: string, from: number) {
  const c = char.toLowerCase();
  for (let i = 1; i <= items.length; i++) {
    const at = (from + i) % items.length;
    const item = items[at];
    if (item === undefined) throw new Error(`Typeahead item missing: index ${at}`);
    const text = item.textContent;
    if (text === null) throw new Error(`Typeahead text missing: index ${at}`);
    if (text.trim().toLowerCase().startsWith(c)) return at;
  }
  return -1;
}

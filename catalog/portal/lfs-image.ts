import { esc } from "./markup";

// An image under applications/ is in Git LFS and a pointer in a checkout without it: the preview
// leaves the tile rather than show a broken image.
export const lfsImage = (src: string) =>
  `<img src="${esc(src)}" alt="" loading="lazy" onerror="this.parentElement.hidden=true">`;

import { esc } from "./markup";

// Hide the preview wrapper if the image fails to load, as happens when Git LFS leaves a pointer file in the checkout.
export const lfsImage = (src: string) =>
  `<img src="${esc(src)}" alt="" loading="lazy" onerror="this.parentElement.hidden=true">`;

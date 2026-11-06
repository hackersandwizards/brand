// The theme switch's two icons as svg paths (24 x 24, stroke 2, round caps and joins): the moon by
// day, the sun by night. ThemeToggle.astro draws them; a port that renders no .astro imports them.
// The moon is brand's own crescent, a circle with a deep bite at the upper right, so it never reads
// as a "C" at 16 px.
export const MOON = "M12 3a6.5 6.5 0 0 0 9 9 9 9 0 1 1-9-9Z";
export const SUN =
  "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z";

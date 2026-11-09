// The theme switch's two icons as svg paths (24 x 24, stroke 2, round caps and joins): the moon by
// day, the sun by night. ThemeToggle.astro draws them; a port that renders no .astro imports them.
// The moon is brand's own crescent, a circle with a deep bite at the upper right, so it never reads
// as a "C" at 16 px. The sun is Lucide's sun as one path (ISC, tokens/LICENSE-Lucide.txt).
export const MOON = "M12 3a6.5 6.5 0 0 0 9 9 9 9 0 1 1-9-9Z";
export const SUN =
  "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41";

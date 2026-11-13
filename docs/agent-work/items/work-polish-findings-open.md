---
kind: work
status: open
priority: 3
area: brand
order: 1995
owner: Ada
evidence: "Checked 13.11.: points 1 (VARIANTS in applications/backgrounds/generate.ts), 2 (WHITE and SUBLINE typed in render.py:50-51), 6 (no unobserve in elements/table.ts), 8 (--site-at in scan/markers.ts) and 9 (README.md:54 and docs/exports.md:85 carry the bunx line, docs/checks.md no longer does) read as stated; the others not re-measured. Internal."
---

# Fix the nine polish findings left open

Brief a brand session to fix the nine polish findings below.

1. **Background generator.** `applications/backgrounds/generate.ts` keeps `VARIANTS`, about 65
   layouts and exports nothing imports, and no table says which layout made which committed file.
2. **Channel banner greys.** `applications/channel-banners/render.py` keeps `WHITE` and `SUBLINE`
   as typed RGB, with no token named for either; naming one changes the committed banners, so it
   needs a render diff.
3. **Dim floor below /20.** `expert/expert.css` floors every `text-foreground/<n>` from `/20` to
   `/65` (`test/expert.test.ts` holds the list), but not `/5` to `/15` nor an arbitrary value such
   as `/[0.33]`, which render below the floor unchecked. A `brand-colours` finding on such a class
   in a consumer's source would close it.
4. **Lone check target in a consumer's flow.** `hw-check-target` holds the box on the rows' pitch
   with negative block margins, so a consumer's `.stack > * + *` or `space-y-*` replaces them and
   the box leaves the pitch. The catalog tiles exempt the class instead; a hit area drawn with
   `inset` or an absolute `::before` would hold in any flow.
5. **First cell's label under 48rem.** `--hw-table-held: none` does not free the first cell's
   `::before` (`elements/table.css`): a consumer label there in `@layer components` computes to
   `content: none`, and an unlayered one sits outside the cell. No consumer labels the first cell
   today.
6. **Table observer on a client-routed site.** `scrollStops` observes every wrapper and table and
   never unobserves them, so a site that swaps pages without a reload keeps the old tables
   referenced. Not measured over navigations.
7. **brand-colours edges.** A double-quoted string inside `${}` in a double-quoted attribute is cut
   at its first quote by `valueAt` and not read; a quoted custom property (`--label: "red"`) in a
   `<style>` block of `.astro`, `.vue` or `.svelte` counts, where in `.css` and `.scss` it does
   not.
8. **brand-markers flags.** `--site-at` without a site is ignored silently, and `"site": {"at": 5}`
   exits with `at.replace is not a function` instead of the "a folder" message.
9. **One owner per consumer fact.** The `bun run`, never `bunx` line stands in the README and
   `docs/exports.md`; the six checks' one-liners in the README and
   `docs/exports.md`; the README's "Work on the package" restates CLAUDE.md; `docs/assets.md`
   names maintainer scripts a consumer cannot run.

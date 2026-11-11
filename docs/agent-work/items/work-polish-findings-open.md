---
kind: work
status: open
priority: 3
area: brand
order: 1965
owner: a brand session
evidence: "polish runs 08.11. (v1.37.0), 09.11. and 11.11.: review findings left unfixed, each measured or read in that run"
---

# Polish findings left open

Fix the polish findings below in brand.

1. **Slow browser tests.** `test/markers.test.ts` takes about 110 s and `test/elements.test.ts`
   about 49 s, each measurement waiting for the one before; every other test file finishes under
   3 s. Three 64-offset runs measured 42.8 s one after another and 26.9 s side by side, in their
   own browser contexts. Run the independent measurements concurrently, the focus-ring cases kept
   serial. Proof: the same pass and `expect()` counts in less time.
2. **Background generator.** `applications/backgrounds/generate.ts` keeps `VARIANTS`, about 65
   layouts and exports nothing imports, and no table says which layout made which committed file.
3. **Channel banner greys.** `applications/channel-banners/render.py` keeps `WHITE` and `SUBLINE`
   as typed RGB, with no token named for either; naming one changes the committed banners, so it
   needs a render diff.
4. **Dim floor below /20.** `expert/expert.css` floors every `text-foreground/<n>` from `/20` to
   `/65` (`test/expert.test.ts` holds the list), but not `/5` to `/15` nor an arbitrary value such
   as `/[0.33]`, which render below the floor unchecked. A `brand-colours` finding on such a class
   in a consumer's source would close it.
5. **Lone check target in a consumer's flow.** `hw-check-target` holds the box on the rows' pitch
   with negative block margins, so a consumer's `.stack > * + *` or `space-y-*` replaces them and
   the box leaves the pitch. The catalog tiles exempt the class instead; a hit area drawn with
   `inset` or an absolute `::before` would hold in any flow.
6. **First cell's label under 48rem.** `--hw-table-held: none` does not free the first cell's
   `::before` (`elements/table.css`): a consumer label there in `@layer components` computes to
   `content: none`, and an unlayered one sits outside the cell. No consumer labels the first cell
   today.
7. **Table observer on a client-routed site.** `scrollStops` observes every wrapper and table and
   never unobserves them, so a site that swaps pages without a reload keeps the old tables
   referenced. Not measured over navigations.
8. **brand-colours edges.** A double-quoted string inside `${}` in a double-quoted attribute is cut
   at its first quote by `valueAt` and not read; a quoted custom property (`--label: "red"`) in a
   `<style>` block of `.astro`, `.vue` or `.svelte` counts, where in `.css` and `.scss` it does
   not.
9. **brand-markers flags.** `--site-at` without a site is ignored silently, and `"site": {"at": 5}`
   exits with `at.replace is not a function` instead of the "a folder" message.
10. **One owner per consumer fact.** The `bun run`, never `bunx` line stands in the README,
    `docs/exports.md` and `docs/checks.md`; the six checks' one-liners in the README and
    `docs/exports.md`; the README's "Work on the package" restates CLAUDE.md; `docs/assets.md`
    names maintainer scripts a consumer cannot run.

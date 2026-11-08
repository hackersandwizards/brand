---
kind: work
status: open
priority: 3
order: 2010
owner: a brand session
evidence: "polish run 08.11. (v1.37.0): review findings left unfixed, each measured or read in that run"
---

# Polish findings left open

1. **Slow browser tests.** `test/markers.test.ts` takes about 110 s and `test/elements.test.ts`
   about 49 s, each measurement waiting for the one before; every other test file finishes under
   3 s. Three 64-offset runs measured 42.8 s one after another and 26.9 s side by side, in their
   own browser contexts. Run the independent measurements concurrently, the focus-ring cases kept
   serial. Proof: the same pass and `expect()` counts in less time.
2. **Theme toggle icons need JavaScript.** `expert/components/ThemeToggle.astro` starts both icons
   `hidden` and only its script reveals one, so the round button is empty until the script runs.
   Switch the icon in CSS on `html[data-theme]`, as `header.css` does for the lockup, and check it
   in os and the trainer hub, which render it.
3. **Dim floor covers eight steps.** `expert/expert.css` holds only `/20` to `/65` of
   `text-foreground/<n>` to `--dim-floor`; `/35` computes 0.35 alpha, about 2:1. A check that fails
   on an unlisted step below the floor would close it.
4. **Background generator.** `applications/backgrounds/generate.ts` keeps `VARIANTS`, about 65
   layouts and exports nothing imports, and no table says which layout made which committed file.
5. **Small leftovers.** `scripts/ampersand.ts` also writes the night cuts that `scripts/outline.ts`
   overwrites; `applications/channel-banners/render.py` keeps `WHITE` and `SUBLINE` as typed RGB,
   with no token named for either.

---
kind: work
status: open
priority: 3
order: 2010
owner: a brand session
evidence: "polish runs 08.11. (v1.37.0) and 09.11.: review findings left unfixed, each measured or read in that run"
---

# Polish findings left open

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

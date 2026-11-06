# Shipped comments carry no review history (v1.16.1)

documents v1.8.3 found that brand's exported CSS named blind-panel scores and Company OS decision
ids in its comments. Every consumer serves those files, so the comments were public on each site
that loads them, and on the brand portal, which prints each element's header comment as its
description.

## What was read

Every comment in the files `package.json` `exports` names (202 block comments in the stylesheets
and components, the line comments in `expert/components/` and `elements/code.ts`, the headers of
`generated/`), and every comment in the HTML, CSS and JS of the built `dist/`.

## How each was classified

- Kept: a comment a reader of the CSS needs to use the token or element correctly. This covers
  roles, settings, markup, contrast ratios, and the browser behaviour a value works around, with
  the measurement that shows it. The other 171 block comments needed no change.
- Rewritten: 31 block comments and one line comment (`Pill.astro`) that mixed such a statement
  with history. The statement stays; the history is cut: blind-panel scores and noise, review
  rounds, dates, Company OS decision ids (`design-system-hub-spoke`, `label-system C`,
  `code-palette`, `density-tiers`, `ds-roll-trainer-hub-compact`), the item id `OS-1`, a
  founder's name, and a person's surname used as a sample name in `fonts.css`.
- The removed text stays in this repo's history: `git show` on the commit that removed it lists
  it whole, and the commits that added it carry its context.

The build copies three generator scripts into `dist/` (`applications/backgrounds/generate.ts`,
`applications/channel-banners/render.py`, `applications/avatars/generate.ts`). Their comments
lose the decision names, review scores and pointers to os review reports. The device and platform
measurements stay, because changing a layout needs them.

## The guard

`test/history.test.ts` reads every `.css`, `.astro` and `.ts` file an export names and fails on
a decision id, a review score, an item id (`OS-1` style, or one of this repo's own item ids), a
date or a founder's name. Its control runs the patterns over seven comments as they shipped in
v1.16.0, and each one must hit. Run against v1.16.0's files, the test fails on 14 of the 15 files
this release changes. The 15th is `fonts.css`, whose sample surname no pattern can know.

## Rendering

- Every changed stylesheet and component is identical to v1.16.0 once comments are stripped.
- All 254 built HTML files, the story pages included, were compared in headless Chrome at 1440 px,
  full page, before and after. With the portal's element descriptions hidden, every page and
  every one of the portal's 59 views is pixel-identical. Three views showed scattered text-edge
  pixels in a first pass. The same build compared with itself showed the same noise, and two
  further before/after passes on those views came back identical.
- The only visible change is intended: five element descriptions on the portal (label box,
  pill, accent rule, inline code, prose) are shorter.

## Left to other repositories

- scaffolding: the catalog shell's `catalog.css`, which `dist/catalogue-assets/` serves, carries
  four comments with blind-review scores and dates.

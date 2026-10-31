# @hackersandwizards/brand

The hackers&wizards brand as one private package: design tokens, the print layer with its static
fonts, the logos, the expert UI layer with the components Company OS and the trainer hub share, and the document
components the PDFs are built from.

Maintainer: Benedikt Stemmildt. Trainers can read the whole repo, its history
included, so nothing goes in that a trainer may not see.

## Use it in another repo

Add the dependency in exactly this form, pinned to the newest tag
(`git ls-remote --tags https://github.com/hackersandwizards/brand.git` lists them). Your machine needs
GitHub read access to this repo; the check is in your repo's README, the reason below.

```json
"@hackersandwizards/brand": "git+ssh://git@github.com/hackersandwizards/brand.git#v<version>"
```

Then import what you need. The colours, each hue's roles (base, text on light, night, tints) and
the chart order are in `tokens/tokens.css` and on the catalogue's Colours page.

```css
@import "@hackersandwizards/brand/tokens.css"; /* in a Tailwind 4 stylesheet */
```

| Import                                                      | File                            |
| ----------------------------------------------------------- | ------------------------------- |
| `@hackersandwizards/brand/tokens.css`                       | Tailwind 4 `@theme` tokens      |
| `@hackersandwizards/brand/tokens.root.css`                  | the same tokens on `:root`      |
| `@hackersandwizards/brand/tokens.json`                      | tokens and resolved colours     |
| `@hackersandwizards/brand/tokens`                           | the same as TypeScript          |
| `@hackersandwizards/brand/tokens.py`                        | the same as a Python module     |
| `@hackersandwizards/brand/print.css`                        | print scale and static fonts    |
| `@hackersandwizards/brand/fonts/<file>`                     | font files                      |
| `@hackersandwizards/brand/expert.css`                       | expert UI layer                 |
| `@hackersandwizards/brand/expert/components/<name>.astro`   | expert UI components            |
| `@hackersandwizards/brand/document.css`                     | print document base             |
| `@hackersandwizards/brand/document/components/<Doc*.astro>` | document components             |
| `@hackersandwizards/brand/logos/<file>`                     | logos                           |
| `@hackersandwizards/brand/clients/<file>`                   | client marks and `clients.json` |

The logo is one line, with no line under it: the wizard beside the pixel wordmark,
`logos/lockup.svg`, is the standard; the wordmark alone, `logos/wordmark.svg`, goes on textiles
(shirts, hoodie) and stickers; the stacked `logos/lockup-compact.svg` on small spots such as the mug
and lock screens. The mail signature keeps its typed wordmark. Each has a PNG beside it, a `-night`
cut for night, black and black textile, and an `-outline` cut, a white outline round the letters,
for Purple Love, Stargazer and the gradient. In both, the wizard of the lockup and the compact lockup
carries an edge of 7.6% of the letters' cap height: grey (`--color-ampersand-light`) in the night
cut, white in the outline cut. The gap between wizard and letters is part of the logo and the same
on every ground: 0.321 of the cap height in the lockup and 0.381 in the compact lockup, measured
between the contours, and from the edge's outer contour 0.351 and 0.411 in the cuts.
`bun scripts/outline.ts` sets the gap in the day files and writes both cuts from them. The wordmark's box is 952 units tall for 851 units of
letters, centred on the line midway between the box middle and the x-height middle of the letters.
A text set beside it centres on its box (`align-items: center`, the
text at `line-height: 1`) and sits centred on the letters. The wizard, taller than the letters,
centres on that box too and then rises by 7.8% of its own height, `translate: 0
var(--logo-wizard-lift)`, so its mass sits on the letters rather than its box.
Where an icon is no taller than the letters, it takes no lift. `logos/lockup.svg` carries the lift
built in, so its box is the wizard's and the wordmark's centre line lies 7.8% of the lockup's height
below the box centre; the night and outline cuts grow their box round the wizard's edge and keep that
7.8%: a text after the lockup centres on that line once the lockup takes the same
`translate: 0 var(--logo-wizard-lift)`.

The & sits optically centred between the s and the w, its mean row-wise gap equal on both sides.
`bun scripts/ampersand.ts` writes that offset into every one-line logo,
renders its PNG and rehashes both in `manifest.json`.

## Work on the package

```sh
bun install      # also points the git hooks at .githooks/
bun run check    # format, lint, typecheck, tests, generated/ up to date
bun run report   # scan the sibling repos, compare their copies, rebuild catalogue.html
bun run live     # every system's catalogue from its last build into captures/, rebuild catalogue.html
```

Open `catalogue.html` from disk for the brand portal: tokens, logos, every system's components live with its own CSS, a Compare of any systems you pick, the applications with their state, and health.
Rebuild the systems, then `bun run live`; `captures/` stays on this machine because the os and trainer hub stories carry fixtures trainers may not see.

A release is a tag `v<version>` that matches `version` in `package.json`; consumers then raise the
tag in their dependency line. Every brand file changes here; the rest of the rules:
[CLAUDE.md](CLAUDE.md).

## Why the `git+ssh://` form

The package is never published to a registry. Bun rewrites `git+https://github.com/...` and
`github:` to GitHub's tarball API, which answers 404 for a private repo, `GITHUB_TOKEN` set or not.
With the `git+ssh://` form Bun clones through git: first over HTTPS with the machine's credential
helper, then over SSH. An install therefore needs GitHub read access to `hackersandwizards/brand`,
through `gh auth login` plus `gh auth setup-git`, or an SSH key. With neither, Bun stops at
`error: InstallFailed cloning repository for @hackersandwizards/brand`, which names no cause, and no
`preinstall` script runs that could explain it.

A machine without access cannot open this README, so each consumer's README carries the two access
checks and both fixes in its setup section.

Licence: proprietary, see [LICENSE](LICENSE).

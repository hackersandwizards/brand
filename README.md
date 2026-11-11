# @hackersandwizards/brand

The hackers&wizards brand as one package: design tokens, fonts, logos, the shared `hw-*` elements,
the expert UI layer Company OS and the trainer hub share, and the checks each repository runs in
its own gate. Slide decks and PDFs come from their own packages, `@hackersandwizards/slides` and
`@hackersandwizards/documents`.

| You want                                                    | Go to                                                                                                                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a logo, a colour, a font, a photo                           | the [brand portal](https://hackersandwizards.github.io/brand/), a download beside each file; the files sit in [`logos/`](logos/) and [`press/`](press/) |
| the logo on a dark ground, its clear space and minimum size | [docs/assets.md](docs/assets.md)                                                                                                                        |
| an element in every state                                   | the [catalog](https://hackersandwizards.github.io/brand/catalog/)                                                                                       |
| the brand in your repository                                | [Install](#install) and [Use](#use)                                                                                                                     |
| to check your repository against the brand                  | [Check your repository](#check-your-repository)                                                                                                         |
| to change the brand                                         | [Work on the package](#work-on-the-package)                                                                                                             |

## Install

Add the dependency in exactly this form, pinned to the newest tag
(`git ls-remote --tags https://github.com/hackersandwizards/brand.git` lists them). The install
needs no GitHub access.

```json
"@hackersandwizards/brand": "git+https://github.com/hackersandwizards/brand.git#v<version>"
```

## Use

In a Tailwind 4 stylesheet, the tokens first, then the shared elements:

```css
@import "@hackersandwizards/brand/tokens.css";
@import "@hackersandwizards/brand/elements.css";
```

The imports most repositories take, each under `@hackersandwizards/brand/`:

- `tokens.css`: the tokens as Tailwind 4 `@theme`; without Tailwind, `tokens.root.css`
- `elements.css`: every shared element (`hw-card`, `hw-pill`, ...) and the scales; one element alone is `elements/<name>.css`
- `fonts.css`: the screen faces, self-hosted
- `marker.css`: the list marker
- `header.css`: the internal header
- `expert.css`, `expert/components/<name>.astro`: the expert UI layer and its components
- `logos/<file>`: logos, favicon set, `logos.json`
- `verbal.json`: claim, headline, mission, values, the retired lines
- `catalogs.json`: every published catalog, for the header's nav
- `package.json`: the installed brand version

Every export: [docs/exports.md](docs/exports.md).

## Check your repository

Six commands check your working tree or your build against the brand. Run each from your
repository's root with `bun run <name>`, never `bunx <name>`; `--help` prints its usage.

- `brand-colours` fails on a colour, radius, shadow or font that is no brand token
- `brand-copies` fails on a copy of a brand file in your tree
- `brand-scan` fails on a fork of an expert component
- `brand-elements` fails on a shared element on your design-system page that differs from the brand rule
- `brand-markers` fails on a list marker off its line
- `brand-retired` fails on a retired slogan in what your build wrote

How to add each to your gate, what it reads, where its exceptions go and how to raise your pin:
[docs/checks.md](docs/checks.md). Five more commands write a LinkedIn post image, a sketch prompt or a mail signature:
[docs/exports.md](docs/exports.md#commands).

## Documentation

- [Exports and commands](docs/exports.md): every exported file and command, and why the dependency line has its form
- [Shared elements](docs/elements.md): the `hw-*` elements, their scales, night, list markers, lists you filter
- [The internal header and the catalog](docs/header.md): the header every internal page wears and the catalogs' nav
- [Logos, favicon, press photos and words](docs/assets.md): the logo's cuts and geometry, clear space, minimum size
- [Checks for your gate](docs/checks.md): the six checks, their exception lists, raising your pin

The exported files and the commands are the whole interface: any other path in the package may
move in the next tag.

## Work on the package

With [bun](https://bun.sh) installed:

- `bun install` installs and points the git hooks at `.githooks/`
- `bun run check` runs the gate: scaffolding's shared steps (admin-check among them), then the built catalog's tests and `generated/`
- `bun run dev` serves the catalog at `http://127.0.0.1:4326/` (the base drops in dev)
- `bun run build` writes `dist/`, as the Pages workflow publishes it

The catalog is one Astro app in `catalog/`. Its root is the brand portal: tokens, logos, every
family of brand files in use under `applications/`, the press kit, and a link to each system's own
design-system page. The element stories are at `/brand/catalog/`. `dist/index.html` also opens
from disk.

A release is a tag `v<version>` that matches `version` in `package.json`; consumers then raise the
tag in their dependency line. Every brand file changes here; the rest of the rules, for people and agents:
[CLAUDE.md](CLAUDE.md).

Maintainer: Benedikt Stemmildt. The repo is public, its history included, so nothing goes in
that may not be public.

Licence: PolyForm Strict 1.0.0, see [LICENSE](LICENSE).

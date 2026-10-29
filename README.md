# @hackersandwizards/brand

The one source of the hackers&wizards brand: design tokens, the print layer with its static fonts,
the logos, the expert UI layer of Company OS and the trainer hub, and the document components the
PDFs are built from.

Open `catalogue.html` from disk to see the tokens, the logos, the scan of every repo and whether
each repo's copies still match this one.

## Use

```sh
bun install
bun run check    # format, lint, typecheck, tests, generated/ up to date
bun run report   # scan the sibling repos, compare their copies, rebuild catalogue.html
```

The sibling repos are read from their checkouts next to this one (`repos.json`). Where one is
missing, the scan skips it with a warning.

## Package entry points

| Import                                     | File                         |
| ------------------------------------------ | ---------------------------- |
| `@hackersandwizards/brand/tokens.css`      | Tailwind 4 `@theme` tokens   |
| `@hackersandwizards/brand/tokens.root.css` | the same tokens on `:root`   |
| `@hackersandwizards/brand/tokens.json`     | tokens and resolved colours  |
| `@hackersandwizards/brand/tokens`          | the same as TypeScript       |
| `@hackersandwizards/brand/tokens.py`       | the same as a Python module  |
| `@hackersandwizards/brand/print.css`       | print scale and static fonts |
| `@hackersandwizards/brand/fonts/<file>`    | font files                   |
| `@hackersandwizards/brand/expert.css`      | expert UI layer              |
| `@hackersandwizards/brand/document.css`    | print document base          |
| `@hackersandwizards/brand/logos/<file>`    | logos                        |

The package is private and never published: consumers install this repo as a Git dependency pinned
to a tag. The document components in `document/components/` are not part of the package.

## Install

A consumer names the dependency in exactly this form, pinned to a tag:

```json
"@hackersandwizards/brand": "git+ssh://git@github.com/hackersandwizards/brand.git#v0.3.1"
```

Bun rewrites `git+https://github.com/...` and `github:` to GitHub's tarball API, which answers 404
for a private repo, `GITHUB_TOKEN` set or not. With the `git+ssh://` form Bun clones through git
instead: first over HTTPS with the machine's credential helper, then over SSH. So an install needs
GitHub read access to `hackersandwizards/brand`, through `gh auth login` plus `gh auth setup-git`,
or an SSH key. With neither, Bun stops at
`error: InstallFailed cloning repository for @hackersandwizards/brand`, which names no cause, and
no `preinstall` script runs that could explain it.

A machine without access cannot open this README, so each consumer's README carries the two access
checks and both fixes in its setup section.

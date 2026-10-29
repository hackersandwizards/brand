# @hackersandwizards/brand

The hackers&wizards brand as one private package: design tokens, the print layer with its static
fonts, the logos and the expert UI layer that Company OS and the trainer hub use. The repo also keeps
the document components the PDFs are built from, outside the package.

Maintainer: Benedikt Stemmildt. Trainers can read the whole repo, its history
included, so nothing goes in that a trainer may not see.

## Use it in another repo

Add the dependency in exactly this form, pinned to the newest tag
(`git ls-remote --tags https://github.com/hackersandwizards/brand.git` lists them). Your machine needs
GitHub read access to this repo; the check is in your repo's README, the reason below.

```json
"@hackersandwizards/brand": "git+ssh://git@github.com/hackersandwizards/brand.git#v0.3.1"
```

Then import what you need:

```css
@import "@hackersandwizards/brand/tokens.css"; /* in a Tailwind 4 stylesheet */
```

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

## Work on the package

```sh
bun install      # also points the git hooks at .githooks/
bun run check    # format, lint, typecheck, tests, generated/ up to date
bun run report   # scan the sibling repos, compare their copies, rebuild catalogue.html
```

Open `catalogue.html` from disk to see the tokens, the logos, the scan of every repo and whether
each repo's copies still match this one. The scan reads the sibling repos from their checkouts next
to this one (`repos.json`) and skips a missing one with a warning.

A release is a tag `v<version>` that matches `version` in `package.json`; consumers then raise the
tag in their dependency line. Which files change here and which in their origin repo, and the rest of
the rules: [CLAUDE.md](CLAUDE.md).

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

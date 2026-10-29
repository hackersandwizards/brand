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
| `@hackersandwizards/brand/logos/<file>`    | logos                        |

The package is private and not published. Which private channel carries it to the other repos is
still open. The document components in `document/` are not part of the package.

# CLAUDE.md

The hackers&wizards brand as one package, `@hackersandwizards/brand`: tokens, the print layer and
static fonts, logos, the expert UI layer and the document components, plus a read-only scan and
drift report over the sibling repos. Option B of
`os/docs/tracking/2026-10-29-brand-system-repo.md`, decided by Benedikt on 2026-10-29.

Benedikt decided on 2026-10-29: this repo stays private on GitHub
(`github.com/hackersandwizards/brand`, team `trainers` read), consumers install it as a Git
dependency pinned to a tag, `git+ssh://git@github.com/hackersandwizards/brand.git#v<version>`. Only
this address form installs; why, and the access it needs: `README.md`, "Why the `git+ssh://` form". No registry. The rollout is staged: this core first, component packages from
talks and os later, moving into the core only once two surfaces share them. `"private": true`
stays: nothing is ever published. A release is a tag `v<version>` matching `package.json`. Nothing
here writes into another repo: no sync, no copy script.

**External trainers can read this whole repo, its history included**, because the trainer hub
installs it as a Git dependency. Nothing goes in that a trainer may not see: no price, rate,
discount, margin, offer, invoice, client term, personal data or secret.

## Layout

- `tokens/`, `logos/`, `expert/`, `document/`: the brand files, each listed in `manifest.json`
  with its sha256. A file another repo still owns carries the repo, path and commit it was
  imported from. This repo owns `expert/expert.css`, `document/` and the two variable
  fonts `tokens/fonts/*-wght-normal.woff2`, which carry no origin.
- `generated/`: token formats built from `tokens/tokens.css` (`:root` CSS, JSON, TS, Python). Never
  edit them; run `bun run tokens`.
- `repos.json`: each sibling repo, its path from here, its own catalogue and where it holds copies.
- `scan-allowlist.json`: the scan's ratchet. It may only shrink; a test fails where it grows
  against `HEAD`.
- `reports/`, `catalogue.html`: the last scan and drift run and the page that shows them.

## Commands

- `bun run check`: format, lint, typecheck, unique function names, tests (manifest hashes, tokens,
  scanner, allowlist ratchet, drift control) and the freshness of `generated/`. No hook runs it:
  `.githooks/pre-commit` scans the staged changes with `gitleaks` and runs `prettier --check` and
  `eslint` on the staged files. `bun install` points `core.hooksPath` at `.githooks/`.
- `bun run fix`: `eslint --fix`, then `prettier --write`.
- `bun run report`: scan, drift and `catalogue.html`. The scan exits 1 where a sibling's count rises
  above the allowlist; the drift report never fails.
- `bun run scan -- --tighten`: lower the allowlist to today's counts. Never raise an entry by hand.
- `bun run import`: re-read every file that has an origin from that origin's last commit and
  rewrite the manifest; files without an origin keep their entry.

## Rules

- A file without an origin changes here, then `manifest.json` and `bun run tokens` follow in the
  same commit. A file with an origin changes in that repo and is re-imported.
- The scan and drift read each sibling's last commit through git and never its working tree.
- The package holds the core only: tokens, generated formats, print and expert layers, the document
  base `document/document.css`, the document components, fonts with their OFL texts, small logos
  and `LICENSE`. `test/package.test.ts` fails on anything else.
- The slide engine stays private to talks and never enters this package, not even a primitive.
- The document components (`document/components/Doc*.astro`) ship in the package and are this
  repo's own: Benedikt decided on 2026-10-29 (os row `brand-unification-plan`, D1 b) that os and the
  trainer hub both consume them from here. A component imports only this repo's files (logos inline,
  no app paths), and every rate or term is a prop. `test/components.test.ts` renders each one
  standalone; a new component needs placeholder props there.
- Only the print masters live in Git LFS: the two CMYK TIFFs and the two 4096 px emoji PNGs
  (`.gitattributes`). `.lfsconfig` keeps clones from fetching them, so a consumer's install stays
  small; fetch them here with `git -c lfs.fetchexclude= lfs pull`. Every file the package ships is
  a plain Git file, and `test/package.test.ts` fails on one in LFS.

## Behavioral rules

Project rules live in `.claude/rules/*.md`. Read and apply them each session. Claude loads them
natively. Codex and pi must read the directory themselves. Ignore the global `~/.claude/rules` set
in this repository. These project rules supersede it. The rules and skills under `.claude/` are
mirrored from the agent-config hub (`~/.claude/scripts/sync-agent-config.sh`): change them there,
never here.

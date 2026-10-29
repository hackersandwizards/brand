# CLAUDE.md

The hackers&wizards brand as one package, `@hackersandwizards/brand`: tokens, the print layer and
static fonts, logos, the expert UI layer and the document components, plus a read-only scan and
drift report over the sibling repos. Option B of
`os/docs/tracking/2026-10-29-brand-system-repo.md`, decided by Benedikt on 2026-10-29.

Benedikt decided on 2026-10-29: the package and this repo stay private, never on a public registry,
and the rollout is staged: this core first, component packages from talks and os later, moving into
the core only once two surfaces share them. Which private channel carries it is still open (row
`brand-package-distribution` in `os/docs/tracking/decisions/items.js`). Until then nothing here
writes into another repo: no sync, no copy script, no remote, no push. `"private": true` in
`package.json` blocks any publish; remove it only once the channel is decided.

## Layout

- `tokens/`, `logos/`, `expert/`, `document/`: the brand files. Each one is listed in
  `manifest.json` with the repo, path and commit it was imported from, and its sha256.
- `generated/`: token formats built from `tokens/tokens.css` (`:root` CSS, JSON, TS, Python). Never
  edit them; run `bun run tokens`.
- `repos.json`: each sibling repo, its path from here, its own catalogue and where it holds copies.
- `scan-allowlist.json`: the scan's ratchet. It may only shrink; a test fails where it grows
  against `HEAD`.
- `reports/`, `catalogue.html`: the last scan and drift run and the page that shows them.

## Commands

- `bun run check`: format, lint, typecheck, unique function names, tests (manifest hashes, tokens,
  scanner, allowlist ratchet, drift control) and the freshness of `generated/`. Must pass before a
  commit; `.githooks/pre-commit` runs it after `gitleaks` scans the staged changes. `bun install`
  points `core.hooksPath` at `.githooks/`.
- `bun run fix`: `eslint --fix`, then `prettier --write`.
- `bun run report`: scan, drift and `catalogue.html`. The scan exits 1 where a sibling's count rises
  above the allowlist; the drift report never fails.
- `bun run scan -- --tighten`: lower the allowlist to today's counts. Never raise an entry by hand.
- `bun run import`: re-read every file from its origin's last commit and rewrite the manifest. Only
  while an origin still owns its file (DS-D's document set in os); retire it once this repo is the
  source.

## Rules

- A brand file changes here, then `manifest.json` and `bun run tokens` follow in the same commit.
  Until this repo is the source, the origins in `manifest.json` own their files: change them there
  and re-import.
- The scan and drift read each sibling's last commit through git and never its working tree.
- The package holds the core only: tokens, generated formats, print and expert layers, fonts with
  their OFL texts, small logos and `LICENSE`. `test/package.test.ts` fails on anything else.
- The slide engine stays private to talks and never enters this package, not even a primitive.
- The document components stay in the repo but out of the package: `DocHeader.astro` imports os
  internals. They ship later in os's component package.
- Large logos live in Git LFS (`.gitattributes`). The two print TIFFs and the two 4096 px emoji PNGs
  stay out of the package's `files`.

## Behavioral rules

Project rules live in `.claude/rules/*.md`. Read and apply them each session. Claude loads them
natively. Codex and pi must read the directory themselves. Ignore the global `~/.claude/rules` set
in this repository. These project rules supersede it. The rules and skills under `.claude/` are
mirrored from the agent-config hub (`~/.claude/scripts/sync-agent-config.sh`): change them there,
never here.

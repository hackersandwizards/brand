# CLAUDE.md

The hackers&wizards brand as one package, `@hackersandwizards/brand`: tokens, the print layer and
static fonts, logos, the expert UI layer and the document components, plus a read-only scan and
drift report over the sibling repos. The reasoning is in os
`docs/tracking/2026-10-29-brand-distribution.md`.

This repo stays private on GitHub
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
  with its sha256. This repo owns every one of them: no other repo is a source.
- `press/`: the press kit's photos, the founders' portraits and their photo together, as the
  website's press page publishes them, with `press.json` naming what each shows and the credit.
  In `manifest.json`. The press kit's texts stay with their owners: the bios in the website's
  `src/data/profiles.ts` and os `documents/people/`, the company description in the website's copy.
- `clients/`: the client marks h&w may show, this repo's own: `clients.json` lists each client's
  name and mark file in display order, keeping neighbours from different industries, with the
  mark's source where known. Outside `manifest.json`.
- `applications/<family>/`: the files made from the brand for one use each, outside the package:
  device and call backgrounds, channel banners, avatars, booth banners, gradients, overlays,
  merch print files, mail signatures. Where a script builds a family it sits beside the files and writes
  there: `backgrounds/generate.ts` (Chrome helper `backgrounds/render.ts`), `booth/generate.ts`,
  `merch/w1.ts` (shirt, hoodie, stickers), `channel-banners/render.py` (`uv run`). The banners
  with client logos never enter this repo: `render.py` writes them only to `--clients-out`. A
  retired file is deleted; git history keeps it.
- `generated/`: token formats built from `tokens/tokens.css` (`:root` CSS, JSON, TS, Python). Never
  edit them; run `bun run tokens`.
- `repos.json`: each sibling repo, its path from here, its own catalogue and where it still holds
  copies of brand files instead of installing the package.
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
- `bun run live`: turns each repo's catalogue, from its last build, into pages that open from disk
  with that repo's own CSS, in `captures/live/` (gitignored: the os and trainer-hub stories carry
  Company OS fixtures), and rebuilds `catalogue.html`, which embeds them as frames.
- `bun run scan -- --tighten`: lower the allowlist to today's counts. Never raise an entry by hand.

## Rules

- A brand file changes here, then `manifest.json` and `bun run tokens` follow in the same commit.
  Other repos take it from the package; a copy one still holds shows as drift until it goes.
- The scan and drift read each sibling's last commit through git and never its working tree.
- The package holds the core only: tokens, generated formats, print and expert layers, the document
  base `document/document.css`, the document components, fonts with their OFL texts, small logos,
  the client marks, the press photos and `LICENSE`. `test/package.test.ts` fails on anything else.
- The slide engine is its own package, `@hackersandwizards/slides`, and never enters this package,
  not even a primitive.
- The expert components (`expert/components/`) are the UI pieces Company OS and the trainer hub
  both render, this repo's own: a component one app alone uses stays in that app. Where the apps
  differ on purpose, the difference is a prop or a token the app sets, never a fork: the hub's
  `--dim-floor` of 70% lifts every `text-foreground/65` to its projector rule, and a hub pill on a
  card passes its own `color`. Their CSS lives in `expert/expert.css`; a consumer adds
  `@source` on `expert/components` so Tailwind sees their classes.
- The document components (`document/components/Doc*.astro`) ship in the package and are this
  repo's own: os and the trainer hub both consume them from here. A component imports only this repo's files (logos inline,
  no app paths), and every rate or term is a prop. `test/components.test.ts` renders each one
  standalone; a new component needs placeholder props there.
- Only the print masters (the two CMYK TIFFs and the two 4096 px emoji PNGs) and the PNG, PDF and
  AI files under `applications/` live in Git LFS (`.gitattributes`). `.lfsconfig` keeps clones,
  a consumer's `bun install` included, from fetching them, so the install stays small; fetch them here with `git -c lfs.fetchexclude= lfs pull`. Every file the package ships is
  a plain Git file, and `test/package.test.ts` fails on one in LFS.

## Behavioral rules

Project rules live in `.claude/rules/*.md`. Read and apply them each session. Claude loads them
natively. Codex and pi must read the directory themselves. Ignore the global `~/.claude/rules` set
in this repository. These project rules supersede it. The rules and skills under `.claude/` are
mirrored from the agent-config hub (`~/.claude/scripts/sync-agent-config.sh`): change them there,
never here.

# CLAUDE.md

The hackers&wizards brand as one package, `@hackersandwizards/brand`: tokens, the print layer and
static fonts, logos, the expert UI layer and the document components, the colour scan each
consumer runs in its own gate, plus a read-only drift and duplicate report over the sibling repos. The reasoning is in os
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
  mark's source where known. `"onepager": false` keeps a mark off the os onepagers' client row,
  which shows every other entry. Outside `manifest.json`.
- `applications/<family>/`: the files made from the brand for one use each, outside the package:
  device and call backgrounds, channel banners, LinkedIn post images, avatars, booth banners,
  gradients, merch print files, mail signatures. Where a script builds a family it sits beside the files and writes
  there: `backgrounds/generate.ts` (Chrome helper `backgrounds/render.ts`), `booth/generate.ts`,
  `merch/w1.ts` (shirt, hoodie, stickers), `channel-banners/render.py` (`uv run`). `linkedin-visuals/` ships as
  three commands: `brand-linkedin-frame` (`frame.ts`) and `brand-linkedin-terminal` (`terminal.ts`)
  write a post's image to the path the caller names, `brand-linkedin-sketch-prompt` prints
  `sketch-prompt.txt`, the generated sketch's prompt, and each `sketch-example-<name>.txt`, a filled
  prompt beside the post image it produced. Every
  channel banner lives in `applications/channel-banners/`, the ones with client logos included.
  A retired file is deleted; git history keeps it.
- `generated/`: token formats built from `tokens/tokens.css` (`:root` CSS, JSON, TS, Python). Never
  edit them; run `bun run tokens`.
- `scan/colours.ts`: the colour scan, shipped as the `brand-colours` command. Each consumer runs it
  in its own `bun run check` and keeps its exceptions, with their reasons, in its own
  `brand-colours.json`.
- `repos.json`: each sibling repo, its path from here, its own design-system page and the brand
  files it holds as copies. Only a delivery copy, a file the repo serves, belongs there: the
  website's, until its CI can install the package, and the certificate verifier's served fonts. A
  skill, script or document generator takes the file from the package.
- `scan-allowlist.json`: the component names allowed in more than one repo, each with its reason.
  It may only shrink; a test fails where it grows against `HEAD`.
- `catalogue.html`: the brand portal, generated from this repo's files only by
  `scripts/catalogue.ts`. Never edit it; run `bun run catalogue`.

## Commands

- `bun run check`: format, lint, typecheck, unique function names, tests (manifest hashes, tokens,
  scanners, allowlist ratchet, drift control) and the freshness of `generated/` and
  `catalogue.html`. No hook runs it:
  `.githooks/pre-commit` runs `bun run check:staged`: `gitleaks` over the staged changes,
  `prettier --check` and `eslint` on the staged files. `bun install` points `core.hooksPath` at `.githooks/`.
- `bun run fix`: `eslint --fix`, then `prettier --write`.
- `bun run catalogue`: rebuild `catalogue.html`.
- `bun run drift`: the siblings' copies of brand files against `manifest.json`; it never fails.
- `bun run scan`: component names in more than one sibling, against `scan-allowlist.json`; exits 1
  on an unlisted one. `-- --tighten` drops entries no longer found. Never add an entry by hand.

## Rules

- A brand file changes here, then `manifest.json` and `bun run tokens` follow in the same commit.
  Other repos take it from the package; a copy one still holds shows as drift until it goes.
- The drift and duplicate reports read each sibling's last commit through git and never its working
  tree. Nothing about another repo goes on `catalogue.html`: each system shows its components on
  its own design-system page, which the catalogue links.
- The package holds the core only: tokens, generated formats, print and expert layers, the document
  base `document/document.css`, the document components, fonts with their OFL texts, small logos,
  the client marks, the press photos, the LinkedIn post renderers and prompts
  `applications/linkedin-visuals/*.ts` and `*.txt`, the colour scan `scan/colours.ts` and `LICENSE`. `test/package.test.ts` fails on anything else.
- A consumer reaches brand through two surfaces only: a command in `bin`, run as `bun run <name>`
  (never `bunx`, which downloads a same-named npm package where none is installed), and a file an
  `exports` target names, imported or, from Python, HTML or a skill, read at its path in
  `node_modules/@hackersandwizards/brand/`. Every other path is internal and may move. Renaming a
  command, changing its arguments or moving an exported file breaks consumers: the release commit
  names it and every consumer follows in the same pass.
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

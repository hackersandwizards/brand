# CLAUDE.md

The hackers&wizards brand as one package, `@hackersandwizards/brand`: tokens, the print layer and
static fonts, logos, the expert UI layer, and the checks each consumer runs in its own gate
(colours, copies, components, list markers, shared elements, retired lines).

This repo is public on GitHub (`github.com/hackersandwizards/brand`), its history included.
Consumers install it as a Git dependency pinned to a tag,
`git+https://github.com/hackersandwizards/brand.git#v<version>`, which needs no GitHub access. No
registry. The rollout is staged: this core first, component packages from talks and os later,
moving into the core only once two surfaces share them. `"private": true` stays: nothing is ever
published to a registry. A release is a tag `v<version>` matching `package.json`. Nothing here
writes into another repo: no sync, no copy script.

**Anyone can read this whole repo, its history included.** Nothing goes in that may not be
public: no price, rate, discount, margin, offer, invoice, client term, client document, personal
data or secret.

## Layout

- `tokens/`, `logos/`, `expert/`, `elements/`: the brand files, each listed in `manifest.json`
  with its sha256. `elements/` holds the shared elements every system renders, one plain-CSS
  file each with the four scales in `scales.css`, and the framework-free scripts two elements need
  (`code.ts`, `list-filter.ts`). This repo owns every one of them: no other repo is a source.
- `press/`: the press kit's photos, the founders' portraits and their photo together, as the
  website's press page publishes them, with `press.json` naming what each shows and the credit.
  In `manifest.json`. The press kit's texts stay with their owners: the bios in the website's
  `src/data/profiles.ts` and os `src/content/documents/people/`, the company description in the website's copy.
- `verbal/verbal.json`: the verbal identity (name, claim, home headline, the words it retires), exported as
  `./verbal.json` and in `manifest.json`; the hub sync copies it into the voice skill.
- `clients/`: the client marks h&w may show, this repo's own: `clients.json` lists each client's
  name and mark file in display order, keeping neighbours from different industries, with the
  mark's source where known. `"onepager": false` keeps a mark off the os onepagers' client row,
  which shows every other entry. `bun scripts/clients.ts` writes each mark's `height` (README);
  `test/clients.test.ts` fails on a stale one or a mark whose box does not end on its drawn edge.
  Outside `manifest.json`.
- `applications/<family>/`: the files made from the brand for one use each, outside the package:
  device and call backgrounds, channel banners, LinkedIn post images, avatars, GitHub social previews, booth banners,
  gradients, merch print files, device stickers, mail signatures. Where a script builds a family it sits beside the files and writes
  there: `backgrounds/generate.ts` (Chrome helper `backgrounds/render.ts`), `booth/generate.ts`, `avatars/generate.ts`, `social-previews/generate.ts` (reads `gh`),
  `merch/w1.ts` (shirt, hoodie, stickers), `channel-banners/render.py` (`uv run`). `linkedin-visuals/` ships as
  three commands: `brand-linkedin-frame` (`frame.ts`) and `brand-linkedin-terminal` (`terminal.ts`)
  write a post's image to the path the caller names, `brand-linkedin-sketch-prompt` prints
  `sketch-prompt.txt`, the generated sketch's prompt, and each `sketch-example-<name>.txt`, a filled
  prompt beside the post image it produced. `slide-visuals/` ships `brand-slide-sketch-prompt`
  (`sketch-prompt.ts`), which prints `sketch-prompt.txt`, the prompt for a sketch beside a concept
  slide's cards, and its worked example. `mail-signature/` holds one template with placeholders
  (`template.html`, `template.txt`), filled by `fill.ts` and shipped as the `brand-mail-signature`
  command (`cli.ts`); no person's signature lives here, since each carries personal data: os renders those from
  its people records. Every
  channel banner lives in `applications/channel-banners/`, the ones with client logos included.
  A retired file is deleted; git history keeps it.
- `generated/`: token formats built from `tokens/tokens.css` (`:root` CSS with the colours again for a light island inside night, JSON, TS, Python, the slide pointer `cursor.svg`), the Shiki theme of its code palette (`code-theme.json`),
  the faces of `tokens/fonts.css` (`fonts.json`) and the `@font-face` rules of `tokens/print.css`
  alone (`static-fonts.css`). Never edit them; run `bun run tokens`.
- `scan/`: the checks a consumer runs in its own `bun run check`, each over its own working tree;
  nothing here reads a consumer. `colours.ts` (`brand-colours`: colours, radii, shadows, fonts),
  exceptions in the consumer's `brand-colours.json`. `copies.ts` (`brand-copies`) fails on a copy of
  a brand file, exceptions in the consumer's `brand-copies.json`. The paths every scan skips are
  `EXCEPTIONS` in `colours.ts`, each printed when applied and listed in the README; a new one
  needs a reason the README states. `components.ts` (`brand-scan`) fails on a consumer component named like an
  expert component, exceptions in the consumer's `brand-scan.json`, run by os and the trainer hub.
  `markers.ts` (`brand-markers`) measures the list markers of the pages a consumer names, the
  rule being `tokens/marker.css`. `elements.ts` (`brand-elements`) measures the shared elements on
  the design-system page a consumer names in `brand-elements.json`, its element-named source and
  that page's coverage. `retired.ts` (`brand-retired`) fails on a line of `verbal.json`'s `retired` list in
  the built folders or files a consumer names.
  A skill, script or document generator takes the file from the package, never a copy.
- `catalog/`: the catalog, one Astro app in scaffolding's catalog shell (`catalog/astro.config.ts`,
  preset `catalog()`), built to `dist/` and published by the reusable Pages workflow at
  `https://hackersandwizards.github.io/brand/`. Its root is the brand portal, generated from this
  repo's files only by `catalog/portal.ts`, which the route `pages/index.html.ts` runs in its own
  process, with `catalog-assets/` (the elements as one stylesheet and the
  PNGs the inlined SVGs embed) from their own route and the tracked files it links copied beside it
  (`files.ts`). The element stories sit in `catalog/stories/` at `/catalog/`. The portal's former
  address `catalogue.html` (route `pages/[former].html.ts`) forwards to the root with its anchor.
  The tests in `test/catalog/` read `dist/` after the build.

## Commands

- `bun run check`: scaffolding's runner (`scaffolding check`): format, lint, styles, typecheck,
  structure, coupling, unique names, spaces, confidential, history, licenses, the unit tests, the catalog build and the item
  check (`admin`) side by side, then `check:catalog` (the built portal and stories, `brand-elements`
  over every story) and `check:tokens` (the freshness of `generated/`). No hook runs it: the
  hooks are scaffolding's skeleton hooks, and `.githooks/README.md` lists what each runs, the
  `pre-push` refusal of the 248 commits `.confidential-purged.json` lists included. `bun install`
  points `core.hooksPath` at `.githooks/`.
- `bun run fix`: `eslint --fix`, then `prettier --write`.
- `bun run dev` (alias `bun run catalog`): the catalog's Astro dev server at
  `http://127.0.0.1:4326/` (`http://brand.localhost` where Caddy proxies it): scaffolding's preset
  drops the `/brand` base in dev and redirects `/brand/...` there. The portal reads the working tree
  afresh on each request. `bun run build` writes `dist/`. The portal's header links every catalog
  `expert/catalogs.json` lists at its published address.

## Rules

- A brief that sets a shared element's value for one scale or surface runs `blind-review` first,
  scored on every surface that renders the element, before the value changes.
- A brand file changes here, then `manifest.json` and `bun run tokens` follow in the same commit.
  Other repos take it from the package and never commit a copy of a brand file.
- A comment in a file the package exports states how to use the token or element, never its
  history: no score, review, date, decision or item id or person. The evidence goes to the item,
  `docs/agent-work/` or the commit message. scaffolding's `history` gate step fails on one.
- Nothing about another repo goes on the portal: each system shows its components on its own
  design-system page, whose URL `catalog/portal.ts` links.
- The package holds the core only: tokens, generated formats, print and expert layers, the shared elements, fonts with
  their OFL texts, small logos,
  the client marks, the press photos, `verbal/`, `manifest.json`, the LinkedIn post renderers and prompts
  `applications/linkedin-visuals/*.ts` and `*.txt`, the slide sketch prompt `applications/slide-visuals/*.ts` and `*.txt`, the mail signature template `applications/mail-signature/`, the consumer checks `scan/*.ts` with the one dependency they need, `puppeteer-core`, and `LICENSE`. `test/package.test.ts` fails on anything else.
- A consumer reaches brand through two surfaces only: a command in `bin`, run as `bun run <name>`
  (never `bunx`, which downloads a same-named npm package where none is installed), and a file an
  `exports` target names, imported or, from Python, HTML or a skill, read at its path in
  `node_modules/@hackersandwizards/brand/`. Every other path is internal and may move. Renaming a
  command, changing its arguments or moving an exported file breaks consumers: the release commit
  names it and every consumer follows in the same pass.
- The two engines are their own packages, and their components never enter this one: slides in
  `@hackersandwizards/slides`, the document base, the document components and the PDF renderer in
  `@hackersandwizards/documents`. Their values do, every one of them:
  `tokens/stage.css` holds every length and step the slide engine
  draws, `tokens/document.css` the document engine's, and an engine keeps only `var()` roles on them. Each shows itself in its own catalog, which the portal
  links; nothing here reads an engine.
- The expert components (`expert/components/`) are the UI pieces two systems both render, this
  repo's own: a component one system alone uses stays in that system. Where the apps
  differ on purpose, the difference is a prop or a token the app sets, never a fork: the hub's
  `--dim-floor` of 70% lifts every `text-foreground/65` to its projector rule, and a hub pill on a
  card passes its own `color`. Their CSS lives in `expert/expert.css`; a consumer adds
  `@source` on `expert/components` so Tailwind sees their classes. The internal header, the one
  frame every internal system and page wears (`AppHeader.astro`), is plain CSS in
  `expert/header.css`, so a static or generated page links or inlines it.
- Only the print masters (the CMYK TIFF and the 4096 px emoji PNG) and the PNG, PDF and
  AI files under `applications/` live in Git LFS (`.gitattributes`). `.lfsconfig` keeps clones
  from fetching them; a consumer's `bun install` unpacks GitHub's tarball, `git archive` of the tag,
  which `export-ignore` in `.gitattributes` narrows to the files `files` names. `bun install` here fetches all but the TIFF, as the catalog shows them, and `git -c lfs.fetchexclude= lfs pull` fetches every one. Every file the package ships is
  a plain Git file, and `test/package.test.ts` fails where the tag archive differs from the packed list or holds an LFS file.

## Behavioral rules

Project rules live in `.claude/rules/*.md`. Read and apply them each session. Claude loads them
natively. Codex and pi must read the directory themselves. Ignore the global `~/.claude/rules` set
in this repository. These project rules supersede it. The rules and skills under `.claude/` are
mirrored from the agent-config hub (`~/.claude/scripts/sync-agent-config.sh`): change them there,
never here.

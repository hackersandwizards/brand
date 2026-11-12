# Checks for your gate

The six checks a consumer runs: what each reads, what it fails on and where its exceptions go. Five
run in your own `bun run check`; `brand-markers` runs outside it. `bun run <name> --help` prints each command's usage.

## Check your colours in your gate

The package ships `brand-colours`, which scans your working tree from the current directory down
and counts, per file:

- `hex`: colour literals off the tokens as hex, or as a CSS colour name (`tomato`, `teal`) in a
  colour property, an SVG colour attribute, a `color-mix()`, a Tailwind arbitrary value
  (`bg-[tomato]`) or a custom property set to that name alone (`--mark: tomato`); a hex of three or
  four letters alone (`#fab`) or digits alone (`#128`, as an issue number reads) only where a value
  stands. In a JSX, Astro or Svelte expression prop
  (`fill={on ? "teal" : "white"}`) and an interpolation (`${...}`), the strings the expression can
  take count, never a string it compares, tests with `in`, or holds inside a key, a call's
  arguments or an object
- `rgb`: colour functions: `rgb()`, `rgba()`, `hsl()`, `hsla()`, and `oklch()`, `oklab()`, `lab()`,
  `lch()`, `hwb()`, `color()` with a colour's arguments, counted without conversion
- `tokenHex`: a literal repeating a token's colour, in any notation, `white` and `black` included,
  instead of naming the token
- `font`: font stacks that do not open on a brand family, in `font-family`, the `font` shorthand, an
  SVG `font-family` attribute or a quoted style key; a family only named like a brand one
  (`Interstate`) counts; and Tailwind's `font-serif`. An `@font-face` naming one of brand's faces,
  the fallback faces of `fonts.css` (`Inter Fallback`) included, counts nothing
- `palette`: Tailwind default palette classes, side and offset forms included (`border-x-red-500`,
  `ring-offset-red-500`, `placeholder-gray-400`)
- `radius`, `shadow`: a `border-radius` or `box-shadow`, vendor-prefixed too (CSS, a custom property named for either,
  a style object, a Tailwind arbitrary value) that is no brand token, and Tailwind's default
  radius and shadow classes with a size (`rounded-lg`, `shadow-md`; the bare `rounded` and
  `shadow` are not read, as words they match prose). A token value, `0`, `none`, a CSS-wide
  keyword, a `var()` whose fallback is a value or another such `var()` (`var(--a, var(--b))`), and
  the generated tokens' own key (`tokens["--radius-brand"]`) pass; a value the scan cannot read, an
  interpolation or a variable, counts nothing.

A standalone SVG cannot name a token, so there a token hex counts nothing, and neither does a mix
the package derives from the tokens: a token colour on white at 7 % or at any 5 % step, and a hue
row's text colour at 70 % with ink, within 1 per channel. A shadow's colour counts in `shadow` only.

Add it to your gate as a `check:<what>` script that scaffolding's `scaffolding.check` runs:

```json
{
  "scripts": {
    "check:colours": "brand-colours",
    "check:copies": "brand-copies",
    "check:retired": "brand-retired dist"
  },
  "scaffolding": { "check": [["check:colours", "check:copies"], "check:retired"] }
}
```

An exception goes in `brand-colours.json` beside your `package.json`, one entry per file with its
counts and the reason, and the list may only shrink: the scan fails where an entry grows against
`HEAD` while the list's total for that metric grows too, or names no reason. A value you move to
another file moves its count in the same commit: the old file's entry shrinks by what the new one
takes. A metric an entry leaves out allows none. An entry on a file that is clean fails too, as it
would let a new finding there pass, and so does an entry allowing more than its file holds: lower
it. `brand-colours --tighten` lowers every entry to today's counts, drops the clean ones and the
metrics at zero, and writes no list where none was and nothing is found.

```json
{
  "src/legacy.css": { "hex": 2, "reason": "a vendor stylesheet we do not edit" }
}
```

A third party's mark, such as a partner conference's or a client's logo as an SVG, carries its
owner's colours, not the brand's. Its entry names the owner in `partner` and its reason, takes no
counts, and may be added in any commit: the scan leaves the file uncounted and prints every partner
mark it allowed. `partner` on any file but an SVG fails.

```json
{
  "public/talk/conf-logo.svg": {
    "partner": "Example Conf",
    "reason": "the conference's logo beside our closing slide, in its own colours"
  }
}
```

### Raise your pin

A newer scan can find more in files you have not touched. In the commit that changes the
`#v<version>` your `package.json` pins at `HEAD` to the installed version, the three lists may also take what the installed
scan finds in your files as committed at `HEAD`: a `brand-colours.json` entry may grow to the count
of the file at `HEAD`, a `brand-copies.json` or `brand-scan.json` entry may name a file committed
at `HEAD` and unchanged since. Whatever your own new or changed code adds still fails, and every
entry still needs its reason. The scan prints the pin change it saw.

1. Raise the pin and run `bun install`.
2. Fix what you can. A `brand-colours.json` entry takes what remains of a partly fixed file. A
   copy or fork you change in this commit can no longer be listed: fix it whole or leave it as is.
3. Run `brand-colours --tighten`, `brand-copies --tighten` and `brand-scan --tighten`: during a
   pin change they add the new findings with an empty reason. Give each its reason.
4. Commit the pin, the lockfile and the lists together. From the next commit on, the lists may
   only shrink again.

## What the scans skip

`brand-colours`, `brand-copies` and `brand-scan` read every file `git ls-files` lists (tracked and
untracked, `.gitignore` honoured) except these, and print each one they applied with its file
count. Nothing else is skipped: `public/`, `docs/`, `src/content/` and SVGs are read. A file of
yours that should not count, such as a sent document or a third-party mark, goes in the
allowlist by name with its reason.

| Exception     | Skips                                                                                                                                                                                  | Why                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `generated`   | `node_modules/`, `dist/`, `.astro/`, `.next/`, `out/`, `coverage/`, `test-results/`, `playwright-report/`, `.vercel/`, `.wrangler/`, `__pycache__/`, `.turbo/`, `build/`, `worktrees/` | build, cache and dependency output, rebuilt from the source the scans read; a nested worktree is another checkout with its own gate |
| `tests`       | `*.test.*`, `*.spec.*`, `__tests__/`, `test/`, `tests/`, Python's `test_*.py`, `*_test.py` and `conftest.py`                                                                           | a test states the values it asserts, off-token ones included, and ships no surface                                                  |
| `allowlists`  | `brand-colours.json`, `brand-copies.json`, `brand-scan.json`, `brand-elements.json`                                                                                                    | the scans' own exception lists, whose reasons name the values they allow                                                            |
| `hub`         | `.claude/skills/parallel-session/`, `.claude/skills/voice/verbal.json`                                                                                                                 | agent tooling the `~/.claude` hub syncs into every repo, non-h&w ones included                                                      |
| `not styling` | `brand-colours` only: every extension but `.css .scss .astro .tsx .ts .mts .cts .jsx .js .mjs .cjs .vue .svelte .html .svg .py .json .webmanifest`                                     | prose, images, fonts, PDFs and other binaries carry no styling a renderer reads                                                     |
| `brand copy`  | `brand-colours` only: a file byte-identical to a package file                                                                                                                          | `brand-copies` reports it, and its allowlist governs it                                                                             |

Inside a file, one thing is skipped: a document the documents engine (`@hackersandwizards/documents`)
composed. `brand-colours` skips its style elements marked `data-hw-document`, `data-hw-components`,
`data-hw-page`, `data-hw-onepager`, `data-hw-readout` or `data-hw-certificate`, the engine's own
stylesheets inlined so the document stands alone, which the engine's gate scans in its source;
everything else in the file is read. `brand-copies` lets such a document carry the logos the
engine inlines from this package, as an `<svg>` or a `data:` URI: the lockup, known by its
`viewBox`, and an unmodified `logos/wordmark*.svg`, known by its whole text (comments and
whitespace aside), so a recoloured or cropped wordmark as an `<svg>` or a percent-encoded URI still
fails. It matches every other drawing in it. The attribute is the one marker both scans trust: nothing checks that the engine
wrote the element, so never put it on a style element of your own.

## Check for copies in your gate

Never commit a copy of a brand file: read it from the installed package. `brand-copies` fails on a
file in your tree that is byte-identical to a file the package ships (the logos, tokens, fonts,
expert components, press photos, generated token formats and the signature
template, through a Git LFS pointer too), on a file named like one of `logos/` that differs from
it, and on a text file carrying a logo's path data or embedded wizard, such as a recoloured
wordmark or an inlined SVG. An exception goes in `brand-copies.json` beside your `package.json`,
`{ "<path>": "<reason>" }`, and the list may only shrink against `HEAD`. An entry no longer found
fails; `brand-copies --tighten` drops those entries, and writes no list where none was and none is
needed.

## Check your components in your gate

Where you render the expert components, `brand-scan` fails on a component file of yours
(`.astro`, `.tsx`, `.jsx`, `.vue`, `.svelte`, in any folder) named like one of them (`Pill`,
`PageHeader`, ...): import it from the package. An exception goes in
`brand-scan.json` beside your `package.json`, `{ "<lowercase name>": "<reason>" }`, and the list may
only shrink against `HEAD`. An entry no component of yours matches fails; `brand-scan --tighten`
drops those entries, and writes no list where none was and none is needed. A name matches without case and word separators: `app-header.tsx` is
`AppHeader`, key `appheader`.

## Check your build for retired lines

`brand-retired` fails where a file your build wrote carries a line from `verbal.json`'s `retired`
list. Name the folders or files it writes, such as `brand-retired dist` or a rendered signature. It
reads every file under them and matches each line in the raw text and in the text with its tags
stripped, with entities decoded, whitespace ignored and case folded in both, so a line a page splits
across elements or sets in title case still counts. JS and JSON escapes are decoded too, `\n`, `\t`
and the other whitespace escapes as spaces, and a run of `*` or `_` at a word's edge, markdown
emphasis, is dropped, so speaker notes serialised into an island's JSON props still count. A line
counts as a whole word at each end, with or without its closing stop, its last word also plural or
possessive. A short line marked `"capital": true` in the list counts only where it opens with its
capital, as a heading or a sentence does, so prose such as "tools that elevate your team's review"
passes; mark a retired line that way when ordinary prose uses its words. A binary file (a NUL byte
in its first 8000) is skipped. It exits 2 on a missing path or a folder with no text file: run it
after the build. It takes no exceptions. A client bundle that imports `verbal.json` whole carries
the retired list and fails: import the fields a page shows (`import { claim } from
"@hackersandwizards/brand/verbal.json"`) or read the file at build time only. Add it after your
build step: `"check:retired": "brand-retired dist"`.

## Show the elements on your design-system page

Your design-system page shows each shared element you use as a tile,
`<div data-hw-tile="card" data-hw-version="<brand version>">` holding the element in your medium,
the version read from `@hackersandwizards/brand/package.json` when the page is built,
marked in the page's own language, "from brand v<version>" on an English page and "aus brand
v<version>" on a German one, with a link to the element's entry in the brand catalog, and each element you keep as your own
in full with its reason, `<section data-hw-exception="<name>">`. On an Astro page the tile is
`@hackersandwizards/brand/Element.astro`: `<Element name="pill" scale="dense" lang="de"
note="..."><span class="hw-pill">...</span></Element>` draws the caption, the version and the link,
your sample in its slot at the scale, `night` for night, or brand's own sample without one. In a focus-ring tile
`brand-elements` focuses every link and control but that link to the element's entry. List the pages
and your exceptions in `brand-elements.json` at your repo's root:

```json
{
  "pages": ["specimen/index.html"],
  "exceptions": {
    "total-band": "money on paper; no other system shows sums",
    "survey-readout": { "reason": "a slide deck on its own stylesheet", "files": ["readout.css"] }
  }
}
```

A system whose pages never turn to night adds `"lightOnly": true`: the tokens only an element's
night rules read may then stay undefined there. `"site": "<dir>"` is `brand-markers --site` (below), and `"site": { "dir": "<dir>", "at": "/mail/" }`
its `--site-at`, for a site built under a base path.
`"csp": "<policy>"` is the Content-Security-Policy your host sends, as one string: both measuring
scans add it to every page they open, a file's included, and fail on each source it refuses, naming
page, element and source (`p.hw-form-error::before: ... refuses data (img-src)`). A host sending
different policies by path writes `"csp": { "/catalog/**": "<policy>", "/app/**": "<policy>" }`:
each glob runs over a page's decoded path, as in `"markers"` (a page opened as a file has its
absolute path, so write `**/catalog/**` there), the first listed match decides, an iframe takes the
policy of its own path, and a page or same-origin iframe no glob matches fails the run. A policy the page
carries itself, in a `<meta>` or from a server named with `--base`, is checked too. Leave out a
per-response nonce, which no page on disk carries. Brand's icons (form field, password toggle, error summary, check,
select, pill, toast, menu, search, disclosure, accordion, tree, the list marker icons) are `data:`
SVG images, so the policy needs `img-src data:` where a page shows one. A host that builds its
header in code can read the policy from this file, so it is stated once.
A gate that starts its own server on a free port names each page as a path from the server's root,
starting with `/`, and runs `brand-elements --base <server url>`, so two gates at once never collide on a port.

Your catalog's home frames each story in an iframe, which neither measuring scan looks into.
`"catalog": "<dir>"` names the built catalog folder (`dist/catalog`, `dist/client/catalog`): every
story state page scaffolding wrote under its `stories/` is measured too, found in the build rather
than listed. Each is named the way a page is, below the catalog's own name: the folder's files, or
with `"site"` the folder's path on it. Where your gate serves the catalog itself, say where it is:
`"catalog": { "dir": "dist/client/catalog", "at": "/catalog/" }` with `--base`, or a full URL as
`at`. A story showing no element passes; a catalog folder holding no story page exits 2. Stories
another repository owns, such as the slides engine's, stay out with `"exclude": ["Slides/**"]` in
that object: globs relative to `stories/`, read by both checks; your own stories stay measured, and a
glob matching no story exits 2.

Before it measures, `brand-elements` opens every closed `<details>` outside a header or nav, since
a focusable in a shut fold takes no focus. An element inside `[data-hw-shell]`, the scaffolding
catalog shell's own card and pill, is the shell's: neither measured nor counted as shown. An element
carrying `hidden`, or inside one, draws nothing: it is not measured, so a page that hides its views until one is opened names
each view's URL. An element holding the page's
focus, or holding the focused node, as a story's focused state does, is read focused, its reference
too.

An exception's instance on a real page carries `data-hw-exception="<name>"` too: a shared element
inside it is that exception, not measured. `files` exempts a stylesheet of the system's own medium
from the source check.

Run `brand-elements` in your gate as a script such as `"check:elements": "brand-elements"`. It fails on an element on the pages whose
computed corner, fill, line, text colour, type, padding or size differs from the brand rule at the
same scale and theme (a reference beside it styled only by this package), on any element drawn
with the brand corner inside another so drawn (inside one, `elements/card.css` gives every element
and every `rounded-brand` the small corner), on a CSS rule named like an element (card; chip, pill, tag, badge; eyebrow, kicker, label;
callout, note; quote; icon-button; button, btn; breadcrumb; fact) that sets a property that element owns (a card's corner, fill, line or
padding, a label's type and colour; a shorthand counts, and so does a Tailwind utility in `@apply`, a state variant such as `hover:` excepted), read from `.css`, `.scss` and the style
elements of `.astro`, `.vue`, `.svelte` and `.html` (the documents engine's left out), or a component file under a `components/` folder of such a name that renders
none of the `hw-*` classes of the elements its name names (a `ProjectCard` without `hw-card`; a button component may render `hw-icon-button`, and a component named for one fact may render one row, a `dt` without a `dl`) and has no exception of that name, on an element carrying an `hw-*` class or
one brand once defined (`BRAND_CLASSES` in `scan/elements.ts`, such as `btn-primary`) that no stylesheet loaded on the page defines, so it draws unstyled (a Tailwind utility
or a class of your own passes, and so does such a class your own CSS defines), on an exception
without a reason, on a `data-hw-exception` whose name the list declares no exception for,
on a page showing no element, and on a run whose pages and stories show none. A `brand-elements.json` naming no page
exits 2, as a run measuring nothing proves nothing. It does not check which elements your page
shows or the version a tile states: a `"uses"` list is no longer read, and you may delete it.

## Check your list markers

`brand-markers` opens each page you name headless at 2x and 4x, as served and with a newline opening
every list item, and fails on a marker more than 0.25 px off its line, on a first line not starting
where the wrapped lines start, on an item that draws the square and keeps the browser's own marker,
and on a page you name with no marker. Name no page and it takes the `"pages"` of your
`brand-elements.json`, so you list them once. A first pass loads each of those pages and each
catalog story once at the first scale to find those showing a marker, and only they and the pages
you name take the measured runs, side by side, one per core, at most 8; a run of listed pages and
stories, a catalog's alone included, that finds no marker at all fails. A square `::before` placed absolutely on its item is
read in its own box, however far left of the text it sits and however it is turned. A list inside
a `[data-hw-exception]`, the system's own element your `brand-elements.json` names with its reason,
is measured and printed apart, `declared exception "<name>": ...` for each one off, counted in the
summary line, and never fails the run; inside an exception the file does not name, it is measured
as every marker is. Keep it as a `check:markers` script, out of `scaffolding.check` and
`scaffolding.changed`: it takes minutes, and its findings are sub-pixel. Run `bun run check:markers`
after you raise your brand pin and after you change how your lists are styled, on the pages or
specimen that show your lists. It opens every closed `<details>` outside a header or nav first,
and scrolls each list into view in every container that scrolls it, the window or an element such
as a catalog's `main`.
`--site <dir>` serves a built site folder on a free port for the run, a folder answering with its
`index.html`, and a page starting with `/` is a path on it, so pages whose links start at the root
load as published: `brand-markers --site dist /catalog/ /verify/`. A site built under a base path
is served there: `--site dist --site-at /mail/ /mail/`, so its `/mail/_astro/` stylesheets load. Both measuring scans fail on a
page whose stylesheet does not load, such as a build linking `file://` stylesheets served with
`--site`: unstyled, the page shows the browser's own markers and spacing. Name such a build's
pages as files instead. A test of your own that measures markers brand-markers leaves out takes its
target and tolerance from the package: `import { CAP_SHARE, TOLERANCE } from
"@hackersandwizards/brand/markers"`. It measures every story page of the catalog that the
`catalog` key of your `brand-elements.json` names, every page on its `"site"` where none of
`--site`, `--base <server url>` and `--catalog` is given, so you name your catalog once; a listed page
starting with `/` and no site or `--base` to serve it is named and left out. `--catalog <dir>` names another
instead, `--catalog-at <page>` where it is served; a story page without a list passes. Readings
you keep go in the `"markers"` block of the same file, each glob over a page's path with its
reason and how many off readings it keeps: `"markers": { "**/content-slide/at-rest/": { "reason":
"...", "off": 6 } }`. A kept reading prints as kept; more than `off` fails, and so does an
entry that keeps none on a page it matches, so a fixed page drops it. Fewer pass: a run with fewer
scales or pages counts fewer.

# Area marks: one icon per area, released in v1.55.0

Each area of h&w now has a mark: a Lucide line icon in the area's colour, `.hw-mark` in
`tokens/marker.css` (export `./marker.css`). It goes beside a link into the area and before the H1
of a page in it. The decision (`decide-area-cue`, Benedikt, 08.11.) chose one shape per area in
today's colours, the same mark before the H1. Before building the shapes, four ways of drawing that
mark went to a blind panel: CSS-drawn shapes, Unicode glyphs, emoji and icons. Icons won outside
the noise, with both models and in both runs. A second panel then picked the icon per area.

## For the website run

| Area             | `data-mark` | Icon (lucide-static 1.70.0) | Colour, light | Colour, night   |
| ---------------- | ----------- | --------------------------- | ------------- | --------------- |
| Trainings        | `trainings` | `graduation-cap`            | teal          | teal-night      |
| Software Factory | `factory`   | `factory`                   | teal          | teal-night      |
| Blog             | `blog`      | `newspaper`                 | purple        | purple-night    |
| Knowledge base   | `knowledge` | `book-open`                 | purple        | purple-night    |
| Podcast          | `podcast`   | `mic`                       | purple        | purple-night    |
| Any other page   | `other`     | `building-2`                | ampersand     | ampersand-light |

Markup: `<span class="hw-mark" data-mark="blog" aria-hidden="true"></span>`, an empty box in
running text or in a row aligned on the baseline. A mark without `data-mark` is other.

Sizes:

- **Beside a line:** 1.15em of the line's text (1.3em inside a `.hw-label`).
- **Before an H1:** `data-size="heading"`, 0.5em of the heading. The icon draws inside the middle
  20 of its 24 units, so the drawing spans 0.42em, the size the shape review recommended.
- **Gap to the text:** 0.5em, 0.3em before an H1, from the mark's own margin.
- **Other values:** `--hw-mark-size`, `--hw-mark-gap` and `--hw-mark-color`, on the mark or a parent.

The box's middle sits on the cap-height middle of its line, rounded to whole pixels with the text,
and the mark never makes its line taller (`test/marks.test.ts` measures both). Night is
`data-theme="dark"`. `brand-markers` skips `.hw-mark`, so the mark never counts as a list marker.

What the website builds: map its areas to `data-mark` (`src/lib/destinations.ts`). Put the mark
where `.dest-swatch` stands today (`LinkRow.astro`, `ArticleRows.astro`), before the card's area
label (`Card.astro`), before the area name of a rail row (`RailBlock.astro`, the "Keep learning"
rows) and before the H1 (`PageHero.astro`). The H1 mark hangs in the margin from 1024 px and
stands inline on the phone, as reviewed. Then raise the brand pin to `v1.55.0`.

## How the mark is drawn: round A

Medium, audience and size in every prompt: the public website at 1440 px desktop and 390 px phone,
read by CTOs, engineering leads and product managers. Personas: CTO, VP Engineering, Head of
Engineering at a German insurer, brand strategist. Claude and Codex, two runs each: 16 runs. Each
variant was injected into a built copy of the website (`origin/main` 5b80fcd4), every other rule of
the site unchanged, the line above the H1 dropped as in the item's variants. Reviewers never learned
which variant came from whom, or that one had been recommended. Labels were neutral letters, folders
random and the order shuffled per run.

Shown per variant: a learning board (cut links with their area written above), a glance board (15
other links, text blurred), the top of the home page, six page heads at 1440 px (Chrome) and six
first screens at 390 px (WebKit). The page heads were a training, the Software Factory, a glossary
entry, a blog post, a podcast episode and About. Steps shown: the link and the page it opens.

| Rendering                         | Calm | Meaning | Arrival | Glance | Brand fit | Overall |
| --------------------------------- | ---- | ------- | ------- | ------ | --------- | ------- |
| Icons, Lucide, in the area colour | 8.31 | 8.12    | 8.69    | 8.12   | 8.31      | 8.38    |
| Unicode glyphs ■ ◆ ● ▲ ○ ▬        | 8.50 | 5.50    | 6.12    | 7.69   | 8.06      | 6.75    |
| CSS shapes (square to bar)        | 7.88 | 5.25    | 6.62    | 8.06   | 7.88      | 6.69    |
| Emoji 🎓 🏭 ✍️ 📚 🎙️ 📄           | 5.12 | 7.44    | 7.81    | 7.81   | 4.25      | 4.56    |

Overall by model:

- **Claude:** icons 8.00, CSS 5.62, glyphs 5.50, emoji 3.38.
- **Codex:** icons 8.75, glyphs 8.00, CSS 7.75, emoji 5.75.

By run, icons scored 8.38 in both. Noise (mean gap between a reviewer's two runs): overall 0.56,
meaning 0.66. Icons lead the next rendering by 1.63, outside the noise in both runs and with both
models.

Glance does not separate the renderings. Once learned, 95 to 98 % of unread links were placed
correctly and sure in every variant.

The reasons reviewers gave:

- **Shapes and glyphs:** 16 of 16 runs for the CSS shapes and 13 of 16 for the glyphs read them as
  status or controls. The dot reads as live
  or unread, the ring as a radio button, the triangle as a warning or play button, the bar as a
  minus.
- **Emoji:** they look like chat stickers beside the brand's type.
- **Icons:** 13 of 16 runs read the page icon for other pages as a file or download, and 8 read the
  Blog pencil as an edit action.

Glyphs: Inter as the brand ships it (`tokens/fonts/`) holds none of the six, so every surface falls
back to a system font. In Chrome on macOS, ■ ● ▲ ○ came from SF, ◆ from Lucida Grande and ▬ from
Arial, each at its own size; the diamond rendered visibly smaller. Windows and Android were not
rendered.

## Which icons: round B

The question the item left open (other marks for Knowledge base and Podcast) carried over to the
icons. Round B also fixed the two causes from round A. CTO and brand strategist, Claude and Codex,
two runs: 8 runs, same boards. Trainings and Software Factory kept their icons in every set.

| Set                                            | Calm | Meaning | Arrival | Glance | Brand fit | Overall |
| ---------------------------------------------- | ---- | ------- | ------- | ------ | --------- | ------- |
| newspaper, book-open, mic, building-2          | 8.50 | 8.25    | 8.38    | 8.62   | 8.25      | 8.50    |
| newspaper, book-marked, headphones, compass    | 8.50 | 7.00    | 7.38    | 7.62   | 7.50      | 7.25    |
| newspaper, library, podcast, building-2        | 7.50 | 6.38    | 7.12    | 7.38   | 7.25      | 6.75    |
| pen-line, book-open, mic, file (round A's set) | 8.50 | 5.50    | 6.50    | 7.88   | 6.75      | 6.25    |

Columns: Blog, Knowledge base, Podcast, other pages.

Overall by model:

- **Claude:** 8.00, 6.75, 5.50, 5.25.
- **Codex:** 9.00, 7.75, 8.00, 7.25.

Noise 0.38. The first set leads by 1.25, in both runs and with both models.

The score that remains: the building reads as the firm itself, so reviewers find it awkward on links
to the book (5 of 8 runs). That is the website's mapping of the book page to other pages. It is
listed for the website run, not a brand change.

Round A's set scored 8.38 against shapes and 6.25 against other icon sets. A score here ranks the
variants in its own panel, never across panels.

## What was not tested

- **Platforms:** Windows and Android, a German page, the hover state, forced colours (the CSS keeps
  the mark in the text colour there) and a reader with a colour-vision deficiency.
- **Other surfaces:** os, documents and slides render the category colours but carry no area mark
  yet.
- **Other icon sets:** Lucide is the only one tried; brand already pins `lucide-static`.

## Code review of the change

`/simplify` and `/code-review` ran on the release diff. Fixed:

- **Line height:** a 1.3em mark made a 12px label line 3px taller; a negative top margin keeps its
  line box.
- **Default icon:** a mark without a known `data-mark` painted a solid square; it now draws other.
- **Private names:** `--_hw-mark` collided with a private variable of `stepper.css`; renamed.
- **Settings:** size settings on a parent lost to the label rule; the label and heading sizes are
  now private defaults.
- **Comment:** the comment called the drawn extent a stroke.
- **Placement:** `.hw-mark` shares `.hw-marker`'s placement rule.

Kept, each with its reason:

- **Licence in the manifest:** the Lucide licence stays in `manifest.json` as the OFL texts are,
  although a consumer that commits a copy would hear from `brand-copies`.
- **Scanner:** `brand-markers` skips `.hw-mark` by name. Skipping every masked box, as proposed,
  stopped it measuring the prose task box, whose tick is a mask.
- **Its own file:** the mark stays in `marker.css`, the file the decision named, rather than moving
  to `elements/mark.css`.

## Reviewer prompt

Round A, Claude, CTO, run 1, verbatim but for the 28 image paths, shortened to their file names:

```text
You are the CTO of a 400-person software company in Germany. You are evaluating outside help to get your engineering teams productive with AI coding agents, and you browse vendor websites between meetings.

Medium: the public website of a consultancy that trains software teams on AI coding agents and builds agent-based delivery systems. Viewed in a desktop browser at 1440 px width and on a phone at 390 px width. Audience: CTOs, engineering leads and product managers deciding whether to hire this firm.

On this website a link into another area of the site carries a small mark beside it, and the page it opens shows a mark before its headline. Below are 4 variants of the same site, labelled A, B, C, D. They differ only in how these marks are drawn. Read every image named below (absolute paths).

Variant A:
  learning-board: …/learning-board.png
  glance-board: …/glance-board.png
  desktop-home: …/desktop-home.png
  desktop-pages-1: …/desktop-pages-1.png
  desktop-pages-2: …/desktop-pages-2.png
  phone-pages-1: …/phone-pages-1.png
  phone-pages-2: …/phone-pages-2.png

[Variants B to D alike]

Board contents:
- learning board: links cut from the real pages at real size, each with the area it leads to written above it.
- glance board: 15 other numbered links with all text blurred so that it cannot be read, as a reader sees a link out of the corner of the eye.
- desktop home: the top of the home page, 1440 px scaled to 1000 px wide.
- desktop pages 1: the head of three pages the links lead to, at 1440 px.
- desktop pages 2: the head of three more such pages, at 1440 px.
- phone pages 1: the first screen of three pages at 390 px, side by side.
- phone pages 2: the first screen of the other three pages at 390 px.

Steps shown: the link (boards, home) and the page it opens (pages).

Task 1, glance. For each variant, study its learning board, then name for every numbered link on its glance board the area it leads to, using only what the link shows, and whether you are sure or guessing. Areas: Trainings, Software Factory, Blog, Knowledge base, Podcast, Other (Other: About, Clients, Book and similar pages).

Task 2, look. For each variant, score from 1 to 10 (10 best):
- calm: visual calm, nothing competes for attention without reason
- meaning: every mark means one thing; 10 = no mark seems to mean something else, such as a status (running, warning, success, error), a button or a rating
- arrival: on a page you opened, how well you can tell which area of the site you are in
- glance: how well you can place an unread link by its mark alone
- brandfit: the marks belong to this brand's type, colour and tone
- overall: would you ship this variant
Then name in one short sentence per variant what keeps it below 10, and in one short sentence what question the marks leave open for a reader.

Answer with JSON only, no prose before or after, in this shape:
{"variants": {"<label>": {"glance": {"1": {"area": "<area>", "sure": true}, "...": "...", "15": {"area": "<area>", "sure": false}}, "calm": 0, "meaning": 0, "arrival": 0, "glance_score": 0, "brandfit": 0, "overall": 0, "below10": "<sentence>", "open": "<sentence>"}}}
Use exactly these area names: Trainings, Software Factory, Blog, Knowledge base, Podcast, Other.
```

Review: large, because the mark is a shared brand element every area link and page head carries.

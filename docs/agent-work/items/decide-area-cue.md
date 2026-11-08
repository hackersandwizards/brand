---
kind: decision
status: open
priority: 2
order: 200
area: brand
owner: Benedikt
evidence: "Blind review 08.11., 24 runs in two rounds, on the website's origin/main (093daa7c) with brand v1.28.5, the website's own pin, linked locally (the website moved the Factory to teal itself, in ef5ae8b4); method and scores in the body."
recommended: shapes
options:
  - key: shapes
    label: "(c) One mark shape per area in today's colours"
    detail: "Trainings a teal square, Software Factory a teal diamond, Blog a purple circle, Knowledge base a purple triangle, Podcast a purple ring, every other page a grey bar; a card shows the mark before its area name. At a glance 100 % correct and unhedged. Keeps the palette; brand's rule that every mark too small for the brand corner is a square (tokens/marker.css) gains a shape per category. Reviewers: the shapes are small and take learning, and a card with an edge but no area name (the factory step cards) still shows only teal."
    score: 7.94
    noise: 0.12
  - key: five-hues
    label: "(b) One colour per area, none of them a state colour"
    detail: "Trainings teal, Software Factory blue #2563eb, Blog purple, Knowledge base pink #db2777, Podcast magenta #c026d3. At a glance 100 % correct and unhedged. Needs three hues outside the palette, and two of them sit close to existing ones: pink is ΔE 10.1 from red, magenta 9.7 from purple (teal to purple is 26.5). Reviewers: five accents compete, the pink edge reads near an error red, pink and magenta are hard to tell apart."
    score: 7.69
    noise: 0.62
  - key: today
    label: "(a) Today: teal for Trainings and Software Factory, purple for Blog, Knowledge base and Podcast, grey for the rest"
    detail: "Every link is placed correctly once its words are read. At a glance only 39 % of answers were correct and unhedged (86 % with the hedged guesses counted): Software Factory was mistaken for Trainings, and Knowledge base and Podcast for Blog. The calmest of the coloured variants."
    score: 6.88
    noise: 0.25
  - key: amber-green
    label: "(e) The website departs from the category rule: Software Factory amber, Knowledge base green, the rest as today"
    detail: "At a glance 94 % correct, 77 % unhedged; Podcast still passes for Blog. The lowest meaning score of all: all 16 round-1 runs named the amber and green as the warning, running, success and autonomous colours of the factory run and the maturity curve on the same page. Amber-dark is ΔE 6.4 from the former factory rust, green-dark 12.9 from teal."
    score: 6.19
    noise: 0.38
  - key: label-only
    label: "(d) No mark, the area name alone"
    detail: "The calmest, but at a glance no answer came without a hedge (74 % right by guessing from layout). The pages read flat and the phone squeezes a long link beside its label."
    score: 5.94
    noise: 0.37
images:
  shapes:
    - src: shapes-home.jpg
      caption: "(c) home, 1440 px: About row, Software Factory row, book, blog and podcast cards"
    - src: today-factory.jpg
      caption: "(c) service page, 1440 px: the same as today, since this view's cues are Trainings squares and card edges, which (c) leaves as they are"
    - src: shapes-phone.jpg
      caption: "(c) phone, 390 px: home hero, home, blog post, factory steps, knowledge base"
    - src: shapes-glance.jpg
      caption: "(c) round 1 glance board: the cues with all text blurred"
  five-hues:
    - src: five-hues-home.jpg
      caption: "(b) home, 1440 px"
    - src: five-hues-factory.jpg
      caption: "(b) service page, 1440 px"
    - src: five-hues-phone.jpg
      caption: "(b) phone, 390 px"
    - src: five-hues-glance.jpg
      caption: "(b) glance board"
  today:
    - src: today-home.jpg
      caption: "(a) home, 1440 px"
    - src: today-factory.jpg
      caption: "(a) service page, 1440 px"
    - src: today-phone.jpg
      caption: "(a) phone, 390 px"
    - src: today-glance.jpg
      caption: "(a) glance board"
  amber-green:
    - src: amber-green-home.jpg
      caption: "(e) home, 1440 px"
    - src: amber-green-factory.jpg
      caption: "(e) service page, 1440 px: the amber hero label beside the amber running and warning marks"
    - src: amber-green-phone.jpg
      caption: "(e) phone, 390 px"
    - src: amber-green-glance.jpg
      caption: "(e) glance board"
  label-only:
    - src: label-only-home.jpg
      caption: "(d) home, 1440 px"
    - src: label-only-factory.jpg
      caption: "(d) service page, 1440 px"
    - src: label-only-phone.jpg
      caption: "(d) phone, 390 px"
    - src: label-only-glance.jpg
      caption: "(d) glance board"
---

# Does the area cue still orient, now that areas share two colours?

Only when the reader reads it. At a glance, without the words, reviewers placed a link with
confidence 39 % of the time, because teal now marks both Trainings and the Software Factory and
purple marks Blog, Knowledge base and Podcast. One mark shape per area in today's colours, or one
non-state colour per area, brings it to 100 %. Amber and green manage 94 %, but they read as
warning and success beside the factory run and the maturity curve.

## How the cue works and what changed

The website's destination cue (`src/lib/destinations.ts`, `LinkRow.astro`, `Card.astro`,
`src/styles/patterns.css`) puts a 10 px square in the area's colour before a link row, a 3 px edge
on a linked card, and the area name in small capitals where the link text does not already name it.

| Area the cue names                                            | Before 06.11.    | Today  |
| ------------------------------------------------------------- | ---------------- | ------ |
| Trainings, Enablement                                         | teal             | teal   |
| Software Factory                                              | rust `#a3402a`   | teal   |
| Blog                                                          | purple           | purple |
| Knowledge base                                                | green-dark       | purple |
| Podcast                                                       | amber-dark       | purple |
| About, Clients, Book, Events, Self-check, Contact, RSS, hosts | grey (ampersand) | grey   |

brand v1.13.0 (`70546a1`) reserved amber, green and red for states; website `ec080771` moved
Knowledge base and Podcast to purple; brand v1.31.0 (`9e96038`) and website `ef5ae8b4` moved the
Software Factory to teal (its review: `docs/agent-work/2026-11-07-factory-labels.md`).

State colours on the website: the factory run in the factory hero (green done or autonomous, amber
running, red error, purple human input, `hero-feed.ts`), the maturity curve (amber trap point,
green goal step, `FactoryMaturity.astro`), and green or red ticks in `ProofSections`,
`StandardSections` and `PrincipleRows`. None appears on home.

Elsewhere brand's category colours carry no website area: os gives its categories teal, purple
and slate (its name for ampersand) and the factory training format rust (`src/config.ts`),
documents set outcomes and module heads in purple, and slides set code-explainer section labels
in amber (`ContentSlide.tsx`, a category in a state colour, the slides repository's to fix). So
(c) changes brand's mark rule and the website, (b) adds three colours to every surface's palette,
(e) changes the website alone.

## Research

- WCAG 1.4.1 allows colour coding where another visual cue carries the same information
  ([W3C, Understanding 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
  Every variant passes: the area name or the link text names the destination. Colour alone fails
  only where nothing else is shown.
- Readers handle up to about six categories well, and performance falls beyond that
  ([arXiv 2508.17460](https://arxiv.org/abs/2508.17460)). The cue has five areas plus grey.
- A shape or icon needs a visible label next to it
  ([NN/g, Icon usability](https://www.nngroup.com/articles/icon-usability/)). The shapes in (c)
  sit beside the area name or a link text that names the place.
- Design systems use status colours mainly to show status
  ([CMS design system](https://design.cms.gov/foundation/theme-colors)). The blind review
  measured the cost of breaking that on this site directly (meaning score of (e)).

## Blind review

Medium, audience and size in every prompt: the public website, 1440 px desktop and 390 px phone,
read by CTOs, engineering leads and product managers. Neutral letters, a new order per run, the
current state scored alongside and never named. Criteria were fixed before any score.

Round 1, 16 runs (CTO, head of engineering, product manager, designer; Claude and Codex; two runs
each), each variant's whole pages plus 16 numbered links:

| Variant         | Calm | Room | Appeal | Meaning | Orientation | Overall |
| --------------- | ---- | ---- | ------ | ------- | ----------- | ------- |
| (c) shapes      | 7.31 | 8.00 | 7.50   | 5.94    | 8.69        | 7.94    |
| (b) five hues   | 7.00 | 8.00 | 7.69   | 6.62    | 8.56        | 7.69    |
| (a) today       | 8.31 | 8.06 | 6.50   | 5.75    | 6.19        | 6.88    |
| (e) amber-green | 6.56 | 7.94 | 7.56   | 3.81    | 8.50        | 6.19    |
| (d) label only  | 8.88 | 7.88 | 5.00   | 6.25    | 4.94        | 5.94    |

With the words readable, every reviewer placed all 16 links correctly in every variant.

Overall by model: Claude (c) 7.62, (b) 7.12, (a) 6.00, (e) 5.50, (d) 5.38; Codex (c) 8.25,
(b) 8.25, (a) 7.75, (e) 6.88, (d) 6.50. Noise, the difference between a reviewer's two runs:
0.55 on overall, 0.65 on meaning. An option's `noise` above is the gap between the two runs'
variant means.

Round 1's glance board reused the 16 read links, and reviewers matched them by layout: even (d)
scored 98 %. Round 2 therefore showed each variant's 16 links with their areas as a learning
board, then 11 links not on it, all text blurred and every area name set to one length:

| Variant         | Correct | Correct and unhedged | Missed                                                   |
| --------------- | ------- | -------------------- | -------------------------------------------------------- |
| (c) shapes      | 100%    | 100%                 |                                                          |
| (b) five hues   | 100%    | 100%                 |                                                          |
| (e) amber-green | 94%     | 77%                  | Podcast as Blog                                          |
| (a) today       | 86%     | 39%                  | Factory as Trainings, Knowledge base and Podcast as Blog |
| (d) label only  | 74%     | 0%                   | Knowledge base, Blog, Podcast                            |

Noise on correct-and-unhedged: 0.02. Same order with both models.

Every candidate keeps the site's rules except the one it tests: (b) adds colours outside the
palette, (c) adds mark shapes other than the square, (e) gives two categories state colours.
Not tested: a German page, the hover state, an icon per area (the shapes stand for it), and a
reader with a colour-vision deficiency (the shapes in (c) and the area names serve that reader;
(b) and (e) rely on hue).

## Why (c)

(c) and (b) tie on look (lead 0.25 inside the noise of 0.55) and both orient fully at a glance.
The tie goes to fewer exceptions. Brand's category rule has three colours and leaves a fourth
value neutral; the website's five areas outgrew it by sharing colours. (c) gives the rule a second
channel, a shape per value, and keeps the palette on every surface. (b) adds three colours to every
surface's palette, two of them near red and purple. (e) orients less well than either and costs the meaning of amber and green on
the pages that carry the factory run.

Two reviewer findings hold for every variant and are the website's to fix: purple also marks
"human input" in the factory run and the step numbers ("01 · Diagnose") on the factory step cards,
so purple means a place, a person and a sequence on one page.

## Reviewer prompt

Round 1, Claude, CTO, run 1, verbatim:

```text
You are the CTO of a 400-person software company in Germany. You are evaluating outside help to get your engineering teams productive with AI coding agents, and you browse vendor websites between meetings.

Medium: the public website of a consultancy that trains software teams on AI coding agents and builds agent-based delivery systems. Viewed in a desktop browser at 1440 px width and on a phone at 390 px width. Audience: CTOs, engineering leads and product managers deciding whether to hire this firm.

On this website a link to another part of the site can carry a destination cue: a small mark, a coloured edge, a small capitalised area name, or a mix of these. Below are 5 variants of the same site, labelled R, M, P, T, K. They differ only in how that cue is drawn. Read every image named below (absolute paths).

Variant R:
  read board: /tmp/claude/areacue/boards/R-read.png
  glance board: /tmp/claude/areacue/boards/R-glance.png
  desktop pages: /tmp/claude/areacue/boards/R-desktop1.png and /tmp/claude/areacue/boards/R-desktop2.png
  phone pages: /tmp/claude/areacue/boards/R-phone.png
[the same four lines for M, P, T and K]

Board contents:
- read board: 16 numbered links cut from the real pages at real size (1 image px = 1 CSS px).
- glance board: the same 16 links in a different order, with all text blurred so that it cannot be read, as a reader sees a link out of the corner of the eye. Colours and marks stay as they are.
- desktop and phone pages: whole sections of the home page, a service page, a blog post and the knowledge base. Desktop images are scaled from 1440 px to 1000 px wide.

Task 1, orientation. For each variant, look at its read board first, then its glance board. For every numbered link on each board, name the area of the site the link leads to, using only what the link itself shows. Choose one of: Trainings (includes Enablement), Software Factory, Blog, Knowledge base, Podcast, Other page on this site (About, Clients, Book and similar). On the glance board, use what you learned from that variant's read board. If you cannot tell, give your best guess.

Task 2, look. For each variant, score from 1 to 10 (10 best), judging the desktop and phone pages:
- calm: visual calm, nothing competes for attention without reason
- room: breathing room, not cramped
- appeal: the cue makes the pages more engaging and distinctive, not dull
- meaning: every colour on the pages means one thing; 10 = no colour seems to mean two different things (a place on the site and a status such as running, warning, success or error), 1 = colours are confusing
- orientation: how well you could tell, while browsing, where a link will take you
- overall: would you ship this variant
Then name in one short sentence per variant what keeps it below 10.

Answer with JSON only, no prose before or after, in this shape:
{"variants": {"<label>": {"read": {"1": "<area>", "...": "...", "16": "<area>"}, "glance": {"1": "<area>", "16": "<area>"}, "calm": 0, "room": 0, "appeal": 0, "meaning": 0, "orientation": 0, "overall": 0, "below10": "<sentence>"}}}
Use exactly these area names: Trainings, Software Factory, Blog, Knowledge base, Podcast, Other.
```

## What each choice changes

- (c): brand adds an ordered set of category mark shapes (square, diamond, circle, triangle, ring,
  bar; sizes beside a line) to the category rule in `tokens/tokens.css` and to the square rule in
  `tokens/marker.css`, in a minor release. The website maps its areas to them in
  `src/lib/destinations.ts` and draws them in `LinkRow.astro`, `Card.astro` and `patterns.css`.
  `brand-markers` measures list items and `.hw-marker` elements, which the
  website's swatch is not.
- (b): brand adds blue, pink and magenta with text and night variants (text on white: blue `#1d4ed8`
  6.70, pink `#be185d` 6.04, magenta `#a21caf` 6.32; the night variants on night 7.46, 7.16, 7.70) and names them category
  colours; the website maps the areas.
- (e): the website alone, against brand's category rule, which then needs a written exception for
  marketing surfaces.
- (a) or (d): nothing, or the website removes the square and the card edge.

---
kind: decision
status: decided
priority: 2
order: 410
area: brand
owner: Benedikt
evidence: "Blind review 08.11., round 3 (16 look and glance runs, 16 continuity runs) and round 4 (16 look runs), on the website's origin/main d4dc0734 with its brand pin v1.28.5, each variant injected as CSS into a throwaway clone; method, scores and the reviewer prompt in the body. Round 2's scores: this item's history (1b2eb0f)."
recommended: shapes-colour
options:
  - key: shapes-colour
    label: "(c+) One mark shape per area in today's colours, carried to the page as a mark before the H1"
    detail: "Trainings a teal square, Software Factory a teal diamond, Blog a purple dot, Knowledge base a purple triangle, Podcast a purple ring, other pages a grey bar. The link shows the mark (cards before their area name); the page it opens shows the same mark before the H1, hanging in the margin from 1024 px, inline on the phone. Best overall in round 3 (7.62), outside the noise against every variant but (x), in both runs and with both models. Links with a mark: 100 % of reviewers found the page a link opens, sure; 89 % placed an unread link at a glance. Recommended at the medium mark size of round 4 (0.42 em of the H1, about 24 px on desktop): overall 7.50, a tie with 0.3 em, and arrival 7.31 against 6.69. Reviewers: the triangle can read as a warning and the dot and ring as status lights."
    score: 7.62
    noise: 0
  - key: counter
    label: "(x) Independent counter-draft: shape and today's colour, a large mark inline at the start of the H1 and in the Resources tab, no mark for other pages"
    detail: "Drafted blind by a separate designer prompt. Best arrival in both rounds (8.50, 8.69), but the least calm (6.69): 30 of the 32 look runs of rounds 3 and 4 name the large marks competing with the headline, the extra line breaks they cause or the repeated mark in the tab bar. Without a mark for other pages, an unread link to About or Clients is placed sure in 5 of 16 runs (16 of 16 with the grey bar). Overall 7.12, inside the noise of (c+) in round 3 and of every variant in round 4."
    score: 7.12
    noise: 0.25
  - key: shapes-teal
    label: "(c) One mark shape per area, all in teal"
    detail: "Orients like (c+) (links with a mark 93 %) and looks calm (8.69), but 14 of 16 runs say the marks share their teal with the buttons and the factory run's status dot, so the small shapes carry the whole difference. Overall 6.88."
    score: 6.88
    noise: 0
  - key: today
    label: "(a) Today: teal for Trainings and Software Factory, purple for Blog, Knowledge base and Podcast, grey for the rest; on the page the area's name above the H1"
    detail: "Every link reaches its page once its words are read. Without the words, reviewers placed only 29 % of links with a mark sure at a glance, and found the page a Trainings or Software Factory link opens sure in half the runs (8 of 16 per link): both pages carry the same teal. Calmest with (c). The area name above the H1 goes if the website takes its own recommendation of no line above any H1 (decide-eyebrow-concept)."
    score: 6.62
    noise: 0.25
  - key: hues
    label: "(b) One colour per area: Software Factory blue #1d4ed8, Knowledge base olive #625114, Podcast rose #b42587, the rest as today"
    detail: "The hypothesis this round tested: the colour carried from the link to the page. It does carry (links with a mark 94 %, the same as (c+)), but it scores lowest on meaning (6.00) and below today overall (6.50). Reviewers: six colours on one square read like a status legend, 5 of 16 runs read the olive as a warning, teal and blue and purple and rose are hard to tell apart at 10 px. Adds three colours to every surface's palette. The hues are this round's fix of round 2's: each sits at least 14.5 ΔE (OKLab ×100) from teal, purple and the three state colours (round 2: 9.7), and passes AA as text on white and as its night variant on Night."
    score: 6.5
    noise: 0
images:
  shapes-colour:
    - src: shapes-colour-medium-pages.jpg
      caption: "(c+) at the recommended mark size (0.42 em), the page a link opens, 1440 px: a training, the Software Factory, a knowledge base entry, a blog post, a podcast episode. Prices hidden."
    - src: shapes-colour-medium-phone.jpg
      caption: "(c+) at 0.42 em, phone, 390 px: five such pages"
    - src: shapes-colour-pages.jpg
      caption: "(c+) at 0.3 em, as round 3 scored it"
    - src: shapes-colour-phone.jpg
      caption: "(c+) at 0.3 em, phone"
    - src: shapes-colour-home.jpg
      caption: "(c+) home, 1440 px scaled to 1000: hero link, training cards, Software Factory row, book and blog cards"
    - src: shapes-colour-continuity.jpg
      caption: "(c+) continuity question as reviewers saw it: a Software Factory link, then three pages with all text blurred"
  counter:
    - src: counter-pages.jpg
      caption: "(x) pages, 1440 px"
    - src: counter-phone.jpg
      caption: "(x) phone, 390 px"
    - src: counter-continuity.jpg
      caption: "(x) continuity question"
  shapes-teal:
    - src: shapes-teal-pages.jpg
      caption: "(c) pages, 1440 px"
    - src: shapes-teal-phone.jpg
      caption: "(c) phone, 390 px"
    - src: shapes-teal-continuity.jpg
      caption: "(c) continuity question"
  hues:
    - src: hues-pages.jpg
      caption: "(b) pages, 1440 px"
    - src: hues-phone.jpg
      caption: "(b) phone, 390 px"
    - src: hues-home.jpg
      caption: "(b) home, 1440 px scaled to 1000"
    - src: hues-continuity.jpg
      caption: "(b) continuity question"
  today:
    - src: today-pages.jpg
      caption: "(a) pages, 1440 px"
    - src: today-phone.jpg
      caption: "(a) phone, 390 px"
    - src: today-continuity.jpg
      caption: "(a) continuity question: two of the three pages carry the same teal"
decision: shapes-colour
by: Benedikt
quote: '"(c+) eine Form pro Bereich, heutige Farben, dieselbe Form vor der H1 der Zielseite (Empfehlung)" bau das mal dann kann ich es mir anschauen ist auch ok wen nes deployed wird ich schaue es mir dann live an.'
---

# Does the area cue carry from the link to the page it opens?

Blocks the mark before each H1 and on links. Nothing is built until you pick.

Only if the page shows the link's mark again. Round 2's shapes lived on links alone, so a reader
who followed a diamond found no diamond on arrival. Put the same mark before the page's H1 and a
shape per area carries as well as a colour per area: with the words blurred, reviewers found the
page a marked link opens, sure, in 100 % of cases for both. Shapes in today's colours look better
(7.62 against 6.50) and add no colour: recommended, with a medium mark (0.42 em).

## What the page shows today

The website sets the area on `<body data-area>` (`src/layouts/Layout.astro`), and three things on
the page take its colour: the area's name above the H1 (`[data-hero-eyebrow]` in
`src/components/ui/PageHero.astro`), the bar under the current header item (`Nav.astro`) and, on
Blog, Knowledge base and Podcast, the bar under the current tab (`SectionBar.astro`). Trainings and
the Software Factory share one header item and one teal, so nothing but the H1's words tells those
pages apart. The line above the H1 may go (website `decide-eyebrow-concept`).

## Research

- Users judge a link from its label, its context and their prior experience, and a weak cue gets
  overlooked ([NN/g, Information scent](https://www.nngroup.com/videos/information-scent/)).
- A site shows where the reader is through several cues at once: the current navigation item, the
  headings, breadcrumbs and, on sites with sharply distinct content, colour per section. People
  overlook subtle changes, so a colour shift alone may go unnoticed
  ([NN/g, You are here](https://www.nngroup.com/articles/navigation-you-are-here/)).
- Colour-coded sections apply one colour per section to every space in it; small elements take
  bolder colours, and a colour that matters needs a non-colour cue beside it
  ([Tidwell, Color-coded sections](https://www.mit.edu/~jtidwell/language/color-coded_sections.html)).
- The BBC gives each service a core colour that identifies it, applied in the service's lockup and
  across graphical elements such as icons and progress indicators
  ([BBC Simorgh, service colours](https://raw.githubusercontent.com/bbc/simorgh/latest/docs/User-Experience/service-colours.mdx)).

The strongest landing anchor these sources support is the link's own mark repeated at the top of
the page, beside the heading, with the navigation's current item as the second cue. Every variant
but today puts its mark before the H1 and keeps the header bar and the tab bar in the area's colour.

## Blind review

Medium, audience and size in every prompt: the public website, 1440 px desktop and 390 px phone,
read by CTOs, engineering leads and product managers. Personas: CTO, head of engineering, product
manager, designer; Claude and Codex; two runs each. Neutral letters and paths, a new order per run,
today's site scored alongside and never named. Criteria and the decision rule were written before
any score. Every candidate keeps the site's rules except the one it tests, and drops the line above
the H1 (today keeps it): (b) adds colours, (c), (c+) and (x) add mark shapes other than the square.

Three tests per variant: (i) glance, 13 unseen links with their text blurred after a learning board
of 12; (ii) continuity, 10 questions, each a readable link and three pages it might open with all
text blurred and photos hidden (5 desktop, 5 phone; the distractors are the confusable areas);
(iii) look, 1 to 10 per criterion.

Round 3, 32 runs (16 look and glance, 16 continuity):

| Variant          | Calm | Room | Appeal | Meaning | Arrival | Overall |
| ---------------- | ---- | ---- | ------ | ------- | ------- | ------- |
| (c+) shapes      | 8.38 | 8.50 | 7.25   | 7.31    | 7.44    | 7.62    |
| (x) counter      | 6.69 | 7.44 | 7.75   | 7.12    | 8.50    | 7.12    |
| (c) shapes, teal | 8.69 | 8.50 | 6.19   | 6.19    | 6.81    | 6.88    |
| (a) today        | 8.69 | 8.06 | 5.69   | 6.19    | 7.44    | 6.62    |
| (b) hues         | 7.25 | 8.50 | 6.88   | 6.00    | 7.00    | 6.50    |

Overall by model: Claude (x) 7.50, (c+) 6.88, (c) 6.25, (b) 5.75, (a) 5.38; Codex (c+) 8.38,
(a) 7.88, (c) 7.50, (b) 7.25, (x) 6.75. Noise, the difference between a reviewer's two runs:
overall 0.55, arrival 0.47, meaning 0.82. An option's `noise` above is the gap between its two
runs' means.

Orientation, share of answers both correct and sure:

| Variant          | Glance | Continuity | Both | All links | Rows without any mark: glance, continuity |
| ---------------- | ------ | ---------- | ---- | --------- | ----------------------------------------- |
| (c+) shapes      | 89 %   | 100 %      | 94 % | 74 %      | 12 %, 75 %                                |
| (b) hues         | 89 %   | 100 %      | 94 % | 74 %      | 12 %, 75 %                                |
| (c) shapes, teal | 88 %   | 100 %      | 93 % | 73 %      | 12 %, 75 %                                |
| (x) counter      | 72 %   | 100 %      | 85 % | 67 %      | 12 %, 69 %                                |
| (a) today        | 29 %   | 64 %       | 45 % | 42 %      | 12 %, 75 %                                |

Glance, continuity and both leave out the "Keep learning" rows, which carry no mark in any variant.
(x) gives links to other pages no mark either; they stay in, which is why its glance figure falls.

Counting guesses, 95 % of glance and 99 to 100 % of continuity answers were right in every variant:
without the words, readers place most links by layout but are sure only where the cue tells them.
The "Keep learning" rows on training and blog pages carry no mark in any variant, only the area's
name under the link, and fail at a glance everywhere (last column).

The decision rule, written before any score, asked for 90 % correct and sure over all links and,
where no variant reaches it, ranks all variants by overall. None reaches it, because of those rows,
so overall decides: (c+) leads (c) by 0.74 and (b) by 1.12, outside the noise of 0.55 in both runs
and with both models, and leads (x) by 0.50, a tie. (c+) and (x) add the same exception, the shape
set, so the tie rule does not separate them. Read over the links with a mark only, (c+), (b) and (c)
reach 90 % and (x) does not; that reading was not part of the rule.

The most frequent reason (c+) stays below 10, in 7 of 8 Claude runs: the mark before the H1 is too
small to say where you landed. Round 4 tested that one cause, 16 runs, look only:

| Variant                 | Calm | Arrival | Overall |
| ----------------------- | ---- | ------- | ------- |
| (c+) mark 0.42 em       | 8.06 | 7.31    | 7.50    |
| (c+) mark 0.3 em        | 8.69 | 6.69    | 7.38    |
| (x) mark 0.5 em, inline | 6.69 | 8.69    | 7.19    |

Noise: overall 0.46, arrival 0.46, calm 0.29. Overall is a three-way tie, and the three trade calm
for arrival in steps outside the noise. All three add the same exception (the shape set), so the
exception rule does not decide. Recommended: 0.42 em, my judgement from three readings: it buys
arrival outside the noise for calm still above 8, keeps the links (c+) was measured with, and does
not repeat (x)'s headline line breaks.

## Reviewer prompt

Round 3, look and glance part, Claude, CTO, run 1, verbatim:

```text
You are the CTO of a 400-person software company in Germany. You are evaluating outside help to get your engineering teams productive with AI coding agents, and you browse vendor websites between meetings.

Medium: the public website of a consultancy that trains software teams on AI coding agents and builds agent-based delivery systems. Viewed in a desktop browser at 1440 px width and on a phone at 390 px width. Audience: CTOs, engineering leads and product managers deciding whether to hire this firm.

On this website a link into another area of the site can carry a cue (a small mark, a coloured edge, a small capitalised area name, or a mix), and the page it opens can carry one too. Below are 5 variants of the same site, labelled […]. They differ only in these cues. Read every image named below (absolute paths).

[per variant: learning board, glance board, desktop home, desktop pages, phone home, phone pages, each a path /tmp/ac3/blind/<random id>/<board>.png]

Board contents:
- learning board: links cut from the real pages at real size, each with the area it leads to written above it.
- glance board: 13 other numbered links, with all text blurred so that it cannot be read, as a reader sees a link out of the corner of the eye.
- desktop home: three sections of the home page, scaled from 1440 to 1000 px wide. Phone home: three sections at 390 px.
- desktop pages: the first screen of five pages the links lead to, 1440 px scaled to 700 px each. Phone pages: the same five pages' first screens at 390 px.

Task 1, glance. For each variant, study its learning board, then name for every numbered link on its glance board the area it leads to, using only what the link shows, and whether you are sure or guessing. Areas: Trainings, Software Factory, Blog, Knowledge base, Podcast, Other (Other: About, Clients, Book and similar pages).

Task 2, look. For each variant, score from 1 to 10 (10 best), judging the home and page images:
- calm: visual calm, nothing competes for attention without reason
- room: breathing room, not cramped
- appeal: the cues make the pages more engaging and distinctive, not dull
- meaning: every colour and every mark means one thing; 10 = nothing seems to mean two different things (such as a place on the site and a status such as running, warning, success or error)
- arrival: on a page you opened, how well you can tell which area of the site you are in
- overall: would you ship this variant
Then name in one short sentence per variant what keeps it below 10.

Answer with JSON only, no prose before or after, in this shape:
{"variants": {"<label>": {"glance": {"1": {"area": "<area>", "sure": true}, "...": "...", "13": {"area": "<area>", "sure": false}}, "calm": 0, "room": 0, "appeal": 0, "meaning": 0, "arrival": 0, "overall": 0, "below10": "<sentence>"}}}
Use exactly these area names: Trainings, Software Factory, Blog, Knowledge base, Podcast, Other.
```

The continuity part asked, per question image: "for every question, say which of the three pages
the link leads to (1, 2 or 3), using only what you see, and whether you are sure or guessing."

A first pass of round 3 named each variant's folder in the image paths (one of them `today`), so a
reviewer could tell the current site. It was discarded and rerun with random folder names; its
order was the same.

## Open points the next round or the website takes up

- The "Keep learning" rows carry no mark in any variant. Under every choice except (a) they need
  the mark before their area name.
- A linked card without an area name (the enablement page's Software Factory card) shows only its
  coloured edge: under (c+) a teal edge, which reads as Trainings (2 of 16 sure). It needs the mark
  before its title.
- Reviewers read the purple triangle as a warning and the dot and ring as status lights (round 4,
  10 of 16 runs name one of them). Not yet tested: other shapes for Knowledge base and Podcast.
- Not tested: a German page, the hover state, a reader with a colour-vision deficiency, and the
  shape set on the other surfaces that use brand's category colours (os, documents, slides).

## What each choice changes

- (c+): brand adds the ordered set of category mark shapes (square, diamond, dot, triangle, ring,
  bar; sizes beside a line and beside an H1) to the category rule in `tokens/tokens.css` and the
  square rule in `tokens/marker.css`, in a minor release. The website maps its areas to them in
  `src/lib/destinations.ts`, draws them in `LinkRow.astro`, `Card.astro` and `patterns.css`, adds
  the mark before the H1 in `PageHero.astro`, and takes up the first two open points.
- (x): as (c+), with the larger inline mark and a mark in `SectionBar.astro`.
- (c): as (c+), and the website gives every area teal.
- (b): brand adds blue, olive and rose with text and night variants (text on white: blue 6.70,
  olive 7.76, rose 5.91; night variants `#6894f5`, `#a9975d`, `#e85ab5` on Night: 6.45, 6.57,
  5.92) and names them category colours; the website maps the areas and adds the mark before the
  H1.
- (a): nothing.

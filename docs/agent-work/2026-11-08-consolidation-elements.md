# Navigation list, filter value, search field, list filter and list row: the reviews

Brand v1.47.0 takes the components several systems built on their own into the shared elements:
`hw-nav`, `hw-choice`, `hw-search`, `ListFilter.astro` over `elements/list-filter.ts`,
`ListRow.astro`, the row's current state, the round icon control's pressed and quiet variants,
the dense button at 38 px and the pill's 24 px remove target. Four visual questions were open; each
was rendered and scored blind before a value was set.

## Method

Medium review per question: two personas from the surface's readers, Claude (`opus`) and Codex
(`gpt-6.1-sol`, high), two runs each, so noise is measured. Every candidate drawn with the brand's
current elements, only the tested rule changed. Screens at real size: the apps at 1440 x 900 at 1:1,
the website on a phone at 390 x 844 CSS px at 2x, a slide at 1440 x 810. Neutral letters, a shuffled
image order per reviewer, the current look scored alongside. Noise is the mean of |run 1 − run 2|
over every reviewer and variant. A lead counts only outside the noise with both models; a tie keeps
the variant with fewer marks or no change.

Personas: a freelance trainer preparing a delivery in the trainer hub; the operations lead of a
small consultancy working in the company's internal system all day; an engineering manager
shortlisting a training on the website; a senior developer sent the training list by their manager.

## Scores

Mean overall and mean of criteria (1 to 10) over all runs; per model the overall of run 1 / run 2.

| Question                                   | Variant                    | Overall | Criteria | Claude    | Codex     |
| ------------------------------------------ | -------------------------- | ------: | -------: | --------- | --------- |
| Current page in the sidebar (app, dense)   | tint (kept)                |    8.13 |     8.35 | 8.0 / 7.5 | 8.5 / 8.5 |
|                                            | bar                        |    7.38 |     7.94 | 7.0 / 6.5 | 8.0 / 8.0 |
|                                            | tint and bar               |    8.38 |     8.42 | 8.0 / 8.0 | 8.5 / 9.0 |
| Noise: criteria 0.22, overall 0.25         |                            |         |          |           |           |
| Chosen filter value (app, dense)           | square tint (the hub's)    |    7.00 |     7.80 | 6.0 / 6.0 | 8.0 / 8.0 |
|                                            | square fill (kept)         |    8.13 |     8.45 | 7.5 / 7.0 | 9.0 / 9.0 |
|                                            | round fill (the website's) |    8.38 |     8.54 | 8.0 / 8.0 | 9.0 / 8.5 |
|                                            | segmented strip            |    7.88 |     8.27 | 7.5 / 7.0 | 8.5 / 8.5 |
| Noise: criteria 0.15, overall 0.31         |                            |         |          |           |           |
| Chosen filter value (website, phone)       | square tint                |    7.88 |     8.54 | 7.5 / 7.5 | 8.5 / 8.0 |
|                                            | square fill (kept)         |    8.75 |     8.84 | 8.0 / 9.0 | 9.0 / 9.0 |
|                                            | round fill                 |    8.50 |     8.80 | 8.0 / 8.0 | 9.0 / 9.0 |
|                                            | segmented strip            |    7.25 |     7.79 | 6.5 / 7.0 | 8.0 / 7.5 |
| Noise: criteria 0.39, overall 0.31         |                            |         |          |           |           |
| Applied-filter and tag text (dense)        | 12 px (kept)               |    7.50 |     7.75 | 7.0 / 7.0 | 8.0 / 8.0 |
|                                            | the UI step (13 or 14 px)  |    8.00 |     8.02 | 7.0 / 7.0 | 9.0 / 9.0 |
| Noise: criteria 0.16, overall 0.00         |                            |         |          |           |           |
| Primary button on night (site, slide, app) | teal, white text (kept)    |    7.75 |     8.19 | 7.0 / 7.0 | 8.5 / 8.5 |
|                                            | teal-night, night text     |    8.38 |     8.42 | 8.0 / 7.5 | 9.0 / 9.0 |
| Noise: criteria 0.27, overall 0.38         |                            |         |          |           |           |

## Decisions

- Current page: the tint stays. Tint and bar lead by 0.25 overall at noise 0.25, a tie; the bar
  alone trails outside the noise.
- Filter value: the square fill, the segmented control's chosen state. It ties with the round fill
  (0.25 at noise 0.31 in the app, −0.25 on the phone); the models split, Claude preferring round
  and Codex square, and the square shares the corner of every other control. The tint the hub drew
  trails by 1.13 in the app, outside the noise.
- Applied-filter text: no change. The UI step leads only with Codex; Claude scores both 7 in every
  run for both personas, so the lead is not outside the noise with both models.
- Night primary button: no change. Its overall lead of 0.63 sits outside the noise of 0.38, but its
  criteria lead of 0.23 sits inside 0.27, and with Codex the manager's criteria favour the teal
  (9.17 / 9.00 against 9.00 / 9.00).

Surfaces scored for the shared values: the trainer hub (dense, 14 px), Company OS (dense, 13 px),
the website on a phone and on a laptop at night, a slide at night. Skipped: documents (no filter
or night button on paper) and admin (dense like OS, the same values).

Every reviewer's open question named the mock's content (a sidebar page beside a list titled
"Units"), the same in every variant, not the elements.

## Reviewer prompt, verbatim (the operations lead, filter value in the app; paths shortened)

```text
You are the operations lead of a small software consultancy. You work in the company's internal operating system all day on a laptop: lists of deals, deliveries and people, filtered and searched dozens of times a day.

Medium: an internal web app on a laptop screen, 1440 x 900 px, shown at 1:1, read at laptop distance. Audience: you. Context: the units list with a search and one topic chosen (you arrive from the Library menu; the step after it is opening one unit). Each version is shown in the day theme and the night theme.

Versions R, Z, K, H, each shown as 2 screens (day, night); the file name starts with the version's letter. Images (read every one):
<scratch>/choice-app/K-day.png
<scratch>/choice-app/H-night.png
<scratch>/choice-app/K-night.png
<scratch>/choice-app/Z-day.png
<scratch>/choice-app/Z-night.png
<scratch>/choice-app/R-night.png
<scratch>/choice-app/H-day.png
<scratch>/choice-app/R-day.png

Score each version on each criterion from 1 (poor) to 10 (excellent), then an overall score from 1 to 10:
1. Chosen: which topic is chosen is obvious at once.
2. Affordance: the topics read as clickable filters.
3. Counts: the number beside each topic reads without effort.
4. Legibility on a laptop.
5. Breathing room: nothing cramped.
6. Visual calm: nothing competes for attention.
7. Coherence: topics, buttons and tags look like one family.

Answer in this exact form, one block per version:
<letter>: c1=<n> c2=<n> c3=<n> c4=<n> c5=<n> c6=<n> c7=<n> overall=<n>
  keeps it below 10: <one sentence per criterion that is below 10>
Then one line: "Open question: <the question the screens leave open for you>".
Judge only what you see. Do not ask questions. Do not edit any file.
```

Review: medium, because shared elements every system renders, current looks scored alongside.

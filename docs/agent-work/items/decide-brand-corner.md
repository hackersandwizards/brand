---
kind: decision
status: open
priority: 2
order: 215
area: brand
owner: Benedikt
evidence: "Blind review 11.11., 20 runs: five personas, Claude and Codex, two runs each, renders changed in the browser on the live and served pages. Report: docs/agent-work/2026-11-11-brand-corner.md."
recommended: single
options:
  - key: today
    label: "Keep: the brand corner on every card, button, callout, code block and dialog"
    detail: "Website home 32 brand corners, offer 8, trainer hub home 8, a talk deck 0.8 to 2.5 per slide. Last or tied for last on every surface with Claude; mean of the five panels 7.17. Changes nothing."
    score: 6.12
    noise: 1.0
  - key: moments
    label: "Only on brand moments: primary call to action, hero panel, title and closing slide, document cover; none in internal tools"
    detail: "Website home 32 to 4, offer 8 to 1, internal tools 0. First for the buyer (8.75) and with Codex on the website, but the colleagues score it below single with both models. Needs a list of moments per surface. Mean of the five panels 8.12."
    score: 7.62
    noise: 1.0
  - key: one-class
    label: "One element class per surface: buttons on screens, callouts in slides and documents"
    detail: "Website home 32 to 5. First for the website visitor with Claude (8.17), last but one across surfaces (6.75, noise 3.0). Mean of the five panels 7.95."
    score: 6.75
    noise: 3.0
  - key: not-internal
    label: "None in os, the trainer hub and admin; decks, documents and websites as now"
    detail: "Scores as today outside the internal tools and as moments inside them; the colleagues prefer single over none with both models. Mean of the five panels 7.48."
    score: 7.62
    noise: 1.0
  - key: single
    label: "Only where it stands alone: never on a card, tile or button that repeats in a grid, list or row"
    detail: "Website home 32 to 5 (the header's Get an offer and the hero panel keep it, the hero's pair of buttons loses it), offer 8 to 6, trainer hub home 8 to 2, os unchanged. First for the colleagues with both models and across surfaces; tied with the other reductions on website, documents and slides. One rule for every surface. Mean of the five panels 8.44."
    score: 8.75
    noise: 1.0
images:
  today:
    - src: today.jpg
      caption: "Website hero and training rows, a slide, the offer, the trainer hub and admin, today"
  moments:
    - src: moments.jpg
      caption: "The same six views, brand moments only"
  one-class:
    - src: one-class.jpg
      caption: "The same six views, one element class per surface"
  not-internal:
    - src: not-internal.jpg
      caption: "The same six views, none in the internal tools"
  single:
    - src: single.jpg
      caption: "The same six views, never on a repeated item"
---

# Where does the brand corner belong?

Pick one rule for the brand corner across every surface; the report recommends `single`.

The question exists because of what you wrote on 11.11.: "also ich bin bei unseren brand borders
von den ganzen elementen noch sehr skeptisch. wir setzen die zu oft ein. das soll ja ein besonderes
element sein. und vor allem visuell auf marketing seiten durchkommen und nicht in internen systemen.
das sollten wir noch mal ganzheitllich bewerten lassen und den overuse drastisch reduzieren sonst
wird das element ja nicht besonders. das ist allerdings auch nur meine meinung. hier fehlt eine
übergreifende review und bewertung über docs, slides, websites usw." Earlier that day, on the form
elements: "die brand border sollten wir sehr deliberate und nur selten einsetzen dort wo es visuell
sinnvoll ist." Reading "brand border" as the asymmetric brand corner is Ada's framing. Form fields
lose the corner in any case; that is decided and runs separately.

The review backs the reduction: with Claude today scores below single on every surface. It does
not back "none in internal systems": the colleagues' panel scores `single` above `moments` and
`not-internal` with both models (Claude 8.38 against 7.00, Codex 8.94 against 8.44, noise 0.25 at
most), and os alone keeps its lone buttons' corner with both models. On the website, documents and slides the reductions tie; `single` takes the tie as the one
rule with no exception per surface. Score is the brand designer's cross-surface panel; per surface:

| Panel                        | today | moments | one-class | not-internal | single |
| ---------------------------- | ----- | ------- | --------- | ------------ | ------ |
| Website visitor              | 7.17  | 8.33    | 8.50      | 7.17         | 8.00   |
| Buyer, offer and onepager    | 6.81  | 8.75    | 7.75      | 6.81         | 8.38   |
| Talk audience, slides        | 8.07  | 8.16    | 8.43      | 8.07         | 8.43   |
| Colleague, internal tools    | 7.69  | 7.72    | 8.34      | 7.72         | 8.66   |
| Brand designer, all surfaces | 6.12  | 7.62    | 6.75      | 7.62         | 8.75   |

With `single`, the work is M in brand, website and slides, S in documents, admin, practitioners
and the trainer hub (after its pin moves from v1.64.0), and nothing in os, certificate-verifier,
mail, hycle and the personal site. The report lists the elements per repository. Unscored and the
next round's candidate: `single` with the primary call to action kept.

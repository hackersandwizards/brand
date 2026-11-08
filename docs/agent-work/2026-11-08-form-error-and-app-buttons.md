# Two reviews of 08.11.: the form error on phones, and the apps' buttons and filter pills

Both reviews were blind. Reviewers saw neutral letters in a fresh order each, never which version
is today's, who made it, or why it was built. Scores run from 1 to 10. Noise is the mean gap
between two runs of the same reviewer.

## The form error on a phone (`hw-field-row` without `data-joined`)

Medium: the certificate verifier's home page and a brand form built from the same parts, at
390 px, device scale 2, right after a submit with an empty field. Persona: a certificate holder
checking the certificate on the phone. Claude and Codex, two runs each.

| Version                                               | Overall (4 runs) | Criteria mean |
| ----------------------------------------------------- | ---------------: | ------------: |
| Error between field and button (the button goes last) |             9.00 |          9.30 |
| Field and button side by side, error under the row    |             8.00 |          8.50 |
| Today: button under the field, error under the button |             7.50 |          8.05 |
| Joined row with an arrow button                       |             7.00 |          7.65 |

Noise 0.25. The lead of 1.5 over today holds in every run and with both models. Shipped in
`elements/field.css`: inside an `hw-form-field`, the stacked row's button follows the error
message, 0.75 rem below it, with no change to the markup. Side by side cut the placeholder
off at 390 px; the joined row's arrow button left the next step unclear.

## The apps' buttons and applied filters (dense scale)

Medium: a deals list in the operations app at 1440 px, light, shown full at 1:1 and as a crop at
device scale 2. Personas: an operations lead and a trainer. Claude and Codex.

Round 1, two runs each (8 runs per version):

| Version                                                         | Overall | Criteria mean |
| --------------------------------------------------------------- | ------: | ------------: |
| Today: `.btn-primary`, `.btn-secondary`, `.filter-chip`         |    8.38 |          8.55 |
| `hw-button` at a dense size (38 px, ui step), `hw-pill` filters |    8.00 |          8.07 |
| `hw-button` at its own size (44 to 48 px), `hw-pill` filters    |    6.88 |          7.08 |

Noise 0.67. The button at its own size is too large for a desk tool in every reviewer's notes and
loses in both models. Most notes on the two `hw-pill` versions named the remove × in the UA link
blue: `hw-pill-remove` took its colour from the link or button rather than the pill, so
`pill.css` now gives it `color: inherit` and brand-elements measures its fill.

Round 2, the × fixed, one run per reviewer (4 runs per version):

| Version                       | Overall | Criteria mean |
| ----------------------------- | ------: | ------------: |
| Today                         |    8.00 |          8.15 |
| `hw-button` at the dense size |    8.00 |          8.20 |

A tie inside the noise goes to the version with fewer exceptions: the dense size is a setting of
the shared button in `scales.css`, today's buttons are a second button beside it. Shipped:
`[data-hw-scale="dense"]` gives `hw-button` 38 px in the ui step, `hw-button` gained a disabled
state, and `expert.css` drops `.btn-primary` and `.btn-secondary`. Surfaces scored: the dense apps
in light. Not scored: night, and the admin app.

## One reviewer prompt, verbatim (round 1, image paths shortened)

```text
You are an operations lead who works in the company's internal operations system all day: deals, invoices, assignments.

Medium: an internal web app on a 1440 px wide desktop screen, read at desk distance. Context: the deals list of the company's operations system, with two filters applied, three rows and a small note form for the selected row. The step before: you opened the list from the header; the step after: you open a deal or add the note. Each version is shown as the full screen at 1:1 ("full") and as a crop of its top at device scale 2 ("detail").

Versions: Q, V, W. Images (read every one with the Read tool or as attached):
<scratch>/V-full.png
<scratch>/V-detail.png
<scratch>/W-full.png
<scratch>/W-detail.png
<scratch>/Q-full.png
<scratch>/Q-detail.png

Score every version on each criterion from 1 (poor) to 10 (excellent), then an overall score from 1 to 10:
1. Clear actions: the main action and the secondary action are found at once and told apart.
2. Filters: the applied filters read as filters, and removing one or all is obvious.
3. Density fit: the controls suit a work tool used all day at a desk, neither oversized nor cramped.
4. Breathing room and visual calm: nothing cramped, nothing competing.
5. Coherence: buttons, filter tags and value tags look like one family on this page.

Answer in this exact form, one block per version:
<letter>: c1=<n> c2=<n> c3=<n> c4=<n> c5=<n> overall=<n>
  keeps it below 10: <one sentence per criterion that is below 10>
Then one line: "Open question: <the question the screen leaves open for you>".
Judge only what you see. Do not ask questions.
```

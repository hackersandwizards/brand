# Quote and callout, priority pills, signature links: blind reviews, 10.11.2026

Three visual questions from the cross-surface brand review, each scored blind before any change.
Reviewers ran headless from a scratch folder outside every checkout, with neutral letters as
labels and the file order shuffled per reviewer. No prompt named a version, an author or a date.
Scale 1 to 10.

## 1. The quote and the callout shared one purple bar

The quote is a purple rule; the callout was a rule of its hue plus a 7 % fill, so a purple callout
read as a quote. Variants, on the surfaces that render each element:

- **R**: today's quote and callout.
- **K**: the callout without its rule (fill and corner only). The quote is unchanged.
- **M**: the quote's rule in neutral grey. The callout is unchanged.

The surfaces were documents' built offer and one-pager (print scale); slides' built stories (a
quotation, a grid of quotes, a cards-and-callout slide with a purple callout); and an app handbook
page on brand's own CSS at the dense scale, day and night. Each variant was injected as a stylesheet
over the built page, and every image was downscaled to 1000 px. Before scoring, each reviewer named every
ruled or tinted block (quote, summary, outcome, note). The criteria, fixed first: told apart,
calm, breathing room, fit for the reader, overall.

Overall, round 1:

| Reviewer                   | K   | M   | R   |
| -------------------------- | --- | --- | --- |
| Claude, offer reader       | 8.5 | 8.0 | 7.0 |
| Claude, workshop attendee  | 8.3 | 7.7 | 7.6 |
| Claude, operations lead    | 8.9 | 8.6 | 8.4 |
| Claude, design lead, run 1 | 8.6 | 8.0 | 7.9 |
| Claude, design lead, run 2 | 8.6 | 7.9 | 7.9 |
| Codex, offer reader        | 9.0 | 9.1 | 8.1 |
| Codex, design lead         | 8.9 | 8.6 | 8.4 |

Noise (the design lead's two Claude runs): 0.1 on the overall. K leads R by 0.85 (Claude) and 0.7
(Codex), outside the noise with both models. The reason every Claude reviewer named for K: a bar
means someone's words, a tint means a box. Their reasons against K: without its rule the 7 % tint
almost vanishes at night and is pale on a projector. Their reasons against M: the grey quote rule
is too faint on a projector.

Round 2 fixed that cause: **Z** is K with the fill at 10 % in day and 14 % at night. The current
state was scored again as **T**, but its slide image was captured blank (a capture defect: it came
first in the run, and slides' `dist` predates the capture), so T's round-2 scores are void and R's
round-1 scores stand for it.

| Reviewer                   | W (= K) | Z    |
| -------------------------- | ------- | ---- |
| Claude, workshop attendee  | 7.5     | 8.5  |
| Claude, operations lead    | 7       | 8    |
| Claude, design lead, run 1 | 8       | 8.75 |
| Claude, design lead, run 2 | 7       | 8    |
| Codex, design lead         | 9.4     | 9.4  |
| Codex, operations lead     | 8.5     | 9.0  |

Z leads in all four Claude runs by 0.75 to 1.0, at about the noise of this round (the design lead's
runs differ by 1.0 for W and 0.75 for Z), and ties or leads with Codex. Neither variant is an
exception to a shared value, so the tie rule does not decide. Z is built because it removes the
cause round 1 named. What still keeps Z below 10 belongs to the slide's layout, not the element:
the callout ends short of the card row and sits close under it.

Skipped combinations: the website, the verifier, practitioners and mail at the screen scale; os and
admin from their own builds (the app page here is a mock on brand's CSS); the night theme of every
surface that has none.

The prompt of the round-1 design lead, verbatim except the file list:

```text
You are a brand design lead who audits how one brand's elements read across print, slides and web apps.

You compare three versions, K, M and R, of the same pages. Each version styles two kinds of block differently: a block that quotes a person or a source, and a box that sums up, notes or states an outcome. The pages are: a printed A4 offer and a one-page summary (PDF, read on a desktop screen at about 100 %, file names "print-*"); slides projected in a meeting room (1920 px wide stage shown at 1000 px, "slide-*"); and an internal web app for a small team: a handbook page, day and night theme (desktop, "apps-*"). Every image is downscaled to 1000 px on its long side. Each file name says the version and the page.

Open every file below with the Read tool before you answer:
- (21 images, 3 versions × 7 pages, shuffled)

Before scoring, for each version and each page, name every block that has a rule, a bar or a tint as one of: QUOTE (someone's words), SUMMARY, OUTCOME, NOTE, OTHER, the way a first-time reader would read it at a glance, and quote its first three words.

Then score each version K, M and R separately per page or theme, on a scale of 1 to 10:
1. Told apart: a quotation and a summary/outcome box are told apart at a glance.
2. Visual calm.
3. Breathing room, not cramped.
4. Fit for the reader of that page.
5. Overall.

Then, for every score below 10, say in one line what keeps it below 10.
```

## 2. P1's tint against the grey P2

The test page was a decision-list mock at the dense scale on brand's CSS, day and night, at 2x for a 1100 px window. Variants:
**G** is today's P1; **J** has a stronger P1 fill (24 % day, 32 % night); **N** has amber P1 text at night (6.24:1).
A variant with amber text in day was dropped before scoring because it measured 4.08:1, below AA.

| Reviewer                       | G   | J   | N   |
| ------------------------------ | --- | --- | --- |
| Claude, operations lead, run 1 | 6   | 5   | 6   |
| Claude, operations lead, run 2 | 6.5 | 5.5 | 6   |
| Claude, design lead            | 6.5 | 5.5 | 6   |
| Claude, new team member        | 5   | 4   | 5   |
| Codex, operations lead         | 8   | 8   | 7.5 |
| Codex, design lead             | 8   | 7.5 | 7.5 |

Noise: 0.5. No variant beats today's P1, so the tint is unchanged. The reviewers named other causes
instead, now in `items/work-priority-pill-order.md`.

## 3. The signature's links

The test page was a webmail mock on a desktop at 100 % with the template's example fields. **A** is today's (teal, no
underline); **E** underlines the website and LinkedIn links.

| Reviewer             | A   | E   |
| -------------------- | --- | --- |
| Claude, client buyer | 8   | 9   |
| Claude, design lead  | 8   | 8   |
| Codex, client buyer  | 9   | 9   |

On "recognised as links", E scored 9 against A's 7 (Claude, design lead). E costs a little calm
(8 against 9). Overall it is a tie, not measured for noise. The tie goes to E, the variant without an exception: brand's
link in text is underlined. The mock was not checked against a real webmail screenshot, and
dark mode was skipped.

Review: medium for 2 and 3, large for 1, because 1 changes a shared element on four surfaces.

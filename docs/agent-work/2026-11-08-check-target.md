# The target size of hw-check and the form field's options, 08.11.

The trainer hub set a 44 × 48 px target around a lone checkbox (the run sheet's done box) and padded
a form field's radio rows itself, as neither element had a target size. The brand now gives one:
the label is the target, 32 px under a mouse and 44 px on a touch screen (`pointer: coarse`), at the
screen and dense scales. Print and stage set 0. Settings: `--hw-check-target` and
`--hw-check-target-touch`. A box with no text beside it sits in `<label class="hw-check-target">`.

## Blind review

Three variants of the target size: none (the rows at their line height), 44 px on every pointer, and
32 px by mouse with 44 px by touch. Rendered light, 1280 px laptop and 390 px phone (touch), in
four contexts: a trainer's run sheet and preparation checklist (dense, regular type), an internal
business app's form (dense), and a website's contact form (screen). Codex (`gpt-6.1-sol`, high),
neutral labels, shuffled per reviewer. Criteria, fixed before scoring: hitting the right option
without a mis-tap, scanning, breathing room, visual calm, fit for the task; one overall score.

| Reviewer (persona, contexts)                  | none | 44 px | 32 / 44 px |
| --------------------------------------------- | ---: | ----: | ---------: |
| Freelance trainer, run sheet, run 1           |  6.5 |   8.4 |        8.8 |
| Freelance trainer, run sheet, run 2           |  6.2 |   8.6 |        8.8 |
| Consultant in the internal app, mouse         |  7.6 |   8.0 |        9.0 |
| Engineering lead on the website, laptop+phone |  7.5 |   8.5 |        9.0 |

Noise (two trainer runs): 0.3 at most. The 32 / 44 px lead over 44 px is 0.3 for the trainer (a tie
inside the noise), 1.0 in the app and 0.5 on the website (one run each); both are defaults with no
exception, and 32 / 44 px leads on every surface, so it is the default. What kept it below 10: the
visible box stays small on the laptop; on the phone it reads as 44 px. Night was not rendered;
print and stage are left out, as nobody taps paper or a slide.

One reviewer prompt, verbatim (the criteria paragraph is the same for all):

> You are a freelance trainer who runs one- and two-day developer workshops for a training company
> and uses its internal web app to tick off a day's run sheet and a preparation checklist, on a
> laptop at the front of the room and on a phone while walking around. You see three variants, K, M
> and P, of the same screen; the attached images are named <context>-<variant>.png. Medium: a web
> app, shown on a 1280 px wide laptop browser (hub-laptop) and on a 390 px wide phone held in one
> hand (hub-phone), at those sizes. The variants differ only in how much space each checkbox or
> radio option takes. Score each variant from 1 to 10 on each criterion: (1) hitting the right box
> or option without a mis-tap or mis-click, on the laptop and on the phone; (2) scanning the list
> quickly; (3) breathing room, not cramped; (4) visual calm; (5) overall fit for the task. Then give
> each variant one overall score from 1 to 10 with one decimal, and for each variant name what keeps
> it below 10. Answer in English, as plain text: per variant the five scores, the overall score, and
> the reasons.

Review: small plus one persona per further surface, because the default reaches every screen
surface that renders a form.

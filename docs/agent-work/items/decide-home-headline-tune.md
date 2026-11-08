---
kind: decision
status: decided
decision: tune-all
by: Benedikt
quote: "„all roles are in tune“ perfect."
priority: 1
order: 30
area: brand
owner: Benedikt
evidence: "Blind panel 08.11., 16 reviewer runs. Report: docs/agent-work/2026-11-08-headline-wording.md, round 3."
recommended: step-every
options:
  - key: step-every
    label: "Keep: Your teams have agents. Once every role is in step, your releases speed up."
    detail: "77.9 (run 1 78.2, run 2 77.6). Clear (8.1), natural English (8.1), together with u1 8.1. 10 of 16 reviews read 'in step' as marching or uniformity, and it fits the tuning desk less well (8.1 against 9.2). With u1 only 3 of 16 still ask 'in step with whom?', against 24 of 32 in round 2. No change anywhere."
    score: 77.9
    noise: 0.6
  - key: tune-all
    label: "Your teams have agents. Once all roles are in tune, your releases speed up."
    detail: "79.4, 1.5 ahead of step-every. It leads with both models (Claude +1.9, Codex +1.0) and in both runs (+2.3, +0.6), but inside its own noise of 2.3, so it is a tie. Best fit with the tuning desk (9.2) and better German fit (8.4 against 7.7). u1 no longer repeats 'in tune' (together 8.2), which is why it lost round 2's f6 pass. All 16 reviews call 'in tune' a metaphor that needs the visual to read concretely (idiom 7.2 against 7.5). Choosing it changes headline.en in verbal.json and needs a brand release."
    score: 79.4
    noise: 2.3
  - key: concert-every
    label: "Your teams have agents. Once every role works in concert, your releases speed up."
    detail: "78.8, 0.9 ahead of step-every, a tie, and split by model (Claude -0.7, Codex +2.2). The independent counter-draft. Best idiom (7.9) and the best German fit (9.4), since 'in concert' is what 'zusammenspielen' says. 16 of 16 reviews call it formal or worn, and 7 find it close to the claim's 'together'. Same line count."
    score: 78.8
    noise: 2.3
  - key: tune-every
    label: "Your teams have agents. Once every role is in tune, your releases speed up."
    detail: "76.1, 1.8 behind step-every with both models and in both runs. 14 of 16 reviews say a single role cannot be 'in tune' on its own (idiom 6.2). That is its round 1 flaw too, apart from f6's repetition."
    score: 76.1
    noise: 1.3
images:
  step-every:
    - src: step-every-desktop.jpg
      caption: "in step, every role: desktop 1440 px, five lines"
    - src: step-every-phone.jpg
      caption: "in step, every role: phone 390 px, five lines"
    - src: preview-u1.jpg
      caption: "Link preview with u1, the step before the page"
    - src: footer-u1-desktop.jpg
      caption: "Footer with u1, desktop 1440 px"
    - src: footer-u1-phone.jpg
      caption: "Footer with u1, phone 390 px"
  tune-all:
    - src: tune-all-desktop.jpg
      caption: "in tune, all roles: desktop 1440 px, five lines"
    - src: tune-all-phone.jpg
      caption: "in tune, all roles: phone 390 px, five lines"
  concert-every:
    - src: concert-every-desktop.jpg
      caption: "in concert, every role: desktop 1440 px, five lines"
    - src: concert-every-phone.jpg
      caption: "in concert, every role: phone 390 px, five lines"
  tune-every:
    - src: tune-every-desktop.jpg
      caption: "in tune, every role: desktop 1440 px, five lines"
    - src: tune-every-phone.jpg
      caption: "in tune, every role: phone 390 px, five lines"
---

# Home H1: "in step" or "in tune", now that the claim is u1?

It's a tie. "All roles are in tune" scores 1.5 ahead of "every role is in step", with both models and in both runs. The lead is inside the noise (2.3), so by the tie rule the line that changes nothing stays recommended. With u1 as the claim, "in tune" no longer repeats it, which was why it lost round 2. With a tie, the choice is yours. "In tune" fits the tuning desk (9.2 against 8.1) and the German H1 (8.4 against 7.7) better. "In step" reads as slightly plainer English (idiom 7.5 against 7.2).

The claim rollout keeps "in step" until you answer.

The German H1 stays "Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller." for every option. It was scored as German fit and needs no change.

Overall is the panel mean, 0 to 100. Noise is the gap between the two runs' panel means; a lead inside it is a tie. All four lines run to five lines on desktop and phone. Reviewer noise (one reviewer's two runs, mean gap) is 2.8.

| Option        | Overall | Run 1 / 2   | Claude / Codex | Clear | Fit hero | Language | Idiom | Together | German fit |
| ------------- | ------- | ----------- | -------------- | ----- | -------- | -------- | ----- | -------- | ---------- |
| tune-all      | 79.4    | 80.5 / 78.2 | 75.8 / 83.0    | 7.9   | 9.2      | 8.0      | 7.2   | 8.2      | 8.4        |
| concert-every | 78.8    | 77.6 / 79.9 | 73.2 / 84.2    | 8.3   | 8.2      | 7.8      | 7.9   | 7.8      | 9.4        |
| step-every    | 77.9    | 78.2 / 77.6 | 73.9 / 82.0    | 8.1   | 8.1      | 8.1      | 7.5   | 8.1      | 7.7        |
| tune-every    | 76.1    | 76.8 / 75.5 | 72.5 / 79.8    | 7.6   | 9.1      | 7.3      | 6.2   | 8.1      | 7.9        |

This follows `decide-home-headline-wording`, which you decided for step-every on 08.11. Its panels assumed c3 or f6 as the claim, so this round puts the "in tune" question again with u1. Its findings on the completed forms ("with each other", "with the others") still hold: neither beat the short line.

## What choosing changes

- step-every: nothing.
- tune-all or concert-every: brand changes `headline.en` in `verbal.json` and releases. The website takes the new line with its next brand pin and in the home hero copy.
- tune-every: the same steps as tune-all. Not advised: it is last with both models.

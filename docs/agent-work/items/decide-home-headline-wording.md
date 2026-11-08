---
kind: decision
status: decided
priority: 2
area: brand
owner: Benedikt
evidence: "Two blind panels 08.11. on the rendered home hero (desktop 1440, phone 390), after the link preview carrying c3 and, in a second pass, f6; CTO, VP of Engineering, brand strategist, native English copy editor; Claude and Codex; two runs each; 32 reviewer runs per round. Round 1: five wordings (in step, in tune, in flow). Round 2: the two completed forms of 'in step' against 'in step' and 'all roles are in tune'. Report: docs/agent-work/2026-11-08-headline-wording.md"
recommended: step-every
options:
  - key: step-every
    label: "Keep: Your teams have agents. Once every role is in step, your releases speed up."
    detail: "First in round 2 (78.3; 78.4 with c3, 78.1 with f6) as in round 1. Five lines on desktop and phone, repeats neither claim (together 8.4). Its one recurring flaw: 24 of 32 reviews ask 'in step with what?'. Neither completed form fixes that at a gain: both answer the question and score lower. German 'zusammenspielen' fits (7.9). No change anywhere."
    score: 78.3
    noise: 2.7
  - key: tune-all
    label: "Your teams have agents. Once all roles are in tune, your releases speed up."
    detail: "1.3 behind in round 2. Ties step-every while c3 stays the claim (+1.0, noise 1.3; +3.5 with Claude, -1.5 with Codex), trails by 3.5 with f6 with both models: it repeats f6's 'in tune' (together 5.8, 16 of 16 f6 reviews name the repetition). Best fit with the tuning desk (9.3); 'roles in tune' reads soft for job functions (idiom 6.6). Round 1, as context: 78.4, same pattern. German fits (8.4)."
    score: 77.0
    noise: 1.3
  - key: step-each-all
    label: "Your teams have agents. Once all roles are in step with each other, your releases speed up."
    detail: "1.9 behind (3.0 with c3, 0.8 with f6, inside the noise there). Answers 'in step with what?': clearest (8.3) and the best carrier of the German 'zusammenspielen' (8.9). It runs to six lines on desktop and phone, which pushes the buttons down; 28 of 32 reviews name the length (fit with the hero 7.3 against 8.5). Both models put it behind."
    score: 76.4
    noise: 0.4
  - key: step-others-every
    label: "Your teams have agents. Once every role is in step with the others, your releases speed up."
    detail: "Last in round 2, 3.0 behind with both models and in both passes. Stays at five lines, but 27 of 32 reviews call 'every role ... with the others' clunky or laboured (language 7.0 against 8.1); two Claude reviews read it as translated."
    score: 75.3
    noise: 0.3
images:
  step-every:
    - src: step-every-desktop.jpg
      caption: "in step, every role: desktop 1440 px, five lines"
    - src: step-every-phone.jpg
      caption: "in step, every role: phone 390 px, five lines"
    - src: preview-c3.jpg
      caption: "Link preview with c3, the step before the page"
    - src: preview-f6.jpg
      caption: "Link preview with f6, the step before the page"
  tune-all:
    - src: tune-all-desktop.jpg
      caption: "in tune, all roles: desktop 1440 px, five lines"
    - src: tune-all-phone.jpg
      caption: "in tune, all roles: phone 390 px, five lines"
  step-each-all:
    - src: step-each-all-desktop.jpg
      caption: "in step with each other, all roles: desktop 1440 px, six lines"
    - src: step-each-all-phone.jpg
      caption: "in step with each other, all roles: phone 390 px, six lines"
  step-others-every:
    - src: step-others-every-desktop.jpg
      caption: "in step with the others, every role: desktop 1440 px, five lines"
    - src: step-others-every-phone.jpg
      caption: "in step with the others, every role: phone 390 px, five lines"
decision: step-every
by: Benedikt
quote: "ok perfekt. dann folge ich deinen empfehlungen und ergebnissen bei claim und headline. leg mal los das zu implementieren und alle effekte die das hat überall zu berücksichtigen"
---

# Which wording for the home H1?

Keep "in step". Completing it does not pay: "with each other" answers "in step with what?" but adds a sixth line on desktop and phone, and "with the others" reads clunky. Both score below the short line with both models.

"All roles are in tune" ties "in step" only while c3 stays the claim; after f6 ("Every agent needs a team in tune.") it repeats "in tune" and falls behind. Round 1 ruled out "every role is in tune" and both "in flow" wordings (report).

Overall is the round 2 panel mean over both claim passes, 0 to 100. Noise is the gap between the two runs' panel means; a lead inside it is a tie. Scores compare within one round only: the round 1 figures in the details are context, not a fifth column.

| Option            | Overall | With c3 | With f6 | Claude / Codex | Lines | Clear | Fit hero | Language | Idiom | Together c3 / f6 | German fit |
| ----------------- | ------- | ------- | ------- | -------------- | ----- | ----- | -------- | -------- | ----- | ---------------- | ---------- |
| step-every        | 78.3    | 78.4    | 78.1    | 72.7 / 83.9    | 5     | 7.7   | 8.5      | 8.1      | 7.2   | 8.3 / 8.5        | 7.9        |
| tune-all          | 77.0    | 79.4    | 74.6    | 72.6 / 81.4    | 5     | 7.7   | 9.3      | 7.7      | 6.6   | 8.4 / 5.8        | 8.4        |
| step-each-all     | 76.4    | 75.4    | 77.3    | 71.3 / 81.4    | 6     | 8.3   | 7.3      | 7.6      | 7.6   | 8.0 / 8.6        | 8.9        |
| step-others-every | 75.3    | 74.9    | 75.7    | 68.9 / 81.7    | 5     | 8.3   | 7.7      | 7.0      | 7.1   | 8.0 / 8.5        | 8.4        |

The German H1 ("Wenn alle Rollen zusammenspielen") fits every option and needs no change.

## What choosing changes

- step-every: nothing. `verbal.json` keeps `headline.en`.
- Any other option: brand changes `headline.en` in `verbal.json` and releases; the website takes it with its next brand pin. step-each-all also makes the home H1 six lines on desktop and phone.

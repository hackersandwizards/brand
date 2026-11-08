---
kind: decision
status: open
priority: 2
area: brand
owner: Benedikt
evidence: "Blind review 08.11.: five wordings of the home H1 on the rendered home hero (desktop 1440, phone 390), after the link preview carrying c3 and, in a second pass, f6; CTO, VP of Engineering, brand strategist, native English copy editor; Claude and Codex; two runs each; 32 reviewer runs. Report: docs/agent-work/2026-11-08-headline-wording.md"
recommended: step-every
options:
  - key: step-every
    label: "Keep: Your teams have agents. Once every role is in step, your releases speed up."
    detail: "First with both claims: 79.3 with c3, 80.6 with f6. Repeats neither claim (together 8.6 and 8.7) and reads as the most natural phrase for roles (idiom 7.8). Reviewers: 'in step' lacks its 'with each other', can sound like marching, and ties to the tuning desk less than 'in tune'. German 'zusammenspielen' fits (8.5). No change anywhere."
    score: 79.9
    noise: 1.4
  - key: tune-all
    label: "Your teams have agents. Once all roles are in tune, your releases speed up."
    detail: "Ties step-every while c3 stays the claim (79.5 against 79.3, noise 1.4); best fit with the tuning desk (9.0). With f6 it trails by 3.2, 7.0 with Claude (Codex +0.6): it repeats f6's 'in tune' (together 6.6). 'All roles are' reads flatter to Claude reviewers, and 'roles in tune' strains English for job functions. German fits (8.7)."
    score: 78.4
    noise: 0.3
  - key: tune-every
    label: "Your teams have agents. Once every role is in tune, your releases speed up."
    detail: "1.3 behind step-every with c3 (inside the noise), 5.4 behind with f6 (outside it, both models). 'A single role in tune' needs a partner (idiom 6.6); repeats f6's 'in tune'."
    score: 76.6
    noise: 1.8
  - key: flow-all
    label: "Your teams have agents. Once all roles are in flow, your releases speed up."
    detail: "13.0 behind step-every, with both models and in both passes. 'In flow' describes a person's focus, not roles working together (idiom 5.1); repeats c3's 'flow' and the desk's 'in flow' caption (together 5.0 with c3). German 'zusammenspielen' no longer carries it (6.3): this option would need a German change."
    score: 66.9
    noise: 0.3
  - key: flow-every
    label: "Your teams have agents. Once every role is in flow, your releases speed up."
    detail: "Last: 14.1 behind step-every, with both models and in both passes. Same reasons as flow-all (idiom 4.6). Would need a German change."
    score: 65.8
    noise: 0.7
images:
  step-every:
    - src: step-every-desktop.jpg
      caption: "in step, every role: desktop 1440 px"
    - src: step-every-phone.jpg
      caption: "in step, every role: phone 390 px"
    - src: preview-c3.jpg
      caption: "Link preview with c3, the step before the page"
    - src: preview-f6.jpg
      caption: "Link preview with f6, the step before the page"
  tune-all:
    - src: tune-all-desktop.jpg
      caption: "in tune, all roles: desktop 1440 px"
    - src: tune-all-phone.jpg
      caption: "in tune, all roles: phone 390 px"
  tune-every:
    - src: tune-every-desktop.jpg
      caption: "in tune, every role: desktop 1440 px"
    - src: tune-every-phone.jpg
      caption: "in tune, every role: phone 390 px"
  flow-all:
    - src: flow-all-desktop.jpg
      caption: "in flow, all roles: desktop 1440 px"
    - src: flow-all-phone.jpg
      caption: "in flow, all roles: phone 390 px"
  flow-every:
    - src: flow-every-desktop.jpg
      caption: "in flow, every role: desktop 1440 px"
    - src: flow-every-phone.jpg
      caption: "in flow, every role: phone 390 px"
---

# Which wording for the home H1?

Keep "in step". It is first whichever claim stands on the link preview, and it repeats neither claim.

"All roles are in tune" ties it only while c3 stays the claim. With f6 ("Every agent needs a team in tune.") the headline repeats "in tune" right after the preview, and it falls 3.2 behind (7.0 with Claude). Both "in flow" wordings lose by 13 to 14 points with both models: reviewers read "in flow" as one person's focus, not as roles working together, and it repeats c3 and the desk's "in flow" caption.

Overall is the panel mean over both claim passes, 0 to 100. Noise is the gap between the two runs' panel means. A lead inside the noise is a tie.

| Option     | Overall | With c3 | With f6 | Claude / Codex | Idiom | Together c3 / f6 | German fit |
| ---------- | ------- | ------- | ------- | -------------- | ----- | ---------------- | ---------- |
| step-every | 79.9    | 79.3    | 80.6    | 76.6 / 83.3    | 7.8   | 8.6 / 8.7        | 8.5        |
| tune-all   | 78.4    | 79.5    | 77.4    | 73.4 / 83.4    | 7.2   | 8.5 / 6.6        | 8.7        |
| tune-every | 76.6    | 78.1    | 75.2    | 73.2 / 80.1    | 6.6   | 8.5 / 6.5        | 8.3        |
| flow-all   | 66.9    | 64.6    | 69.2    | 62.1 / 71.8    | 5.1   | 5.0 / 7.8        | 6.3        |
| flow-every | 65.8    | 63.4    | 68.3    | 62.5 / 69.2    | 4.6   | 5.0 / 7.8        | 6.3        |

The German H1 ("Wenn alle Rollen zusammenspielen") fits the three "step" and "tune" wordings and needs no change. Only an "in flow" wording would.

## What choosing changes

- step-every: nothing. `verbal.json` keeps `headline.en`.
- Any other option: brand changes `headline.en` in `verbal.json` and releases; the website takes it with its next brand pin. A flow option also needs a new `headline.de`.

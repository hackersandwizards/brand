---
kind: decision
status: open
priority: 1
order: 3
area: brand
owner: Benedikt
evidence: "Blind panel, reader's path and cold reads 08.11., 396 runs. Report: docs/agent-work/2026-11-08-claim-tune.md."
recommended: tpe-tune
options:
  - key: tpe-tune
    label: "Agents pay off when your people are in tune. / KI-Agenten lohnen sich, wenn eure Leute eingespielt sind."
    detail: "Panel 81.7, 6.7 ahead of u1, outside the noise in both runs and with both models. Reader's path 78.0, 5.5 ahead of u1 with the same H1, all four cells positive, two inside u1's noise of 4.8. Reviewers name 'pay off' / 'lohnen sich' in 28 of 40 panel reviews as what keeps it below the maximum."
    score: 79.9
    noise: 0.5
  - key: u1-tune
    label: "Keep: Agents pay off when your people ship together. / KI-Agenten lohnen sich, wenn eure Leute gemeinsam liefern."
    detail: "Panel 75.0; path 72.5, one message 7.1, the line without 'tune' does not connect to the H1 and desk ('the metaphor arrives late'). Together on the panel 8.9, the highest; distinctive 4.7, the lowest. Changes nothing."
    score: 73.8
    noise: 4.8
  - key: d8-tune
    label: "Agents write code. People in tune ship faster. / KI-Agenten schreiben Code. Wer eingespielt ist, liefert schneller."
    detail: "Strongest pair in the reader's path, 81.2, 8.7 ahead of u1 outside the noise in all four cells, German 79.6. Panel 72.0: Claude 6.9 behind u1, Codex 0.9 ahead. Together 6.0, the lowest; German panel 6.5 below English; the banner break strands 'People / in tune' and 'Wer', which a fixed break would have to solve before release. Has no 'pay off'."
    score: 76.6
    noise: 0.9
  - key: tte-tune
    label: "Agents pay off when your teams are in tune. / KI-Agenten lohnen sich, wenn eure Teams eingespielt sind."
    detail: "Panel 80.3, a tie with tpe (Claude tpe +4.3, Codex tte +1.6). Path 75.6, a tie with tpe (Claude tpe +5.9, Codex tte +1.1). People 8.0 against 9.8: 'teams' may mean single teams."
    score: 78.0
    noise: 1.5
images:
  tpe-tune:
    - src: tpe-tune-path.jpg
      caption: "The reader's path: link preview or LinkedIn profile, then home at 1440 and 390, then footer"
    - src: tpe-tune-panel.jpg
      caption: "The claim on the LinkedIn app and laptop, X, Sessionize, closing slide and link preview"
    - src: tpe-tune-panel-de.jpg
      caption: "The German claim on the same surfaces"
  u1-tune:
    - src: u1-tune-path.jpg
      caption: "The reader's path with the current claim"
    - src: u1-tune-panel.jpg
      caption: "The current claim on the surfaces"
  d8-tune:
    - src: d8-tune-path.jpg
      caption: "The reader's path"
    - src: d8-tune-panel.jpg
      caption: "The claim on the surfaces"
  tte-tune:
    - src: tte-tune-path.jpg
      caption: "The reader's path"
    - src: tte-tune-panel.jpg
      caption: "The claim on the surfaces"
---

# Does the claim carry "in tune" now that the home H1 does?

"Agents pay off when your people are in tune." is the recommended claim, paired with the H1 "Once all roles are in tune" that now ships. It beats u1 on the rendered panel by 6.7, outside the noise with both models and in both runs. In the reader's path it scores 78.0 against 72.5. That lead is positive in all four cells; two fall inside u1's own run gap of 4.8, so by the larger-noise reading used here they are ties. If those two cells count as a tie for the whole measurement, the tie rule keeps u1; I read one clear lead with no loss as not a tie, and u1's 4.8 is not yet explained. Its only requirement miss is the German, by 0.2. Cold readers restate a result for the company at the ceiling on all four options in both languages.

Your three lines were hypotheses and reviewers never knew whose they were. A fresh drafter wrote eight more, three of which reached the full measurement. Your preference against "pay off" stayed out of every prompt and is no score: u1 and the recommended line both carry it, and reviewers name it in 28 of 40 panel reviews of that line as what keeps it below the maximum. "Agents write code. People in tune ship faster." is the strongest line without "pay off": first in the reader's path, sixth of seven on the panel, its banner break and its German needing work. If "pay off" outweighs the panel for you, that is the one to choose, with a fixed break before release.

Score is the mean of panel and path; noise is the larger run gap of the two. The two measures disagree for d8, so read them apart in the table. "tte" ties "tpe" on both; the tie goes to tpe on people (9.8 against 8.0). Each cell is in the report.

| Option   | Panel | Path (with the H1) | Path German | Together | One message (path) | Recurring word + / - |
| -------- | ----- | ------------------ | ----------- | -------- | ------------------ | -------------------- |
| tpe-tune | 81.7  | 78.0               | 78.4        | 7.5      | 8.7                | 9 / 3                |
| tte-tune | 80.3  | 75.6               | 77.7        | 7.9      | 8.2                | 6 / 6                |
| u1-tune  | 75.0  | 72.5               | 72.2        | 8.9      | 7.1                | 0 / 0                |
| d8-tune  | 72.0  | 81.2               | 79.6        | 6.0      | 8.6                | 7 / 1                |

The H1 "Once all roles are in tune" scores above "Once every role is in step" with six of the seven claims, by 2.2 to 3.1, both models and both runs; with u1 the gap is 0.8, inside the noise. Reviewers who name "in tune" recurring across banner, H1 and desk call it help more often than harm, 46 to 21 across the six "in tune" claims with that H1, mostly from d3's 13 to 1 (the table counts every such remark per pair). No prompt mentions it.

## What a switch changes

- `verbal/verbal.json`: `claim.en`, `claim.de`, `claim.word` (the accent becomes "in tune" / "eingespielt"), u1's two lines into `retired`.
- Every channel banner re-rendered, the footer and link preview with the next brand pin in each consumer, a brand release.
- Profile texts (LinkedIn About and headline, practitioners bios, Sessionize, OMR) rewritten around the new line and blind-reviewed under `work-claim-rollout-holistic`; the list in `work-update-external-profiles-after-claim` takes the new line.
- DPMA, EUIPO and USPTO are not queried for any line yet; a chosen line gets that check before release.

Keeping u1 changes nothing.

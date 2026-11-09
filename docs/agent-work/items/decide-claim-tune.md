---
kind: decision
status: open
priority: 1
order: 10
area: brand
owner: Benedikt
evidence: "Blind panel, reader's path and cold reads 08.11., 396 runs; controls, path and panel with q6 09.11., 100 runs. Reports: docs/agent-work/2026-11-08-claim-tune.md, docs/agent-work/2026-11-09-claim-flow.md."
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
  - key: q6-flow-claim
    label: "Back to the claim until 07.11.: Agents bring the speed. Flow needs teams in tune. / Agenten bringen das Tempo. Flow braucht eingespielte Teams."
    detail: "Panel 09.11. 69.9 against tpe 79.3, tte 79.9 and u1 79.3, behind with both models, in both runs and both languages. Path with the decided headline 72.2 against tpe 76.8 and u1 75.2. Most distinctive of the five (6.6), least clear (6.3); all 32 panel reviews name 'flow' in what keeps it below the maximum, and the German link preview strands 'Teams.'. Earlier claim rounds (06.-08.11.) put it between 56.0 and 73.5."
    score: 71.1
    noise: 1.1
  - key: q6-flow-h1
    label: "As the home headline in place of 'Your teams have agents. Once all roles are in tune, your releases speed up.', with tpe or u1 as the claim"
    detail: "Asked what the line says: 71.2 against 79.8 for the decided headline on the same first screen, behind with both models in both runs. Path 70.8 with tpe and 70.3 with u1, against 76.8 and 75.2 for the decided headline with the same claim. Leads only on layout: 87.0 against 68.8 with the same page around both lines; the website's 87.7 repeats at 87.4. Needs its own line break: today's rule strands 'tune.' at 1440 px."
    score: 71.0
    noise: 1.6
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
  q6-flow-claim:
    - src: q6-flow-claim.jpg
      caption: "The line as the claim: LinkedIn banner, link preview, footer"
    - src: q6-flow-claim-de.jpg
      caption: "The German claim on the same surfaces"
  q6-flow-h1:
    - src: q6-flow-h1.jpg
      caption: "The line as the home H1 on today's page, 1440 and 390"
---

# Does the claim carry "in tune" now that the home H1 does?

"Agents pay off when your people are in tune." is the recommended claim, paired with the H1 "Once all roles are in tune" that now ships. It beats u1 on the rendered panel by 6.7, outside the noise with both models and in both runs. In the reader's path it scores 78.0 against 72.5. That lead is positive in all four cells; two fall inside u1's own run gap of 4.8, so by the larger-noise reading used here they are ties. If those two cells count as a tie for the whole measurement, the tie rule keeps u1; I read one clear lead with no loss as not a tie, and u1's 4.8 is not yet explained. Its only requirement miss is the German, by 0.2. Cold readers restate a result for the company at the ceiling on all four options in both languages.

Your three lines were hypotheses and reviewers never knew whose they were. A fresh drafter wrote eight more, three of which reached the full measurement. Your preference against "pay off" stayed out of every prompt and is no score: u1 and the recommended line both carry it, and reviewers name it in 28 of 40 panel reviews of that line as what keeps it below the maximum. "Agents write code. People in tune ship faster." is the strongest line without "pay off": first in the reader's path, sixth of seven on the panel, its banner break and its German needing work. If "pay off" outweighs the panel for you, that is the one to choose, with a fixed break before release.

Score is the mean of panel and path; noise is the larger run gap of the two. The q6 options take their panel and path from 09.11., where q6-flow-h1's panel is the headline question on the first screen; by the same rule that round gives tpe 78.1 and u1 77.3. The two measures disagree for d8, so read them apart in the table. "tte" ties "tpe" on both; the tie goes to tpe on people (9.8 against 8.0). Each cell is in the report.

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
- Profile texts (LinkedIn About and headline, practitioners bios, Sessionize, OMR) rewritten around the new line and blind-reviewed in one more scored round (the method of `docs/agent-work/2026-11-08-claim-rollout-holistic.md`); the list in `work-update-external-profiles-after-claim` takes the new line.
- DPMA, EUIPO and USPTO are not queried for any line yet; a chosen line gets that check before release.

Keeping u1 changes nothing.

## Website, measured 09.11. after the rollout on u1

The website now reads claim and headline from `verbal.json` (website `82a5d43e..55e5d975`), so a switch here reaches it with the next brand pin and two regenerate commands, no source edit. In its in-context panel (12 runs, noise 2) the line the hero showed until then, "Agents bring the speed. Flow needs teams in tune." (retired 07.11.), scored 87.7 on the first screen against 76.4 for the decided headline with its forced break and 70.0 without. No candidate changed the headline's words. Report: website `docs/agent-work/2026-11-09-claim-and-headline.md`.

## Benedikt's question, 09.11.

"und warum nicht "Agents bring the speed. Flow needs teams in tune." wenn das so viele punkte bekommt? oder ist das dann die headline? das könnte sowohl headline als auch claim sein."

Measured on 09.11. as both (report `docs/agent-work/2026-11-09-claim-flow.md`, 100 runs): it loses in both roles, so neither q6 option is recommended.

The 87.7 survives the control as a number and not as a verdict on the line. Rerun with the website's prompt and personas, it comes back at 87.4 against 76.5. That panel judged only the headline's layout on the first screen: line breaks, stranded words, calm. Swapping the H1 alone moves that score by 18 points on the old page and on today's, so the page and the brand version do not explain it. Asking about the same screenshots what the line says reverses the order: the decided headline leads by 8.1 on the old page and 8.6 on today's, with both models in both runs. That question is the one the 07.11. panel asked, where q6 as H1 scored 76.8, third.

- As the headline, q6 trails the decided headline by 6.0 on the reader's path with tpe as the claim, and by 4.9 with u1. Only the brand strategist puts it level or ahead.
- As the claim, it trails tpe, tte and u1 by 9.4 to 10.0. Every one of 32 reviews names "flow" in what keeps it below the maximum, and in German the link preview strands "Teams.".
- Its strength is real but narrow: four short lines that sit calmly on the first screen, and the highest distinctive score of the five claims (6.6). The decided headline's weakness on the layout panel is its five lines at 1440 px, a matter of the website's line break, not its words.

This round puts tpe, tte and u1 level on the claim panel (79.3 to 79.9), where 08.11. had tpe 6.7 ahead of u1; the cause is not yet explained. With the decided headline, tpe still leads u1 on the path (+1.6: Claude +3.4, Codex -0.1). No round puts u1 ahead of tpe, so tpe stays the recommendation.

---
kind: decision
status: open
priority: 1
order: 10
area: brand
owner: Benedikt
evidence: "Blind review 10.11., 319 runs: text screen, rendered panel, cold reads with an f6 control, three hero rounds, four reader's-path rounds with u1 and d8 as anchors. Report: docs/agent-work/2026-11-10-claim-amdahl.md."
recommended: tpe-tune
options:
  - key: tpe-tune
    label: "Keep: Agents pay off when your people are in tune. / KI-Agenten lohnen sich, wenn eure Leute eingespielt sind."
    detail: "Panel 77.8, path 68.0. Leads the panel on people (9.6), calm (9.0) and the footer (82.4). Reviewers name 'in tune' / 'eingespielt' in 33 of 40 panel reviews and 'pay off' / 'lohnen sich' in 22 as what keeps it below the maximum. Changes nothing."
    score: 72.9
    noise: 0.1
  - key: x4
    label: "Agents speed up code. Your handoffs set the pace. / KI-Agenten schreiben Code schneller. Eure Übergaben bestimmen das Tempo."
    detail: "Path 80.8 against 68.0, ahead in all four cells (Claude +17.5 and +17.0, Codex +8.2 and +8.4) and in both languages, and still ahead by 11.0 with the buyers' problem left out of the prompt. Panel 79.3 against 77.8: Claude +2.2 and +3.3, Codex +0.8 and +0.0. People 6.6 against 9.6, footer 74.0 against 82.4; all 40 panel reviews name 'handoffs' / 'Übergaben' ('sounds like process rather than people and can read as agent handoffs'). The English needs a fix before release: 'speed up code' reads as faster-running software to 6 of 40."
    score: 80.1
    noise: 0.2
  - key: d1k-en
    label: "English home headline only: Your developers code faster with agents. Releases speed up once product, QA and ops keep pace."
    detail: "On the hero it beats the decided headline in both rounds and all eight cells (75.8 against 71.7, noise 1.7). No German version holds: three German drafts trail 'Wenn alle Rollen zusammenspielen' on the German reader's path (67.4 to 74.6 against 78.2) and run seven to ten lines at 1440 px against six. Taking it would split the English and German headlines."
    score: 75.8
    noise: 1.7
images:
  tpe-tune:
    - src: tpe-tune-panel.jpg
      caption: "The claim on the LinkedIn app and laptop, one-pager header and website footer"
    - src: tpe-tune-path.jpg
      caption: "The reader's path with the decided headline: LinkedIn, home page at 1440 and 390, footer"
  x4:
    - src: x4-panel.jpg
      caption: "The line on the same surfaces"
    - src: x4-panel-de.jpg
      caption: "The German line on the same surfaces"
    - src: x4-path.jpg
      caption: "The reader's path with the decided headline"
  d1k-en:
    - src: d1k-hero.jpg
      caption: "The English headline on the home page at 1440 px"
    - src: g2-hero-de.jpg
      caption: "The best German draft, seven lines at 1440 px"
---

# Does the claim change to "Agents speed up code. Your handoffs set the pace."?

Keep tpe-tune, or take x4, the line that carries Amdahl's point, or an English-only headline.

Amdahl's point is that the part you leave slow caps the whole speedup. x4 carries it without naming the law: agents speed up one step, and the rest of the path sets the pace. On the reader's path (LinkedIn profile, home page with the decided headline, footer) it beats tpe by 12.8 points: in all four model and run cells, in both languages, and still by 11.0 with the buyers' problem left out of the prompt. Two anchor lines repeat their 08.11. order on the same path: d8 above tpe, u1 below. So the path measures the same thing it did then. x4 also beats d8 there by 7.4.

On the rendered panel x4 leads by only 1.5: Claude +2.2 and +3.3, Codex +0.8 in its first run and +0.0 in its second. The rule fixed before the first panel score asked for a lead outside the noise in both runs and with both models. Codex's second run gives 0.0. The German also misses the requirement by 0.1, like tpe on 08.11. By that rule it is a tie, and a tie keeps the line that changes nothing, hence `recommended: tpe-tune`. On the reading of 08.11., a clear lead on the path with no loss in the overall panel score, x4 wins; it does lose single panel criteria, below. Both readings are the scores'. Choosing between them is direction, so it is yours.

What x4 costs: readers see process rather than people. People scores 6.6 against 9.6, and every panel review names "handoffs" / "Übergaben". The footer scores 74.0 against 82.4, since the two sentences run to four or five lines there. "Your teamwork sets the pace" fixes the people score (8.4) but reads generic (distinctive 5.4 against 7.4) and ties x4 on the panel. Its path was not measured.

| Option   | Panel | Path (with the decided H1) | Path without the buyers' problem | Distinctive | People | Footer | Cold read core |
| -------- | ----- | -------------------------- | -------------------------------- | ----------- | ------ | ------ | -------------- |
| tpe-tune | 77.8  | 68.0                       | 68.8                             | 5.3         | 9.6    | 82.4   | 32 / 32        |
| x4       | 79.3  | 80.8                       | 79.8                             | 7.4         | 6.6    | 74.0   | 32 / 32        |

For tpe-tune and x4, score is the mean of panel and path and noise the larger run gap of the two. d1k-en's score is its second hero round and compares only with the decided headline's 71.7 there. The path's tpe sits lower than on 08.11. (68.0 against 78.0). The competing lines differ, but u1 and d8 keep their order around it.

The headline: "Your developers code faster with agents. Releases speed up once product, QA and ops keep pace." beats the decided headline on the home page in English in both hero rounds. With tpe it gains 11.7 on the English path. Its German loses: three German drafts trail the decided German headline on the German path, and the best runs seven lines against six. Claude puts every German draft behind the decided one. The option stands only as an English line beside the German "zusammenspielen", which splits the pair. I would not take it.

## What a switch to x4 changes

- `verbal/verbal.json`: `claim.en`, `claim.de`, `claim.word` ("pace" / "Tempo"), and tpe's lines move into `retired`. The English first sentence gets fixed first ("speed up code" reads as faster-running software) and goes through one small review.
- Every channel banner is re-rendered with a fixed break after the first sentence, the footer and link preview follow with the next brand pin in each consumer, and brand cuts a release.
- Profile texts are rewritten around the new line and scored, as `work-update-external-profiles-after-claim` lists.
- DPMA, EUIPO and USPTO are not yet queried for x4.

Keeping tpe-tune changes nothing beyond the rollout already decided.

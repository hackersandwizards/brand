---
kind: decision
status: open
priority: 2
order: 216
area: brand
owner: Benedikt
evidence: "Blind review 10.11., 319 runs: text screen, rendered panel, cold reads with an f6 control, three hero rounds, four reader's-path rounds with u1 and d8 as anchors. Report: docs/agent-work/2026-11-10-claim-amdahl.md. Round on the client's change first, 10.11., 343 runs: docs/agent-work/2026-11-10-claim-positive.md."
recommended: tpe-tune
options:
  - key: tpe-tune
    label: "Keep: Agents pay off when your people are in tune. / KI-Agenten lohnen sich, wenn eure Leute eingespielt sind."
    detail: "Panel 77.8, path 68.0. Leads the panel on people (9.6), calm (9.0) and the footer (82.4). Reviewers name 'in tune' / 'eingespielt' in 33 of 40 panel reviews and 'pay off' / 'lohnen sich' in 22 as what keeps it below the maximum. Changes nothing. On the client's change leading the line (second round of 10.11.) it scores 5.2 of 10 on the panel: reviewers read 'the investment in AI agents pays off', 'without saying what for'."
    score: 72.9
    noise: 0.1
  - key: x4
    label: "Agents speed up code. Your handoffs set the pace. / KI-Agenten schreiben Code schneller. Eure Übergaben bestimmen das Tempo."
    detail: "Path 80.8 against 68.0, ahead in all four cells (Claude +17.5 and +17.0, Codex +8.2 and +8.4) and in both languages, and still ahead by 11.0 with the buyers' problem left out of the prompt. Panel 79.3 against 77.8: Claude +2.2 and +3.3, Codex +0.8 and +0.0. People 6.6 against 9.6, footer 74.0 against 82.4; all 40 panel reviews name 'handoffs' / 'Übergaben' ('sounds like process rather than people and can read as agent handoffs'). The English needs a fix before release: 'speed up code' reads as faster-running software to 6 of 40. On the client's change leading the line (second round of 10.11.) it scores 5.4 of 10 on the panel and 4.2 on the path, below tpe-tune there in all three rounds: Claude answers 'nothing' to what gets better in 47 of 48 path reviews, and 8 of 16 cold readers restate a diagnosis and no gain."
    score: 80.1
    noise: 0.2
  - key: d1k-en
    label: "English home headline only: Your developers code faster with agents. Releases speed up once product, QA and ops keep pace."
    detail: "On the hero it beats the decided headline in both rounds and all eight cells (75.8 against 71.7, noise 1.7). No German version holds: three German drafts trail 'Wenn alle Rollen zusammenspielen' on the German reader's path (67.4 to 74.6 against 78.2) and run seven to ten lines at 1440 px against six. Taking it would split the English and German headlines."
    score: 75.8
    noise: 1.7
  - key: e5x
    label: "Your developers got faster. Your releases are next. / Eure Entwickler sind schneller geworden. Jetzt ziehen eure Releases nach."
    detail: "The client's change leads: 8.8 of 10 on the panel against 5.2 and 5.4. Path 79.3 against 67.6 for tpe-tune and 78.5 for x4: ahead of tpe-tune in every cell, a tie with x4. Panel: its first wording trailed x4 by about 6 points in every cell and tpe-tune with Codex; the pair alone beside the anchors is unscored (40 runs). It names neither agents nor people working together: none of 32 cold readers says that agents alone are not enough. In the same rounds tpe-tune scores 71.2 and x4 78.0."
    score: 75.3
    noise: 0.7
  - key: r1
    label: "Faster releases with agents, when your people are in tune. / Schnellere Releases mit KI-Agenten, wenn eure Leute eingespielt sind."
    detail: "The decided claim with the gain named first: 9.2 of 10 on the client's change. Panel 76.4 between tpe-tune (74.8) and x4 (77.5), with the models split: Codex +4.7 to +5.3 over both, Claude -0.7 to -10.1. Path 72.0 against 76.7 for x4 and 66.1 for tpe-tune. Claude reads 'a generic vendor promise' (distinctive 5.8 against 7.7 for x4), and the line nearly restates the decided headline. In the same rounds tpe-tune scores 70.5 and x4 77.1."
    score: 74.2
    noise: 1.9
  - key: hb
    label: "Home headline: Faster releases with the agents your teams already have. Once all roles are in tune. / Schnellere Releases mit den Agenten, die eure Teams schon haben. Sobald alle Rollen zusammenspielen."
    detail: "The decided headline's content with the gain first: 9.4 to 9.8 of 10 on the client's change against 2.9 to 3.2. Hero 77.1 against 76.2 for the decided headline: ahead outside the noise in two of three rounds, a tie in the third. On the reader's path Claude scores every pair 1.5 to 3.7 lower with it and Codex 3.8 to 4.5 higher. Six lines in German at 1440 px, as now. 'Already' repeats the subline, which would need a new sentence."
    score: 77.1
    noise: 2.3
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
  e5x:
    - src: e5x-panel.jpg
      caption: "The line on the LinkedIn app and laptop, one-pager header and website footer"
    - src: e5x-panel-de.jpg
      caption: "The German line on the same surfaces"
    - src: e5x-path.jpg
      caption: "The reader's path with the decided headline"
  r1:
    - src: r1-panel.jpg
      caption: "The line on the same surfaces"
    - src: r1-panel-de.jpg
      caption: "The German line on the same surfaces"
  hb:
    - src: hb-hero.jpg
      caption: "The headline on the home page at 1440 px"
    - src: hb-hero-de.jpg
      caption: "The German headline, six lines at 1440 px"
---

# Does the claim change to "Agents speed up code. Your handoffs set the pace."?

Keep tpe-tune, or take x4, a claim that leads with the client's gain (e5x, r1), or a headline (hb, d1k-en).

Amdahl's point is that the part you leave slow caps the whole speedup. x4 carries it without naming the law: agents speed up one step, and the rest of the path sets the pace. On the reader's path (LinkedIn profile, home page with the decided headline, footer) it beats tpe by 12.8 points: in all four model and run cells, in both languages, and still by 11.0 with the buyers' problem left out of the prompt. Two anchor lines repeat their 08.11. order on the same path: d8 above tpe, u1 below. So the path measures the same thing it did then. x4 also beats d8 there by 7.4.

On the rendered panel x4 leads by only 1.5: Claude +2.2 and +3.3, Codex +0.8 in its first run and +0.0 in its second. The rule fixed before the first panel score asked for a lead outside the noise in both runs and with both models. Codex's second run gives 0.0. The German also misses the requirement by 0.1, like tpe on 08.11. By that rule it is a tie, and a tie keeps the line that changes nothing, hence `recommended: tpe-tune`. On the reading of 08.11., a clear lead on the path with no loss in the overall panel score, x4 wins; it does lose single panel criteria, below. Both readings are the scores'. Choosing between them is direction, so it is yours.

What x4 costs: readers see process rather than people. People scores 6.6 against 9.6, and every panel review names "handoffs" / "Übergaben". The footer scores 74.0 against 82.4, since the two sentences run to four or five lines there. "Your teamwork sets the pace" fixes the people score (8.4) but reads generic (distinctive 5.4 against 7.4) and ties x4 on the panel. Its path was not measured.

| Option   | Panel | Path (with the decided H1) | Path without the buyers' problem | Distinctive | People | Footer | Cold read core |
| -------- | ----- | -------------------------- | -------------------------------- | ----------- | ------ | ------ | -------------- |
| tpe-tune | 77.8  | 68.0                       | 68.8                             | 5.3         | 9.6    | 82.4   | 32 / 32        |
| x4       | 79.3  | 80.8                       | 79.8                             | 7.4         | 6.6    | 74.0   | 32 / 32        |

For tpe-tune and x4, score is the mean of panel and path and noise the larger run gap of the two. d1k-en's score is its second hero round and compares only with the decided headline's 71.7 there. The path's tpe sits lower than on 08.11. (68.0 against 78.0). The competing lines differ, but u1 and d8 keep their order around it.

The headline: "Your developers code faster with agents. Releases speed up once product, QA and ops keep pace." beats the decided headline on the home page in English in both hero rounds. With tpe it gains 11.7 on the English path. Its German loses: three German drafts trail the decided German headline on the German path, and the best runs seven lines against six. Claude puts every German draft behind the decided one. The option stands only as an English line beside the German "zusammenspielen", which splits the pair. I would not take it.

## The second round of 10.11.: the client's change first

Benedikt's words on x4, relayed in the round's brief, are the reason for it:

> Ich finde den neuen Claim sehr spannend, allerdings präsentiert er ja keine Lösung oder was bei dem Kunden dann besser ist. Wir hatten ja online, glaube ich, auch recherchiert, dass wir da sagen wollen, was beim Kunden sich zum Besseren verändert. Aber das Thema Handoff und Bottleneck ist gar nicht so falsch. Vielleicht könnten wir das ja nochmal nutzen und ins Positive drehen, um unsere Headline und den Claim nochmal zu optimieren. Ich weiß nicht, ob du da noch mehr Versionen testen kannst mit diesem Hintergrund?

The round scored 49 new claim pairs and 16 headline pairs with the same method, tpe-tune and x4 as anchors in every round, and one criterion more, reported apart from the overall score: the first thing the line makes you see is what gets better for the client (0 to 10), with a clause naming it, "nothing" allowed. Report: `docs/agent-work/2026-11-10-claim-positive.md`.

No line beats both anchors on the path and on that criterion without losing the panel. The rule fixed before the first run keeps the line that changes nothing in that case, so `recommended` stays tpe-tune. The criterion adds a reason against x4: on the path it scores lowest of all claims on what he asked for (4.2 against 6.1 for tpe-tune); on the panel the two tie.

| Option   | Client's change leads | Panel                                   | Path (with the decided H1) |
| -------- | --------------------- | --------------------------------------- | -------------------------- |
| tpe-tune | 5.2                   | 74.8 and 72.8                           | 66.1, 64.9 and 67.6        |
| x4       | 5.4                   | 77.5 and 76.7                           | 76.7, 75.7 and 78.5        |
| e5x      | 8.8                   | 71.2 (first wording; the pair unscored) | 79.3                       |
| r1       | 9.2                   | 76.4                                    | 72.0                       |

These rounds sit 1.8 to 5.0 points below the first round of the day on the panel, with other lines beside the anchors, so each new option's detail names what tpe-tune and x4 scored in its own rounds. The scores of tpe-tune and x4 in the options are the first round's. The scores of e5x and r1 are the mean of panel and path in their own rounds, e5x with the panel of its first wording. hb's score is its second hero round and compares only with the decided headline's 76.2 there.

- e5x wins the criterion and beats tpe-tune on the path by 8.6 to 14.9 in every cell. It ties x4 on the path and loses the panel to x4. It drops the position's point that the gain depends on every role: the headline and the descriptor would have to carry it.
- r1 is the decided claim with the gain in front. Codex puts it ahead of both anchors on the panel, Claude behind both, and it nearly repeats the decided headline.
- hb turns the decided headline around: the gain first, then the agents the teams have, then the roles. It ties the decided headline on the hero by the rule and splits the models on the path.

My judgement, apart from the rule: if the client's gain is to lead somewhere, the headline is where it costs least. hb with tpe-tune keeps the people in the claim and puts the gain first on the home page. No move is free: each gain-first claim pays with the panel or with distinctiveness, and hb pays with Claude's path score.

## What a switch to x4 changes

- `verbal/verbal.json`: `claim.en`, `claim.de`, `claim.word` ("pace" / "Tempo"), and tpe's lines move into `retired`. The English first sentence gets fixed first ("speed up code" reads as faster-running software) and goes through one small review.
- Every channel banner is re-rendered with a fixed break after the first sentence, the footer and link preview follow with the next brand pin in each consumer, and brand cuts a release.
- Profile texts are rewritten around the new line and scored, as `work-update-external-profiles-after-claim` lists.
- DPMA, EUIPO and USPTO are not yet queried for x4.

e5x or r1 would change the same files as x4. hb changes the home headline in `verbal/verbal.json` and, with the next brand pin, the website's home page, whose subline needs a new sentence.

Keeping tpe-tune changes nothing beyond the rollout already decided.

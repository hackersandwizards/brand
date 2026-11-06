---
kind: decision
status: open
priority: 1
area: copy
owner: Benedikt
evidence: "Blind review 06.11., six rounds, five personas, Claude and Codex; every candidate's scores in docs/agent-work/2026-11-06-new-claim.md. Score: mean of round 6's second pass, claim EN and DE and home H1 EN and DE; noise 0.8 on the claim's panel mean, 1.0 on the home H1's."
recommended: b1
options:
  - key: b1
    label: "Agents bring the speed. Flow takes practice. / Agenten bringen das Tempo. Flow braucht Übung."
    detail: "Round 6: claim EN 74.8, DE 74.8, first in both languages, 2.8 to 5.4 ahead of n8 and r4; as home H1 over the hero visual EN 76.7, DE 77.2, fifth, 5.1 and 8.0 behind q6. Ahead of f7 by 4.8 to 7.4 in both tests. One meaning in both languages. Flow stays the claim's word, capitalised in English too."
    score: 76
    noise: 0.9
  - key: q6
    label: "Agents bring the speed. Flow needs teams in tune. / Agenten bringen das Tempo. Flow braucht eingespielte Teams."
    detail: "Round 6: as home H1 EN 81.8, DE 85.2, first with every persona, fit with the hero visual 9.6; as the claim EN 66.2, DE 73.5. The English and German say different things ('in tune' against 'eingespielt'), and 'in tune' reads as soft without the visual."
    score: 77
    noise: 0.9
  - key: f7
    label: "Agents bring the speed. Flow takes training. / Agenten bringen das Tempo. Flow braucht Training."
    detail: "Round 5's recommendation. Round 6: claim EN 70.0, DE 69.5; as home H1 EN 70.5, DE 69.8. The clearest of these lines (7.8 as the claim), below b1 in both tests."
    score: 70
    noise: 0.9
  - key: r4
    label: "You lead the agents. We show you how. / Ihr führt die Agenten. Wir zeigen euch, wie."
    detail: "Round 6: claim EN 71.5, DE 69.4; as home H1 EN 70.0, DE 68.2. Codex's favourite as the claim in English (79.1), distinctive 4.0, fit with the hero visual 4.8."
    score: 70
    noise: 0.9
  - key: n8
    label: "Agents bring the speed. We bring the calm. / Agenten bringen das Tempo. Wir bringen die Ruhe."
    detail: "Round 6: claim EN 72.0, DE 70.0, second, first with the Head of Engineering; as home H1 EN 69.0, DE 66.8. Energy and calm still the highest (8.9), fit with the hero visual 5.2."
    score: 69
    noise: 0.9
---

# Which claim stands for h&w everywhere?

The claim stands on the home H1 and its social card, the website footer, the one-pagers, the deck
closing slide, the press boilerplate, LinkedIn banners and profiles, and `verbal.json` `claim`.
Benedikt asked on 06.11. for a new claim everywhere and decides it himself. Round 6 tested his four
proposals (practice, tune, the right environment, the right organizational structure), variations on
each, new drafts of the run and an independent draft against f7, r4, p3, n8 and the current claim.
The report `docs/agent-work/2026-11-06-new-claim.md` keeps every round's table, the method and a
reviewer prompt.

## Scores

Five personas: a CTO of a Mittelstand manufacturer under board pressure, a VP of Engineering at a
scale-up, a Head of Engineering worried about quality and morale, a brand strategist for DACH B2B
tech services, and a senior developer after a two-day training. Claude and Codex, two runs each,
the order shuffled per reviewer, nothing marking a line as current or naming its author. Overall 0
to 100, mean of all reviewers. Round 6, second pass, 15 lines; the table shows the options and the
current claim.

As the claim, on the deck closing slide and the one-pager header (noise 3.6 per reviewer, 0.8 on
the panel mean):

| Line                                                  | EN   | DE   | Claude EN / DE | Codex EN / DE | Clear | Credible | Distinctive | Energy and calm |
| ----------------------------------------------------- | ---- | ---- | -------------- | ------------- | ----- | -------- | ----------- | --------------- |
| b1: Agents bring the speed. Flow takes practice.      | 74.8 | 74.8 | 71.4 / 70.8    | 78.2 / 78.8   | 6.5   | 8.2      | 5.2         | 7.8             |
| n8: Agents bring the speed. We bring the calm.        | 72.0 | 70.0 | 70.8 / 69.1    | 73.3 / 71.0   | 5.5   | 6.3      | 6.3         | 8.9             |
| r4: You lead the agents. We show you how.             | 71.5 | 69.4 | 63.8 / 61.5    | 79.1 / 77.3   | 8.3   | 8.1      | 4.0         | 6.2             |
| f7: Agents bring the speed. Flow takes training.      | 70.0 | 69.5 | 63.1 / 61.3    | 76.9 / 77.7   | 7.8   | 7.3      | 4.5         | 6.6             |
| q6: Agents bring the speed. Flow needs teams in tune. | 66.2 | 73.5 | 64.1 / 71.0    | 68.4 / 76.0   | 6.5   | 7.8      | 5.6         | 7.8             |
| The current claim                                     | 26.3 | 23.1 | 27.8 / 23.8    | 24.8 / 22.5   | 4.3   | 2.0      | 3.0         | 2.7             |

As the home H1 over the lead sentence and the running hero visual, at 1440 px and 375 px (noise
3.5 per reviewer, 1.0 on the panel mean):

| Home H1           | EN   | DE   | Claude EN / DE | Codex EN / DE | Clear | Credible | Energy and calm | Fit with the visual |
| ----------------- | ---- | ---- | -------------- | ------------- | ----- | -------- | --------------- | ------------------- |
| q6                | 81.8 | 85.2 | 79.5 / 82.8    | 84.1 / 87.6   | 8.3   | 8.2      | 8.4             | 9.6                 |
| b1                | 76.7 | 77.2 | 71.3 / 71.2    | 82.1 / 83.1   | 7.7   | 8.1      | 8.1             | 7.1                 |
| f7                | 70.5 | 69.8 | 63.8 / 61.6    | 77.1 / 78.0   | 8.6   | 7.2      | 6.8             | 6.7                 |
| r4                | 70.0 | 68.2 | 60.8 / 59.4    | 79.3 / 76.9   | 8.6   | 8.2      | 6.8             | 4.8                 |
| n8                | 69.0 | 66.8 | 65.4 / 63.0    | 72.7 / 70.5   | 6.8   | 6.0      | 8.8             | 5.2                 |
| The current claim | 32.4 | 29.3 | 31.2 / 28.1    | 33.5 / 30.5   | 5.8   | 2.1      | 3.0             | 5.8                 |

## Recommendation

b1, as the claim and as the home H1. As the claim it leads in both languages, 2.8 (EN) and 4.8 (DE)
ahead of n8 and 3.3 and 5.4 ahead of r4 at a noise of 0.8, and is first with four of five personas.
Per model the lead is thinner: Claude puts it 0.6 and 1.7 ahead of n8, Codex puts r4 0.9 ahead in
English. As the home H1 q6 leads b1 by 5.1 (EN) and 8.0 (DE), outside the noise, with every persona.
Over both tests the two are level within the noise (q6 76.7, b1 75.9). The tie goes to b1: the
claim test covers every surface, where q6's English scores 8.6 below b1, and b1 says the same thing
in both languages, which q6 does not. b1 beats f7, round 5's recommendation, in both tests and both
languages by 4.8 to 7.4.

Taking q6 as the home H1 and b1 as the claim is possible, but it splits the one line the website
reads from `verbal.json`, and the home page then carries a headline the claim does not repeat.

The reviewers' remaining gaps for b1, which a yes accepts:

- No "we" and no team: who provides the practice stays implicit ("doesn't say who practises or that
  this company coaches it"), and "practice" can read as individual. The logo, the lead sentence and
  the hero visual carry the rest. Putting the team in ("Flow takes practice as a team", "Flow takes
  a practiced team") cost 7 to 9 points in English as the claim.
- "Übung" sounds slightly like school to some Claude reviewers; "Praxis" scored 9.1 lower.
- "Flow" stays abstract on the closing slide and the one-pager, where no hero visual explains it.
- Agents' speed is taken for granted.
- Fit with the hero visual 7.1 against q6's 9.6: the visual shows roles lining up, the line names
  practice.
- At 1440 px the home H1 breaks after "Flow", in both languages.

## What a yes changes

1. Brand, a minor release: `verbal.json` takes the new `claim` (en, de, `since`; `word.en` becomes
   "Flow", capitalised as in the line, since `test/verbal.test.ts` and the closing slide's highlight
   match the word case-sensitively), and the current claim moves into `retired` with
   `replacedBy: claim`. `position.en` and `boilerplate.en` quote the old claim's words
   ("unstoppable, in flow"), so the release rewrites both. `applications/channel-banners/render.py`
   writes the claim into the first LinkedIn profile banner, so it gets rewritten and re-rendered. The
   portal and `test/verbal.test.ts` read `verbal.json` and follow on their own.
2. Each consumer then raises its brand pin and picks the claim up, one session per repo:
   - website: the home H1 (`start.*.ts`), the footer slogan, the social cards and the OG alt text
     follow `verbal.claim`. `claimLines` in `src/copy/ui.ts` splits the footer slogan at the first
     comma, and b1 has none, so the split rule changes with it. Hard-coded copies change by hand: 14
     one-pager `<p class="claim">`, `scripts/og/template.html`, the boilerplate in
     `src/copy/press.ts`, `public/llms.txt`, `src/lib/structured-data.ts`, and the two e2e guards
     (`headline-motion`, `reflow-motion`). The H1's line break at 1440 px is set there. The
     `home-headline` item closes with it.
   - slides: the closing slide reads `verbal.claim` and its `word`, and `render-pptx.test.ts`
     follows.
   - trainer-hub: its decks have closed without the claim since 412dc47e, because the old claim
     scored lower there. Whether the new claim returns to the closing slide is a review there.
   - os: the business foundation quotes the claim in its position, brand promise and efficiency
     messaging, and the profile texts (LinkedIn tagline and headline) carry it. Benedikt's approved
     bio says "makes whole companies unstoppable", so that line needs his own new wording.
   - documents: no reference to the claim, so nothing changes.

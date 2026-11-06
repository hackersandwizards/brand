---
kind: decision
status: open
priority: 1
area: copy
owner: Benedikt, Stefan
evidence: "Blind review 06.11., two rounds, five personas, Claude and Codex; every candidate's scores in docs/agent-work/2026-11-06-new-claim.md"
recommended: a
options:
  - key: a
    label: "Calm teams ship sooner with agents. / Gelassene Teams liefern mit Agenten früher."
    detail: "Round 2: EN 75.2, DE 71.1 (Claude 69.8 / 66.4, Codex 80.6 / 75.8). Highest overall; first with three of five personas in both languages. Highlight word: Calm / Gelassene."
    score: 73
    noise: 1.3
  - key: b
    label: "Ship sooner with agents, and stay steady. / Mit Agenten früher liefern und ruhig bleiben."
    detail: "Round 2: EN 73.6, DE 70.2 (Claude 66.6 / 64.6, Codex 80.6 / 75.8). Tied with a. Several reviewers read the German 'ruhig bleiben' as an instruction to bear the pressure. Highlight word: steady / ruhig."
    score: 72
    noise: 1.3
  - key: c
    label: "Calm teams ship sooner. / Gelassene Teams liefern früher."
    detail: "Round 2: EN 69.4, DE 66.4. a without agents: most memorable (9.0), but clear only 3.6, since the line alone does not say what h&w works on."
    score: 68
    noise: 1.3
  - key: d
    label: "Ship sooner, stay steady. / Früher liefern, ruhig bleiben."
    detail: "Round 2: EN 69.2, DE 64.5. b without agents: memorable 9.1, clear 3.4, and distinctive 4.2, the lowest of the four: reviewers placed it on any DevOps vendor's site."
    score: 67
    noise: 1.3
---

# Which claim stands for h&w everywhere?

The founders answered the home headline question (website item `home-headline`) on 06.11. by asking
for a new claim in the direction of its winner, d. The claim stands on the home H1 and its social
card, the website footer, the one-pagers, the deck closing slide, the press boilerplate, LinkedIn
banners and profiles, and `verbal.json` `claim`. So it needs to be short and hold up without a
sentence under it, and d as a full sentence does not do that.

## Scores

Five personas, blind: a CTO of a Mittelstand manufacturer under board pressure, a VP of Engineering
at a scale-up, a Head of Engineering worried about quality and morale, a brand strategist for DACH
B2B tech services, and a senior developer reading the closing slide after a two-day training. Each
scored every pair on the home hero at 1440 px with its lead sentence and on the deck's closing slide
at 1920 x 1080, in English and German. Criteria were clear, credible, distinctive, energy and calm,
memorable and language, plus an overall score from 0 to 100. Claude and Codex both scored, the order
shuffled per reviewer, with nothing marking a line as current or naming its author. Round 1 scored 16
pairs twice. Noise is 4.7 points per reviewer and 1.3 points on the panel mean. Round 2 refined the
top five, and the current claim and d ran again as controls.

| Pair                                         | EN round 2 | DE round 2 | Clear | Distinctive | Energy and calm | Memorable |
| -------------------------------------------- | ---------- | ---------- | ----- | ----------- | --------------- | --------- |
| a: Calm teams ship sooner with agents.       | 75.2       | 71.1       | 6.5   | 6.2         | 8.5             | 7.5       |
| b: Ship sooner with agents, and stay steady. | 73.6       | 70.2       | 6.5   | 5.6         | 8.2             | 7.4       |
| c: Calm teams ship sooner.                   | 69.4       | 66.4       | 3.6   | 4.7         | 8.8             | 9.0       |
| d: Ship sooner, stay steady.                 | 69.2       | 64.5       | 3.4   | 4.2         | 8.7             | 9.1       |
| Control: d of `home-headline`, full          | 47.8       | 46.2       | 7.1   | 5.9         | 7.3             | 2.5       |
| Control: the current claim                   | 27.0       | 23.6       | 3.9   | 3.3         | 3.0             | 4.0       |

The current claim came last in both rounds, in both languages, with both models.
Its credible score was 2.0. The full d line scored memorable 2.5: reviewers called it a lead sentence
rather than a claim, one counted six lines in the hero.

## Recommendation

a. It is the highest overall. a or b is first with every persona, and a is first in both languages
with three of five: the VP of Engineering preferred b, the developer b in German. Over its short form
c, a leads by 5.8 (EN) and 4.7 (DE) with both models, outside the noise. Against b the lead is 1.6
and 0.9, a tie: Codex scored both the same, Claude preferred a. The tie breaks on the German. b's
"ruhig bleiben" read to Codex reviewers as a call to bear the pressure, and to Claude reviewers as a
to-do list. a's German has a word-order flaw that one edit fixes.

The reviewers' remaining gaps for a, which a yes accepts or a follow-up review fixes:

- "Calm" can read as a precondition, teams that are already calm, rather than what h&w helps a
  team become. Codex raised it for four of five personas.
- The German word order "liefern mit Agenten früher" read as clunky to all five Claude reviewers.
  "Mit Agenten liefern gelassene Teams früher." fixes the order and has not been scored.
- Distinctive stays at about 6. "Sooner" is still something any delivery firm could say, the same
  gap the home headline review found.

## What a yes changes

1. Brand, a minor release: `verbal.json` takes the new `claim` (en, de, `word`, `since`), and the
   current claim moves into `retired` with `replacedBy: claim`. `position.en` and `boilerplate.en`
   quote the old claim's words ("unstoppable, in flow"), so the release rewrites both.
   `applications/channel-banners/render.py` writes the claim into the first LinkedIn profile
   banner, so it gets rewritten and re-rendered. The portal and `test/verbal.test.ts` read
   `verbal.json` and follow on their own.
2. Each consumer then raises its brand pin and picks the claim up, one session per repo:
   - website: the home H1 (`start.*.ts`), the footer slogan, the social cards and the OG alt text
     follow `verbal.claim`. `claimLines` in `src/copy/ui.ts` splits the footer slogan at the first
     comma, and a has none. Hard-coded copies change by hand: 14 one-pager `<p class="claim">`,
     `scripts/og/template.html`, the boilerplate in `src/copy/press.ts`, `public/llms.txt`,
     `src/lib/structured-data.ts`, and the two e2e guards (`headline-motion`, `reflow-motion`).
     The `home-headline` item closes with it.
   - slides: the closing slide reads `verbal.claim` and its `word`, and `render-pptx.test.ts`
     follows.
   - trainer-hub: its decks have closed without the claim since 412dc47e, because the old claim
     scored lower there. Whether the new claim returns to the closing slide is a review there.
   - os: the business foundation quotes the claim in its position, brand promise and efficiency
     messaging, and the profile texts (LinkedIn tagline and headline) carry it. Benedikt's
     approved bio says "makes whole companies unstoppable", so that line needs his own new wording.
   - documents: no reference to the claim, so nothing changes.

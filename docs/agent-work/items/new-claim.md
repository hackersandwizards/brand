---
kind: decision
status: open
priority: 1
area: copy
owner: Benedikt, Stefan
evidence: "Blind review 06.11., three rounds, five personas, Claude and Codex; every candidate's scores in docs/agent-work/2026-11-06-new-claim.md"
recommended: a
options:
  - key: a
    label: "Calm teams ship sooner with agents. / Gelassene Teams liefern mit Agenten früher."
    detail: "Round 3: claim EN 74.2, DE 68.6; as home H1 EN 80.8, DE 77.6, first with every persona. The claim is the home H1, as it is today."
    score: 71
    noise: 1.0
  - key: b
    label: "Ship sooner with agents, and stay steady. / Mit Agenten früher liefern und ruhig bleiben."
    detail: "Round 3: claim EN 69.6, DE 67.7. Ties a in German, 4.6 behind in English. Reviewers read 'ruhig bleiben' as a call to keep calm under pressure."
    score: 69
    noise: 1.0
  - key: a2
    label: "a with the German word order changed: Mit Agenten liefern gelassene Teams früher."
    detail: "Round 3: DE 62.8, 5.8 below a's own German. Reviewers read the fronted 'Mit Agenten' as constructed and the tool put ahead of the people."
    score: 68
    noise: 1.0
  - key: f
    label: "The current claim without 'unstoppable': Your whole company in flow with agentic engineering. / Euer ganzes Unternehmen im Flow mit Agentic Engineering."
    detail: "Round 3: claim EN 48.2, DE 42.9; as home H1 EN 59.0, DE 56.5. Above the current claim, below a, b and a2 with every persona, in both languages, with both models."
    score: 46
    noise: 1.0
---

# Which claim stands for h&w everywhere?

The claim stands on the home H1 and its social card, the website footer, the one-pagers, the deck
closing slide, the press boilerplate, LinkedIn banners and profiles, and `verbal.json` `claim`. Round
3 scored the four lines above and the current claim as claims, then the home hero in three
arrangements, then where the long outcome line (option d of the website item `home-headline`) would
stand if it is not the home H1.

## Scores, round 3

Five personas, blind: a CTO of a Mittelstand manufacturer under board pressure, a VP of Engineering
at a scale-up, a Head of Engineering worried about quality and morale, a brand strategist for DACH
B2B tech services, and a senior developer reading the closing slide after a two-day training.
Claude and Codex, two runs each, the order shuffled per reviewer, nothing marking a line as current
or naming its author. Overall 0 to 100, mean of all reviewers.

As the claim, shown on the home hero at 1440 px, the deck closing slide and the one-pager header
(noise 3.8 per reviewer, 1.0 on the panel mean):

| Line                                                              | EN   | DE   | Clear | Credible | Distinctive | Energy and calm |
| ----------------------------------------------------------------- | ---- | ---- | ----- | -------- | ----------- | --------------- |
| a: Calm teams ship sooner with agents.                            | 74.2 | 68.6 | 5.7   | 7.1      | 6.1         | 8.3             |
| b: Ship sooner with agents, and stay steady.                      | 69.6 | 67.7 | 6.0   | 7.2      | 5.1         | 7.6             |
| a2: a, German "Mit Agenten liefern gelassene Teams früher."       | 74.1 | 62.8 | 5.6   | 7.1      | 6.1         | 8.0             |
| f: Your whole company in flow with agentic engineering.           | 48.2 | 42.9 | 4.5   | 4.8      | 3.8         | 5.6             |
| Control: Your whole company unstoppable, in flow with agentic ... | 27.8 | 23.3 | 3.8   | 2.0      | 3.2         | 3.0             |

As the home hero, the H1 over the current lead sentence at 1440 px and 375 px (noise 4.3 per
reviewer, 0.6 on the panel mean):

| Home hero                                   | EN   | DE   | Clear | Credible | Distinctive | Energy and calm |
| ------------------------------------------- | ---- | ---- | ----- | -------- | ----------- | --------------- |
| a as H1                                     | 80.8 | 77.6 | 7.7   | 7.5      | 7.4         | 8.6             |
| d as H1, a as a small line above it         | 74.6 | 71.5 | 7.9   | 7.4      | 6.9         | 7.9             |
| d as H1, f as a small line above it         | 69.3 | 66.8 | 7.7   | 6.8      | 6.0         | 7.0             |
| f as H1                                     | 59.0 | 56.5 | 6.5   | 5.6      | 4.4         | 6.1             |
| Control: the current claim as H1, unchanged | 40.1 | 36.5 | 6.0   | 2.6      | 3.7         | 3.1             |

Where d stands if it is not the home H1: d on the first screen of four live pages against that
page's current first screen at 1440 px, scored as the first screen of that page (two runs, noise
2.8 per reviewer, 0.8 on the panel mean):

| Page                              | Current first screen EN / DE | With d EN / DE | Fit current / d |
| --------------------------------- | ---------------------------- | -------------- | --------------- |
| Home, a as H1, d as the lead line | 83.7 / 80.0                  | 62.8 / 59.0    | 8.7 / 6.3       |
| Enablement, d as H1               | 82.6 / 78.0                  | 67.8 / 64.8    | 8.8 / 6.3       |
| Enablement at scale, d as H1      | 85.7 / 83.8                  | 66.7 / 64.0    | 9.4 / 6.2       |
| Software Factory, d as H1         | 74.3 / 75.3                  | 69.4 / 66.5    | 8.5 / 6.7       |

d lost on every page, in both languages, with both models. On the home page it drops what h&w
does: the current lead says training and mentoring, d repeats the outcome. On the other pages it
names neither the page's subject nor h&w's work, runs to six lines, and "they" reads as either the
teams or the customers. So d stands nowhere as a headline; the claim carries its direction.

## Recommendation

a, as the claim and as the home H1. It leads both tables. As the claim it is first in English with
every persona and in German with three of five; the brand strategist and the developer put b first
in German. As the home hero it is first with every persona in both languages, 6.2 points (EN) and
6.1 (DE) ahead of d with a above it, with both models.

f, the current claim without "unstoppable", gains about 20 points on the current claim but stays
26 (EN) and 26 (DE) points behind a as the claim, and 22 and 21 behind it as the home H1. The
reviewers named the same three reasons with both models: "whole company" overreaches for a training
firm, "in flow" names no outcome, and the German reads as Denglisch.

The German word-order fix a2 did not help: it scored 5.8 below a's own German, outside the noise.
a keeps "Gelassene Teams liefern mit Agenten früher."

The reviewers' remaining gaps for a, which a yes accepts:

- The line does not say that h&w trains and mentors. On the home page the lead sentence carries it;
  on the closing slide and the one-pager the context does.
- Codex reviewers read "calm" as a precondition, teams that are already calm, rather than what h&w
  helps a team become, for every persona.
- In German, Claude reviewers read the sentence-final "früher" as possibly "formerly".

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

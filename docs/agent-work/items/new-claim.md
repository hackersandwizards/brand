---
kind: decision
status: open
priority: 1
area: copy
owner: Benedikt, Stefan
evidence: "Blind review 06.11., four rounds, five personas, Claude and Codex; every candidate's scores in docs/agent-work/2026-11-06-new-claim.md"
recommended: n8
options:
  - key: n8
    label: "Agents bring the speed. We bring the calm. / Agenten bringen das Tempo. Wir bringen die Ruhe."
    detail: "Round 4: claim EN 76.7, DE 74.8; as home H1 EN 79.8, DE 79.2, first with both models, Codex's English a tie with r4. Energy and calm 9.4, the highest of any line. Highlight word: calm / Ruhe."
    score: 76
    noise: 0.9
  - key: r4
    label: "You lead the agents. We show you how. / Ihr führt die Agenten. Wir zeigen euch, wie."
    detail: "Round 4: claim EN 77.0, DE 75.8, a tie with n8; as home H1 EN 77.8, DE 75.8, 2.0 and 3.4 behind n8. The clearest and most credible line (8.6), but energy and calm only 6.0."
    score: 76
    noise: 0.9
  - key: r5
    label: "Ship fast with agents and sleep well. / Mit Agenten schnell liefern und ruhig schlafen."
    detail: "Round 4: claim EN 71.0, DE 67.5; as home H1 EN 71.9, DE 69.4. Energy and calm 8.9, but reviewers placed 'sleep well' on any DevOps vendor's site."
    score: 69
    noise: 0.9
  - key: a
    label: "Calm teams ship sooner with agents. / Gelassene Teams liefern mit Agenten früher."
    detail: "Round 4, as a control: claim EN 62.5, DE 55.5; as home H1 EN 69.8, DE 63.4. Led rounds 2 and 3; 14 to 19 points behind n8 once the new lines ran beside it."
    score: 59
    noise: 0.9
---

# Which claim stands for h&w everywhere?

The claim stands on the home H1 and its social card, the website footer, the one-pagers, the deck
closing slide, the press boilerplate, LinkedIn banners and profiles, and `verbal.json` `claim`.
Four blind rounds scored the lines. The report `docs/agent-work/2026-11-06-new-claim.md` keeps every
round's table, the method and a reviewer prompt.

## Scores

Five personas: a CTO of a Mittelstand manufacturer under board pressure, a VP of Engineering at a
scale-up, a Head of Engineering worried about quality and morale, a brand strategist for DACH B2B
tech services, and a senior developer after a two-day training. Claude and Codex, two runs each,
the order shuffled per reviewer, nothing marking a line as current or naming its author. Overall 0
to 100, mean of all reviewers.

As the claim, on the home hero at 1440 px, the deck closing slide and the one-pager header (round
4, second pass, noise 3.4 per reviewer, 0.9 on the panel mean):

| Line                                           | EN   | DE   | Clear | Credible | Distinctive | Energy and calm | Memorable |
| ---------------------------------------------- | ---- | ---- | ----- | -------- | ----------- | --------------- | --------- |
| r4: You lead the agents. We show you how.      | 77.0 | 75.8 | 7.6   | 8.6      | 5.2         | 6.0             | 8.5       |
| n8: Agents bring the speed. We bring the calm. | 76.7 | 74.8 | 5.3   | 6.7      | 6.6         | 9.4             | 8.9       |
| r5: Ship fast with agents and sleep well.      | 71.0 | 67.5 | 5.8   | 6.3      | 5.0         | 8.9             | 8.1       |
| a: Calm teams ship sooner with agents.         | 62.5 | 55.5 | 4.7   | 5.7      | 5.5         | 7.7             | 6.6       |
| The current claim                              | 26.3 | 22.6 | 3.4   | 1.9      | 2.8         | 3.5             | 3.2       |

As the home H1 over the current lead sentence, at 1440 px and 375 px (noise 2.3 per reviewer, 0.8
on the panel mean):

| Home H1           | EN   | DE   | Claude EN / DE | Codex EN / DE | Clear | Credible | Distinctive | Energy and calm |
| ----------------- | ---- | ---- | -------------- | ------------- | ----- | -------- | ----------- | --------------- |
| n8                | 79.8 | 79.2 | 77.3 / 76.3    | 82.2 / 82.1   | 7.5   | 7.3      | 7.1         | 9.2             |
| r4                | 77.8 | 75.8 | 73.8 / 72.1    | 81.9 / 79.4   | 8.6   | 8.6      | 5.2         | 6.4             |
| r5                | 71.9 | 69.4 | 65.2 / 62.2    | 78.6 / 76.6   | 7.5   | 6.2      | 5.0         | 8.3             |
| a                 | 69.8 | 63.4 | 63.5 / 57.9    | 76.0 / 68.9   | 7.1   | 6.6      | 5.6         | 7.3             |
| The current claim | 39.8 | 35.2 | 39.9 / 35.4    | 39.7 / 35.0   | 5.5   | 2.8      | 3.2         | 3.5             |

The long outcome line d of the website item `home-headline` stands nowhere as a headline: on the
first screen of the home page, Enablement, Enablement at scale and Software Factory it scored 5 to
21 points below each page's current first screen, in both languages, with both models.

## Recommendation

n8, as the claim and as the home H1. As the claim it ties r4: the lead is 0.3 (EN) and 1.0 (DE) at
a noise of 0.9, and the models split, Claude for n8, Codex for r4. As the home H1 n8 leads r4 by 2.0
and 3.4, outside the noise, with Claude in both languages and with Codex in German; Codex's English
is a tie. The tie on the claim breaks on energy and calm: n8 scores 9.4, r4 6.0, and energy and calm
together was the direction the claim search started from. On the claim n8 is first with the Head of
Engineering and the brand strategist, r4 with the CTO, the VP of Engineering and the developer.

n8 closes the gaps a left: the calm is what h&w brings, not a trait a team needs beforehand;
distinctive rose from 5.5 to 6.6 against a in the same pass; the German ends on "Ruhe", not on
"früher". The pass also tested "Wir bringen Gelassenheit": 3.3 points below "die Ruhe" in German.

The reviewers' remaining gaps for n8, which a yes accepts:

- The line implies the training and mentoring but does not name them. On the home page the lead
  sentence names them; on the closing slide and the one-pager the context does.
- "We" needs the logo beside it, as in a mail signature or a banner.
- Codex reviewers read "Agents bring the speed" as giving agents the credit for speed, and some
  read "Ruhe" as standing still.
- n8 names agents before people. r4 puts people first.

## What a yes changes

1. Brand, a minor release: `verbal.json` takes the new `claim` (en, de, `word` calm / Ruhe,
   `since`), and the current claim moves into `retired` with `replacedBy: claim`. `position.en` and
   `boilerplate.en` quote the old claim's words ("unstoppable, in flow"), so the release rewrites
   both.
   `applications/channel-banners/render.py` writes the claim into the first LinkedIn profile
   banner, so it gets rewritten and re-rendered. The portal and `test/verbal.test.ts` read
   `verbal.json` and follow on their own.
2. Each consumer then raises its brand pin and picks the claim up, one session per repo:
   - website: the home H1 (`start.*.ts`), the footer slogan, the social cards and the OG alt text
     follow `verbal.claim`. `claimLines` in `src/copy/ui.ts` splits the footer slogan at the first
     comma, and n8 has none: it breaks at the full stop between its two sentences or stays on one line. Hard-coded copies change by hand: 14 one-pager `<p class="claim">`,
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

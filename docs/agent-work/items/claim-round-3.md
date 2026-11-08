---
kind: decision
status: open
priority: 1
order: 90
area: brand
owner: Benedikt
evidence: "Blind review 08.11., round 4: 21 lines prefiltered on text by 6 reviewer runs; 264 cold reads of one LinkedIn banner each (11 claims, alone and with a descriptor line, English and German, 3 personas, Claude and Codex), graded blind by Claude and Codex (258 of 264 grades agree); then 11 and 6 claims on 11 surfaces in two passes, 5 personas, Claude and Codex, two runs each, 40 reviewer runs. Round 3 before it: 54 reviewer runs. Report: docs/agent-work/2026-11-08-claim-round-4.md"
recommended: m08k
options:
  - key: m08k
    label: "Every agent needs a team. / Jeder KI-Agent braucht ein Team. On the banners with the line: Training and mentoring in agentic engineering / Training und Mentoring in Agentic Engineering"
    detail: "First in pass 2, ahead of every other claim in both runs with both models (Claude 77.5, Codex 81.5). Calm (8.6), natural (language 8.9), credible (8.3). 'KI-Agent' removes the spy reading of 'Agent' that cost m08 in German (78.8 against 75.5); reviewers find it a little heavier. Training stays implicit without the descriptor line. Above the home H1, m08 scored 72.0 against 79.8 for the empty slot in round 3, so with it the home hero keeps nothing above the H1."
    score: 79.5
    noise: 0.1
  - key: m08
    label: "Every agent needs a team. / Jeder Agent braucht ein Team. With the same descriptor line on the banners"
    detail: "m08k's English with the German as in round 3. First in pass 1 (79.9, noise 0.6). In German, 11 of 20 pass-1 reviewers name 'Agent' as reading like a spy, a sales agent or call-centre staff."
    score: 77.8
    noise: 0.2
  - key: a6
    label: "More code isn't faster delivery. / Mehr Code heißt nicht schneller liefern. With the descriptor line on the banners"
    detail: "Round 3's lead, here 6.5 behind m08k with both models. Most credible (8.9). Reviewers call it a thesis or talk title, not a claim, and the German clumsy. The weakest footer (64.2). Keeps the home H1 line it won in round 3 (see home-claim-line)."
    score: 73.0
    noise: 1.5
  - key: d01k
    label: "We teach teams to ship with agents. / Wir machen eure Teams fit für Agenten. On the banners alone"
    detail: "The best descriptive claim: says what h&w does, so the banners need no second line (12 of 12 cold readers named training). Codex likes it (80.5), Claude does not (64.5): 'clear but forgettable, any AI training company could say it' (distinctive 4.9, emotional 4.9)."
    score: 72.5
    noise: 0.2
  - key: e01
    label: "Proud of every release. / Stolz auf jedes Release. With the descriptor line on the banners"
    detail: "The best emotional claim of 12 drafted: most emotional (8.0) and calmest (9.1), best on the closing slide (80.4). Alone it says nothing of agents or training (clear 4.5), weakest on the link preview (66.8), where no descriptor stands."
    score: 70.2
    noise: 2.0
  - key: c3
    label: "Agents in the team. Teams in flow. / Agenten im Team. Teams im Flow. (in verbal.json since v1.29.0)"
    detail: "Unmarked control. Last in pass 2. Least distinctive (4.4): reviewers place 'Flow' beside Slalom's German claim."
    score: 69.2
    noise: 0.1
images:
  m08k:
    - src: r4-m08k-banners.jpg
      caption: "m08k: LinkedIn profile, X, XING, Sessionize, LinkedIn page and YouTube banners with the descriptor line, English above German"
    - src: r4-m08k-surfaces.jpg
      caption: "m08k: closing slide, link preview, one-pager header and phone footer, English above German"
    - src: r4-banner-alone-and-descriptor.jpg
      caption: "The LinkedIn profile banner of m08, a6, c3, e01 and d01, the claim alone on the left, with the descriptor line on the right"
  m08:
    - src: r4-m08-banners.jpg
      caption: "m08: banners with the descriptor line, English above German"
    - src: r4-m08-surfaces.jpg
      caption: "m08: slide, link preview, one-pager, footer, English above German"
    - src: m08-website.jpg
      caption: "Round 3, m08: home hero (desktop and phone) and footer"
  a6:
    - src: r4-a6-banners.jpg
      caption: "a6: banners with the descriptor line, English above German"
    - src: r4-a6-surfaces.jpg
      caption: "a6: slide, link preview, one-pager, footer, English above German"
    - src: a6-website.jpg
      caption: "Round 3, a6: home hero (desktop and phone) and footer"
  d01k:
    - src: r4-d01k-banners.jpg
      caption: "d01k: banners with the claim alone, English above German"
    - src: r4-d01k-surfaces.jpg
      caption: "d01k: slide, link preview, one-pager, footer, English above German"
  e01:
    - src: r4-e01-banners.jpg
      caption: "e01: banners with the descriptor line, English above German"
    - src: r4-e01-surfaces.jpg
      caption: "e01: slide, link preview, one-pager, footer, English above German"
  c3:
    - src: r4-c3-banners.jpg
      caption: "c3: banners with the descriptor line, English above German"
    - src: r4-c3-surfaces.jpg
      caption: "c3: slide, link preview, one-pager, footer, English above German"
    - src: c3-website.jpg
      caption: "Round 3, c3: home hero (desktop and phone) and footer"
---

# Which claim replaces c3?

No short claim works alone on a banner: shown alone on a LinkedIn banner, a6, m08, c3 and the four
emotional claims each got 0 of 12 cold readers to say that h&w trains people in working with AI
agents, while with the line "Training and mentoring in agentic engineering" under them all 12 did,
and the panel scored the banners 6 to 16 points higher (m08 73.8 to 83.4, a6 70.2 to 80.2). So the banner is a claim plus
a descriptor line, and the claim can stay short. "Think different" ran beside a name every reader
knew; hackers&wizards names no offer, so the descriptor line has to say it.

I recommend m08k, "Every agent needs a team." / "Jeder KI-Agent braucht ein Team.", with that
line on the banners: first in pass 2 (79.5, noise 0.1), ahead in both runs with both models.

The other questions of this round:

- A descriptive claim does not beat a short claim with a descriptor. The best one, d01k, scores
  72.5: clear, but "any AI training company could say it". The retired line ("Your whole company
  unstoppable, …") scored 31.9, last on every surface: "unstoppable" reads as hype, the line runs
  long, and alone it names agentic engineering but not that h&w trains (0 of 12).
- Emotional claims: 12 drafted from the research, positive and short. The best, "Proud of every
  release." (e01), is the most emotional line of the field (8.0) and scores 70.2. The emotion
  holds, the line says nothing about agents, and the link preview and slide carry no descriptor.
  m08k sits between the two: a stance with feeling (7.1) that still names agents.
- a6 drops to third. Reviewers call the negation a thesis or a talk title rather than a claim.

Overall is the panel mean, 0 to 100, over English and German and over all surfaces. Noise is the
difference between the panel means of the two runs. A lead inside the noise is a tie.

## Per surface, pass 2

| Surface          | m08k        | m08         | a6          | d01k        | e01         | c3          |
| ---------------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- |
| Six banners      | 81.6        | 80.2        | 77.6        | 76.4        | 75.0        | 74.3        |
| Closing slide    | 80.1        | 79.5        | 74.6        | 70.0        | 80.4        | 76.4        |
| Link preview     | 78.0        | 74.8        | 76.2        | 76.2        | 66.8        | 73.0        |
| One-pager header | 78.8        | 77.9        | 74.1        | 74.9        | 72.0        | 71.6        |
| Footer (phone)   | 78.3        | 76.1        | 64.2        | 77.4        | 68.9        | 70.2        |
| Overall          | 79.5        | 77.8        | 73.0        | 72.5        | 70.2        | 69.2        |
| Claude / Codex   | 77.5 / 81.5 | 76.8 / 78.8 | 69.7 / 76.2 | 64.5 / 80.5 | 70.9 / 69.5 | 65.7 / 72.6 |
| EN / DE          | 80.2 / 78.8 | 80.2 / 75.5 | 74.4 / 71.5 | 76.6 / 68.3 | 71.2 / 69.2 | 70.1 / 68.2 |

Criteria (0 to 10): m08k distinctive 7.4, clear 7.2, emotional 7.1, credible 8.3, calm 8.6,
language 8.9. The rest is in the report.

## What choosing changes

- Any claim but c3: brand changes `claim` in `verbal/verbal.json`, retires c3 there, and releases.
  `claim.word` (the accent word on the banners) names "flow" today; m08k holds no such word, so
  the banners draw it without an accent or with a new word. The banners gain the descriptor line:
  `applications/channel-banners/render.py` sets it under the claim (Mono 500, 0.62 of the claim
  size, as tested), and `verbal.json` holds its text so the banners and other consumers read it
  from one place. The consumers read the claim from their brand pin: the website's footer and
  link preview, the slides closing slide, the os one-pagers, three trainer hub decks.
- With m08k or m08: `home-claim-line` keeps nothing above the H1 (m08 there 72.0 against 79.8 for
  the empty slot in round 3); its option eyebrow-a6 holds only for a6.
- c3: nothing changes.

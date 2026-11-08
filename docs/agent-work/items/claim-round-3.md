---
kind: decision
status: open
priority: 1
order: 90
area: brand
owner: Benedikt
evidence: "Blind review 08.11., round 5: the vendors' own lines fetched (Paperclip: 'A team of agents for every person.'); 944 cold reads of one LinkedIn banner each (11 claims, alone and with the descriptor line, English and German, CTO, VP Engineering, engineering lead and a LinkedIn reader from outside tech, Claude and Codex, two runs), asking what the team is and which kind of company would say the line; 12 claims on banners, closing slide and link preview by round 4's panel, 20 reviewer runs. Round 4 before it: 304 reviewer runs, round 3: 54. Report: docs/agent-work/2026-11-08-claim-round-5.md"
recommended: n02
options:
  - key: n02
    label: "Every agent needs your people. / Jeder KI-Agent braucht eure Leute. On the banners with the line: Training and mentoring in agentic engineering / Training und Mentoring in Agentic Engineering"
    detail: "Read as people by 32 of 32 cold readers. Alone, every buyer persona names training (EN 12 of 16, the 4 vendor guesses all from the reader outside tech; DE 16 of 16). Second on the panel, 1.4 behind m08k (2.2 and 0.7 per run, 0.9 with Claude, 2.0 with Codex). Reviewers: training still rests on the descriptor; 'your people' reads to some as flattery; the link preview orphans 'people.'."
    score: 75.2
    noise: 0.6
  - key: m08k
    label: "Every agent needs a team. / Jeder KI-Agent braucht ein Team. With the descriptor line on the banners"
    detail: "First on the panel again. Shown alone, the English makes 16 of 16 cold readers guess an AI tool vendor (German 7 of 16); the team reads as agents 5, unclear 8, people 3 of 16 in English, people 15 of 16 in German. With the descriptor all 32 name training, but slide and link preview carry no descriptor. Paperclip heads its site with 'A team of agents for every person.'"
    score: 76.6
    noise: 0.9
  - key: a6
    label: "More code isn't faster delivery. / Mehr Code heißt nicht schneller liefern. With the descriptor line on the banners"
    detail: "Ties n02 on the panel (Claude prefers n02, Codex a6). No cold reader guesses a vendor. Most credible (9.0). A negation."
    score: 74.4
    noise: 0.1
  - key: m08
    label: "Every agent needs a team. / Jeder Agent braucht ein Team. With the descriptor line on the banners"
    detail: "m08k's English, so the same vendor reading. German alone: 9 of 16 guess a vendor, 6 of 16 cannot say what the team is."
    score: 74.6
    noise: 0.2
  - key: n10
    label: "Your people lead. Agents follow. / Eure Leute führen. KI-Agenten folgen. With the descriptor line on the banners"
    detail: "Third on the panel, but alone it reads as software sold to staff: 7 of 16 guess a tool vendor in English, 10 of 16 in German, though all 32 read the people as humans."
    score: 73.2
    noise: 1.8
  - key: n04
    label: "Behind every agent, your people. / Hinter jedem KI-Agenten stehen eure Leute. With the descriptor line on the banners"
    detail: "The same readings as n02 (people 32 of 32; vendor only from the reader outside tech, 4 of 16 in English), 4.1 lower on the panel."
    score: 71.1
    noise: 1.5
  - key: d01k
    label: "We teach teams to ship with agents. / Wir machen eure Teams fit für Agenten. On the banners alone"
    detail: "The only line that names training alone (32 of 32, sure at 8.0 to 8.5). Codex 80.0, Claude 61.4: clear but not distinctive (4.8) or emotional (5.0)."
    score: 70.7
    noise: 1.6
  - key: e01
    label: "Proud of every release. / Stolz auf jedes Release. With the descriptor line on the banners"
    detail: "Most emotional (8.1). Alone, 30 of 32 readers answer 'other' for the kind of company; weakest on the link preview (67.7)."
    score: 68.0
    noise: 1.9
  - key: c3
    label: "Agents in the team. Teams in flow. / Agenten im Team. Teams im Flow. (in verbal.json since v1.29.0)"
    detail: "Unmarked control, last on the panel, least distinctive (3.8)."
    score: 65.0
    noise: 3.8
images:
  n02:
    - src: r5-n02-banners.jpg
      caption: "n02: LinkedIn profile, X and Sessionize banners with the descriptor line, English left, German right"
    - src: r5-n02-surfaces.jpg
      caption: "n02: closing slide and link preview, English left, German right"
    - src: r5-m08k-n02-alone.jpg
      caption: "The LinkedIn banner alone, as the cold readers saw it: m08k left, n02 right, English above German"
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

Benedikt, 08.11.: "n02 finde ich cool. lass uns trotzdem noch mal weiter iterieren ich habe noch einige ideen im chat". n02 is his preferred line, a hypothesis for the next round, not yet the decision. The next round scores his ideas blind beside n02; it waits for him to share them.

I recommend n02, "Every agent needs your people." / "Jeder KI-Agent braucht eure Leute.", with
the line "Training and mentoring in agentic engineering" under it on the banners. Round 4's m08k
loses the recommendation, because without the descriptor it reads as an AI tool vendor.

- Alone on a LinkedIn banner, the English m08k makes 16 of 16 cold readers guess a company that
  sells AI agent software, across CTO, VP Engineering, engineering lead and a LinkedIn reader,
  with Claude and Codex in both runs. The German makes 7 of 16 guess one. With the descriptor, all
  32 name training. The closing slide and the link preview show the line without it.
- Multi-agent vendors use "team of agents" as their category term. Paperclip heads its site with
  "A team of agents for every person.", which turns m08k around. No company was found using the
  claim itself.
- n02 keeps m08k's sentence and makes the team the reader's own people: 32 of 32 read it as people,
  and every buyer persona names training even without the descriptor. On the panel it comes
  second, 75.2 (noise 0.6), 1.4 behind m08k (2.2 and 0.7 per run, 0.9 with Claude, 2.0 with
  Codex). It ties a6 (74.4: Claude prefers n02, Codex a6), and wins the tie as a positive line: a6 is a negation.
- Still owed before it goes out: a trademark clearance in DPMA, EUIPO and USPTO (only a web search
  ran), and n02 on the one-pager, footer and remaining banners, which this round did not draw.

Overall is the mean of each reviewer's own overall score, 0 to 100, over English and German, not
the mean of the surface scores. Noise is the difference between the panel means of the two runs.
A lead counts only outside the noise and in both runs with both models; otherwise it is a tie.

## Cold reads, banner alone (16 per cell)

| Key  | EN: tool vendor | DE: tool vendor | EN: team read as people | DE: team read as people |
| ---- | --------------- | --------------- | ----------------------- | ----------------------- |
| m08k | 16              | 7               | 3                       | 15                      |
| n02  | 4               | 0               | 16                      | 16                      |
| a6   | 0               | 0               | (no agents named)       | (no agents named)       |
| n04  | 4               | 0               | 16                      | 16                      |
| d01k | 0               | 0               | 16                      | 16                      |

## Per surface, this round

| Surface        | m08k        | n02         | m08         | a6          | n04         | d01k        | e01         | c3          |
| -------------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- |
| Banners        | 80.2        | 78.2        | 79.2        | 78.4        | 74.3        | 76.6        | 74.6        | 71.5        |
| Closing slide  | 75.3        | 74.4        | 73.5        | 73.1        | 71.7        | 70.0        | 75.0        | 69.3        |
| Link preview   | 76.1        | 75.2        | 73.5        | 77.1        | 72.2        | 72.5        | 67.7        | 71.0        |
| Overall        | 76.6        | 75.2        | 74.6        | 74.4        | 71.1        | 70.7        | 68.0        | 65.0        |
| Claude / Codex | 74.5 / 78.7 | 73.6 / 76.7 | 73.4 / 75.8 | 71.3 / 77.4 | 71.0 / 71.2 | 61.4 / 80.0 | 69.7 / 66.3 | 61.5 / 68.5 |
| EN / DE        | 76.3 / 76.9 | 74.4 / 75.9 | 76.3 / 72.8 | 75.8 / 72.9 | 70.5 / 71.7 | 74.5 / 67.0 | 68.7 / 67.3 | 66.0 / 64.0 |

Criteria (0 to 10): n02 distinctive 6.3, clear 7.0, emotional 7.3, credible 7.8, calm 8.4,
language 8.5. Round 4's images of m08k, m08, a6, d01k, e01 and c3 stay in this folder.

## What choosing changes

- Any claim but c3: brand changes `claim` in `verbal/verbal.json`, retires c3 there, and releases.
  `claim.word` (the accent word on the banners) names "flow" today; for n02 it could name
  "people" / "Leute", or the banners draw no accent. The banners gain the descriptor line:
  `applications/channel-banners/render.py` sets it under the claim (Mono 500, 0.62 of the claim
  size, as tested), and `verbal.json` holds its text so that consumers read it from one place. The
  consumers read the claim from their brand pin: the website's footer and link preview, the
  slides closing slide, the os one-pagers, three trainer hub decks.
- With n02, the website's link preview needs a balanced wrap, or "people." stands alone on its
  line.
- `home-claim-line`: n02 above the home H1 is untested; with m08k or m08 the slot stays empty, as
  round 3 measured (m08 there 72.0 against 79.8 for the empty slot).
- c3: nothing changes.

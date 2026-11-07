---
kind: decision
status: open
priority: 1
order: 16
area: copy
owner: Benedikt
evidence: "Blind review 07.11., two passes plus a pairing pass, six to seven personas, Claude and Codex, two runs each; every candidate's scores in docs/agent-work/2026-11-07-claim-and-headline.md. Score: mean of the claim test (pass 2, closing slide, one-pager header and profile banner, EN and DE) and the home page with the headline k3 (pairing pass, EN and DE); for q6 today's page."
recommended: c2
options:
  - key: c2
    label: "Flow is a team sport. / Flow ist Teamsport."
    detail: "Claim test 73.6 (EN 73.4, DE 73.8), second; memorable 8.4, language 9.4, distinctive 4.7 ('a familiar formula'), agents unnamed. With the headline k3 the best page of the pairing pass, 77.8, ahead of c3 with k3 by 4.5 with both models and all six personas: 'together' 8.0. Tied with c3 over both tests inside the noise and recommended because it needs no exception: it works above the H1 and on every other surface. One sentence: the banner renderer and the website footer split the claim at its first sentence and need a one-sentence path."
    score: 75.7
    noise: 1.5
  - key: c3
    label: "Agents in the team. Teams in flow. / Agenten im Team. Teams im Flow."
    detail: "Claim test 77.1 (EN 76.6, DE 77.6), first in both passes with all seven personas and both models, 3.5 ahead of c2 at a noise of 1.8; fit 8.6, distinctive 6.3. As a page with k3 it scored 73.3: it repeats the headline's 'agents' and 'teams', 'together' 6.2. Taking it means the home page keeps the claim off the line above the H1, an untested layout."
    score: 75.2
    noise: 1.5
  - key: r3
    label: "Teams with agents. Teams in flow. / Teams mit Agenten. Teams im Flow."
    detail: "c3 with agents as the teams' tool rather than team members. Claim test 71.7, third; with k3 69.8. The repetition reads 'flat, like a list'."
    score: 70.8
    noise: 1.5
  - key: q6
    label: "Keep q6: Agents bring the speed. Flow needs teams in tune. / Agenten bringen das Tempo. Flow braucht eingespielte Teams."
    detail: "The claim since v1.17.0. Claim test 65.2 (EN 63.6, DE 66.9), eighth of 13. Today's page with q6 as the H1 and no claim line 67.5, below six of the nine pairs. Reviewers read it as a tagline that leaves the buyer's result implicit."
    score: 66.4
    noise: 1.5
images:
  c2: [c2-en.jpg, page-c2-k3.jpg]
  c3: [c3-en.jpg, page-c3-k3.jpg]
  r3: r3-en.jpg
  q6: q6-en.jpg
---

# Which line is the claim, now that the home headline is its own line?

Benedikt asked on 07.11. to tell the claim and the home headline apart, with Apple's "Think
different" as the model for a claim. The claim is the brand's tagline: short, repeated unchanged
for years, on the deck closing slide, the one-pager header, the LinkedIn profile banner, the website
footer and the mail signature, and as the small line above the home H1. The headline is decided in
`home-headline`. q6 stays `claim` in `verbal.json` until this is decided; nothing is released.

Choosing c2 or c3 changes `verbal.json` `claim` (word stays "Flow") and every surface that reads it:
the closing slide, the one-pagers (website and os), the profile banners in
`applications/channel-banners/`, the website footer and OG fallback, and `verbal.json` `retired`
takes q6. c2 is one sentence, and the banner renderer and the footer split the claim at its first
sentence today.

## Scores

Personas: a CIO of a retail group, a CTO of a Mittelstand manufacturer, a VP of Engineering at a
scale-up, a Chief Product Officer, a Head of Engineering worried about quality and morale, a brand
strategist for DACH B2B tech services, and, for the claim test, a senior developer after a training.
Claude and Codex, two runs each, the order shuffled per reviewer, nothing marking a line as current
or naming its author.

| Option | Claim test EN / DE | Claude EN / DE | Codex EN / DE | Page with k3 EN / DE | Together |
| ------ | ------------------ | -------------- | ------------- | -------------------- | -------- |
| c2     | 73.4 / 73.8        | 66.4 / 66.0    | 80.4 / 81.6   | 79.0 / 76.7          | 8.0      |
| c3     | 76.6 / 77.6        | 71.2 / 71.6    | 82.0 / 83.6   | 74.2 / 72.5          | 6.2      |
| r3     | 71.7 / 71.6        | 63.1 / 62.3    | 80.3 / 81.0   | 70.8 / 68.9          | 5.1      |
| q6     | 63.6 / 66.9        | 60.7 / 62.3    | 66.4 / 71.4   | 66.6 / 68.5 (as H1)  | no line  |

Noise: 1.8 on the panel mean in the claim test, 1.1 in the pairing pass. The report holds every
candidate, the criteria per line and a reviewer prompt.

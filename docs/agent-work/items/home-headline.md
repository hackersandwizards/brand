---
kind: decision
status: open
priority: 1
order: 17
area: copy
owner: Benedikt
evidence: "Blind review 07.11., pass 2 of the home headline test: each candidate as the H1 of the live home page at 1440 and 375 px, EN and DE, tuning desk lined up; six personas, Claude and Codex, two runs each. Every candidate's scores in docs/agent-work/2026-11-07-claim-and-headline.md."
recommended: k3
options:
  - key: k3
    label: "Your teams have agents. Once every role is in step, your releases speed up. / Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden eure Releases schneller."
    detail: "First at 80.8 (EN 81.9, DE 79.8), first with the CIO, the CPO, the Head of Engineering and the VP of Engineering; ahead of q6 with both models. Names the mechanism the tuning desk shows: fit with the hero 9.4, relevant 9.3, credible 8.2. Every Codex reviewer found the German 'Rollen eingespielt' constructed ('people or teams are eingespielt'), and at five lines on the desktop it is long for an H1. With the claim c2 above it the best page of the pairing pass, 77.8."
    score: 80.8
    noise: 1.1
  - key: k2
    label: "Your teams have agents. Now get your releases out sooner. / Eure Teams haben Agenten. Jetzt kommen eure Releases früher raus."
    detail: "77.7 (EN 77.4, DE 77.9), first with the CTO and the brand strategist, and Codex's first by 3.3 (EN) and 5.7 (DE); Claude puts it 12.4 and 9.4 behind k3. Clearest line (9.3), least distinctive (5.1): 'any vendor could say it', and 'jetzt' reads as a promised result."
    score: 77.7
    noise: 1.1
  - key: h2
    label: "Your teams have agents. Now your releases speed up too. / Eure Teams haben Agenten. Jetzt werden auch eure Releases schneller."
    detail: "k2's parent. 76.5 in pass 2, first in pass 1 (79.1). Clear 8.9, distinctive 5.2; 'speed up too' ends flat."
    score: 76.5
    noise: 1.1
  - key: k4
    label: "Your agents write the code. Your company learns to ship it sooner. / Eure Agenten schreiben den Code. Euer Unternehmen lernt, ihn früher auszuliefern."
    detail: "The line that names the company itself as the one that changes. 75.2 (EN 78.4, DE 72.0); the German reads heavier than the English."
    score: 75.2
    noise: 1.1
  - key: q6
    label: "No split: keep q6 as the H1. Agents bring the speed. Flow needs teams in tune. / Agenten bringen das Tempo. Flow braucht eingespielte Teams."
    detail: "Today's H1. 76.8 (EN 75.5, DE 78.1), fit with the hero 9.5, clear 6.8: reviewers read it as 'a tagline rather than a buying proposition' that leaves the buyer's result implicit. Choosing it keeps one `claim` field and changes nothing."
    score: 76.8
    noise: 1.1
images:
  k3: [k3-desktop.jpg, k3-phone.jpg]
  k2: k2-desktop.jpg
  h2: h2-desktop.jpg
  k4: k4-desktop.jpg
  q6: q6-desktop.jpg
---

# Which line is the home headline, the H1 that says what changes for the client company?

Benedikt asked on 07.11. to tell the claim and the headline on the site apart: the headline puts the
company and what changes for it in front. Until now `verbal.json` `claim` served as both, and q6 is
the live home H1. The claim is decided in `claim`. Nothing changes until both are decided; nothing is
released.

## What a split changes

- brand: a new field `headline` in `verbal.json` beside `claim`, `{ "en", "de", "since" }`, listed in
  `manifest.json`, released as a minor version. `claim` keeps its consumers.
- website (reads `@hackersandwizards/brand/verbal.json`): the home H1 takes `headline` instead of
  `claim` (`src/copy/start.en.ts` and `start.de.ts`, `heroes.start.title`); the home social cards
  take it too (`src/lib/social-cards.ts`, the `home` cards, so the OG image and its alt text follow);
  `src/components/templates/StartPage.astro` breaks the home H1 after every second word, a rule
  written for q6, and needs one for the new line. With the tested layout the claim stands as a small
  line above the H1. The footer (`src/copy/ui.ts`) and the OG alt fallback in
  `src/layouts/Layout.astro` keep `claim`.
- Nothing else reads the headline: slides, documents, the one-pagers and the banners carry the claim.
- The voice skill's `brand-voice.md` names the claim as the "Primary headline"; the hub that owns it
  takes the split.

## Scores, pass 2

Personas: a CIO of a retail group, a CTO of a Mittelstand manufacturer, a VP of Engineering at a
scale-up, a Chief Product Officer, a Head of Engineering worried about quality and morale, and a
brand strategist for DACH B2B tech services. Claude and Codex, two runs each, order shuffled per
reviewer, nothing marking a line as current or naming its author.

| Option | Overall EN / DE | Claude EN / DE | Codex EN / DE | Clear | Relevant | Credible | Distinctive | Fit with the hero | Language |
| ------ | --------------- | -------------- | ------------- | ----- | -------- | -------- | ----------- | ----------------- | -------- |
| k3     | 81.9 / 79.8     | 78.8 / 78.6    | 85.0 / 81.0   | 8.5   | 9.3      | 8.2      | 7.3         | 9.4               | 7.4      |
| k2     | 77.4 / 77.9     | 66.4 / 69.2    | 88.3 / 86.7   | 9.3   | 9.2      | 7.0      | 5.1         | 7.6               | 8.8      |
| q6     | 75.5 / 78.1     | 75.8 / 77.4    | 75.2 / 78.8   | 6.8   | 7.6      | 8.2      | 7.6         | 9.5               | 8.3      |
| h2     | 76.5 / 76.4     | 70.6 / 70.8    | 82.3 / 82.0   | 8.9   | 9.2      | 6.7      | 5.2         | 7.9               | 8.3      |
| k4     | 78.4 / 72.0     | 70.8 / 64.5    | 86.1 / 79.4   | 8.3   | 8.7      | 7.8      | 6.4         | 7.9               | 7.3      |

Noise: 3.5 per reviewer, 1.1 on the panel mean. The retired claim, an unmarked control, scored 30.5.
k3's lead over k2 holds on the panel mean, not with both models. An untested German fix for k3's
weak spot: "Wenn alle Rollen zusammenspielen, ..." in place of "eingespielt sind".

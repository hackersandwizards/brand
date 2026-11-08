---
kind: decision
status: open
priority: 1
order: 40
area: brand
owner: Benedikt
multiple: true
evidence: "Blind review 07.11., round 4: the website's page headlines with a6 and with c3, 96 reviewer runs (website item work-ship-decided-page-headlines). Round 3 (claim-round-3): a6 above the H1 against the empty slot, 48 reviewer runs. Round 2: home hero in two passes (8 then 5 candidates), the claim on 11 surfaces, the 35 page headlines with c3 and k3, then alternatives for 4 pages: 6 personas, Claude and Codex, two runs each, 120 reviewer runs. Report: docs/agent-work/2026-11-07-claim-and-headline.md"
recommended:
  - none
  - de-zusammenspielen
options:
  - key: eyebrow-a6
    label: "Above the H1: the claim a6, More code isn't faster delivery. / Mehr Code heißt nicht schneller liefern."
    detail: "Round 3, only if claim-round-3 picks a6. Ties with the empty slot in the same test (80.9 against 79.8, noise 0.2 and 1.3) for both models; fit with k3 8.2. The slot carries the brand's own claim, no second line for the website. Scored in another test than the round 2 options below: compare it with the empty slot, not with their numbers."
    score: 80.9
    noise: 0.2
  - key: eyebrow-cto
    label: "Above the H1: For CTOs and their teams / Für CTOs und ihre Teams"
    detail: "Ties with the empty slot (lead 1.0 at noise 1.4). Names the buyer in one short line and repeats nothing. Reviewers: an audience line any provider could carry."
    score: 77.6
    noise: 1.4
  - key: none
    label: "Nothing above the H1"
    detail: "First in both passes (79.1, then 78.6), inside the noise. Codex reviewers miss no line; Claude reviewers miss a buyer cue or a brand anchor."
    score: 78.6
    noise: 1.0
  - key: eyebrow-audience
    label: "Above the H1: For CTOs, CIOs and engineering leaders / Für CTOs, CIOs und Engineering-Leitungen"
    detail: "Pass 1 78.6, pass 2 76.5. 'Engineering-Leitungen' reads as officialese (German language 6.2); two lines on the phone."
    score: 76.5
    noise: 0.7
  - key: eyebrow-offer
    label: "Above the H1: Agentic engineering training and mentoring / Schulung und Mentoring in Agentic Engineering"
    detail: "Pass 1 only. Clearest (8.9), but it repeats the lead sentence word for word."
    score: 77.5
    noise: 0.8
  - key: desk-c3
    label: "c3 as a line under the tuning desk"
    detail: "Pass 1 only. Best place for c3, still 6.9 below the empty slot: c3 and the H1 both say teams and agents (together 6.6)."
    score: 72.2
    noise: 1.5
  - key: eyebrow-c3
    label: "c3 above the H1"
    detail: "Pass 1 only. Together 5.6: the small line and the H1 repeat each other."
    score: 71.8
    noise: 2.1
  - key: footer-c3
    label: "c3 at the foot of the hero copy"
    detail: "Pass 1 only. Together 5.6."
    score: 69.0
    noise: 0.5
  - key: under-c3
    label: "c3 directly under the H1"
    detail: "Pass 1 only. Lowest: together 5.0, calm 6.5."
    score: 67.5
    noise: 1.3
  - key: de-zusammenspielen
    label: "German H1: Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller."
    detail: "German language 8.5 and 8.3 against 7.2 and 7.5 for 'eingespielt', with both models in both passes. Six lines on the desktop instead of five. Changes verbal.json headline.de."
    score: 78.5
    noise: 0.0
  - key: de-eingespielt
    label: "German H1 as in v1.29.0: Wenn alle Rollen eingespielt sind, ..."
    detail: "Every Codex reviewer and several Claude reviewers again: roles are not 'eingespielt', teams are."
    score: 78.6
    noise: 1.0
  - key: de-spielen
    label: "German H1: Eure Teams haben Agenten. Spielen alle Rollen zusammen, werden eure Releases schneller."
    detail: "Tested to avoid the sixth line; it still breaks into six and scores lowest of the three."
    score: 77.4
    noise: 0.3
images:
  eyebrow-a6:
    - src: eyebrow-a6-desktop.jpg
      caption: "a6 above the H1: desktop 1440 px, English above German"
    - src: eyebrow-a6-phone.jpg
      caption: "a6 above the H1: phone 375 px, English beside German"
  eyebrow-cto:
    - src: eyebrow-cto-desktop.jpg
      caption: "For CTOs and their teams, above the H1: desktop 1440 px, English above German"
    - src: eyebrow-cto-phone.jpg
      caption: "For CTOs and their teams, above the H1: phone 375 px, English beside German"
  none:
    - src: none-desktop.jpg
      caption: "Nothing above the H1: desktop 1440 px, English above German"
    - src: none-phone.jpg
      caption: "Nothing above the H1: phone 375 px, English beside German"
  eyebrow-audience:
    - src: eyebrow-audience-desktop.jpg
      caption: "Audience line above the H1: desktop 1440 px, English above German"
    - src: eyebrow-audience-phone.jpg
      caption: "Audience line above the H1: phone 375 px, English beside German"
  eyebrow-offer:
    - src: eyebrow-offer-desktop.jpg
      caption: "Offer line above the H1: desktop 1440 px, English above German"
    - src: eyebrow-offer-phone.jpg
      caption: "Offer line above the H1: phone 375 px, English beside German"
  desk-c3:
    - src: desk-c3-desktop.jpg
      caption: "c3 under the tuning desk: desktop 1440 px, English above German"
    - src: desk-c3-phone.jpg
      caption: "c3 under the tuning desk: phone 375 px, English beside German"
  eyebrow-c3:
    - src: eyebrow-c3-desktop.jpg
      caption: "c3 above the H1: desktop 1440 px, English above German"
    - src: eyebrow-c3-phone.jpg
      caption: "c3 above the H1: phone 375 px, English beside German"
  footer-c3:
    - src: footer-c3-desktop.jpg
      caption: "c3 at the foot of the hero copy: desktop 1440 px, English above German"
    - src: footer-c3-phone.jpg
      caption: "c3 at the foot of the hero copy: phone 375 px, English beside German"
  under-c3:
    - src: under-c3-desktop.jpg
      caption: "c3 under the H1: desktop 1440 px, English above German"
    - src: under-c3-phone.jpg
      caption: "c3 under the H1: phone 375 px, English beside German"
  de-zusammenspielen:
    - src: none-z-desktop.jpg
      caption: "German H1 with zusammenspielen: desktop 1440 px, English above German"
    - src: none-z-phone.jpg
      caption: "German H1 with zusammenspielen: phone 375 px, English beside German"
  de-spielen:
    - src: none-s-desktop.jpg
      caption: "German H1 with Spielen alle Rollen zusammen: desktop 1440 px, English above German"
    - src: none-s-phone.jpg
      caption: "German H1 with Spielen alle Rollen zusammen: phone 375 px, English beside German"
---

# What stands above the home H1?

Blocks the German home H1, which ships with the new claim.

**Read this with `claim-round-3` and the website's `decide-eyebrow-concept`.** Since this item was written, the claim recommendation moved to n02 and the whole-site review recommends no line above any H1, so the recommendation here is now nothing above the home H1. What stays yours alone is the German H1.

You asked for something above the H1 again, tested together with the headline and on every surface the claim reaches. Pick one home option and one German H1.

Round 3 (`claim-round-3`) changes the answer. If you pick the claim a6 there, I recommend it above the H1: it ties with the empty slot for both models (80.9 against 79.8; Claude 73.5 against 71.2, Codex 88.3 against 88.5), and the slot then carries the brand's own claim rather than a line only the website has. If you keep c3 or pick a claim that repeats k3 (m01, m08, m15 score 70 to 73 there), "For CTOs and their teams" stays the recommendation, as below.

c3 does not work in the home hero, wherever it stands: 67.5 to 72.2 against 78.6 for the empty slot, because c3 and k3 both say agents and teams ("together" 5.0 to 6.6). A short line that is not the claim does work: "For CTOs and their teams" ties with the empty slot.

Overall is the panel mean, 0 to 100, over English and German. Noise is the difference between the panel means of the two runs. A lead inside the noise is a tie.

## The home hero

Pass 1, eight heroes (H1 k3 in each):

| Option                                            | Overall | EN / DE     | Claude / Codex | Together | Clear | Distinctive | Calm | Language |
| ------------------------------------------------- | ------- | ----------- | -------------- | -------- | ----- | ----------- | ---- | -------- |
| Nothing above the H1, German with zusammenspielen | 79.5    | 80.1 / 79.0 | 74.4 / 84.7    | 8.1      | 8.0   | 6.6         | 8.2  | 8.3      |
| Nothing above the H1                              | 79.1    | 80.2 / 78.0 | 75.0 / 83.3    | 8.1      | 7.9   | 6.6         | 9.0  | 7.6      |
| Audience line above                               | 78.6    | 80.4 / 76.8 | 77.6 / 79.6    | 8.4      | 8.8   | 6.1         | 7.9  | 7.2      |
| Offer line above                                  | 77.5    | 78.8 / 76.2 | 70.2 / 84.8    | 7.4      | 8.9   | 5.9         | 7.9  | 7.5      |
| c3 under the tuning desk                          | 72.2    | 73.4 / 71.1 | 63.6 / 80.9    | 6.6      | 7.8   | 7.2         | 7.6  | 7.4      |
| c3 above the H1                                   | 71.8    | 73.0 / 70.6 | 68.0 / 75.6    | 5.6      | 7.6   | 7.2         | 7.8  | 7.4      |
| c3 at the foot of the hero copy                   | 69.0    | 70.1 / 67.8 | 60.8 / 77.2    | 5.6      | 7.8   | 6.8         | 7.0  | 7.4      |
| c3 under the H1                                   | 67.5    | 68.6 / 66.4 | 61.7 / 73.3    | 5.0      | 7.5   | 7.0         | 6.5  | 7.4      |

Pass 2 fixed the two causes of pass 1: the audience line's stiff German and two phone lines ("For CTOs and their teams"), and "eingespielt" (two German alternatives). Five heroes:

| Option                                          | Overall | EN / DE     | Claude / Codex | Together | Clear | Distinctive | Calm | Language |
| ----------------------------------------------- | ------- | ----------- | -------------- | -------- | ----- | ----------- | ---- | -------- |
| Nothing above the H1                            | 78.6    | 79.2 / 77.9 | 73.9 / 83.3    | 8.0      | 7.6   | 6.9         | 8.5  | 7.8      |
| Nothing above, German with zusammenspielen      | 78.5    | 79.2 / 77.8 | 72.8 / 84.3    | 8.0      | 7.6   | 6.9         | 7.9  | 8.2      |
| For CTOs and their teams above                  | 77.6    | 78.5 / 76.7 | 74.3 / 81.0    | 7.7      | 8.1   | 6.7         | 8.0  | 7.7      |
| Nothing above, German with Spielen ... zusammen | 77.4    | 79.2 / 75.6 | 72.5 / 82.4    | 8.0      | 7.6   | 6.9         | 7.8  | 7.9      |
| Audience line above                             | 76.5    | 78.4 / 74.5 | 72.3 / 80.7    | 7.9      | 8.6   | 6.7         | 7.0  | 7.0      |

Pass 2 found no hero above pass 1's leader: a plateau, so no third pass. The two models split on the question you asked. Claude reviewers miss a line that names the buyer ("nothing tells me I am the addressee"); Codex reviewers write "no short line feels missing".

## The claim on every other surface

Round 3 measured every claim candidate, c3 and q6 included, on the seven banners, the closing slide, the one-pager, the footer and the link preview: see `claim-round-3`.

## The page headlines

The website's page headlines were read with c3 and k3 in round 2 and with each claim, a6 and c3, in round 4 (report, sections Round 2 and Round 4). The set fits both claims equally; the final set per claim and the lines that change are in the website item `work-ship-decided-page-headlines`, every score in the git history its evidence names.

## What choosing changes

- eyebrow-a6: the website's home hero takes brand's claim as its eyebrow (`src/components/templates/StartPage.astro`), once brand ships a6 and the website pins that release.
- eyebrow-cto or another line: the website's home hero passes the line to its eyebrow (`src/components/templates/StartPage.astro`, `src/copy/start.en.ts`, `start.de.ts`). The line belongs to the website's copy, not to brand.
- de-zusammenspielen: brand changes `headline.de` in `verbal.json` and releases; the website takes it with its next brand pin.
- The page headlines change in the website's copy; that decision stays in the website item, which this one informs.

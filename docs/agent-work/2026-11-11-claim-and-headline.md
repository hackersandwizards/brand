# The claim and the home headline, 11.11.2026

The claim is "Faster releases with agents, when your people are in tune." / "Schnellere Releases
mit KI-Agenten, wenn eure Leute eingespielt sind." (r1). The home headline is "Faster releases with
the agents your teams already have. Once all roles are in tune." / "Schnellere Releases mit den
Agenten, die eure Teams schon haben. Sobald alle Rollen zusammenspielen." (hb). Benedikt decided
both on 10.11. (item `decide-claim-amdahl`, commit `bddb043`), `verbal/verbal.json` gives both
`since: 2026-11-10`, and brand v2.14.0 ships them (tagged 11.11., 00:02; v2.15.0 ships the same
lines). Two rounds on 11.11. validated the pair. With the banner seen on one visit and the home
page's first screen on a later one, r1 with hb scores 82.7, level with the best of eight pairs (83.4,
noise 1.3), and hb leads the headline it replaced under r1 in all four model and run cells. On the
banners r1 ranks third of seven claims, a tie with the first two by the rule of these rounds.
Benedikt read that ranking on 11.11. and kept the claim on the banners (item
`review-claim-pair-and-banner-rank`, decided in `e271516`, closed in `402e23a`).

The banner ranking he read, English, the only language the banners ship in:

| Claim                                                      | Overall | Noise | Claude / Codex | Gain first |
| ---------------------------------------------------------- | ------- | ----- | -------------- | ---------- |
| Agents speed up code. Your handoffs set the pace.          | 78.1    | 0.4   | 78.6 / 77.6    | 5.5        |
| Your developers got faster. Your releases are next.        | 78.0    | 0.3   | 78.3 / 77.6    | 9.2        |
| Faster releases with agents, when your people are in tune. | 74.7    | 1.2   | 72.1 / 77.3    | 9.2        |
| Agents pay off when your people ship together.             | 74.7    | 0.5   | 73.3 / 76.1    | 5.5        |
| Be the team that ships as fast as it codes.                | 72.8    | 1.6   | 71.2 / 74.5    | 9.0        |
| Agents pay off when your people are in tune.               | 70.2    | 0.1   | 68.6 / 71.7    | 5.1        |
| Faster releases with agents take the whole team.           | 69.8    | 1.8   | 58.0 / 81.6    | 8.7        |

Gain first (0 to 10, left out of overall) asks whether the client's gain is the first thing the line
shows. The lead of the first two over r1 is outside the noise with Claude and inside it with Codex,
so it counts as a tie.

This report replaces the nine reports of 07.11. to 10.11. on the topic. They are in git, with every
candidate table and reviewer prompt, at commit `402e23a`.

## Keys

| Key | Line (EN / DE)                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| r1  | Faster releases with agents, when your people are in tune. / Schnellere Releases mit KI-Agenten, wenn eure Leute eingespielt sind. (the claim)                                                             |
| hb  | Faster releases with the agents your teams already have. Once all roles are in tune. / Schnellere Releases mit den Agenten, die eure Teams schon haben. Sobald alle Rollen zusammenspielen. (the headline) |
| dh  | Your teams have agents. Once all roles are in tune, your releases speed up. / Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller. (headline in v1.57.0 to v2.13.0) |
| u1  | Agents pay off when your people ship together. / KI-Agenten lohnen sich, wenn eure Leute gemeinsam liefern. (claim in v1.56.0 to v2.13.0)                                                                  |
| tpe | Agents pay off when your people are in tune. / KI-Agenten lohnen sich, wenn eure Leute eingespielt sind.                                                                                                   |
| x4  | Agents speed up code. Your handoffs set the pace. / KI-Agenten schreiben Code schneller. Eure Übergaben bestimmen das Tempo.                                                                               |
| e5x | Your developers got faster. Your releases are next. / Eure Entwickler sind schneller geworden. Jetzt ziehen eure Releases nach.                                                                            |
| t2  | Faster releases with agents take the whole team. / Schnellere Releases mit KI-Agenten brauchen das ganze Team.                                                                                             |
| f1  | Be the team that ships as fast as it codes. / Werdet das Team, das so schnell liefert, wie es programmiert.                                                                                                |
| c3  | Agents in the team. Teams in flow. / Agenten im Team. Teams im Flow. (claim in v1.29.0)                                                                                                                    |
| q6  | Agents bring the speed. Flow needs teams in tune. / Agenten bringen das Tempo. Flow braucht eingespielte Teams. (claim in v1.17.0)                                                                         |
| f6  | Every agent needs a team in tune. / Jeder KI-Agent braucht ein eingespieltes Team.                                                                                                                         |

## Decided

Each decision is Benedikt's, recorded in the item and commit named.

| Date   | Decision                                                                                                                        | Record                                                                                                                                                                   | Release                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| 06.11. | q6 as the claim, also as the home H1                                                                                            | item `new-claim`, `e1b6de2`                                                                                                                                              | v1.17.0                       |
| 07.11. | c3 as the claim, k3 ("Your teams have agents. Once every role is in step, your releases speed up.") as the new field `headline` | items `claim` and `home-headline`, `776dc71`                                                                                                                             | v1.29.0                       |
| 08.11. | f6 as the claim, with the German H1 "zusammenspielen"                                                                           | item `claim-round-3`, `afb16e9`                                                                                                                                          | none                          |
| 08.11. | u1 as the claim, the German H1 "Wenn alle Rollen zusammenspielen", nothing above the home H1                                    | items `claim-confirm-after-round-8` and `decide-home-headline-wording`, `a260c9a`; the German H1 and the empty slot came with the f6 pick (`home-claim-line`, `afb16e9`) | v1.56.0                       |
| 08.11. | The H1 "Once all roles are in tune" (dh) in place of "in step"                                                                  | item `decide-home-headline-tune`, `cb5cdd0`                                                                                                                              | v1.57.0                       |
| 10.11. | tpe as the claim, with dh                                                                                                       | item `decide-claim-tune`, `c5bcc97`                                                                                                                                      | none, superseded the same day |
| 10.11. | r1 as the claim, hb as the home headline                                                                                        | item `decide-claim-amdahl`, `bddb043`                                                                                                                                    | v2.14.0 (`06ef37d`)           |
| 11.11. | The claim stays on the banners after the banner ranking                                                                         | item `review-claim-pair-and-banner-rank`, `e271516`, closed `402e23a`                                                                                                    | nothing to carry out          |

Set by the runs, not by a person: the release of v2.14.0 took `claim.word` "releases" / "Releases",
the accented word on the banners and the closing slide, as an assumption; the descriptor "Training
and mentoring in agentic engineering" stays under the claim on the banners on the set review below.

## Measured

### How to read the numbers

- Reviewers are model personas: Claude (`claude -p --model opus`; from the round on the client's
  change of 10.11. pinned to `claude-opus-5-5` at effort medium) and Codex (`gpt-6.1-sol`, reasoning
  high). No human reader was asked.
- Every round ran blind: neutral labels, an order shuffled per reviewer, nothing marking a line as
  current or naming its author. From 08.11.'s claim-tune round on, image files had hashed names too.
- Noise is the gap between the panel means of a reviewer's two runs. A lead inside the noise is a
  tie. In the rounds of 10. and 11.11. a lead counts only where it has the same sign in all four model
  and run cells and lies outside the noise in each.
- Scores compare only within one round. Each round had its own panel, its own lines beside each
  candidate and its own surfaces, so each row below names the anchor of the same round.
- The kinds of measurement: the rendered panel (the claim on banners, slide, one-pager, footer or
  link preview at display size), the reader's path or side by side (banner, home page and footer on
  one sheet), the hero (the H1 alone on the home page's first screen), cold reads (one banner, the
  reader knowing nothing else, a blind classifier reading the answers), and separate views (the
  banner on one visit, the first screen on a later one).

### Every round

| Date        | Question                                             | Winner                                                          | Score against the anchor of the same round                                                                                                                       | Noise                   |
| ----------- | ---------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 06.11.      | A new claim, also as the home H1 (six rounds)        | q6 decided; b1 recommended                                      | q6 77 as the mean of claim and home H1, b1 76; the claim before, as claim: 26.3 / 23.1                                                                           | 0.9                     |
| 07.11. (1)  | Claim and home headline as two lines                 | claim c3 (c2 recommended), headline k3                          | claim c3 77.1, c2 73.6; H1 k3 80.8, q6 76.8; page c2 with k3 77.8, the page with q6 as H1 67.5                                                                   | 1.8; 1.1; 1.1           |
| 07.11. (2)  | What stands above the home H1                        | nothing                                                         | nothing 78.6, "For CTOs and their teams" 77.6; c3 in four places in the hero 67.5 to 72.2, nothing 79.1 (pass 1)                                                 | 1.4; 0.2 to 2.1         |
| 07.11. (3)  | A more distinctive claim, on every surface           | a6 "More code isn't faster delivery."                           | a6 78.5, c3 66.4                                                                                                                                                 | 0.8                     |
| 07.11. (4)  | The website's page headlines with each claim         | tie                                                             | the set 77.5 with a6, 77.8 with c3                                                                                                                               | 2.9; 1.2                |
| 08.11. (4)  | A claim that works on a banner                       | m08k "Every agent needs a team."                                | m08k 79.5, c3 69.2                                                                                                                                               | 0.1; 0.1                |
| 08.11. (5)  | Whose team, and could a tool vendor say it           | n02 "Every agent needs your people."                            | n02 75.2, m08k 76.6 (read as people by 3 of 16 English readers), c3 65.0                                                                                         | 0.6; 0.9; 3.8           |
| 08.11. (6)  | Lines carrying "flow" or "tune"                      | n02                                                             | n02 79.5, f6 78.6, c3 77.0                                                                                                                                       | 1.2; 1.0; 0.4           |
| 08.11. (7)  | Extensions of "a team in tune"                       | panel n02, set f6; f6 decided                                   | panel n02 81.2, f6 80.2; set f6 78.1, n02 76.9                                                                                                                   | 1.2; 0.1; 0.2; 1.8      |
| 08.11. (8)  | Fresh lines against f6                               | f6 stays, m3 ties as a set                                      | m3 78.1, f6 75.2; set m3 and f6 76.5 each                                                                                                                        | 1.7; 1.8; 0.0; 0.1      |
| 08.11. (9)  | One line or a short and long pair                    | s4p recommended                                                 | s4p 77.1, f6 65.1                                                                                                                                                | 0.8; 1.9                |
| 08.11. (10) | The same lines in the LinkedIn app and on the laptop | u1; decided                                                     | set u1 83.2, f6 78.6                                                                                                                                             | 0.4; 1.4                |
| 08.11.      | The u1 banner set                                    | u1 with "together" in the accent                                | 83.6, all white 80.6, the shipped c3 set 72.6; a legibility fix 81.8 against 79.2                                                                                | 0.2; 1.7                |
| 08.11.      | H1 "in step" or "in tune"                            | "in tune" (dh); decided                                         | measured in the items of commits `52a1200`, `78b2402`, `da96d90`; on 08.11.'s path the tune H1 scores above the step H1 with all seven claims, +0.8 (u1) to +3.1 |                         |
| 08.11.      | Claims with "in tune" against u1                     | tpe                                                             | panel tpe 81.7, u1 75.0; path tpe with dh 78.0, u1 with dh 72.5                                                                                                  | 0.4; 1.3; 0.5; 4.8      |
| 09.11.      | q6 as claim and as headline, judged on what it says  | the decided lines                                               | path: q6 as H1 70.8, dh 76.8 (both with tpe); panel: q6 as claim 69.9, tpe 79.3                                                                                  | 1.6; 0.7; 1.1; 0.7      |
| 10.11.      | A claim carrying Amdahl's point                      | x4 ties tpe on the panel, leads on the path                     | panel x4 79.3, tpe 77.8; path x4 80.8, tpe 68.0                                                                                                                  | 0.2; 0.1; at most 1.3   |
| 10.11.      | The client's change first (`gain_first`)             | no line passes the rule; r1, e5x, hb options; r1 and hb decided | panel r1 76.4, tpe 74.8, x4 77.5; hero hb 76.0, dh 73.1 (round 1)                                                                                                | 1.9; 1.0; 0.9; 1.0; 1.2 |
| 10.11.      | r1 with hb, side by side on one sheet                | e5x with dh                                                     | r1+hb 70.8, r1+dh 75.6, e5x+dh 81.2                                                                                                                              | 0.8; 1.0; 0.8           |
| 10.11.      | The r1 banner set                                    | r1, descriptor unchanged                                        | 83.7, the u1 set 82.4: a tie                                                                                                                                     | 2.0; 0.2                |
| 10.11.      | The profile texts under r1                           | see "The profile texts"                                         |                                                                                                                                                                  |                         |
| 11.11.      | r1 with hb on separate views                         | e5x+hb and r1+hb level                                          | r1+hb 82.7, e5x+hb 83.4, r1+dh 76.2                                                                                                                              | 0.5; 1.3; 0.5           |
| 11.11.      | Seven claims on the banners                          | x4 and e5x, a tie with r1                                       | r1 74.7, x4 78.1, e5x 78.0                                                                                                                                       | 1.2; 0.4; 0.3           |

The LinkedIn banner scores of 08.11. rounds 7 to 9 came from LinkedIn's logged-out mobile-browser
layout, whose profile photo covers each line's first letters. Round 10 measured again in the iPhone
app and on the laptop, the layouts every later round used.

### The pair on separate views (11.11., 130 runs)

Stage 1: one reviewer sees one banner on the founder's LinkedIn profile, in the app or on a laptop,
with the descriptor, and writes in their own words what they take away. No takeaway repeats four words
of its claim in a row (0 of 80). Stage 2: a fresh reviewer gets eight cases, each that takeaway as
what they remember plus the live home page's first screen at 1440 px and 390 px with hb or dh, and
scores each case. Run 1 gets a takeaway its own model wrote, run 2 one the other model wrote. Four
personas (CTO, VP of Engineering, brand strategist, bilingual copy editor), both models, two runs,
English and German apart.

| Pair   | Overall | Noise | Claude / Codex | Gain first | Recognise | Further | Match named as help / cost / both, of 32 |
| ------ | ------- | ----- | -------------- | ---------- | --------- | ------- | ---------------------------------------- |
| e5x+hb | 83.4    | 1.3   | 80.3 / 86.5    | 9.3        | 8.7       | 7.4     | 16 / 0 / 0                               |
| r1+hb  | 82.7    | 0.5   | 80.2 / 85.1    | 9.3        | 9.0       | 6.7     | 20 / 15 / 8                              |
| tpe+hb | 80.8    | 0.8   | 75.9 / 85.8    | 9.3        | 8.0       | 7.5     | 6 / 0 / 0                                |
| u1+dh  | 77.1    | 0.1   | 72.6 / 81.6    | 4.8        | 8.7       | 7.2     | 15 / 3 / 2                               |
| x4+hb  | 76.7    | 0.1   | 73.2 / 80.1    | 9.2        | 7.4       | 6.3     | 10 / 0 / 0                               |
| e5x+dh | 76.4    | 0.2   | 73.0 / 79.9    | 5.0        | 8.2       | 7.2     | 12 / 0 / 0                               |
| r1+dh  | 76.2    | 0.5   | 73.2 / 79.2    | 4.9        | 8.8       | 6.5     | 17 / 8 / 5                               |
| x4+dh  | 71.9    | 0.4   | 68.6 / 75.2    | 4.9        | 7.5       | 6.1     | 16 / 0 / 0                               |

Gain first is one of the criteria here, and hb opens on the gain, so a control arm repeated the 16
prompts of the CTO and the VP of Engineering with gain first asked apart and left out of overall.
Lead in overall points, per cell (Claude run 1, run 2; Codex run 1, run 2):

| Comparison                   | Gain first among the criteria (32 reviews) | Gain first asked apart (16 reviews) |
| ---------------------------- | ------------------------------------------ | ----------------------------------- |
| hb in place of dh, under r1  | +6.4: +5.9, +8.1; +6.0, +5.8               | +2.5: +3.5, +3.0; +2.2, +1.2        |
| hb in place of dh, under e5x | +7.0: +6.1, +8.5; +6.8, +6.5               | +3.2: +3.5, +4.8; +3.0, +1.5        |
| r1+hb against e5x+hb         | -0.7: -0.1, +0.0; -0.5, -2.2               | -1.1: +0.2, -1.8; +0.0, -3.0        |
| r1+hb against tpe+hb         | +1.8: +2.8, +5.9; -0.4, -0.9               | +1.6: +4.2, +4.5; -0.8, -1.5        |
| r1+hb against u1+dh          | +5.6: +6.6, +8.6; +4.0, +3.1               | +1.1: +4.8, +1.0; +0.2, -1.5        |

- hb does not cost r1 on separate views. In the control its lead is clear with Claude and at the
  edge of the noise with Codex (r1+hb's noise there 0.9).
- The lead is not recognition. Under r1, recognise is the same with either headline (+0.1, noise
  0.2). r1 is recognised as well as any of the five claims.
- With r1 the first screen adds the least to what the reader came with: further 6.7, against 7.4
  for e5x+hb and 7.5 for tpe+hb. Of the 32 reviews of r1+hb, 15 name the match with the memory as a
  cost. Within each model those reviews score the pair lower (Claude by 1.4, Codex by 3.0); the
  groups are small and their noise was not measured.
- "It mostly confirms the thought I arrived with; there is little detail about how the change
  happens." (VP of Engineering, Codex, scoring the pair 84). The question the first screen leaves
  open: "What does getting all roles in tune involve in an actual product team?" (VP of
  Engineering, Codex).
- Limits: the memory is a takeaway a model wrote minutes earlier; only the first screen was shown;
  4 of 256 cases of the main arm have the gain score of the other headline, all in Claude's English
  reviews, and where a swap changes anything it shrinks hb's lead.

[The banner as stage 1 shows it](2026-11-11-claim-and-headline/separate-banner-view.jpg); the first
screen with hb, [English](2026-11-11-claim-and-headline/separate-hero-hb.jpg) and
[German](2026-11-11-claim-and-headline/separate-hero-hb-de.jpg);
[with dh](2026-11-11-claim-and-headline/separate-hero-dh.jpg).

### The pair side by side on one sheet (10.11., 64 runs)

The founder's LinkedIn profile, the home page with the H1 and the footer on one sheet. Four personas,
both models, two runs, English and German apart; two arms, the banner with the descriptor and alone.
With the descriptor:

| Pair   | Overall | Noise | Claude / Codex | One message | Distinctive | Reviews naming the repetition |
| ------ | ------- | ----- | -------------- | ----------- | ----------- | ----------------------------- |
| r1+hb  | 70.8    | 0.8   | 59.0 / 82.6    | 6.2         | 5.1         | 31 of 32                      |
| r1+dh  | 75.6    | 1.0   | 68.4 / 82.8    | 7.4         | 5.3         | 25 of 32                      |
| tpe+hb | 68.7    | 0.2   | 57.4 / 79.9    | 7.4         | 5.0         | 5 of 32                       |
| tpe+dh | 69.5    | 0.6   | 62.3 / 76.6    | 7.5         | 4.9         | 2 of 32                       |
| x4+dh  | 78.2    | 0.3   | 75.8 / 80.6    | 8.1         | 8.0         | 0 of 32                       |
| e5x+dh | 81.2    | 0.8   | 79.1 / 83.2    | 8.6         | 7.2         | 1 of 32                       |

- On one sheet hb costs r1 4.8 points with the descriptor and 5.2 without, all of it Claude's (-8.0
  to -10.8 per cell, Codex -0.6 to +0.2). The two lines together lose about four points more than
  each change alone, in all eight cells of both arms.
- r1 is the better claim under either headline: +6.1 over tpe with dh in all eight cells.
- 63 of 64 reviews of r1+hb name the repetition. "Claim and H1 are near-identical, so neither does
  its own job; the H1 ends on a fragment." (VP of Engineering, Claude). 48 of 64 name hb's second
  sentence a fragment.
- The round repeats path round 3 of 10.11. within 1.9 points for the four pairs both scored (tpe+dh
  67.6 there, x4+dh 78.5, tpe+hb 69.1, e5x+dh 79.3).

The separate views of 11.11. are the nearer model of how a visitor meets the two lines; this round
stays the measurement for both lines on one page, the H1 above the footer.
[English](2026-11-11-claim-and-headline/r1-hb-path.jpg),
[German](2026-11-11-claim-and-headline/r1-hb-path-de.jpg).

### The claims on the banners (11.11., 64 panel reviews, 152 cold reads)

Seven claims rendered by `render.py` on every banner that shows the claim: LinkedIn slide 1, X,
XING, Sessionize, Brella, Facebook and YouTube. LinkedIn is the screenshot of 08.11. with the banner
swapped in, XING and Sessionize the live pages with the cover swapped, X and Facebook mocks from the
safe areas `render.py` records. Four personas (CTO, VP of Engineering, conference organiser, brand
strategist), both models, two runs, English and German apart, with and without the descriptor. The
English ranking is at the top of this report.

- r1 scores highest of the seven on core, what a company gets from agents and what that depends on
  (8.7; e5x 4.2), and lowest on room (7.8; the others 8.4 to 8.8) and, of the top four, on
  distinctive (5.2; x4 7.0).
- Of r1's 32 reviews, 26 name "in tune" in what keeps it below the maximum, 26 the length and 19 the
  comma. "'In tune' is soft and vague; the comma before 'when' reads stiffly; the line is long."
  (CTO, Claude).
- About x4: "Leads with the tool and the bottleneck, not my gain; 'speed up code' is slightly off
  idiom." (CTO, Claude). About e5x: "Says neither what agents bring nor what the gain depends on;
  assumes developers already got faster." (CTO, Claude). About t2: "Garden-path grammar: 'agents
  take the whole team' reads first as agents replacing the team." (VP of Engineering, Claude).
- The descriptor adds 2.2 (r1, t2) to 7.5 points (tpe). From the claim alone, readers take training
  from r1 in 3 of 8 cold reads and agents in 6 of 8; with the descriptor every reader names both,
  whatever the claim.
- German, rendered for this run only: on XING e5x and x4 run to the canvas edge and are cut, r1 ends
  5 px from it. On the Sessionize phone page e5x, x4, r1 and t2 are cut. German overall: tpe 76.7, t2
  74.8, u1 74.4, r1 74.4, f1 70.0, x4 65.1, e5x 58.9. A German banner for any of the four long lines
  needs a narrower layout on XING and Sessionize first.
- `render.py`'s break rule gives x4 the rows "Agents speed up code. Your" / "handoffs set the pace."
  and t2 "Faster releases with" / "agents take the whole team."; either claim would need a fixed
  break.

[The seven on LinkedIn](2026-11-11-claim-and-headline/rank-linkedin.jpg);
[r1, e5x and x4 on XING](2026-11-11-claim-and-headline/rank-xing.jpg);
[r1 and e5x on the other channels](2026-11-11-claim-and-headline/rank-others.jpg);
[the German lines that are cut](2026-11-11-claim-and-headline/breaks-de.jpg);
[x4 and t2 in the rows the rule gives](2026-11-11-claim-and-headline/rows-rule.jpg).

### The shipped banners (10.11., 12 runs)

`render.py` breaks r1 into "Faster releases with agents," and "when your people are in tune.", the
accent on "releases". The group's ink box moved by at most 3 px per edge against u1, so every photo
clearance measured before still applies. The whole set as each channel shows it, CTO, VP of
Engineering and senior brand designer, both models, two runs:

| Set                                                   | Overall | Noise | Claude / Codex |
| ----------------------------------------------------- | ------- | ----- | -------------- |
| r1, descriptor unchanged (shipped)                    | 83.7    | 2.0   | 79.5 / 87.8    |
| The banners before (u1)                               | 82.4    | 0.2   | 78.3 / 86.5    |
| r1 with "We train and mentor every role on your team" | 80.8    | 0.7   | 75.3 / 86.3    |
| r1 with "Training and mentoring for your whole team"  | 79.1    | 1.8   | 73.5 / 84.7    |

On 08.11. the accent word led the all-white claim by 3.0 at a noise of 0.2, so `claim.word` stays.

XING is the known weak point: the descriptor is 8 px tall on a 390 px phone. Four renders of the u1
cover on the live XING page, phone and 1024 px, 08.11. ("Shipped" is the u1 cover of v1.56.0; the r1
group's ink box differs by at most 3 px):

| Version                                   | Overall | Noise | Legible | Breathing | Hierarchy |
| ----------------------------------------- | ------- | ----- | ------- | --------- | --------- |
| Shipped                                   | 77.4    | 1.1   | 6.5     | 7.8       | 8.2       |
| Claim 46.6 px, descriptor 0.62            | 76.5    | 1.0   | 6.7     | 7.1       | 8.4       |
| Descriptor 0.665, one row                 | 69.6    | 0.4   | 6.4     | 5.4       | 7.8       |
| Descriptor 0.86, two rows, smaller lockup | 68.4    | 0.0   | 7.6     | 4.6       | 6.4       |
| Previous cover                            | 51.3    | 0.1   | 6.4     | 7.8       | 7.2       |

Every enlargement costs more breathing room at the 1024 px crop than it gains on the phone: a
plateau. [LinkedIn, app and laptop](2026-11-11-claim-and-headline/banners-linkedin.jpg),
[XING, phone and desktop](2026-11-11-claim-and-headline/banners-xing.jpg),
[the other channels](2026-11-11-claim-and-headline/banners-others.jpg).

### The headline alone on the first screen (10.11., 36 runs)

The live home page in headless Chrome with the H1 replaced, desktop English and German at 1440 x 900,
English phone at 390 x 844; both models, two runs, 12 runs per round; judged on what the line says,
layout scored apart. The source does not list the
personas.

| Round       | dh   | Noise | hb   | Noise | hb's lead per cell (Claude r1, r2; Codex r1, r2) | Gain first dh / hb |
| ----------- | ---- | ----- | ---- | ----- | ------------------------------------------------ | ------------------ |
| 1           | 73.1 | 1.2   | 76.0 | 1.0   | +1.3, +2.0, +4.3, +4.0                           | 3.2 / 9.4          |
| 2           | 76.2 | 2.3   | 77.1 | 1.5   | -1.3, +0.3, +2.3, +2.3                           | 3.2 / 9.8          |
| German only | 72.0 | 0.3   | 76.2 | 0.3   | +3.0, +4.3, +4.7, +4.7                           | 2.9 / 9.4          |

hb runs five lines in English and six in German at 1440 px, as dh does. Reviewers named the "already"
that repeated the subline's "already use", and the trailing fragment.

On 09.11. the website's layout panel had scored q6 as H1 87.7 against 76.4 for dh. With one factor
changed per round: the same screenshots scored on what the line says put dh ahead by 8.1 on the old
page and 8.6 on today's, with both models in both runs (noise 0.1 to 1.0). Swapping the H1 alone had
moved the layout score by 18 points.

### The claim on the panel and on the path (10.11.)

The rendered panel of 10.11. (LinkedIn app and laptop, one-pager header, website footer at 1440 px;
five personas, both models, two runs, round 1 of the round on the client's change):

| Key | Overall | Noise | Claude / Codex | Distinctive | Core | People | Together | Gain first |
| --- | ------- | ----- | -------------- | ----------- | ---- | ------ | -------- | ---------- |
| x4  | 77.5    | 0.9   | 76.6 / 78.5    | 7.7         | 7.9  | 6.3    | 8.0      | 4.8        |
| r1  | 76.4    | 1.9   | 69.5 / 83.3    | 5.8         | 9.1  | 8.8    | 7.7      | 9.2        |
| tpe | 74.8    | 1.0   | 71.2 / 78.2    | 5.5         | 7.3  | 9.2    | 7.7      | 5.4        |
| f1  | 72.5    | 0.0   | 69.0 / 76.0    | 6.3         | 4.2  | 7.8    | 6.4      | 8.5        |
| e5  | 71.2    | 0.7   | 70.5 / 71.8    | 6.3         | 5.0  | 6.8    | 3.7      | 8.5        |

e5 is e5x's first wording ("Now your releases do."). The models split on r1: Codex puts it 4.7 to
5.3 ahead of both anchors, Claude 0.7 to 10.1 behind. On the path with dh (round 1), r1 leads tpe in
every cell and trails x4 with Claude by 7.8 and 11.2. Cold reads of the banner, alone and with the
descriptor, both languages: r1 names people and a result in 32 of 32 readings and the core (agents
alone are not enough) in 31; the bar was 24 of 32, and the control f6 named a result in 3 of 8.

### Trademark lookups (10. and 11.11.)

Read-only word searches for r1 in both languages and its parts, each register first given a control
that had to hit: DPMAregister (which also lists EU and international marks, 10.11., 23:28 CET), EUIPO
eSearch plus (23:37 CET) and USPTO Trademark Search in field tag mode (11.11., 00:02 CET). No match
in any register. Nearest hits contain "in tune" (for example IR 1257664 MICROSOFT INTUNE, USPTO serial
97845996 IN TUNE) or "releases" (EM 018256977 FIRST RELEASES). This is no clearance: no similarity
search, no class filter, no figurative marks, no unregistered rights.

## The profile texts

Three rounds, 284 runs, 10. and 11.11. No profile text pastes the claim. Every About, the Sessionize
tagline and bio, the Featured link title and OMR's opening paragraph change; the LinkedIn headline
and the company tagline stay, and YouTube's description has no claim. The texts to enter are in
the item `work-update-external-profiles-after-claim`, each seen in place under the new banner.

Each text was scored on the page a visitor sees: the LinkedIn profile and company page in the iPhone
app and on a laptop, the Sessionize and OMR pages live at 1000 px and 390 px with the text and the
cover swapped in. The prompt names the step before (a post or a message) and the step after (the home
page with hb and its subline), the claim, the mission and the vision. Four personas on every page
(CTO, VP of Engineering, brand strategist, bilingual copy editor) and one reader of that page: an
engineering manager answering a first message (profile), a head of Learning & Development comparing
providers (company page, OMR), a program committee member (Sessionize). Claude (`claude-opus-5-5`,
effort medium) and Codex (`gpt-6.1-sol`, reasoning high), two runs, English and German apart: 20
runs per page and language, 12 for the Featured link title. Criteria, fixed before the first score:
first screen clear, carries the line, one with the page, fits mission and vision, credible, natural
language, next step, then overall from 0 to 100.

| Key     | Candidate                                                                                                                                                                                                                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L       | The text as it stands: on LinkedIn the text of 31.10., on Sessionize and OMR the live page of 10.11.                                                                                                                                                                                             |
| U       | LinkedIn only: the text written on 08.11. around the claim before. LinkedIn could not be read, so either L or U may stand there                                                                                                                                                                  |
| P       | L with the claim pasted on top                                                                                                                                                                                                                                                                   |
| R       | L with "in tune" made concrete in one place                                                                                                                                                                                                                                                      |
| N       | No claim wording: the plain offer, the line left to the banner                                                                                                                                                                                                                                   |
| X       | An independent counter-draft: a separate model run that got the facts, the lines and the fields, and no other draft                                                                                                                                                                              |
| Y, Z    | Round 2, from the reasons of round 1. Profile: X's About with its third paragraph opening on "When every role is in tune with the others", under the headline as it stands (Y) or X's shorter headline (Z). Company page: R's About in two shorter sentences, under the tagline as it stands (Y) |
| M       | Round 3, Sessionize: N with one clause, "until every role works in tune with the others" / "bis alle Rollen eingespielt zusammenarbeiten"                                                                                                                                                        |
| b, c, d | Round 3, OMR's opening paragraph: the offer ending on "bis alle Rollen eingespielt zusammenarbeiten" (b), the claim pasted in front (c), the claim as a sentence of the paragraph (d)                                                                                                            |

**Round 1 (132 runs): pasting loses everywhere.** P scores lowest on the profile (71.7 and 71.9) and
on Sessionize (58.5 and 60.0), 6 to 12 points under the text it was pasted onto, and within a point
of the lowest on the company page (72.9 and 72.8, beside L at 73.5 and 72.2). As the Featured link
title the claim scores 54.3 against 75.3 for a title that says what the link opens. The
counter-draft leads the profile (84.3 English, 82.9 German), and N leads Sessionize by 12.0 and 11.5
over the live text in all eight cells.

**Round 2 (92 runs): LinkedIn.**

| Page, language | Entered | Overall | Noise | Against L (Claude run 1, 2; Codex run 1, 2)                 | Next best                                       |
| -------------- | ------- | ------- | ----- | ----------------------------------------------------------- | ----------------------------------------------- |
| Profile, EN    | Y       | 83.4    | 0.2   | +8.1: +11.2, +11.4; +5.2, +4.6                              | Z 84.9: +1.5 over Y (+2.8, +4.4; -0.2, -1.0)    |
| Profile, DE    | Y       | 83.8    | 0.1   | +8.6: +11.0, +11.6; +6.8, +5.0                              | Z 83.9: +0.1 over Y (+0.6, +2.4; -1.0, -1.8)    |
| Company, EN    | Y       | 80.2    | 0.7   | +5.8: +9.0, +10.8; +1.4, +1.8                               | N 79.7: Y leads by 0.5 (+1.0, +4.0; -1.2, -1.6) |
| Company, DE    | Y       | 82.8    | 1.3   | +10.0: +12.2, +13.0; +7.2, +7.8                             | R 79.9: Y leads by 2.9 in all four cells        |
| Featured title | e       | 80.0    | 0.7   | +14.8 over round 1's best title: +15.0, +17.0; +14.3, +13.0 | g 70.7                                          |

- Profile: Z and Y tie, Z's lead standing in Claude's cells only. The tie went to Y, the headline as
  it stands: one field less to change, and it keeps "AI training and mentoring", the words people
  search for. The item names Z as the alternative.
- Company page, English: Y and N tie. Y is entered in both languages, since it leads N by 4.8 in
  German in all four cells and one text in two languages keeps the page of a piece. Against U, the
  text of 08.11. with the claim before in it, Y leads by 2.3 in English (Claude +7.0, +4.4; Codex
  -0.6, -1.6) and by 7.5 in German in all four cells.
- Featured link title: "Seven agentic engineering training courses for teams, with mentoring on
  call". All 12 reviews of round 1's best title marked "trainings" as a countable plural, hence
  "training courses". The About texts keep "team trainings", the website's wording: 2 of the 40
  English reviews of the entered profile and company texts mark it, both by the Codex copy editor on
  the profile. Reviewers also note that the link opens the home page and not a list of courses.

**Round 3 (60 runs): Sessionize and OMR.**

| Page, language | Entered | Overall | Noise | Against L (Claude run 1, 2; Codex run 1, 2) | Next best                                               |
| -------------- | ------- | ------- | ----- | ------------------------------------------- | ------------------------------------------------------- |
| Sessionize, EN | M       | 80.2    | 0.9   | +14.7: +17.2, +15.6; +12.6, +13.2           | N 78.0: M leads by 2.2 (+4.2, +3.6; -0.2, +1.4)         |
| Sessionize, DE | M       | 82.5    | 0.9   | +17.1: +20.0, +20.4; +13.2, +15.0           | N 77.3: M leads by 5.2 (+7.8, +8.6; +2.4, +2.2)         |
| OMR, DE        | b       | 82.5    | 0.8   | +25.9: +28.0, +24.6; +26.8, +24.2           | d 80.2: b leads by 2.2 (+3.6, +4.4; +1.4, -0.4); c 73.2 |

- Sessionize: the one clause moves "carries the line" from 6.5 to 8.2 (English) and 8.5 (German) and
  costs natural language about a point (8.9 to 7.7, 8.3 to 7.5). M leads in seven of eight cells and
  is entered in both languages. Reviewers of N ask what "in tune" means; reviewers of M ask how one
  would measure it.
- OMR: the live opening, "macht ganze Unternehmen unaufhaltsam, im Flow mit Agentic Engineering", is
  the wording of the claim retired on 06.11. and scores 56.6; all 20 reviews name "unaufhaltsam",
  most as an unbacked superlative on a page where buyers compare providers. Pasting the new claim in
  front (c) loses 9.2 to b.

On every page reviewers ask for a result: one client, one number, how one would tell that the roles
are in tune. No profile text has one, and none was added, since a profile text takes only facts the
current texts state. That result is content the company owns, not wording.

Limits: the LinkedIn pages are mocks built from the app's and the site's layout with the real banner,
photo and logo, not checked against a logged-in screenshot. LinkedIn's company page, Clutch, Sortlist
and Crunchbase block an automated read, and X, Brella and Facebook need a login, so the item says to
replace the whole field. The Codex reviewers loaded the hub's `voice` skill and read its
`brand-voice.md`, which names claim and headline by key only; no log shows a read of the skill's
`verbal.json`.

In place: LinkedIn profile [English](2026-11-11-claim-and-headline/profile-en.jpg),
[German](2026-11-11-claim-and-headline/profile-de.jpg); company page
[English](2026-11-11-claim-and-headline/company-en.jpg),
[German](2026-11-11-claim-and-headline/company-de.jpg); Sessionize
[English](2026-11-11-claim-and-headline/sessionize-en.jpg),
[German](2026-11-11-claim-and-headline/sessionize-de.jpg);
[OMR](2026-11-11-claim-and-headline/omr-de.jpg).

## Open

The brand points below are in item `work-claim-followups`; the pin raises are briefs for the talks and
trainer-hub sessions.

- **External profiles.** Item `work-update-external-profiles-after-claim` (open, Benedikt): upload
  the seven banners and enter the texts above; Stefan enters OMR. Stefan's own LinkedIn About was
  not reviewed in any round.
- **The descriptor belongs in `verbal.json`.** The 08.11. rollout left it in code until a third
  surface or a consumer shows it. Its text is in `render.py` (`DESCRIPTOR`), in
  `applications/booth/generate.ts` with a full stop, and in the website's footer (`src/copy/ui.ts`,
  `footerSlogan`, with its German "Schulung und Mentoring in Agentic Engineering."), so that
  condition is met now. Moving it adds a field to `verbal.json`, a release.
- **`render.py` sizes each client mark by a hand-set height** in `PROFILE_LOGOS` and
  `FEATURED_LOGOS`, where `@hackersandwizards/testimonials`' `marks.json` records each mark's size and
  scale. Reading it from there moves pixels on two shipped banners and needs its own render and
  review; worth it at the next change to a mark's box.
- **`claim_block` takes size, step and grid height per surface** where one size would derive the
  others: a refactor with no visible change.
- **Consumers still to raise their pin**, read from each repository's `origin/main` as last fetched
  on 11.11. between 05:53 and 07:56 (this run fetched nothing): talks at v2.11.1, trainer-hub at
  v1.64.0. Website, os, slides, documents, mail, admin, certificate-verifier, hycle-private, practitioners
  and the personal site are at v2.15.0, the hub at v2.14.0. The website tracks its own follow-ups in its
  items (`work-hero-break-rule-one-owner`, `review-german-footer-safari`); its new home subline was
  decided on 11.11.
- **Not yet explained:**
  - tpe against u1 changes sign between rounds: tpe ahead by 6.7 on the panel of 08.11., level on
    09.11. (79.3 each), u1 ahead by 4.5 on the English banners of 11.11. and tpe ahead by 2.2 on the
    German ones. u1's run gap of 4.8 on the path of 08.11. is not explained either.
  - Why Claude assigns first screens to the wrong cases in some of its English reviews of 11.11.
  - The control f6 scored 9 of 16 in the English cold reads of 08.11.'s claim-tune round, against 6
    of 16 in round 10's English cell. Rounds are not comparable, and the rise is not explained.
  - The reader's path of 10.11. (Amdahl round) sits lower than on 08.11.: tpe 68.0 against 78.0,
    with another set of pairs and prompts. The anchors keep their order; the cause is not
    established.
  - The comments in `render.py` before 10.11. gave right ink edges 2 to 3 px wider than the
    committed banners measure. The comments now give what the run prints; no cause is established.

## Method: the prompts behind the current numbers

One prompt per kind of measurement, each from the latest round of its kind. `<run>` replaces the path of the
run's scratch folder.

Cold read, and stage 1 of the separate views (11.11., CTO, Claude, English, r1 with the descriptor):

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. You come across this LinkedIn profile in the LinkedIn iPhone app. The image shows it at its real display size. You know nothing else about the person or the company. Read the image file <run>/blind/8b779c7eef.jpg. Open no other file.

Answer in English, in your own words, without quoting the banner:
- takeaway: what you take away from the banner, the way you would still have it in mind a few days later (one or two sentences)
- does: what this company does, as far as the banner tells you (one clause; write "unclear" if the banner does not tell you)
- expect: what you expect the company's website to say when you open it (one sentence)
Answer with JSON only: {"takeaway": "...", "does": "...", "expect": "..."}
```

Separate views, stage 2 (11.11., VP of Engineering, Codex, run 1, English):

```text
You are the VP of Engineering at a European e-commerce company with 300 engineers. Some days ago you came across the LinkedIn profile of a company's founder and looked at its banner. Today you open that company's website for the first time.

Below are 8 separate cases. Each case has two parts: a note of what you still remembered from the banner, and an image of the first screen of the home page as you see it today, at its real display size, at 1440 px wide on a laptop (left) and at 390 px on a phone (right). Take each case on its own, as if it were your only visit: the note is all you remember, the image is all you see. The text under the headline and the picture beside it are the same in every case. Language: English. Read every image file. Open no other file.

Case VR
   what you remembered: "Getting value from AI agents depends on preparing the engineering team to work with them. This company helps people develop those skills."
   first screen (image 1 of 8): <run>/blind/0380ed3a4c.jpg
Case BQ
   what you remembered: "AI coding tools can make developers faster, but how work passes between people and agents determines whether the whole team speeds up. This company helps engineering teams improve that way of working."
   first screen (image 2 of 8): <run>/blind/8308e5abea.jpg
Case FP
   what you remembered: "AI coding tools can make developers faster, but how work passes between people and agents determines whether the whole team speeds up. This company helps engineering teams improve that way of working."
   first screen (image 3 of 8): <run>/blind/20df384a7d.jpg
Case PS
   what you remembered: "They help turn gains from AI coding tools into faster delivery across the engineering team. I’d remember the focus on getting software shipped sooner."
   first screen (image 4 of 8): <run>/blind/e623385758.jpg
Case PF
   what you remembered: "Getting value from coding agents depends on how well the people using them work together. This company helps engineering teams build that capability."
   first screen (image 5 of 8): <run>/blind/8f7344fbd5.jpg
Case QK
   what you remembered: "They help turn gains from AI coding tools into faster delivery across the engineering team. I’d remember the focus on getting software shipped sooner."
   first screen (image 6 of 8): <run>/blind/355276bbb1.jpg
Case QC
   what you remembered: "They help engineering teams deliver software faster using AI agents, with an emphasis on getting the people working effectively together."
   first screen (image 7 of 8): <run>/blind/71f8cd14da.jpg
Case HW
   what you remembered: "They help engineering teams deliver software faster using AI agents, with an emphasis on getting the people working effectively together."
   first screen (image 8 of 8): <run>/blind/c4a6905985.jpg

Score each case, 0 to 10:
- gain_first: the first thing the headline makes you see is what gets better for the client company and its people, ahead of the provider's service and ahead of the problem
- does_clear: after this first screen you know what the company does
- read_on: you would scroll and read on
- recognise: what this first screen says makes you recognise the company from the earlier visit; judge by the message and leave the name and the logo aside
- further: this first screen takes the thought you came with a step further
Then overall, 0 to 100: how well this first screen works for you as the next step after the earlier visit.
For each case, in your own words:
- relation: how what you read here relates to what you remembered (one sentence)
- works: what works best about arriving here with that memory (at most 15 words)
- below_max: what keeps it below the maximum (at most 20 words)
- open_question: the one question this first screen leaves open for you (at most 15 words)
Answer with JSON only: {"<label>": {"gain_first":0,"does_clear":0,"read_on":0,"recognise":0,"further":0,"overall":0,"relation":"one sentence","works":"at most 15 words","below_max":"at most 20 words","open_question":"at most 15 words"}, ...} covering every label.
```

Banner panel (11.11., CTO, Claude, run 1, English, with the descriptor). The candidates are cut
after the first of seven:

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. A company, hackers&wizards, shows a line on the banners of its social and event profiles. You know nothing else about the company. Each candidate below is the same set of banners with a different line; language of the line: English.

Medium: profile pages on LinkedIn, XING, X, Sessionize, Facebook, Brella and YouTube. Audience: engineering and product leaders in German-speaking companies who open a profile after a first contact. Display size: as in the screenshots (a phone, a laptop browser), each banner with the profile photo and the page's own crop where the channel has them; the third image is 1000 px wide. Read every image file, three per candidate, in the order listed. Open no other file.

Candidate RM (line: Faster releases with agents, when your people are in tune.)
- <run>/blind/fa8dad4ba9.jpg: the LinkedIn profile in the iPhone app (left) and on the desktop site on a laptop (right)
- <run>/blind/eaa9bca8ae.jpg: the XING profile on a 390 px phone (left) and in a 1024 px desktop browser (right)
- <run>/blind/a511b9af12.jpg: from the top, each captioned: the X profile header, the Sessionize speaker page on a laptop and on a phone, the Facebook profile cover on a phone and on a desktop, the Brella event profile cover, the strip of the YouTube channel banner every device shows
[cut here: six more candidates in the same form]

Score each candidate, 0 to 10:
- distinctive: the line could not stand just as well on a competitor's page
- clear: you understand the line at a glance
- emotional: it makes you want to know more
- credible: you believe it
- language: natural, idiomatic English
- calm: visual calm on the banners
- room: breathing room, not cramped, clear of the photo and of each page's edges
- legible: legible at the sizes shown
- offer: from these banners alone you know what the company does
- core: the line says what a company gets from AI agents and what that depends on
- people: you read it as being about human people, not about software
Then linkedin, xing, others (how well the line works on each group of banners), each 0 to 100, and overall, 0 to 100.
Apart from these scores, and left out of overall:
- gain_first, 0 to 10: the first thing the line makes you see is what gets better for the client company and its people, ahead of the provider's service and ahead of the problem
- gain: name in one clause what the line says gets better for the client; write "nothing" if it names nothing
For each candidate also:
- does: what this company does, judged from this candidate's banners alone (one clause; write "unclear" if they do not tell you)
- breaks: name every banner on which the line is cut off, covered or collides with something, or write "none"
- open_question: the one question the line leaves open for you (at most 15 words)
- below_max: what keeps it below the maximum (at most 20 words)
Answer with JSON only: {"<label>": {"distinctive":0,"clear":0,"emotional":0,"credible":0,"language":0,"calm":0,"room":0,"legible":0,"offer":0,"core":0,"people":0,"linkedin":0,"xing":0,"others":0,"overall":0,"gain_first":0,"gain":"one clause","does":"one clause","breaks":"none","open_question":"at most 15 words","below_max":"at most 20 words"}, ...} covering every label.
```

Side by side on one sheet, the reader's path (10.11., CTO, Claude, run 1, English, with the
descriptor):

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. A training company from Hamburg, hackers&wizards, trains and mentors engineering and product teams and their leaders in working with AI coding agents (agentic engineering). Its buyers are CTOs, CIOs and VPs of Engineering whose developers have coding agents while releases come no faster. It is choosing the pair of lines a reader meets on the way in: the claim, a short line on the founder's LinkedIn profile banner and in the website footer, and the headline, the H1 on the home page.

Medium: the reader's path in steps, each image showing them in order: 1 the founder's LinkedIn profile in the iPhone app and on a laptop (the way in), 2 the home page's first screen at 1440 px (and 390 px on a phone for English), 3 the website footer. Shown at display size, scaled to 1600 px wide. Audience: engineering and product leaders in German-speaking companies who meet the company for the first time. Language: English. Each image is the same path with a different pair of lines. Read every image file.

MH: <run>/blind/fadb9a1872.jpg
   claim (banner, footer): Faster releases with agents, when your people are in tune.
   headline (home page H1): Your teams have agents. Once all roles are in tune, your releases speed up.
CS: <run>/blind/070a4a95e5.jpg
   claim (banner, footer): Agents pay off when your people are in tune.
   headline (home page H1): Faster releases with the agents your teams already have. Once all roles are in tune.
GM: <run>/blind/14149b70f0.jpg
   claim (banner, footer): Faster releases with agents, when your people are in tune.
   headline (home page H1): Faster releases with the agents your teams already have. Once all roles are in tune.
SQ: <run>/blind/34abc668dc.jpg
   claim (banner, footer): Agents speed up code. Your handoffs set the pace.
   headline (home page H1): Your teams have agents. Once all roles are in tune, your releases speed up.
HM: <run>/blind/1234fb771d.jpg
   claim (banner, footer): Your developers got faster. Your releases are next.
   headline (home page H1): Your teams have agents. Once all roles are in tune, your releases speed up.
QB: <run>/blind/fd775cedc1.jpg
   claim (banner, footer): Agents pay off when your people are in tune.
   headline (home page H1): Your teams have agents. Once all roles are in tune, your releases speed up.

Score each pair, 0 to 10:
- clear: you understand within seconds what changes for your company
- relevant: it names a change you want
- credible: you believe it
- distinctive: it could not stand just as well on a competitor's pages
- language: natural, idiomatic English
- one_message: banner, home page and footer tell one coherent message, each line doing its own job
- headline: the H1 does a homepage headline's job
- claim: the banner and footer line does a claim's job
Then overall, 0 to 100: how well this path works for you as a first contact.
Apart from these scores, and left out of overall, for the claim (the banner and footer line):
- gain_first, 0 to 10: the first thing the line makes you see is what gets better for the client company and its people, ahead of the provider's service and ahead of the problem
- gain: name in one clause what the line says gets better for the client; write "nothing" if it names nothing
Name for each pair the one question the path leaves open for you, and what keeps it below the maximum.
Answer with JSON only: {"<label>": {"clear":0,"relevant":0,"credible":0,"distinctive":0,"language":0,"one_message":0,"headline":0,"claim":0,"overall":0,"gain_first":0,"gain":"one clause","open_question":"at most 15 words","below_max":"at most 20 words"}, ...} covering every label.
```

Profile texts (10.11., copy editor, Codex, run 1, Sessionize, English). The four versions' tagline
and bio texts are cut where marked:

```text
You are a bilingual copy editor, German and English, who edits B2B technology copy for native readers of each language. You look at the Sessionize speaker page of Benedikt Stemmildt, founder of the training company hackers&wizards, shown on a laptop (left, scaled to 1000 px wide) and on a 390 px phone (right). The audience is conference program committees, and engineering leaders who look up a speaker; the display size is the one shown in each image.
Read every image file named below. Language of the text: English. Each version is the same page, with different text. The cover, photo and layout are the same in every version. Below each image name is the full text of the fields that change.
The step before this page: the reader saw a post or received a message from this company or person. The step after this page: the company's home page, which opens with the headline "Faster releases with the agents your teams already have. Once all roles are in tune." and the line "We train engineering and product teams and their leaders in agentic engineering, hands-on in the coding agent they already use.".
The company's line, which appears on its banners and closing slides: "Faster releases with agents, when your people are in tune."
Its stated mission: "We bring every role that builds our clients' products into flow with agentic engineering, as one team."
Its stated vision: "A world where the whole organization is in flow, because every role it takes to build its products is tuned to the others. Where agentic engineering is lived, not performed."

Version NB
Image: <run>/blind/6ca8488c13.jpg
[cut here: the tagline and bio of this version and of versions HT, PN and SG]

Score each version on these criteria, 0 to 10 each, judging the text in its place on the page: first_screen_clear (what is on the first screen says what is on offer and for whom); carries_line (reading the whole, the company's line becomes concrete and is believable, without being repeated like a slogan); one_with_page (the text reads as one with the banner and the page around it, with no duplication or clash); fits_mission_vision; credible (facts over slogans, a person or company you would trust); natural_language (reads as natural English for this reader); next_step (you would answer, follow or book a call). Then give each version an overall score from 0 to 100.
For each version, name in one sentence what keeps its lowest criterion below 10 and which question this page leaves open for you as a reader.
Answer as JSON only: {"candidates": {"<version label>": {"criteria": {"first_screen_clear": <0-10>, "carries_line": <0-10>, "one_with_page": <0-10>, "fits_mission_vision": <0-10>, "credible": <0-10>, "natural_language": <0-10>, "next_step": <0-10>}, "overall": <0-100>, "lowest_reason": "...", "open_question": "..."}}}
```

The hero rounds of 10.11. reused the headline criteria of 07.11. with gain first added; their prompt
and the rendered-panel prompts of 08. to 10.11. are in git at `402e23a`.

Review: none, because this report folds measured reports into one and adds no measurement and no
copy that leaves the company.

# Claim round 9: one line or a short/long pair that meets every requirement, 08.11.2026

The pair s4p meets four of the six requirements fully and two in part:

- Short line, for the banners: "Agents pay off when your people ship as a team." / "KI-Agenten
  lohnen sich, wenn eure Leute als Team liefern."
- Long line, for the closing slide, the link preview, the one-pager and the top of the About and
  the bios: "Agents pay off when your people ship as a team. Your customers notice." / "KI-Agenten
  lohnen sich, wenn eure Leute als Team liefern. Eure Kunden merken es."

Alone on the LinkedIn banner, with the photo over the first letters, 32 of 32 cold readers read
its people as people and 31 of 32 restate the core thought (f6: 14 and 12). With the banners, slide and link preview in view, the panel's overall score puts it 12.0 ahead of f6, in both runs and with both models (noise 0.8); surface by surface it ties f6 on the banners (-0.5) and leads on the slide (+2.2) and the link preview (+3.0). As a whole set
with the home H1 "zusammenspielen", the decided headlines and the profile texts it ties f6 (78.6
against 79.0). The short line alone on every surface still leads f6 by 8.2 overall. On the banners Codex puts s4p 2.7 behind f6, outside the noise.

What it misses in part: Codex's banner score, 2.7 behind f6's, and German. The German scores 3.0 below the English (noise 0.8), its banners 3.3 below
f6's German banners, and reviewers call "als Team liefern" slightly translated (language 8.1
against f6's 9.3). It is still the best of four German wordings and leads f6's German by 10.5.

## Question

Round 8 kept f6 but left it short of the core thought: alone on a banner, f6's team read as
people for 1 of 32 readers. Benedikt then asked whether one combination meets every requirement,
named a short claim for banners and a long one elsewhere as an option, liked m3 and f6, and allowed
"im Einklang" back as a word. The core thought stays as in round 8: agents alone deliver nothing;
agents and the human team in tune; then the company succeeds and ships to its customers.

## Requirements, fixed before any score

- (a) Alone on the LinkedIn banner, cold readers read the team as people and restate the core
  thought (people and a result for the company or its customers). Bar: 28 of 32 people, 24 of 32
  core.
- (b) On the banners, closing slide and link preview: within the noise of f6 or ahead, with each
  model.
- (c) As a whole set with the site and the profile texts: ties or beats f6.
- (d) Keeps working together: the panel criterion "together" at least f6's minus 1.
- (e) Survives LinkedIn's narrow layout: the cold read of (a) runs on that view, the photo over the
  first letters of each line.
- (f) German as strong as English: German overall within the noise of the English, and the German
  cold read passes (a). "Im Einklang" runs as a candidate word, blind.

## Candidates

| Key | Kind   | EN                                                                                             | DE                                                                                                             | Origin                     |
| --- | ------ | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------- |
| f6  | single | Every agent needs a team in tune.                                                              | Jeder KI-Agent braucht ein eingespieltes Team.                                                                 | anchor (decided)           |
| m3  | single | Agents write code. Your team ships products.                                                   | KI-Agenten schreiben Code. Euer Team liefert Produkte.                                                         | anchor (runner-up)         |
| q2  | pair   | short f6; long: Every agent needs a team in tune. Together they ship what your customers need. | short f6; long: Jeder KI-Agent braucht ein eingespieltes Team. Zusammen liefern sie, was eure Kunden brauchen. | round 2, f6 extended       |
| A3q | pair   | Agents pay off when your people work together. / + Your customers see it in your releases.     | KI-Agenten lohnen sich, wenn eure Leute zusammenarbeiten. / + Eure Kunden merken es an euren Releases.         | round 4, from fresh A3     |
| u1p | pair   | Agents pay off when your people ship together. / + Your customers see it in your releases.     | KI-Agenten lohnen sich, wenn eure Leute gemeinsam liefern. / + Eure Kunden merken es an euren Releases.        | round 5, A3 with m3's ship |
| s4p | pair   | Agents pay off when your people ship as a team. / + Your customers notice.                     | KI-Agenten lohnen sich, wenn eure Leute als Team liefern. / + Eure Kunden merken es.                           | round 6, u1p fixed         |
| s4  | single | Agents pay off when your people ship as a team.                                                | KI-Agenten lohnen sich, wenn eure Leute als Team liefern.                                                      | s4p's short line alone     |

"+" marks the sentence the long line adds to the short one. A fresh model (`claude -p --model
opus`) got the offer, the buyers, the thought and the surfaces in neutral words, and never saw a
candidate, a current or retired line or any of Benedikt's words. It wrote ten single lines and six pairs; all sixteen went into round 1 beside twelve hybrids and pairs from this run and the three anchors (f6, m3 and round 8's e6). A3, its "Agents pay off when people build together. Customers see it.", is the root
of A3q, u1p and s4p. 53 keys in all; every key and score is in the tables below.

## Method

- Panel criteria, 0 to 10: round 8's eight (distinctive, clear, emotional, credible, calm,
  language, core, people) and a new one, together ("it says the human team works together, with
  each other and with the agents"); banners, slide, link preview and overall, 0 to 100. A pair was
  scored as the system it is: the short line on the banners, the long one on the slide and the
  link preview.
- Rounds 1 and 2, text: CTO, VP of Engineering, conference organiser, brand strategist; Claude
  (`claude -p --model opus`) and Codex (`gpt-6.1-sol`, high); one run in round 1, two in round 2.
- Rounds 3 to 6, rendered: round 8's panel (CTO, VP of Engineering, conference organiser, senior
  engineer looking for a job, brand strategist; both models; two runs; 20 runs a round). Per
  candidate and language one sheet at real display size: the LinkedIn banner in LinkedIn's narrow
  layout with the real profile photo restored over it (screenshot of 31.10. in os
  `docs/agent-work/2026-10-31-channel-banners-live/`), the X header with a grey circle where the
  photo sits, the Sessionize cover, the closing slide (slides catalog story
  `Types/closing-slide/contact`, the claim swapped in headless Chrome for Testing) and the link
  preview (the website's `scripts/og/template.html`, filled as `generate.mjs` fills the home card).
  The banners came from `applications/channel-banners/render.py`, loaded by a scratch script, with
  the descriptor "Training and mentoring in agentic engineering" / "Training und Mentoring in
  Agentic Engineering" at 0.62 of the claim size, as in rounds 7 and 8. No accent colour.
- Round 7, German only: the same panel on the German sheets of s4p and three German wordings of its
  short line, with f6 and m3, 20 runs.
- Cold reads of the LinkedIn banner in its narrow layout, photo over it: CTO, VP of Engineering,
  engineering lead, HR at a logistics company; both models; two runs, the answer options reversed
  in run 2; 16 per line and language. The team question ("unclear" offered) and the free-text
  question each in their own run. Twelve short lines, 768 runs.
- The free-text readings went to Claude runs that saw only the readings, never the line, and marked
  people, alone, company and the kind of company; core is people and company, as in round 8. Three
  passes over all 384 readings; a reading counts by the majority of the three. Their spread is the
  classifier's noise and appears beside each count.
- The set, f6, m3, s4p, u1p and A3q: the sheets above, as text the home H1 (German
  "zusammenspielen" for every set), the lead, the tuning desk with its "in flow" output, the 24
  decided page headlines (website item `work-ship-decided-page-headlines`, read from `origin/main`,
  blog-r2) and Benedikt's profile texts (the LinkedIn About's opening from the 31.10. screenshot,
  the practitioners short bio, the Sessionize bio read live today), the claim line at the top of the
  About and the bios. CTO, VP of Engineering, brand strategist, bilingual copy editor; both models;
  two runs: 16 runs.
- Noise: the gap between the means of run 1 and run 2. A lead counts only outside the noise, in
  both runs and with both models; otherwise a tie.
- Overall is each reviewer's own 0-to-100 score for the line as the company's claim, with every surface in view, not the mean of the three surface scores: a line can score lower overall than on every surface where reviewers mark down core and people (f6 in round 6).
- 954 runs: 1 drafting, 24 text panel, 100 rendered panel, 768 cold reads, 45 classifier, 16 set.

## Rounds 1 and 2, text

Round 1, 31 lines and pairs, one run (gap to f6, positive = ahead):

| Key | EN (short line for pairs)                                                      | Overall | Gap   | Claude / Codex | Core | People | Together | Lang. |
| --- | ------------------------------------------------------------------------------ | ------- | ----- | -------------- | ---- | ------ | -------- | ----- |
| p1  | Every agent needs a team in tune. (+ That is how your company ships products.) | 77.6    | +3.3  | +1.9 / +4.6    | 8.0  | 6.9    | 7.1      | 8.4   |
| e6  | Agents write code. Teams in tune ship products.                                | 76.7    | +2.4  | +0.6 / +4.1    | 6.9  | 7.4    | 6.6      | 8.7   |
| x6  | Every agent needs a team in tune. Then you ship.                               | 76.3    | +2.0  | +2.5 / +1.5    | 7.6  | 6.9    | 7.1      | 8.4   |
| A3  | Agents pay off when people build together. Customers see it.                   | 74.7    | +0.4  | +0.5 / +0.2    | 8.6  | 9.8    | 7.0      | 7.8   |
| f6  | Every agent needs a team in tune.                                              | 74.3    |       |                | 6.2  | 6.9    | 7.1      | 8.7   |
| m3  | Agents write code. Your team ships products.                                   | 72.8    | -1.5  | -3.7 / +0.8    | 5.9  | 7.6    | 3.6      | 9.2   |
| x3  | Agents write code. People in tune ship products.                               | 67.5    | -6.8  | -5.6 / -8.0    | 6.9  | 9.8    | 6.1      | 6.2   |
| p3  | Agents and people in tune. (+ ... ship what your customers need.)              | 65.1    | -9.2  | -15.8 / -2.5   | 5.9  | 8.6    | 8.1      | 6.8   |
| x2  | Agents and people in tune ship products.                                       | 63.5    | -10.8 | -16.4 / -5.2   | 5.6  | 8.7    | 8.1      | 6.6   |

The other 22 scored 54.2 to 73.4. Nine lines carried "im Einklang" in German (x2, x3, x4, x8, x9, x12, p2, p3, p4); they scored 60.4 to 73.4 and took the round's three lowest language scores (5.5 to 5.7). Reviewers,
both models: "'im Einklang' sounds esoteric", "spiritual rather than operational", "stiff". Every
reviewer named the same two causes for the f6 family: "team" does not say human, and no customer
appears.

Round 2, 15 lines and pairs, two runs, built on those causes. The best and the anchors:

| Key | Short line                                     | Overall | Noise | Gap  | Claude / Codex | Core | People | Together | Lang. |
| --- | ---------------------------------------------- | ------- | ----- | ---- | -------------- | ---- | ------ | -------- | ----- |
| q2  | Every agent needs a team in tune.              | 79.9    | 0.1   | +9.1 | +9.4 / +8.9    | 8.7  | 7.1    | 8.7      | 8.4   |
| q1  | Every agent needs your team in tune.           | 78.8    | 0.7   | +8.0 | +8.1 / +8.1    | 8.7  | 7.9    | 8.7      | 7.7   |
| A3p | Agents pay off when your people work together. | 76.5    | 0.2   | +5.7 | +7.1 / +4.4    | 8.5  | 9.6    | 7.3      | 8.4   |
| m3  | Agents write code. Your team ships products.   | 71.4    | 2.8   | +0.6 | +1.1 / +0.2    | 6.1  | 8.2    | 3.3      | 9.3   |
| f6  | Every agent needs a team in tune.              | 70.8    | 2.9   |      |                | 5.3  | 6.8    | 6.8      | 8.8   |
| y1e | Every agent needs your team in tune.           | 63.0    | 1.8   | -7.8 | -8.8 / -6.8    | 5.1  | 7.4    | 6.5      | 6.2   |

y1e is q1's short line with the German "Jeder KI-Agent braucht euer Team im Einklang." against
"euer eingespieltes Team": German 58.7 against 71.2. Adding the customer in the long line lifts f6
by 9; "your team in tune" reads awkward in English ("needs your team in tune is clumsy").

## Rounds 3 to 7, rendered

Gap to f6 per round, positive = ahead (rounds compare within themselves only):

| Round | Key | Overall | Noise | Gap   | Run 1 / 2     | Claude / Codex | Banners | Slide | Link preview | EN / DE     | Core | People | Together | Calm | Lang. |
| ----- | --- | ------- | ----- | ----- | ------------- | -------------- | ------- | ----- | ------------ | ----------- | ---- | ------ | -------- | ---- | ----- |
| 3     | A3p | 78.1    | 0.6   | +10.6 | +9.8 / +11.5  | +12.8 / +8.5   | 70.5    | 78.0  | 78.9         | 79.3 / 76.8 | 8.4  | 9.4    | 7.8      | 7.2  | 8.2   |
| 3     | q2  | 75.2    | 2.3   | +7.7  | +7.7 / +7.7   | +7.3 / +8.2    | 72.5    | 77.3  | 78.2         | 74.5 / 76.0 | 7.5  | 5.8    | 7.6      | 8.4  | 8.3   |
| 3     | e6  | 75.1    | 0.2   | +7.6  | +6.6 / +8.7   | +8.2 / +7.2    | 72.3    | 78.9  | 78.8         | 75.0 / 75.2 | 6.8  | 6.6    | 6.3      | 8.2  | 8.3   |
| 3     | m3  | 73.8    | 0.3   | +6.3  | +5.4 / +7.4   | +8.3 / +4.5    | 75.5    | 80.7  | 81.8         | 74.5 / 73.2 | 6.0  | 7.7    | 3.3      | 9.2  | 9.0   |
| 3     | f6  | 67.5    | 2.3   |       |               |                | 73.0    | 73.1  | 73.8         | 66.4 / 68.5 | 4.7  | 5.3    | 6.1      | 9.4  | 8.3   |
| 4     | A3q | 78.8    | 1.7   | +8.9  | +9.4 / +8.5   | +9.8 / +8.1    | 67.7    | 75.2  | 76.0         | 79.5 / 78.1 | 8.6  | 9.3    | 7.3      | 7.5  | 8.5   |
| 4     | q2  | 76.7    | 0.7   | +6.8  | +6.7 / +6.8   | +6.2 / +7.5    | 70.4    | 74.2  | 74.4         | 75.2 / 78.2 | 7.5  | 6.7    | 8.1      | 7.9  | 8.6   |
| 4     | f6  | 69.9    | 0.8   |       |               |                | 70.5    | 70.7  | 71.7         | 68.2 / 71.5 | 4.9  | 6.3    | 6.6      | 9.4  | 8.8   |
| 5     | A3q | 79.0    | 0.4   | +11.6 | +12.1 / +11.0 | +11.3 / +11.8  | 71.2    | 79.0  | 78.7         | 79.7 / 78.2 | 8.5  | 9.4    | 7.5      | 7.7  | 8.6   |
| 5     | u1p | 74.5    | 0.2   | +7.1  | +7.3 / +6.8   | +6.9 / +7.2    | 68.3    | 75.2  | 75.5         | 75.8 / 73.2 | 8.3  | 9.4    | 7.1      | 7.2  | 7.2   |
| 5     | m3  | 70.8    | 1.5   | +3.4  | +2.9 / +3.7   | +3.6 / +3.0    | 73.6    | 78.7  | 80.3         | 71.9 / 69.6 | 5.3  | 8.0    | 2.8      | 9.2  | 8.8   |
| 5     | f6  | 67.4    | 0.7   |       |               |                | 71.8    | 72.6  | 74.2         | 65.7 / 69.2 | 4.6  | 5.6    | 6.1      | 9.2  | 8.4   |
| 6     | s4p | 77.1    | 0.8   | +12.0 | +10.7 / +13.4 | +12.8 / +11.3  | 70.0    | 76.2  | 78.8         | 78.6 / 75.6 | 8.1  | 9.3    | 7.3      | 7.6  | 7.8   |
| 6     | u1p | 75.9    | 1.7   | +10.8 | +9.0 / +12.6  | +9.5 / +12.2   | 69.8    | 72.5  | 73.4         | 77.8 / 74.0 | 8.5  | 9.3    | 7.4      | 6.2  | 7.5   |
| 6     | s4  | 73.3    | 1.6   | +8.2  | +6.5 / +10.0  | +7.6 / +8.9    | 70.0    | 75.5  | 76.1         | 75.0 / 71.7 | 6.6  | 9.3    | 7.3      | 8.1  | 7.8   |
| 6     | A3q | 73.3    | 1.2   | +8.2  | +6.7 / +9.8   | +6.0 / +10.5   | 68.6    | 71.7  | 72.3         | 74.0 / 72.5 | 7.8  | 9.3    | 7.9      | 6.4  | 8.2   |
| 6     | m3  | 70.7    | 0.1   | +5.6  | +4.8 / +6.6   | +4.1 / +7.2    | 73.4    | 79.0  | 81.4         | 72.0 / 69.5 | 5.5  | 8.0    | 3.1      | 9.1  | 8.8   |
| 6     | f6  | 65.1    | 1.9   |       |               |                | 70.5    | 74.0  | 75.8         | 62.9 / 67.2 | 4.5  | 5.5    | 6.5      | 8.9  | 8.2   |
| 7, DE | s4p | 77.2    | 1.1   | +10.5 | +10.1 / +10.8 | +7.6 / +13.3   | 72.1    | 78.0  | 79.8         | – / 77.2    | 8.1  | 9.4    | 7.2      | 7.5  | 8.1   |
| 7, DE | g2  | 75.2    | 0.2   | +8.5  | +8.8 / +8.2   | +4.9 / +12.1   | 68.5    | 76.3  | 77.8         | – / 75.2    | 8.1  | 9.4    | 7.1      | 6.5  | 7.8   |
| 7, DE | m3  | 74.3    | 0.1   | +7.6  | +7.8 / +7.5   | +7.1 / +8.2    | 79.3    | 79.8  | 80.8         | – / 74.3    | 5.7  | 7.5    | 3.2      | 9.3  | 9.2   |
| 7, DE | g1  | 73.3    | 1.1   | +6.6  | +7.4 / +5.9   | +2.6 / +10.7   | 70.9    | 75.3  | 77.0         | – / 73.3    | 7.6  | 7.0    | 7.3      | 7.5  | 7.5   |
| 7, DE | g3  | 70.2    | 1.3   | +3.5  | +3.1 / +4.0   | -0.3 / +7.4    | 65.6    | 72.3  | 73.5         | – / 70.2    | 7.8  | 9.4    | 7.6      | 6.5  | 6.2   |
| 7, DE | f6  | 66.7    | 0.4   |       |               |                | 75.4    | 71.5  | 71.5         | – / 66.7    | 4.7  | 5.2    | 6.1      | 9.6  | 9.3   |

Round 3 also scored q1 (+3.5), z2 ("a human team in tune", +6.0) and z1 (q2's long line on every
surface, -0.2, banners 50.3); round 4 w1p ("Agents work when ...", +3.2) and v1 ("Every agent
needs people in tune", -1.2); round 5 u2p ("Agents deliver when ...", +5.9); round 6 u1 (u1p's
short line alone, +8.3). The German wordings of round 7: g1 "KI-Agenten lohnen sich, wenn euer
Team gemeinsam liefert.", g2 "KI-Agenten zahlen sich aus, wenn eure Leute als Team liefern.", g3
"KI-Agenten lohnen sich, wenn eure Leute gemeinsam ausliefern.", each with "Eure Kunden merken
es." in the long line.

- Every round from 3 on puts its best line 8.9 to 12.0 ahead of f6: a plateau. Round 7 found no
  German above s4p's own: it leads g2 by 2.0, outside the noise with both models (Claude 2.7, Codex
  1.2).
- s4p against u1p in round 6: +1.2 at noise 1.7, a tie. s4p is calmer (7.6 against 6.2) and wins
  the set (below).
- Surface by surface in round 6, s4p against f6: banners -0.5 (Claude +1.5, Codex -2.7; noise 1.3 and 1.5), slide +2.2 (Claude +4.6, Codex -0.5; noise 1.2 and 0.6), link preview +3.0 (Claude +5.0, Codex +1.2; noise 1.1 and 0.4). u1p trails by 3.5 in round 5, outside the noise; "ship together" cost it.
- What keeps s4p below the maximum, in the reviewers' words: "Customers notice what?", "working
  with agents only implied", "'als Team liefern' slightly translated", "the LinkedIn crop eats the
  first words". For m3, every Claude reviewer in every round: no working together ("Separates
  agents from the team instead of joining them").

## Cold reads, the LinkedIn banner in its narrow layout (16 per cell)

| Key | Lang | Team: agents / both / people / unclear | People, Claude / Codex | Reading: people / company / core (3 passes) | Alone |
| --- | ---- | -------------------------------------- | ---------------------- | ------------------------------------------- | ----- |
| s4p | EN   | 0 / 0 / 16 / 0                         | 8 / 8                  | 16 / 16 / 16 (16, 16, 16)                   | 9     |
| s4p | DE   | 0 / 0 / 16 / 0                         | 8 / 8                  | 16 / 15 / 15 (15, 15, 15)                   | 10    |
| u1p | EN   | 0 / 0 / 16 / 0                         | 8 / 8                  | 16 / 15 / 15 (15, 14, 14)                   | 9     |
| u1p | DE   | 0 / 0 / 16 / 0                         | 8 / 8                  | 16 / 16 / 16 (16, 16, 16)                   | 13    |
| A3q | EN   | 0 / 0 / 16 / 0                         | 8 / 8                  | 16 / 12 / 12 (10, 12, 10)                   | 10    |
| A3q | DE   | 0 / 0 / 16 / 0                         | 8 / 8                  | 16 / 12 / 12 (10, 12, 6)                    | 13    |
| m3  | EN   | 0 / 0 / 16 / 0                         | 8 / 8                  | 13 / 16 / 13 (14, 12, 12)                   | 1     |
| m3  | DE   | 0 / 0 / 16 / 0                         | 8 / 8                  | 12 / 16 / 12 (15, 12, 11)                   | 1     |
| f6  | EN   | 0 / 0 / 8 / 8                          | 8 / 0                  | 13 / 7 / 7 (4, 7, 7)                        | 15    |
| f6  | DE   | 0 / 0 / 6 / 10                         | 6 / 0                  | 15 / 5 / 5 (3, 5, 5)                        | 16    |
| e6  | EN   | 0 / 0 / 16 / 0                         | 8 / 8                  | 6 / 16 / 6 (7, 7, 7)                        | 16    |
| q1  | EN   | 0 / 0 / 16 / 0                         | 8 / 8                  | 13 / 5 / 4 (3, 4, 5)                        | 14    |
| q1  | DE   | 0 / 0 / 8 / 8                          | 7 / 1                  | 13 / 1 / 1 (1, 0, 3)                        | 16    |
| z1  | EN   | 0 / 0 / 6 / 10                         | 6 / 0                  | 11 / 16 / 11 (10, 11, 11)                   | 16    |

A3q's short line is A3p's. Also read, below the bar: w1p (core 17 of 32), u2p (15), v1 (5), z2 (5),
e6 in German (4). Noise: the team count differs by at most 2 of 8 between the runs. The classifier
moves some counts by up to 7 between passes (u2p in German: 4, 5, 11), s4p's and u1p's by at most 1.
This round's classifier marks people more strictly than round 8's: m3's readings count people 25 of
32 here, 32 there, while the team question gives 32 of 32 in both. On the narrow layout the photo
cuts s4p to "ents pay off when your" / "ple ship as a team." and "I-Agenten lohnen sich, wenn" / "e
Leute als Team liefern."; readers still name people 32 of 32.

## The set: every surface with the site and the profile texts (16 runs)

| Key | Overall | Noise | Run 1 / 2   | Claude / Codex | Gap  | Claude / Codex gap | Repetition EN / DE | Together | Profiles | Website | Brand | Calm |
| --- | ------- | ----- | ----------- | -------------- | ---- | ------------------ | ------------------ | -------- | -------- | ------- | ----- | ---- |
| f6  | 79.0    | 3.2   | 80.6 / 77.4 | 71.8 / 86.2    |      |                    | 4.3 / 4.4          | 9.1      | 77.9     | 82.8    | 81.2  | 8.8  |
| s4p | 78.6    | 0.5   | 78.4 / 78.9 | 72.9 / 84.4    | -0.4 | +1.1 / -1.8        | 4.8 / 4.9          | 8.2      | 78.9     | 80.0    | 77.6  | 7.6  |
| u1p | 77.1    | 0.1   | 77.1 / 77.0 | 70.2 / 83.9    | -1.9 | -1.6 / -2.3        | 3.6 / 4.1          | 8.2      | 77.5     | 80.1    | 75.7  | 6.8  |
| m3  | 75.6    | 0.9   | 76.0 / 75.1 | 64.9 / 86.2    | -3.4 | -6.9 / 0.0         | 3.1 / 3.7          | 7.2      | 76.9     | 75.1    | 77.0  | 8.6  |
| A3q | 72.7    | 0.2   | 72.6 / 72.8 | 65.5 / 79.9    | -6.3 | -6.3 / -6.3        | 3.9 / 3.9          | 7.8      | 74.1     | 76.6    | 70.3  | 6.9  |

- s4p ties f6: -2.2 in run 1, +1.5 in run 2, both inside f6's noise of 3.2. u1p ties too. m3 trails
  with Claude by 6.9 and ties with Codex; A3q trails in both runs and with both models.
- f6 reads as one piece with the site (together 9.1), and repeats its image for the same reason:
  "'in tune' repeats the coordination image of 'in step', the tuning desk and the profiles' flow".
  s4p repeats words, not the image: agents, people, team, ship, customers ("customers notice
  restates the bio's speed showing up for customers").
- The question each set leaves open: s4p, "What will customers notice: faster releases, fewer
  defects, or both?"; f6, "What does a team in tune deliver my business?"; m3, "My team already
  ships products, so what does your training change?".

## Seen in place

LinkedIn's narrow layout cuts the first two to four letters of every line, as in rounds 7 and 8
(image `2026-11-08-claim-all-candidates/claim-confirm-after-round-8/r9-linkedin.jpg`: f6, m3, u1p, s4p from the top, English
left). s4p breaks into two lines on the profile banner, so the photo takes "Ag" and "peo". It stays
the defect of `profile-1` in `render.py`, item `work-banner-photo-overlap`. s4p in place on every surface: images `r9-s4p-en.jpg` and `r9-s4p-de.jpg`.

## Decision

Recommendation: s4p. It meets (a), (d) and (e), and (c) with a tie rather than a lead. It meets (b) in part: ahead in the panel's overall score and with Claude on every surface, while Codex puts its banners 2.7 behind f6's, outside the noise. It meets (f) in part: its German trails its English by 3.0 and f6's German banners by 3.3, though it
leads f6's German overall by 10.5 and beats three other German wordings.

- u1p is the second-best pair: it ties s4p on the panel and passes (a), but its banners trail f6's
  by 3.5 and it ties f6 in the set only at -1.9.
- m3 passes (a) (people 32 of 32, core 25 of 32) and misses (d) in every round (together 2.8 to 3.6); in the set it trails f6 by 6.9 with Claude.
- f6 misses (a): 14 of 32 readers read its team as people, 12 of 32 restate the core thought.
- "Im Einklang", scored blind in ten lines, took round 1's three lowest language scores and lost 12.5 points of German against "eingespielt" in the same line (y1 against y1e).

Choosing s4p changes `verbal.json`: the claim gains a long form beside the short one, and the
consumers read whichever their surface takes. That is a release with a new exported field, and
`home-claim-line` keeps "zusammenspielen" as decided.

## Skipped and owed

- The X header was judged as a render with a grey circle, not on its live page, as in rounds 7
  and 8. XING, YouTube, Facebook and Brella were not rendered this round; round 7 holds them for
  f6.
- The one-pager header and the About and bios were judged as text in the set, not rendered.
- Trademark: DPMA, EUIPO and USPTO are not queried for s4p.

## Prompt, verbatim

Cold read, CTO, Claude, the free-text question:

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. You scroll past this LinkedIn profile banner. You know nothing else about the company. Read the image file /private/tmp/claim9-0811/blind/fe36c0.jpg.
In one or two sentences of your own: what does this line claim? Then: what kind of company would say it, in a few words?
Answer with JSON only: {"claims": "...", "company": "..."}
```

Review: large, because the claim leaves the company.

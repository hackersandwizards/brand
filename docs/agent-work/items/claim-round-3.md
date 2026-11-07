---
kind: decision
status: open
priority: 1
order: 90
area: brand
owner: Benedikt
evidence: "Blind review 07.11., round 3: 34 drafts prefiltered on text by 6 reviewer runs, then 10 and 9 claims on 11 surfaces in two passes, 6 personas, Claude and Codex, two runs each, 48 reviewer runs. Report: docs/agent-work/2026-11-07-claim-and-headline.md, section Round 3"
recommended: a6
options:
  - key: a6
    label: "More code isn't faster delivery. / Mehr Code heißt nicht schneller liefern."
    detail: "First in both passes, ahead of c3 by 12.1 with both models and on every surface. Most credible (9.1) and fits k3 (8.2). Above the H1 it ties with the empty slot. Against it: it names the buyer's problem, not what h&w does; Claude reviewers find the German clipped (language 6 to 7)."
    score: 78.5
    noise: 0.4
  - key: m01
    label: "You buy agents. You build teams. / Agenten kauft ihr. Teams baut ihr auf."
    detail: "Ties with a6 (2.0 behind, noise 2.2). Repeats agents and teams with k3 (fit 6.9): above the H1 it loses to the empty slot (73.2 against 79.8), so the home page would need an exception."
    score: 76.5
    noise: 2.2
  - key: m08
    label: "Every agent needs a team. / Jeder Agent braucht ein Team."
    detail: "Calmest German (language 9.4), but 'could almost be a Globant line' (distinctive 6.1) and repeats k3 above the H1 (fit 6.0). Its lead over c3 holds with both models; behind a6 with Codex only."
    score: 75.6
    noise: 1.4
  - key: b4
    label: "Until you don't need us. / Bis ihr uns nicht mehr braucht."
    detail: "Best above the H1 (82.6) and on the slide (83.9), weakest alone: on banners and the link preview it does not say what the company does (clear 5.3, banners 69.7, link preview 67.1)."
    score: 75.5
    noise: 0.2
  - key: a6g
    label: "a6 with the German fix: Mehr Code ist noch kein schnelleres Release."
    detail: "Pass 2 fix for a6's German. English as a6. The German scored lower than a6's (70.6 against 77.2)."
    score: 75.2
    noise: 0.7
  - key: m15
    label: "Speed is a team skill. / Tempo ist Teamarbeit."
    detail: "Calm and clean, but generic (distinctive 4.7) and repeats k3 above the H1 (fit 5.2)."
    score: 73.8
    noise: 0.7
  - key: m02
    label: "The agent is the easy part. / Der Agent ist der leichte Teil."
    detail: "Pass 1 only. Distinctive (7.3), but the German reads translated (pass 1, EN 77.3, DE 70.0)."
    score: 73.6
    noise: 0.6
  - key: a7
    label: "Licences are bought in a day. Practice isn't. / Lizenzen kauft ihr an einem Tag. Praxis nicht."
    detail: "Pass 1 only. Distinctive (7.4), but long and lecturing on the slide and the link preview."
    score: 71.3
    noise: 1.7
  - key: a6t
    label: "a6 with a second sentence: More code isn't faster delivery. That takes a team. / Mehr Code ist noch kein Release. Dafür braucht es ein Team."
    detail: "Pass 2 fix for 'says only the problem'. Clearer (8.3), but loses calm (6.4) and fit with k3 (5.8): k3 already says the team part."
    score: 70.6
    noise: 1.5
  - key: a4
    label: "Faster with agents. And still fast without us. / Schneller mit Agenten. Auch wenn wir längst weg sind."
    detail: "Pass 1 only. Codex 78.1, Claude 54.9: reads as a speed promise."
    score: 66.5
    noise: 2.0
  - key: c3
    label: "Agents in the team. Teams in flow. / Agenten im Team. Teams im Flow. (in verbal.json since v1.29.0)"
    detail: "Unmarked control. Least distinctive of the field (4.2): 'Flow' sits next to Slalom's 'Bringen Sie KI in den Flow.', agents in the team next to Globant's 'Our people and AI agents build together.' Repeats k3 above the H1 (fit 4.3, home 62.2)."
    score: 66.4
    noise: 0.0
  - key: q6
    label: "Agents bring the speed. Flow needs teams in tune. / Agenten bringen das Tempo. Flow braucht eingespielte Teams. (retired)"
    detail: "Unmarked control. Last on every surface."
    score: 56.3
    noise: 0.1
images:
  a6:
    - src: a6-surfaces.jpg
      caption: "a6: the seven banners, closing slide, one-pager header and link preview, English above German"
    - src: a6-website.jpg
      caption: "a6: home hero (desktop and phone) and footer, English beside German"
  m01:
    - src: m01-surfaces.jpg
      caption: "m01: banners, slide, one-pager, link preview, English above German"
    - src: m01-website.jpg
      caption: "m01: home hero and footer, English beside German"
  m08:
    - src: m08-surfaces.jpg
      caption: "m08: banners, slide, one-pager, link preview, English above German"
    - src: m08-website.jpg
      caption: "m08: home hero and footer, English beside German"
  b4:
    - src: b4-surfaces.jpg
      caption: "b4: banners, slide, one-pager, link preview, English above German"
    - src: b4-website.jpg
      caption: "b4: home hero and footer, English beside German"
  a6g:
    - src: a6g-surfaces.jpg
      caption: "a6g: banners, slide, one-pager, link preview, English above German"
    - src: a6g-website.jpg
      caption: "a6g: home hero and footer, English beside German"
  m15:
    - src: m15-surfaces.jpg
      caption: "m15: banners, slide, one-pager, link preview, English above German"
    - src: m15-website.jpg
      caption: "m15: home hero and footer, English beside German"
  m02:
    - src: m02-surfaces.jpg
      caption: "m02: banners, slide, one-pager, link preview, English above German"
    - src: m02-website.jpg
      caption: "m02: home hero and footer, English beside German"
  a7:
    - src: a7-surfaces.jpg
      caption: "a7: banners, slide, one-pager, link preview, English above German"
    - src: a7-website.jpg
      caption: "a7: home hero and footer, English beside German"
  a6t:
    - src: a6t-surfaces.jpg
      caption: "a6t: banners, slide, one-pager, link preview, English above German"
    - src: a6t-website.jpg
      caption: "a6t: home hero and footer, English beside German"
  a4:
    - src: a4-surfaces.jpg
      caption: "a4: banners, slide, one-pager, link preview, English above German"
    - src: a4-website.jpg
      caption: "a4: home hero and footer, English beside German"
  c3:
    - src: c3-surfaces.jpg
      caption: "c3: banners, slide, one-pager, link preview, English above German"
    - src: c3-website.jpg
      caption: "c3: home hero and footer, English beside German"
  q6:
    - src: q6-surfaces.jpg
      caption: "q6: banners, slide, one-pager, link preview, English above German"
    - src: q6-website.jpg
      caption: "q6: home hero and footer, English beside German"
---

# Which claim replaces c3?

c3 loses to a new line on every surface. "More code isn't faster delivery." / "Mehr Code heißt nicht schneller liefern." (a6) led both passes: 78.5 against 66.4 for c3, with both models, outside the noise (0.8 on the panel mean). I recommend it. Pick one claim; the home headline k3 stays.

Why c3 loses: next to the claims of the neighbours it reads as theirs. Reviewers placed "in flow" beside Slalom Germany's "Bringen Sie KI in den Flow." and "agents in the team" beside Globant's "Our people and AI agents build together." (distinctive 4.2 of 10). And above the home H1 it repeats k3 (fit 4.3).

What holds a6 back, from every reviewer group: it names the buyer's problem, not what h&w does, and Claude reviewers find the German clipped. Pass 2 tested a fix for each: a better German line (a6g) and a second sentence naming the team (a6t). Both scored lower than a6 itself, so this round ends on a plateau.

m01 ties with a6 (2.0 behind, noise 2.2). The tie goes to a6, because m01 needs an exception: above the home H1 it repeats k3 and loses to the empty slot, a6 does not.

Overall is the panel mean, 0 to 100, over English and German and over all surfaces. Noise is the difference between the panel means of the two runs. A lead inside the noise is a tie.

## Per surface, pass 2

| Surface                       | a6   | m01  | m08  | b4   | a6g  | m15  | a6t  | c3   | q6   | a6 ahead of c3, Claude / Codex |
| ----------------------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------------------------------ |
| Seven banners                 | 79.1 | 79.7 | 80.2 | 69.7 | 76.0 | 79.1 | 69.8 | 73.5 | 60.5 | 7.0 / 4.3                      |
| Deck closing slide            | 79.9 | 80.1 | 78.5 | 83.9 | 76.9 | 80.5 | 70.5 | 73.1 | 61.3 | 7.0 / 6.6                      |
| One-pager header              | 79.6 | 76.4 | 77.6 | 78.1 | 76.2 | 77.8 | 66.2 | 70.3 | 56.3 | 8.1 / 10.6                     |
| Link preview (OG card)        | 79.9 | 79.9 | 76.5 | 67.1 | 76.8 | 79.3 | 70.7 | 72.7 | 61.0 | 8.6 / 5.9                      |
| Website footer                | 77.9 | 77.7 | 79.2 | 79.9 | 74.9 | 79.4 | 70.5 | 71.8 | 60.2 | 6.4 / 5.7                      |
| Above the home H1             | 80.9 | 73.2 | 72.0 | 82.6 | 77.3 | 70.2 | 65.7 | 62.2 | 49.2 | 16.8 / 20.7                    |
| Overall, across every surface | 78.5 | 76.5 | 75.6 | 75.5 | 75.2 | 73.8 | 70.6 | 66.4 | 56.3 |                                |

Panel noise per surface and claim 0.0 to 4.2 (m01 above the H1), most under 1.5. The home page with nothing above the H1 scored 79.8: a6 above the H1 ties with it for both models (Claude 73.5 against 71.2, Codex 88.3 against 88.5). b4's lead there (82.6) comes from Claude alone.

## Criteria, pass 2 (0 to 10, mean over both languages)

| Claim | Distinctive | Clear | Fit with k3 | Calm | Credible | Language | EN / DE     | Claude / Codex |
| ----- | ----------- | ----- | ----------- | ---- | -------- | -------- | ----------- | -------------- |
| a6    | 7.2         | 7.8   | 8.2         | 8.3  | 9.1      | 8.2      | 79.8 / 77.2 | 74.5 / 82.5    |
| m01   | 7.5         | 7.4   | 6.9         | 8.0  | 8.0      | 8.1      | 78.1 / 75.0 | 71.8 / 81.3    |
| m08   | 6.1         | 7.3   | 6.0         | 9.0  | 7.7      | 9.4      | 75.8 / 75.4 | 74.2 / 77.1    |
| b4    | 7.2         | 5.3   | 9.2         | 9.1  | 8.2      | 9.1      | 74.7 / 76.2 | 72.0 / 79.0    |
| a6g   | 7.1         | 7.5   | 7.9         | 8.0  | 8.9      | 7.3      | 79.8 / 70.6 | 70.7 / 79.7    |
| m15   | 4.7         | 7.2   | 5.2         | 9.2  | 8.1      | 8.9      | 74.3 / 73.2 | 71.2 / 76.3    |
| a6t   | 7.1         | 8.3   | 5.8         | 6.4  | 8.6      | 8.3      | 71.5 / 69.7 | 63.1 / 78.1    |
| c3    | 4.2         | 6.5   | 4.3         | 8.1  | 7.0      | 7.3      | 66.7 / 66.0 | 61.1 / 71.6    |
| q6    | 4.9         | 6.8   | 2.8         | 5.6  | 5.9      | 6.5      | 57.0 / 55.6 | 50.8 / 61.8    |

m02, a7 and a4 were in pass 1 only (pass 1 table in the report).

## What choosing changes

- Any claim but c3: brand changes `claim` in `verbal/verbal.json`, retires c3 there, and releases. `claim.word` (the word the banners set in the accent) names "flow" today; a6 holds no such word, so it gets a new word or the banners draw the claim without an accent. The release redraws the seven claim banners (`applications/channel-banners/render.py`). The consumers read the claim from their brand pin: the website's footer (`src/copy/ui.ts`, which splits after the first sentence and takes a one-sentence claim whole) and link preview, the slides closing slide, the os one-pagers, and three trainer hub decks (`src/slides/data/`).
- With a6, `home-claim-line` changes: the claim above the H1 then ties with the empty slot, see that item.
- c3: nothing changes; the rollout on hold resumes.

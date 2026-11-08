# Claim round 7: extensions of "a team in tune", with every surface, 08.11.2026

The recommendation stays n02, "Every agent needs your people." / "Jeder KI-Agent braucht eure
Leute.". f6, "Every agent needs a team in tune." / "Jeder KI-Agent braucht ein eingespieltes
Team.", ties it again: on the banners, slide and link preview (80.2 against 81.2) and as a whole
set with the home hero, the 24 page headlines and the profile texts (78.1 against 76.9). Both
leads lie inside the noise. Alone on a banner, though, f6 is the weaker line: 7 of 16 English
readers take it for an AI tool vendor (n02: 2), and 15 of 16 cannot say whether its team is
people or agents (n02: 0). The tie goes to n02, which needs no change to the German home H1.

No extension of f6 holds. Every line that adds the company or flow to "a team in tune" scores
17.0 to 28.6 points lower than n02, in both runs and with both models. Benedikt's line, "Every
company in flow needs agents with a team in tune.", comes last, 36.5 points behind. Its short
form comes 25.0 points behind.

## Question

Benedikt, 08.11., liked f6 and asked whether it could be extended, naming one idea: "Every
company in flow needs agents with a team in tune". He asked for more variations, then for the
headlines, bios and banners that go with them, the banners shown where they are used. His line
and his liking of f6 went into the test as hypotheses, scored blind.

## Candidates

| Key | EN                                                          | DE                                                                                      | Origin                                  | Prefilter |
| --- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------- | --------- |
| f6  | Every agent needs a team in tune.                           | Jeder KI-Agent braucht ein eingespieltes Team.                                          | round 6                                 | 77.2      |
| n02 | Every agent needs your people.                              | Jeder KI-Agent braucht eure Leute.                                                      | control (the recommendation)            | 77.2      |
| c3  | Agents in the team. Teams in flow.                          | Agenten im Team. Teams im Flow.                                                         | control (current claim)                 | 68.8      |
| g3  | Flow comes when every agent has a team in tune.             | Flow entsteht, wenn jeder KI-Agent ein eingespieltes Team hat.                          | this run                                | 56.0      |
| d3  | From a team in tune to a company in flow.                   | Vom eingespielten Team zum Unternehmen im Flow.                                         | fresh model                             | 54.8      |
| d1  | A team in tune. A whole company in flow.                    | Ein eingespieltes Team. Ein ganzes Unternehmen im Flow.                                 | fresh model                             | 53.9      |
| g4  | Every agent with a team in tune. Every company in flow.     | Jeder KI-Agent mit eingespieltem Team. Jedes Unternehmen im Flow.                       | this run                                | 50.7      |
| g2  | Every agent needs a team in tune. Then your company flows.  | Jeder KI-Agent braucht ein eingespieltes Team. Dann kommt euer Unternehmen in den Flow. | this run                                | 50.1      |
| d2  | A team in tune puts your whole company in flow.             | Ein eingespieltes Team bringt euer ganzes Unternehmen in den Flow.                      | fresh model                             | 46.8      |
| g5  | Every agent needs a team in tune, every company needs flow. | Jeder KI-Agent braucht ein eingespieltes Team, jedes Unternehmen braucht Flow.          | this run                                | 45.7      |
| g1  | Your company in flow: every agent with a team in tune.      | Euer Unternehmen im Flow: jeder KI-Agent mit einem eingespielten Team.                  | this run                                | 44.5      |
| g6  | Companies in flow give every agent a team in tune.          | Unternehmen im Flow geben jedem KI-Agenten ein eingespieltes Team.                      | this run                                | 39.8      |
| B3  | Every company in flow needs agents with a team in tune.     | Jedes Unternehmen im Flow braucht KI-Agenten mit einem eingespielten Team.              | Benedikt's idea, as stated, translated  | 35.6      |
| B3k | A company in flow: agents and a team in tune.               | Ein Unternehmen im Flow: KI-Agenten und ein eingespieltes Team.                         | B3 fixed for the prefilter's main cause | (panel)   |

- The fresh model (`claude -p --model opus`) got the offer, the belief behind it, the task (keep
  "a team in tune", add a whole company in flow) and round 6's word rules. It saw no candidate,
  no current or retired line and no words of Benedikt's. Three of its six lines went on. They
  are close to two retired lines ("Your whole company, in tune with agentic engineering.", "Your
  whole company unstoppable, in flow with agentic engineering."), so none could ship as written.
- Prefilter: text only, CTO, conference organiser and brand strategist, Claude and Codex, one run
  each (6 runs, no noise measured). Against B3 all six named the same cause: the nested chain
  ("a company in flow needs agents with a team") must be read twice, "every company needs agents"
  sounds like a sales doctrine, and "agents with a team" turns round who serves whom. B3k keeps
  its three ideas and drops the nesting and the "every". The panel took the five best extensions,
  B3, B3k and the three controls; d2, g5, g1 and g6 were cut.

## Method

As round 6, so the scores compare within this round:

- Surfaces, rendered from the shipped sources with the claim swapped in: the LinkedIn profile
  banner, the X header, the Sessionize, XING, YouTube, Facebook and Brella covers from
  `applications/channel-banners/render.py`, loaded by a scratch script, with the descriptor
  "Training and mentoring in agentic engineering" / "Training und Mentoring in Agentic
  Engineering" at 0.62 of the claim size; a line wider than the safe area breaks at the space
  nearest its middle and the group shrinks until it fits. The closing slide from the slides
  catalog's built story `Types/closing-slide/contact`, the link preview from the website's
  `scripts/og/template.html` filled as `generate.mjs` fills the home card, and the header of the
  AE-LEAD one-pager from os, each with the claim replaced in headless Chrome for Testing. No
  accent colour on any claim.
- Panel: CTO, VP of Engineering, conference organiser, senior engineer looking for a job, brand
  strategist; Claude (`claude -p --model opus`) and Codex (`gpt-6.1-sol`, high), two runs each,
  20 runs, each its own shuffled order under neutral labels and random file names. Round 4's six
  criteria, banners (LinkedIn, X, Sessionize, grey circles where the photo covers them), slide,
  link preview and overall.
- Cold reads: the LinkedIn banner alone, a fresh run told it knows nothing else. CTO, VP of
  Engineering, engineering lead, HR at a logistics company; Claude and Codex, two runs each; the
  attribution and the reading each in its own run, the options reversed in run 2. Nine lines,
  576 runs. The reading question offered "unclear" explicitly, which round 6's did not, so its
  counts compare within this round only.
- The set, for the top two (f6, and d3 as the best extension) and n02: every surface rendered in
  place. LinkedIn and YouTube on the real screenshots of 31.10. in os
  (`docs/agent-work/2026-10-31-channel-banners-live/`), the candidate banner pasted into the
  banner's measured box and the profile photo restored over it. XING and Sessionize on the live
  public pages, logged out, desktop (1440 px) and phone (390 px), the banner image swapped in the
  page. X header, slide, link preview and one-pager as above. With it, as text: the home H1
  ("Your teams have agents. Once every role is in step, your releases speed up."; in German "Wenn
  alle Rollen zusammenspielen" for f6 and d3, "eingespielt sind" for n02), the home lead, the
  tuning desk with its "in flow" output, the footer, the 24 page headlines the website decided
  (blog-r2 for the blog), and Benedikt's profile texts that carry the flow idea: LinkedIn headline,
  the opening and the "In flow" paragraph of his About, the short bio of the website and the
  practitioners page ("developers in flow"), the Sessionize bio ("brings engineering teams into
  flow") and the company page tagline, all as they stand. CTO, VP of Engineering, brand strategist,
  bilingual copy editor; Claude and Codex, two runs: 16 runs. Criteria: repetition and together
  (0 to 10), profiles, website and brand surfaces (0 to 100), calm (0 to 10), overall (0 to 100),
  the repeated words, and the question the path from profile to website leaves open.
- Noise: the gap between the panel means of run 1 and run 2; for cold reads, the gap in a count.
  A lead counts only outside the noise, in both runs and with both models; otherwise a tie.
- 619 reviewer runs: 1 drafting, 6 prefilter, 20 panel, 576 cold reads, 16 set.

## Result

### Panel (20 runs)

| Key | Overall | Noise | Banners | Slide | Link preview | EN / DE     | Claude / Codex | Run 1 / 2   | Dist. | Clear | Emot. | Cred. | Calm | Lang. |
| --- | ------- | ----- | ------- | ----- | ------------ | ----------- | -------------- | ----------- | ----- | ----- | ----- | ----- | ---- | ----- |
| n02 | 81.2    | 1.2   | 83.6    | 82.2  | 83.8         | 80.8 / 81.6 | 82.0 / 80.4    | 80.6 / 81.8 | 7.8   | 7.2   | 8.0   | 8.1   | 8.9  | 8.8   |
| f6  | 80.2    | 0.1   | 82.1    | 80.7  | 82.6         | 79.8 / 80.7 | 76.8 / 83.8    | 80.2 / 80.3 | 7.2   | 7.7   | 6.5   | 8.4   | 8.7  | 8.3   |
| c3  | 76.5    | 1.0   | 81.4    | 80.7  | 83.2         | 76.6 / 76.5 | 73.4 / 79.7    | 76.0 / 77.0 | 6.0   | 7.0   | 6.3   | 7.7   | 8.9  | 7.9   |
| d3  | 64.2    | 2.1   | 70.5    | 69.6  | 71.0         | 63.6 / 64.7 | 63.6 / 64.7    | 63.1 / 65.2 | 4.0   | 5.1   | 6.0   | 6.5   | 8.3  | 8.1   |
| d1  | 62.3    | 2.1   | 69.0    | 68.0  | 67.5         | 63.9 / 60.7 | 61.2 / 63.3    | 61.2 / 63.4 | 4.0   | 4.7   | 6.5   | 5.9   | 7.7  | 7.9   |
| g3  | 60.8    | 1.4   | 65.7    | 62.6  | 60.0         | 63.5 / 58.0 | 57.0 / 64.5    | 60.0 / 61.5 | 5.8   | 6.4   | 5.2   | 6.1   | 6.5  | 6.8   |
| B3k | 56.2    | 0.6   | 60.7    | 59.5  | 59.8         | 58.8 / 53.6 | 51.2 / 61.2    | 56.5 / 55.9 | 5.0   | 6.1   | 4.4   | 6.2   | 6.2  | 5.9   |
| g4  | 54.9    | 0.0   | 60.0    | 56.7  | 56.4         | 57.0 / 52.8 | 50.8 / 59.0    | 54.9 / 54.9 | 5.6   | 5.8   | 5.2   | 5.2   | 5.5  | 5.2   |
| g2  | 52.6    | 1.4   | 56.7    | 52.6  | 50.0         | 57.5 / 47.9 | 47.3 / 58.0    | 52.0 / 53.4 | 6.0   | 6.8   | 5.7   | 5.0   | 4.6  | 6.1   |
| B3  | 44.7    | 0.4   | 49.5    | 47.2  | 49.5         | 47.8 / 41.5 | 42.1 / 47.2    | 44.9 / 44.5 | 4.9   | 4.8   | 3.6   | 4.3   | 4.9  | 5.0   |

The gap to n02, per run and per model:

| Key | Gap   | Run 1 | Run 2 | Claude | Codex | Verdict          |
| --- | ----- | ----- | ----- | ------ | ----- | ---------------- |
| f6  | -1.0  | -0.4  | -1.5  | -5.2   | +3.3  | tie              |
| c3  | -4.7  | -4.5  | -4.8  | -8.6   | -0.8  | tie (Codex)      |
| d3  | -17.0 | -17.5 | -16.6 | -18.4  | -15.7 | sinks            |
| d1  | -18.9 | -19.4 | -18.4 | -20.8  | -17.1 | sinks            |
| g3  | -20.5 | -20.5 | -20.3 | -25.0  | -15.9 | sinks            |
| B3k | -25.0 | -24.0 | -25.9 | -30.8  | -19.2 | sinks            |
| g4  | -26.3 | -25.7 | -26.9 | -31.2  | -21.5 | sinks            |
| g2  | -28.6 | -28.6 | -28.4 | -34.7  | -22.4 | sinks            |
| B3  | -36.5 | -35.7 | -37.3 | -39.9  | -33.2 | sinks, massively |

Against f6 every extension sinks too, by 16.1 (d3) to 35.6 (B3), in both runs and with both
models. Codex prefers f6 to n02 in both runs, Claude n02, as in round 6. What keeps the lines
below the maximum, in the reviewers' words:

- The extensions that drop the agents (d3, d1): "Classic 'From X to Y' consultancy shape; no
  agents", "could advertise agile coaching", "company flow is an unsubstantiated leap".
- The extensions that keep them (g2, g4, g3) get long and lose calm (4.6 to 6.5): two sentences,
  a second claim fused to the first.
- B3: "Convoluted chain: company needs agents with a team; logic is backwards and heavy", "Implies
  every successful company needs agents", "Addresses companies already 'in flow'".
- f6: "'In tune' is a soft musical image", "feels slightly crafted", the offer rests on the
  descriptor. n02: "could mean agents require more supervision", "'your people' could read like
  HR", the offer rests on the descriptor.

### Cold reads, the LinkedIn banner alone (16 per cell)

| Key | EN: vendor / training / other | Sure | DE: vendor / training / other | Sure | EN team: agents / both / people / unclear | DE team: agents / both / people / unclear |
| --- | ----------------------------- | ---- | ----------------------------- | ---- | ----------------------------------------- | ----------------------------------------- |
| n02 | 2 / 14 / 0                    | 4.7  | 0 / 16 / 0                    | 5.7  | 0 / 0 / 16 / 0                            | 0 / 0 / 16 / 0                            |
| f6  | 7 / 9 / 0                     | 4.2  | 2 / 14 / 0                    | 4.9  | 0 / 0 / 1 / 15                            | 0 / 0 / 2 / 14                            |
| d3  | 0 / 16 / 0                    | 5.4  | 0 / 16 / 0                    | 5.8  | 0 / 0 / 16 / 0                            | 0 / 0 / 16 / 0                            |
| d1  | 0 / 14 / 2                    | 4.6  | 0 / 16 / 0                    | 4.8  | 0 / 0 / 16 / 0                            | 0 / 0 / 16 / 0                            |
| g2  | 0 / 16 / 0                    | 5.1  | 1 / 15 / 0                    | 5.8  | 0 / 0 / 0 / 16                            | 0 / 0 / 0 / 16                            |
| B3k | 8 / 8 / 0                     | 4.7  | 6 / 10 / 0                    | 4.6  | 0 / 0 / 16 / 0                            | 0 / 0 / 16 / 0                            |
| B3  | 5 / 11 / 0                    | 4.6  | 7 / 7 / 2                     | 5.2  | 0 / 0 / 5 / 11                            | 0 / 0 / 1 / 15                            |
| g4  | 10 / 6 / 0                    | 4.4  | 10 / 6 / 0                    | 5.4  | 0 / 0 / 1 / 15                            | 0 / 0 / 0 / 16                            |
| g3  | 13 / 3 / 0                    | 4.4  | 11 / 5 / 0                    | 4.8  | 0 / 0 / 0 / 16                            | 0 / 0 / 0 / 16                            |

Noise: the vendor count differs by at most 2 reads of 8 between run 1 and run 2 (g4 in English),
by 1 or 0 for every other cell. For n02 the one English vendor guess outside the HR reader comes
from one buyer read; for f6, 4 of the 7 English vendor guesses come from buyer personas, the
other 3 from the HR reader. Given "unclear" as an option, the f6 readers wrote: "'Team in tune'
could mean human developers or orchestrated agents; nothing disambiguates." Lines where the team
is not the agent's own (n02, d3, d1, B3k) read as people 16 of 16. The flow extensions that keep
"every agent" up front (g3, g4) go to a tool vendor most often.

### The set: every surface in place, with the site and the profile texts (16 runs)

| Key | Overall | Noise | Run 1 / 2   | Claude / Codex | EN / DE     | Repetition EN / DE | Together | Profiles | Website | Brand | Calm |
| --- | ------- | ----- | ----------- | -------------- | ----------- | ------------------ | -------- | -------- | ------- | ----- | ---- |
| f6  | 78.1    | 0.2   | 78.0 / 78.2 | 72.5 / 83.7    | 79.1 / 77.1 | 5.2 / 5.1          | 8.3      | 75.9     | 79.6    | 79.6  | 7.7  |
| n02 | 76.9    | 1.8   | 77.8 / 76.0 | 72.1 / 81.6    | 76.9 / 76.8 | 7.0 / 6.9          | 7.2      | 80.1     | 75.1    | 80.0  | 8.7  |
| d3  | 68.8    | 1.1   | 69.4 / 68.2 | 64.4 / 73.2    | 69.1 / 68.5 | 3.5 / 3.5          | 7.5      | 66.3     | 71.3    | 72.8  | 6.7  |

- f6 leads n02 by 1.2: in run 1 by 0.2, inside n02's noise of 1.8, in run 2 by 2.2, with Claude
  by 0.4 and with Codex by 2.1. A tie. f6 reads as one idea with the home hero and the tuning
  desk (together 8.3 against 7.2), and repeats them for the same reason: "'In tune', 'every role
  is in step' and the tuning desk repeat the same metaphor." n02 fits the profiles better (80.1
  against 75.9) and is calmer (8.7 against 7.7); its one repetition is the Factory operating
  model headline ("Agents do the work, and your people decide what ships.").
- d3 sinks by 8.1, in both runs (8.4 and 7.8) and with both models (7.8 and 8.4). Every reviewer
  named its "in flow" five times over: the tuning desk's output, the "In flow" paragraph of the
  LinkedIn About, the short bio's "developers in flow" and the Sessionize bio's "into flow".
  Readers asked: "How does training one team get my whole company into flow?"
- The question every set leaves open after the path from profile to website: what the training
  changes and how faster releases would show. For n02: "Needs my people for what?"

### Seen in place, every candidate

- LinkedIn's narrow layout (the logged-out page in the 31.10. screenshot, 807 px wide): the
  profile photo covers the first two or three letters of the claim's lines and of the descriptor
  ("ery agent needs a team in tune.", "der KI-Agent braucht"). The shipped banner shows the same
  in that screenshot ("our whole company unstoppable,"). It is a defect of `profile-1` in
  `render.py` (the group starts at x 480 of 1584), independent of the claim.
- XING on a phone: the photo covers the start of the descriptor line, which the shipped banner
  does not carry. Whichever claim is chosen, the descriptor needs its own safe-area check on XING
  mobile and on LinkedIn's narrow layout before it ships.
- YouTube: the descriptor sits close to the cropped strip's lower edge on a 1180 px window.

Images in the item: `claim-round-3/r7-set-linkedin.jpg` (LinkedIn narrow layout, f6, d3, n02,
English and German), `r7-set-phone-de.jpg` (XING and Sessionize on a phone, German),
`r7-extensions-banners.jpg` (the LinkedIn banner of B3, B3k, d3 and g3).

## Decision

n02 stays the recommendation. It ties f6 on the panel and in the set and leads it in the cold
reads by more than the noise: 2 against 7 English vendor guesses, people 16 against 1 of 16 in
English and 16 against 2 in German. f6 also needs the German home H1 changed to
"zusammenspielen"; n02 needs nothing.

f6 remains open to Benedikt, as in round 6: its score does not sink on the panel or in the set,
and by the rule set before any score ("n02 leads by more than the noise, in both runs and with
both models") it does not drop. Choosing it means choosing `de-zusammenspielen` in
`home-claim-line` too, and accepting a banner on which, read alone, most readers cannot tell whose
team it means.

Extending f6 does not hold. Every extension scores lower than f6 and n02 by more than 16 points,
in both runs and with both models; Benedikt's line as stated comes last.

## Skipped and owed

- X: the live page answered `ERR_SSL_PROTOCOL_ERROR` to the headless browser, so the X header
  was judged as a render with a grey circle at the measured photo position, not in its page.
- LinkedIn personal and company pages: logged out, LinkedIn shows an authwall or blocks the
  headless browser. The personal profile was judged on the real screenshot of 31.10.; the company
  page cover carries the descriptor and no claim, so it was not rendered.
- Booth banners carry no claim (`applications/booth/generate.ts`: "Everyone has coding agents.
  Releases come no faster." and the offer line), so they were not rendered. The website footer
  was read as text, not drawn.
- Facebook and Brella covers were rendered but not shown to reviewers.
- c3 had no cold read and no set test this round (rounds 1 and 4 hold both).
- Trademark: DPMA, EUIPO and USPTO are still not queried, for n02 or f6.

## Prompt, verbatim

Cold read, CTO, Codex, run 1, the reading question:

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. You scroll past this LinkedIn profile banner. You know nothing else about the company. Read the image file /private/tmp/claim7-0811/blind/010d0f.jpg.
What is the "team" in this line: other AI agents, people, or both? If you cannot tell, say unclear.
Answer with JSON only: {"team": "agents" | "people" | "both" | "unclear", "why": "at most 15 words"}
```

Review: large, because the claim leaves the company.

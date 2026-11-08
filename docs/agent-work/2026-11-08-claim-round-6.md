# Claim round 6: claim candidates carrying "flow" or "tune", 08.11.2026

The recommendation stays n02, "Every agent needs your people." / "Jeder KI-Agent braucht eure
Leute.". A line carrying "tune" holds: f6, "Every agent needs a team in tune." / "Jeder KI-Agent
braucht ein eingespieltes Team.", ties n02 on the claim surfaces and in the cold reads. On the
current home page, though, its German repeats the home H1 word for word. There it trails n02 in
every run and with both models, a tie only because n02's own two runs differ by 6.3. With
"zusammenspielen" in the German H1, the option `home-claim-line` already recommends, the
repetition shrinks and the two tie closely. Every other flow or tune line on the panel scores
lower than n02 by more than the noise, in both runs and with both models.

The rule for "the score sinks", set before any score: n02 leads by more than the noise, in both
runs and with both models. By that rule f6 does not sink. The two lines as stated in the brief sink
by 20.7 and 37.8 points.

## Question

Benedikt, 08.11., asked for lines with "flow" or "tune" in them, and named two ideas: "Every
agent needs a team to stay in flow" and "your company in flow with agents supported by teams". The
words matter to him unless the score drops hard. This round tests his two lines, a short fix of
each, five lines of its own, two from a fresh model and two older lines blind, beside n02 and the current claim c3 as unmarked controls.

## Candidates

| Key | EN                                                    | DE                                                           | Origin                                        | Prefilter |
| --- | ----------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------- | --------- |
| f6  | Every agent needs a team in tune.                     | Jeder KI-Agent braucht ein eingespieltes Team.               | this run                                      | 72.4      |
| f2  | Agents bring speed. Your people bring flow.           | KI-Agenten bringen Tempo. Eure Leute bringen den Flow.       | this run                                      | 70.7      |
| c3  | Agents in the team. Teams in flow.                    | Agenten im Team. Teams im Flow.                              | control (current claim)                       | 69.4      |
| n02 | Every agent needs your people.                        | Jeder KI-Agent braucht eure Leute.                           | control (round 5's recommendation)            | 68.4      |
| f4  | Your people in tune. Your agents in flow.             | Eure Leute eingespielt. Eure KI-Agenten im Flow.             | this run                                      | 64.5      |
| d4  | Your own people, in flow with agents.                 | Eure eigenen Leute, im Flow mit KI-Agenten.                  | fresh model                                   | 62.9      |
| f7  | Agents need flow. Flow needs your people.             | KI-Agenten brauchen Flow. Flow braucht eure Leute.           | this run                                      | 60.3      |
| d1  | Every role in tune. Releases in flow.                 | Alle Rollen eingespielt. Eure Releases im Flow.              | fresh model                                   | 59.5      |
| f3  | Agents bring the speed. Flow needs teams in tune.     | Agenten bringen das Tempo. Flow braucht eingespielte Teams.  | the claim before c3 (brand 1.28.5)            | 59.5      |
| f1  | Every agent needs your people in flow.                | Jeder KI-Agent braucht eure Leute im Flow.                   | this run                                      | 55.2      |
| f5  | Flow is a team sport.                                 | Flow ist Teamsport.                                          | round 1's c2                                  | 52.3      |
| B1  | Every agent needs a team to stay in flow.             | Jeder KI-Agent braucht ein Team, um im Flow zu bleiben.      | Benedikt's first idea, as stated, translated  | 50.9      |
| B2  | Your company in flow with agents, supported by teams. | Euer Unternehmen im Flow mit KI-Agenten, getragen von Teams. | Benedikt's second idea, as stated, translated | 34.3      |
| B1k | Every agent needs a team in flow.                     | Jeder KI-Agent braucht ein Team im Flow.                     | B1 fixed for the prefilter's main cause       | (panel)   |
| B2k | Your company in flow with agents.                     | Euer Unternehmen im Flow mit KI-Agenten.                     | B2 fixed for the prefilter's main cause       | (panel)   |

- The fresh model (`claude -p --model opus`) got a neutral brief: the offer, what h&w stands
  behind, the word rule (flow or tune; Flow, eingespielt, abgestimmt), positive, 2 to 8 words, no
  figures, no hype, no dash, ihr-form, "KI-Agent", and no "team of agents". It saw no candidate, no
  current or retired line and no words of Benedikt's. Two of its six lines went on.
- Prefilter: text only, round 4's method (CTO, conference organiser, brand strategist; Claude and
  Codex; one run each; so no noise measured). The panel took the four best new lines, B1 and B2 as
  stated, and one fix of each; f7, fifth at 60.3, was cut to keep the panel at ten. The prefilter reviewers' main cause against B1: an agent "staying
  in flow" reads as a human state given to software, and the clause makes the line long. Against
  B2: long, corporate, "supported by teams" makes the people secondary. B1k and B2k keep each idea
  and drop that cause.

## Method

As round 5, so that the scores compare:

- Surfaces, rendered from the shipped sources with the claim swapped in: the LinkedIn profile
  banner, the X header and the Sessionize cover from `applications/channel-banners/render.py`,
  loaded by a scratch script, each alone and with the descriptor "Training and mentoring in
  agentic engineering" / "Training und Mentoring in Agentic Engineering" at 0.62 of the claim
  size; grey circles where the profile photo covers it (LinkedIn's by estimate, as before). The
  closing slide from the slides catalog's story `Types/closing-slide/contact`, built, with the claim
  replaced in headless Chrome for Testing. The link preview from the website's
  `scripts/og/template.html`, filled the way `generate.mjs` fills the home card. No accent colour
  on any claim. Image files went to the reviewers under random names.
- Cold reads, one banner each, never a list: the LinkedIn banner alone, a fresh run told it knows
  nothing else. CTO, VP of Engineering, engineering lead, and a LinkedIn reader from outside tech
  (HR at a logistics company); Claude and Codex, two runs each, so 16 reads per line and language.
  Attribution: "Which kind of company would say this?" (AI tool vendor, training or consulting,
  other; the first two reversed in run 2), what it does, how sure. Reading, in its own run: "What
  is the 'team' in this line: other AI agents, people, or both?", or for lines without "team"
  "Who does this line say the agents need or work with?", classes reversed in run 2. Nine lines
  576 runs.
- Panel, round 5's: CTO, VP of Engineering, conference organiser, senior engineer looking for a
  job, brand strategist; Claude (`claude -p --model opus`) and Codex (`gpt-6.1-sol`, high), two
  runs each, 20 runs, each its own shuffled order under neutral labels. Round 4's six criteria,
  banners (with the descriptor), slide, link preview, and overall.
- Site check: the best two flow or tune lines (f6, B1k) and n02 as text inside the website as it
  will stand: the home H1 k3 from `verbal.json` ("Your teams have agents. Once every role is in
  step, your releases speed up." / "… Wenn alle Rollen eingespielt sind …"), its lead, the tuning
  desk whose caption reads "in flow" / "im Flow", and the 24 page headlines the website decided
  (its item `work-ship-decided-page-headlines`, blog-r2 for the blog). Criteria: repetition and
  together (0 to 10), the repeated words, overall in the site (0 to 100). CTO, brand strategist,
  a bilingual copy editor; Claude and Codex; two runs: 12 runs. Then the same 12 with the German
  H1 "Wenn alle Rollen zusammenspielen", the option `home-claim-line` recommends.
- Noise: the gap between the panel means of run 1 and run 2; for cold reads, the gap in a count.
  A lead counts only outside the noise, in both runs and with both models; otherwise it is a tie.
- 627 reviewer runs: 1 drafting, 6 prefilter, 576 cold reads, 20 panel, 24 site check.

## Result

### Panel (20 runs)

| Key | Overall | Noise | Banners | Slide | Link preview | EN / DE     | Claude / Codex | Run 1 / 2   | Dist. | Clear | Emot. | Cred. | Calm | Lang. |
| --- | ------- | ----- | ------- | ----- | ------------ | ----------- | -------------- | ----------- | ----- | ----- | ----- | ----- | ---- | ----- |
| n02 | 79.5    | 1.2   | 81.3    | 80.6  | 80.9         | 79.1 / 80.0 | 80.0 / 79.2    | 79.0 / 80.2 | 7.7   | 6.8   | 8.0   | 7.9   | 8.8  | 8.9   |
| f6  | 78.6    | 1.0   | 79.5    | 78.7  | 80.2         | 76.3 / 80.8 | 74.8 / 82.4    | 78.1 / 79.1 | 7.2   | 7.3   | 7.0   | 8.4   | 8.4  | 8.5   |
| c3  | 77.0    | 0.4   | 80.3    | 79.3  | 82.0         | 77.3 / 76.5 | 74.4 / 79.5    | 76.8 / 77.2 | 6.2   | 7.0   | 6.2   | 7.8   | 8.9  | 8.1   |
| B1k | 73.8    | 0.8   | 76.4    | 75.5  | 77.5         | 74.2 / 73.5 | 71.9 / 75.8    | 73.5 / 74.2 | 6.3   | 6.8   | 6.3   | 7.8   | 8.5  | 7.7   |
| f2  | 70.7    | 2.2   | 74.2    | 71.3  | 71.5         | 74.0 / 67.3 | 71.6 / 69.7    | 69.5 / 71.8 | 6.5   | 7.3   | 6.8   | 6.6   | 6.7  | 7.4   |
| d4  | 69.0    | 0.6   | 70.7    | 70.3  | 71.7         | 69.8 / 68.2 | 61.6 / 76.5    | 68.7 / 69.3 | 6.5   | 6.8   | 6.8   | 7.8   | 7.3  | 6.3   |
| f4  | 68.9    | 1.7   | 72.8    | 71.5  | 74.3         | 70.2 / 67.5 | 67.0 / 70.7    | 69.7 / 68.0 | 6.1   | 6.1   | 6.2   | 6.8   | 7.9  | 6.8   |
| B1  | 58.8    | 1.2   | 63.5    | 60.0  | 59.6         | 62.5 / 55.1 | 56.8 / 60.8    | 58.2 / 59.4 | 5.8   | 6.0   | 5.2   | 6.5   | 6.0  | 6.2   |
| B2k | 55.7    | 2.2   | 61.2    | 59.4  | 62.2         | 55.6 / 55.8 | 49.9 / 61.5    | 54.6 / 56.8 | 3.0   | 5.5   | 4.3   | 5.8   | 7.7  | 6.2   |
| B2  | 41.7    | 0.9   | 47.3    | 43.5  | 43.0         | 43.0 / 40.4 | 38.0 / 45.4    | 41.2 / 42.1 | 3.4   | 4.6   | 3.3   | 5.5   | 4.4  | 4.3   |

The gap to n02, per run and per model:

| Key | Gap   | Run 1 | Run 2 | Claude | Codex | Verdict          |
| --- | ----- | ----- | ----- | ------ | ----- | ---------------- |
| f6  | -0.9  | -0.9  | -1.1  | -5.2   | +3.2  | tie, holds       |
| c3  | -2.5  | -2.2  | -3.0  | -5.6   | +0.3  | tie, holds       |
| B1k | -5.7  | -5.5  | -6.0  | -8.1   | -3.4  | sinks, by 5.7    |
| f2  | -8.8  | -9.5  | -8.4  | -8.4   | -9.5  | sinks            |
| B1  | -20.7 | -20.8 | -20.8 | -23.2  | -18.4 | sinks, massively |
| B2  | -37.8 | -37.8 | -38.1 | -42.0  | -33.8 | sinks, massively |

Codex prefers f6 to n02 in both runs (82.4 in each against 78.0 and 80.3); Claude prefers n02 in
both (79.9 and 80.0 against 73.8 and 75.8). f6 leads n02 in German (80.8 against 80.0) and trails
in English (76.3 against 79.1). What keeps f6 below the maximum, in the reviewers' words: "'In
tune' is a soft music metaphor", "feels written for the slogan rather than naturally spoken", and
the training offer rests on the descriptor. For n02: it "says why, not what", and the link
preview leaves "people." alone on its line.

c3 scores 12.0 higher than in round 5 (65.0, noise 3.8) on a panel whose weakest lines sit lower.
It ties n02 here, but earlier rounds measured what this one did not repeat: alone on a banner, 0
of 12 cold readers named training (round 4), and on the home page c3 repeats the H1 k3
("together" 6.2 against 8.0 for a line that did not, round 1).

### Cold reads, banner alone (16 per cell)

| Key | EN: vendor / training | Sure | DE: vendor / training | Sure | EN: agents / both / people / unclear | DE: agents / both / people / unclear |
| --- | --------------------- | ---- | --------------------- | ---- | ------------------------------------ | ------------------------------------ |
| n02 | 4 / 12                | 5.8  | 1 / 15                | 6.2  | 0 / 0 / 16 / 0                       | 0 / 0 / 16 / 0                       |
| f6  | 4 / 12                | 5.6  | 3 / 13                | 5.9  | 0 / 0 / 13 / 3                       | 0 / 0 / 16 / 0                       |
| f2  | 4 / 12                | 6.1  | 3 / 13                | 6.1  | 0 / 0 / 16 / 0                       | 0 / 0 / 16 / 0                       |
| d4  | 3 / 13                | 5.9  | 0 / 16                | 6.4  | 0 / 0 / 16 / 0                       | 0 / 0 / 16 / 0                       |
| B1k | 6 / 10                | 5.4  | 3 / 13                | 5.8  | 0 / 0 / 15 / 1                       | 0 / 0 / 16 / 0                       |
| f4  | 6 / 10                | 5.4  | 1 / 15                | 6.1  | 0 / 1 / 2 / 13                       | 0 / 1 / 9 / 6                        |
| B2k | 12 / 4                | 5.6  | 10 / 6                | 5.4  | 0 / 0 / 16 / 0                       | 0 / 0 / 8 / 8                        |
| B1  | 16 / 0                | 5.2  | 14 / 2                | 5.2  | 1 / 0 / 6 / 9                        | 1 / 0 / 9 / 6                        |
| B2  | 16 / 0                | 5.8  | 7 / 9                 | 5.5  | 0 / 0 / 16 / 0                       | 0 / 0 / 16 / 0                       |

No reader answered "other". Noise is at most one read of eight for n02, f6, f2, d4 and B1k, and
largest for B1 in German, read as people 6 then 3. For n02 and f6, every vendor guess comes from the reader
outside tech; the buyer personas named training in every run. B1 as stated goes to a tool vendor
16 to 0 in English, across all four personas: "Probably a developer tool that runs several coding
agents together as a team, or adds team support around them, so they keep working". Its "stay in
flow" reads as software that keeps agents running. f6's three unclear English reads all come from
the reader outside tech: "it could just as well mean a group of AI agents working together".

### The site: repetition with the home H1 and the page headlines (12 runs each)

| Key | H1 as in verbal.json: repetition (EN / DE) | Together | Overall in the site | Run 1 / 2   | Claude / Codex | H1 "zusammenspielen": repetition (EN / DE) | Together | Overall | Run 1 / 2   | Claude / Codex |
| --- | ------------------------------------------ | -------- | ------------------- | ----------- | -------------- | ------------------------------------------ | -------- | ------- | ----------- | -------------- |
| n02 | 7.2 (7.2 / 7.2)                            | 7.8      | 77.0                | 73.8 / 80.1 | 67.0 / 86.9    | 6.8 (6.8 / 6.8)                            | 7.6      | 73.9    | 73.3 / 74.4 | 62.4 / 85.3    |
| f6  | 3.8 (5.0 / 2.7)                            | 7.6      | 69.6                | 70.0 / 69.2 | 60.8 / 78.4    | 5.1 (5.4 / 4.8)                            | 8.3      | 75.5    | 76.0 / 75.0 | 67.6 / 83.4    |
| B1k | 3.6 (3.6 / 3.6)                            | 7.0      | 63.5                | 63.8 / 63.1 | 54.2 / 72.8    | 3.2 (3.2 / 3.2)                            | 7.1      | 61.9    | 63.3 / 60.4 | 51.7 / 72.1    |

- With the H1 as `verbal.json` holds it, n02 leads f6 by 7.4 in the site, in both runs (3.8 and
  10.9) and with both models (6.2 and 8.5). n02's own runs differ by 6.3 (Claude 60.3 then 73.7),
  so run 1's lead lies inside the noise: by the rule, a tie, with f6 behind in every split. All 12 runs name the same cause: "eingespieltes Team" repeats
  "Wenn alle Rollen eingespielt sind" from the German H1 word for word, and "in tune" restates
  "every role is in step" and the tuning desk in English.
- With "zusammenspielen" in the German H1, f6 leads n02 by 1.6: in both runs (2.7 and 0.6), with
  Claude (5.2) but not with Codex (-1.9). A tie. f6's German repetition rises from 2.7 to 4.8; the
  English, still "in step" beside "in tune", stays at 5.4.
- n02 and B1k repeat the same words in both languages, and every reviewer gave each of them one
  repetition score for English and German alike.
- B1k repeats the tuning desk's caption "in flow" / "im Flow" word for word in all 24 runs.
- n02 repeats one deep page: "your people" / "eure Leute" stands in the Factory operating model
  headline ("Agents do the work, and your people decide what ships.").

## Decision

n02 stays the recommendation. f6 ties it on every test of this round, so the tie goes to the line
with fewer exceptions. n02 needs none. f6 repeats the German home H1 word for word, which all 12
site reviewers named, and trails n02 there in every run and with both models; only the German H1
change removes that.

Benedikt's condition leaves f6 open to him: he holds "flow" or "tune" important unless the score
drops hard. By the rule above it does not drop for f6, and with "zusammenspielen" in the German
home H1 its one exception goes. Choosing f6 then means choosing `de-zusammenspielen` in `home-claim-line` too.
In English "in tune" still sits beside "in step" on the home page (repetition 5.4 against 6.8 for
n02), within the tie.

No new flow line holds. Every line with "flow" on the panel scores lower than n02 by more than the
noise, except c3, the current claim, which earlier rounds rejected on other grounds. The flow lines
below the panel cut scored lower than n02 in the prefilter, one run each, noise not measured. The word "flow" already
stands on the home page as the tuning desk's caption.

## Skipped and owed

- c3 had no cold read and no site check this round (rounds 4 and 1 hold both).
- Not drawn: the one-pager, the footer, the home hero with the claim above the H1, and the XING,
  YouTube and company page banners. The site check read the website as text, not as a screenshot.
- The five lines below the panel cut (f7, d1, f3, f1, f5) ran in the prefilter only, one run
  per reviewer.
- The cold read with the descriptor was not repeated; in round 5 every line reached 32 of 32 there.
- Trademark: DPMA, EUIPO and USPTO are still not queried, for n02 or f6.
- LinkedIn's photo position is an estimate, as in rounds 4 and 5.

## Prompt, verbatim

Panel, CTO, Codex, run 1, the candidate list cut after the second of ten:

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. You bought coding agents for every team and are under board pressure to show what they changed. You have seen every consulting deck.

A company from Hamburg, hackers&wizards, trains and mentors engineering teams, product teams and their leaders in agentic engineering, working with AI coding agents as a team. Its buyers are CTOs, CIOs and VPs of Engineering in German-speaking Europe whose developers have coding agents while releases come no faster. German copy uses the informal plural (ihr). It is choosing its brand claim: the short line beside the company name wherever the brand appears. On its social banners most people meet it without any other context.

These are the claims and headlines of the companies it is compared with:
- "We Help Engineering Organisations Become AI Native" (re:cinq)
- "AI that works." (Thoughtworks)
- "We give technology a purpose." / "Wir geben Technologie einen Sinn." (INNOQ)
- "A global network of technology innovators" (Equal Experts)
- "KI-native Softwareentwicklung" (codecentric)
- "Bringen Sie KI in den Flow." (Slalom Germany)
- "Our people and AI agents build together." (Globant)
- "Technology is our how. And people are our why." (Endava)
- "Building software people trust" (DabApps)
- "Machen Sie Ihre Technologieinvestitionen zum Wettbewerbsvorteil" (Zühlke)

Each candidate claim is shown on every surface it reaches, everything else unchanged. Per candidate and language two images, 1200 px wide:
1. banners: the social profile banners as each platform shows them, grey shapes marking where the platform's profile photo covers the banner, from top to bottom: LinkedIn personal profile banner, X header, Sessionize speaker cover. Each carries a smaller second line under the claim.
2. brand surfaces: the closing slide of a talk deck (the claim under the speakers), then the link preview card a shared link of the homepage shows.
Real display: the banners on LinkedIn, X and Sessionize on a desktop (about 800 px wide) and on a phone; the slide projected; the link preview in a chat or feed.

Look at every image (read each file), then score every candidate on its own, for English and for German.

Criteria, each 0 to 10:
- distinctive: it could not stand just as well beside one of the companies above or any AI consultancy
- clear: within seconds you know what the company does or stands for
- emotional: it makes you feel something or want to be part of it
- credible: you believe it; it promises nothing you would distrust
- calm: confident without shouting, no hype, no gimmick; visually calm, breathing room, not cramped
- language: idiomatic, natural English (for en) or natural spoken German (for de); not a translation, not stilted
Per surface, 0 to 100, how well the claim works there: banners, slide, og (the link preview).
Then overall, 0 to 100: how well this works as the company's claim across all surfaces.

Candidates:
L01
  en: Every agent needs a team in tune.
  de: Jeder KI-Agent braucht ein eingespieltes Team.
  images (English banners, English brand surfaces, German banners, German brand surfaces): /private/tmp/claim6-0811/blind/20e79f-en-banners.jpg, /private/tmp/claim6-0811/blind/20e79f-en-brand.jpg, /private/tmp/claim6-0811/blind/20e79f-de-banners.jpg, /private/tmp/claim6-0811/blind/20e79f-de-brand.jpg
L02
  en: Every agent needs your people.
  de: Jeder KI-Agent braucht eure Leute.
  images (English banners, English brand surfaces, German banners, German brand surfaces): /private/tmp/claim6-0811/blind/08f1b4-en-banners.jpg, /private/tmp/claim6-0811/blind/08f1b4-en-brand.jpg, /private/tmp/claim6-0811/blind/08f1b4-de-banners.jpg, /private/tmp/claim6-0811/blind/08f1b4-de-brand.jpg
[cut here: L03 to L10]

Answer with JSON only, no prose before or after: {"L01": {"en": {"distinctive": 0, "clear": 0, "emotional": 0, "credible": 0, "calm": 0, "language": 0, "banners": 0, "slide": 0, "og": 0, "overall": 0, "below_max": "what keeps it from full marks, at most 20 words"}, "de": {...}}, ...} covering every label.
```

Review: large, because the claim leaves the company.

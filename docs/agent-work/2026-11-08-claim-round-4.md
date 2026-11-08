# Claim round 4: a claim that works on a banner, 08.11.2026

Round 3 left a6 ("More code isn't faster delivery.") in front, m08 ("Every agent needs a team.")
close behind, and c3 as the current claim (item `claim-round-3`). This round tests three open
doubts about them, each as a test and not as a ruling:

1. Does a short claim work alone on the banners, or does it need a line saying what h&w does?
2. Does a descriptive claim, one that says what h&w does, beat a short one?
3. Can a positive, emotional claim replace the negation in a6?

## What the sources say

Fetched 08.11.:

- "A descriptor is just what it sounds like: a short phrase that describes something about your
  business. A tagline is usually more abstract: it expresses your purpose or helps you build an
  emotional connection with customers." "You can use one, both, or neither." "If your business
  name isn't self-explanatory, a descriptor can help." (Myrna Greenfield, "Bring Out the Best:
  Descriptors vs. Taglines", LinkedIn, 08.05.2016)
- "Descriptive taglines explain what the brand does. These work best when the brand name is
  abstract or doesn't immediately communicate the service." "Benefits or outcome-driven taglines
  speak to how the client will feel or what they'll gain. These work best when the brand name
  already communicates the service clearly" (The Look & The Feel, "What Is a Brand Tagline and
  How Do You Write One That Actually Works?", updated July 2026).
- Apple's "Think different" ran from 1997 to 2002. The portrait ads and posters showed no product,
  only a small Apple logo and the words "Think different" in one corner (Wikipedia, "Think
  different"). The line came with no descriptor because the name Apple was known to every reader.
- For LinkedIn banners the guides read agree on one message that says whom the company serves and
  what it does (Zeliq, "LinkedIn Banner: How to Create a Great One in 2026", 28.05.2026). No
  official LinkedIn guidance was found.

All four are agency or reference texts without data. They agree on one point this round tests: a
name that says nothing about the offer, like hackers&wizards, needs the "what" somewhere on the
banner, in the claim or in a descriptor beside it. An emotional line alone works for a name the
reader already knows.

## Candidates

Four controls, unmarked for the reviewers: a6, m08, c3 and the retired "Your whole company
unstoppable, in flow with agentic engineering." / "Euer ganzes Unternehmen unaufhaltsam, im Flow
mit Agentic Engineering." (r0). 17 new lines in two kinds: emotional (e, how it feels or whom the
reader becomes, no description of the offer) and descriptive (d, says what h&w does in one line).
Four came from this run and seven each from two fresh Claude models (`claude -p --model opus`) that
saw only a neutral brief: the offer and the facts h&w stands behind, the neighbours of round 3,
the two kinds with "Think different." and "Just do it." as examples of the first, and the rules
(positive, no negation, two to seven words, no figures, no hype words, no dash, German in the
ihr-form and written for German readers). They saw no candidate, no current or retired line and
no words of Benedikt's. One near twin (draft B's "Agentic engineering for every role.") was
dropped. No new negation: the round adds none.

## Method

- Prefilter: the 21 lines as text with the neighbours listed, three personas (CTO, conference
  organiser, brand strategist), Claude and Codex, one run each. Criteria: distinctive, clear,
  emotional, credible, calm, language (0 to 10) and overall (0 to 100), the lines read "alone
  beside the name on a banner".
- Pass 1: the controls and the strongest seven new lines across both kinds (three descriptive, four
  emotional), drawn on every surface. The banners by `applications/channel-banners/render.py`,
  loaded from a scratch script that swaps in the claim: the LinkedIn profile banner, the X header,
  the XING and Sessionize covers, the LinkedIn company page cover (whose shipped version carries a
  descriptor and no claim) and the YouTube strip every device shows, each once with the claim
  alone and once with the descriptor line "Training and mentoring in agentic engineering" /
  "Training und Mentoring in Agentic Engineering" under it (Mono 500, the label weight, at 0.56 of
  the claim size). Grey shapes mark the profile photo and the page logo where the renderer's
  comments measured them; LinkedIn's photo and logo tile are placed by estimate. A single sentence
  over 18 characters breaks at the space nearest its middle. The closing slide from the slides
  package's built print catalog, the header of the AE-LEAD one-pager without price (os) and the
  link preview from the website's `scripts/og/template.html` filled the way `generate.mjs` fills
  it, each with the claim line replaced, in headless Chrome. The website footer on a phone as a
  mock of its brand block (lockup, three icons, the claim), checked by eye against the round 3
  screenshot. English and German throughout.
- Cold read, before any score: per claim, language and banner version, a fresh run that saw only
  the LinkedIn profile banner and was told it knows nothing else about the company, as a CTO
  coming from a comment, a conference organiser coming from a talk submission, or an engineer
  coming from a former colleague's like. It wrote what the company does and for whom, how sure it
  was and whether it would click on. Claude and Codex each: 264 runs. A third pair of runs graded
  the answers blind, without the claims, against the facts: teaches or mentors (T), on AI coding
  agents or agentic engineering (A). Claude and Codex agreed on 258 of 264 answers; the table
  counts an answer when both facts hold on the mean of the two grades. The control: the
  descriptive claim d01 alone was named by 12 of 12.
- Personas for the panel: CTO, VP of Engineering, conference organiser, senior engineer looking
  for a job, brand strategist. Claude (`claude -p --model opus`) and Codex (`gpt-6.1-sol`, high),
  two runs each, each run its own shuffled order under neutral labels, nothing marking a claim as
  current or naming an author: 20 reviewer runs per pass.
- Criteria, fixed before any score: the six of the prefilter; per surface 0 to 100 (banners alone,
  banners with the line, slide, link preview, one-pager, footer); overall 0 to 100 with the banner
  version the reviewer prefers, and which one.
- Pass 2: the top six, each with the fix for the cause most reviewers named. m08's German
  "Agent" reads as a spy, sales agent or call-centre staff for 11 of 20 reviewers, so m08k says
  "KI-Agent". d01's German "Wir bringen Teams bei, mit Agenten zu liefern." reads as school and
  translated, so d01k says "Wir machen eure Teams fit für Agenten.". e01 broke before "release",
  so lines up to 24 characters now stay on one line. Reviewers find the descriptor tiny on
  phones, so it grows to 0.62 of the claim size. Each claim shown in its preferred banner version:
  the short claims with the line, d01k alone. m08 ran beside m08k unchanged as the check on the
  fix: both carry the same English, and both English means came out at 80.2.
- 304 reviewer runs in all: 6 in the prefilter, 264 cold reads, 2 grading runs, 20 per pass;
  plus the three drafting runs.

## Result

- Alone on a banner, no short claim says what h&w does. For a6, m08, c3 and the four emotional
  lines, 0 of 12 cold readers said that h&w trains people in working with AI agents; they guessed
  a consultancy or a tool, sure of it at 3.0 to 4.5 of 10. With the line,
  12 of 12 did for every claim, at 7.6 to 8.0, and would click on more often (m08 4.9 to 6.2).
- The panel agrees: the line lifts the banners of every short claim by 6.5 to 16.3, and 34 to 40
  of 40 runs prefer it. For a descriptive claim it repeats what the claim says and lowers the
  banners (d01 77.3 to 71.6).
- The best short claim with the line beats the best descriptive claim alone on the banners (m08
  83.4 against d01 77.3) and overall. Descriptive claims are clear (8.3 to 9.0) and score low on
  distinctive and emotional (4.1 to 6.8); Claude scores them 64 to 65, Codex 78 to 83.
- The retired line r0 scores 31.9 in pass 1, last on every surface and with both models:
  "unstoppable" reads as hype, the line runs long, and alone it tells cold readers the subject
  (agentic engineering, 10 of 12) but not that h&w trains (0 of 12).
- Emotional claims: e01 "Proud of every release." / "Stolz auf jedes Release." is the most
  emotional (8.0) and calmest (9.1) line of pass 2 and first on the closing slide (80.4); it loses
  on the link preview (66.8), where no line explains it. Overall 70.2, 9.3 behind m08k.
- m08k leads pass 2 at 79.5 (noise 0.1), ahead of m08 by 1.7 with both models in both runs; the
  lead is all German (78.8 against 75.5). a6 falls to 73.0, 6.5 behind with both models; c3 is
  last at 69.2. In pass 1 c3 (75.3) and a6 (74.8) tied.
- The fix moved m08k past m08; d01k and e01 stayed where they were. Pass 2 ends on a plateau, so
  no third pass.

Item `claim-round-3` holds the per-surface scores of pass 2 and every finalist's images.

### Prefilter, text only (6 reviewer runs, one run each, so no noise measured)

| Key | EN                                                                | DE                                                                     | Origin                  | Overall | EN / DE     | Claude / Codex | Distinctive | Clear | Emotional | Credible | Calm | Language |
| --- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------- | ------- | ----------- | -------------- | ----------- | ----- | --------- | -------- | ---- | -------- |
| m08 | Every agent needs a team.                                         | Jeder Agent braucht ein Team.                                          | control (round 3)       | 76.3    | 77.2 / 75.5 | 73.3 / 79.3    | 7.7         | 6.3   | 6.6       | 8.3      | 9.0  | 9.2      |
| d03 | Agentic engineering for the whole team.                           | Agentic Engineering fürs ganze Team.                                   | draft A, descriptive    | 71.7    | 72.2 / 71.2 | 62.8 / 80.5    | 5.3         | 8.6   | 4.3       | 8.5      | 9.2  | 8.5      |
| d01 | We teach teams to ship with agents.                               | Wir bringen Teams bei, mit Agenten zu liefern.                         | this run, descriptive   | 70.9    | 74.7 / 67.2 | 61.2 / 80.7    | 5.7         | 9.2   | 4.6       | 8.7      | 8.9  | 7.9      |
| d04 | We coach your teams until agents deliver.                         | Wir coachen eure Teams, bis Agenten mitliefern.                        | draft A, descriptive    | 69.2    | 68.0 / 70.3 | 60.0 / 78.3    | 6.5         | 8.5   | 5.1       | 7.2      | 7.7  | 7.6      |
| c3  | Agents in the team. Teams in flow.                                | Agenten im Team. Teams im Flow.                                        | control (current claim) | 67.8    | 68.3 / 67.2 | 62.3 / 73.2    | 5.2         | 7.2   | 5.8       | 7.3      | 8.0  | 7.8      |
| a6  | More code isn't faster delivery.                                  | Mehr Code heißt nicht schneller liefern.                               | control (round 3 lead)  | 67.2    | 68.7 / 65.7 | 60.5 / 73.8    | 7.2         | 6.3   | 6.7       | 9.2      | 7.7  | 7.8      |
| d02 | Agentic engineering from practitioners.                           | Agentic Engineering aus der Praxis.                                    | this run, descriptive   | 62.4    | 61.2 / 63.7 | 54.7 / 70.2    | 3.8         | 8.0   | 2.9       | 8.2      | 9.2  | 8.3      |
| d05 | Training teams until they fly solo.                               | Wir trainieren Teams, bis sie allein fliegen.                          | draft B, descriptive    | 59.2    | 63.0 / 55.5 | 54.7 / 63.8    | 5.7         | 6.6   | 5.8       | 7.8      | 7.8  | 6.7      |
| e01 | Proud of every release.                                           | Stolz auf jedes Release.                                               | this run, emotional     | 57.8    | 58.3 / 57.3 | 53.7 / 62.0    | 5.0         | 4.7   | 7.8       | 6.7      | 8.7  | 8.8      |
| e12 | Grow your own wizards.                                            | Macht eure Leute zu Wizards.                                           | draft B, emotional      | 56.6    | 61.7 / 51.5 | 57.0 / 56.2    | 8.2         | 4.8   | 6.5       | 5.8      | 5.6  | 7.1      |
| e09 | Be the team that ships.                                           | Seid das Team, das liefert.                                            | draft B, emotional      | 55.8    | 56.5 / 55.0 | 51.0 / 60.5    | 3.7         | 4.9   | 6.9       | 7.0      | 6.6  | 8.9      |
| e11 | Release day, easy day.                                            | Release? Läuft.                                                        | draft B, emotional      | 55.1    | 51.7 / 58.5 | 52.3 / 57.8    | 6.2         | 5.0   | 6.9       | 5.3      | 6.0  | 8.1      |
| e05 | Speed that stays yours.                                           | Tempo, das euch bleibt.                                                | draft A, emotional      | 51.8    | 50.7 / 53.0 | 50.0 / 53.7    | 5.7         | 3.3   | 6.0       | 7.3      | 8.8  | 7.6      |
| e07 | Ship it together.                                                 | Gemeinsam raus damit.                                                  | draft A, emotional      | 45.3    | 49.7 / 41.0 | 40.2 / 50.5    | 3.2         | 3.8   | 6.0       | 7.2      | 6.7  | 8.2      |
| e04 | Every role in tune.                                               | Alle Rollen im Takt.                                                   | draft A, emotional      | 44.8    | 44.3 / 45.2 | 43.7 / 45.8    | 4.8         | 2.8   | 5.2       | 7.3      | 9.0  | 7.9      |
| e10 | Your team. Your speed.                                            | Euer Team. Euer Tempo.                                                 | draft B, emotional      | 42.5    | 41.8 / 43.2 | 43.0 / 42.0    | 2.3         | 3.0   | 5.2       | 7.5      | 8.5  | 8.8      |
| e03 | Build as one.                                                     | Baut als ein Team.                                                     | draft A, emotional      | 40.8    | 43.8 / 37.8 | 38.3 / 43.3    | 2.3         | 3.4   | 5.0       | 7.7      | 8.5  | 6.9      |
| e02 | Fast together.                                                    | Gemeinsam schnell.                                                     | this run, emotional     | 40.1    | 39.0 / 41.2 | 39.7 / 40.5    | 2.3         | 2.8   | 5.3       | 6.8      | 8.0  | 7.8      |
| e06 | Your customers feel it first.                                     | Eure Kunden merken es zuerst.                                          | draft A, emotional      | 39.5    | 39.7 / 39.3 | 38.5 / 40.5    | 4.7         | 2.0   | 5.8       | 5.3      | 8.3  | 9.0      |
| e08 | Play like a band.                                                 | Spielt wie eine Band.                                                  | draft B, emotional      | 38.2    | 39.0 / 37.5 | 38.2 / 38.3    | 5.5         | 1.8   | 5.9       | 7.0      | 7.2  | 7.9      |
| r0  | Your whole company unstoppable, in flow with agentic engineering. | Euer ganzes Unternehmen unaufhaltsam, im Flow mit Agentic Engineering. | control (retired)       | 21.2    | 22.7 / 19.8 | 18.5 / 24.0    | 2.7         | 5.3   | 3.5       | 2.0      | 1.0  | 3.8      |

### Cold read: what the company does, from one banner (12 runs per cell)

| Key | Alone: training and AI agents named | Sure | Would click | With the line: named | Sure | Would click |
| --- | ----------------------------------- | ---- | ----------- | -------------------- | ---- | ----------- |
| m08 | 0 of 12                             | 3.1  | 4.9         | 12 of 12             | 7.8  | 6.2         |
| c3  | 0 of 12                             | 4.5  | 5.4         | 12 of 12             | 8.0  | 6.2         |
| a6  | 0 of 12                             | 3.8  | 6.1         | 12 of 12             | 7.9  | 6.7         |
| d01 | 12 of 12                            | 7.1  | 6.3         | 12 of 12             | 8.4  | 6.3         |
| d04 | 11 of 12                            | 7.0  | 6.4         | 12 of 12             | 8.4  | 6.8         |
| d03 | 0 of 12                             | 5.2  | 6.2         | 12 of 12             | 8.0  | 6.2         |
| e09 | 0 of 12                             | 3.0  | 4.2         | 12 of 12             | 7.8  | 5.8         |
| e01 | 0 of 12                             | 3.4  | 4.5         | 12 of 12             | 7.6  | 6.2         |
| e12 | 0 of 12                             | 3.2  | 4.2         | 12 of 12             | 7.8  | 6.1         |
| e11 | 0 of 12                             | 3.6  | 4.8         | 12 of 12             | 7.7  | 5.9         |
| r0  | 0 of 12                             | 4.2  | 5.0         | 11 of 12             | 7.5  | 5.2         |

### Pass 1, eleven claims on every surface

| Key | Overall | Noise | EN / DE     | Claude / Codex | Distinctive | Clear | Emotional | Credible | Calm | Language |
| --- | ------- | ----- | ----------- | -------------- | ----------- | ----- | --------- | -------- | ---- | -------- |
| m08 | 79.9    | 0.6   | 80.5 / 79.2 | 78.5 / 81.2    | 7.4         | 6.2   | 7.1       | 8.4      | 9.0  | 9.3      |
| c3  | 75.3    | 3.4   | 75.5 / 75.2 | 71.5 / 79.1    | 5.2         | 6.7   | 6.6       | 7.5      | 8.5  | 7.8      |
| a6  | 74.8    | 3.0   | 76.0 / 73.6 | 71.2 / 78.4    | 6.9         | 6.6   | 6.8       | 9.0      | 8.0  | 7.6      |
| d01 | 74.2    | 1.3   | 78.0 / 70.4 | 65.4 / 83.0    | 5.9         | 9.0   | 4.8       | 8.5      | 8.0  | 7.6      |
| d04 | 72.8    | 1.8   | 72.8 / 72.8 | 64.0 / 81.6    | 6.8         | 8.4   | 5.8       | 7.0      | 7.3  | 7.4      |
| d03 | 71.5    | 1.5   | 71.7 / 71.3 | 65.3 / 77.8    | 4.1         | 8.3   | 4.1       | 8.7      | 8.7  | 8.3      |
| e09 | 71.5    | 0.5   | 73.3 / 69.8 | 69.5 / 73.5    | 4.4         | 5.3   | 7.3       | 7.5      | 7.6  | 8.7      |
| e01 | 71.4    | 0.5   | 71.8 / 71.0 | 71.5 / 71.3    | 5.0         | 4.3   | 7.9       | 7.5      | 9.1  | 8.9      |
| e12 | 69.3    | 4.0   | 73.6 / 65.0 | 69.3 / 69.3    | 8.6         | 4.4   | 7.0       | 6.2      | 6.3  | 7.4      |
| e11 | 68.5    | 0.5   | 65.0 / 72.0 | 68.0 / 69.0    | 6.0         | 4.2   | 7.5       | 5.8      | 7.3  | 8.5      |
| r0  | 31.9    | 2.2   | 35.1 / 28.6 | 31.2 / 32.5    | 2.8         | 5.2   | 3.7       | 2.4      | 2.1  | 3.8      |

Per surface, pass 1:

| Key | Banners alone | With the line | Lift  | Runs preferring the line | Slide | Link preview | One-pager | Footer |
| --- | ------------- | ------------- | ----- | ------------------------ | ----- | ------------ | --------- | ------ |
| m08 | 73.8          | 83.4          | +9.7  | 40 of 40                 | 82.2  | 78.1         | 79.7      | 78.4   |
| c3  | 73.1          | 79.6          | +6.5  | 34 of 40                 | 80.7  | 76.5         | 76.5      | 75.8   |
| a6  | 70.2          | 80.2          | +10.0 | 40 of 40                 | 79.0  | 75.2         | 75.2      | 67.6   |
| d01 | 77.3          | 71.6          | -5.7  | 2 of 40                  | 71.8  | 78.6         | 73.3      | 77.2   |
| d04 | 75.2          | 71.9          | -3.3  | 10 of 40                 | 71.8  | 76.6         | 71.1      | 74.3   |
| d03 | 74.5          | 68.6          | -5.9  | 20 of 40                 | 70.7  | 76.9         | 71.3      | 77.5   |
| e09 | 63.9          | 77.7          | +13.8 | 40 of 40                 | 78.7  | 69.0         | 74.0      | 70.5   |
| e01 | 61.1          | 77.5          | +16.3 | 40 of 40                 | 80.2  | 65.9         | 73.5      | 71.2   |
| e12 | 59.5          | 75.8          | +16.3 | 40 of 40                 | 74.7  | 64.4         | 70.7      | 67.6   |
| e11 | 60.7          | 76.1          | +15.4 | 40 of 40                 | 75.6  | 65.0         | 69.1      | 67.1   |
| r0  | 32.0          | 32.2          | +0.2  | 18 of 40                 | 35.6  | 38.3         | 33.9      | 35.5   |

### Pass 2, criteria

| Key  | EN                                  | DE                                       | Overall | Noise | Distinctive | Clear | Emotional | Credible | Calm | Language |
| ---- | ----------------------------------- | ---------------------------------------- | ------- | ----- | ----------- | ----- | --------- | -------- | ---- | -------- |
| m08k | Every agent needs a team.           | Jeder KI-Agent braucht ein Team.         | 79.5    | 0.1   | 7.4         | 7.2   | 7.1       | 8.3      | 8.6  | 8.9      |
| m08  | Every agent needs a team.           | Jeder Agent braucht ein Team.            | 77.8    | 0.2   | 7.5         | 6.2   | 7.4       | 8.3      | 8.8  | 9.1      |
| a6   | More code isn't faster delivery.    | Mehr Code heißt nicht schneller liefern. | 73.0    | 1.5   | 6.8         | 7.0   | 7.0       | 8.9      | 7.2  | 7.6      |
| d01k | We teach teams to ship with agents. | Wir machen eure Teams fit für Agenten.   | 72.5    | 0.2   | 4.9         | 8.5   | 4.9       | 8.1      | 8.2  | 8.5      |
| e01  | Proud of every release.             | Stolz auf jedes Release.                 | 70.2    | 2.0   | 5.5         | 4.5   | 8.0       | 7.4      | 9.1  | 9.1      |
| c3   | Agents in the team. Teams in flow.  | Agenten im Team. Teams im Flow.          | 69.2    | 0.1   | 4.4         | 6.5   | 6.3       | 6.9      | 7.7  | 7.2      |

Skipped combinations: the home hero (m08 above the H1 scored 72.0 against 79.8 for the empty slot
in round 3, and no new line was put there); the Facebook, Brella and OMR covers; the banners on a
phone (the descriptor's size on phones is the reviewers' main remaining complaint); a second
descriptor wording; the trainer hub decks and os documents other than one one-pager. The website
footer is a mock; LinkedIn's photo and page logo positions are estimates, not measured on a fresh
screenshot.

Seen on the way, for the website: the link preview breaks "Every agent needs a" / "team.", because
the template sets no balanced wrap. Reviewers named the same orphan on the closing slide; the slide
renders m08 on one line.

### Prompts, verbatim

A cold read (Claude, conference organiser, m08 in English, claim alone):

```text
You curate the programme of a German developer conference with 2,000 attendees. Every day you open speaker and sponsor profiles on LinkedIn, Sessionize and X, usually from a comment or a submission, and decide in seconds whether the company behind them is relevant.

You opened this company's LinkedIn page from a talk submission to your conference. The image /private/tmp/claim4-0811/r1/m08-en/alone/linkedin-profile.png is the banner at the top of the page (1584 x 396 px, shown about 800 px wide on a desktop; the grey circle is where the profile photo covers it). You know nothing else about the company.

Look at the image (read the file). Answer from the banner alone, before anything else:
1. In one sentence: what does this company do?
2. For whom?
3. How sure are you of 1, 0 to 10?
4. Would you click further to learn more, 0 to 10?

Answer with JSON only: {"does": "", "for_whom": "", "sure": 0, "click": 0}
```

Pass 2, CTO, Codex, run 1, the candidate list cut after the second of six:

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
1. banners: the social profile banners as each platform shows them, grey shapes marking where the platform's profile photo or logo covers the banner. Row 1: LinkedIn personal profile banner, X header. Row 2: XING cover, Sessionize speaker cover. Row 3: LinkedIn company page cover, the strip of the YouTube channel banner every device shows. Some candidates carry a smaller second line under the claim on the banners.
2. brand surfaces: the closing slide of a talk deck (the claim under the speakers), the link preview card a shared link shows, the header of a training one-pager (the claim as the small line above the title, A4) and the website footer on a phone (the claim under the logo).
Real display: the banners on LinkedIn, X, XING, Sessionize and YouTube on a desktop (about 800 px wide) and on a phone; the slide projected; the link preview in a chat or feed; the one-pager printed or as PDF; the footer on a phone.

Look at every image (read each file), then score every candidate on its own, for English and for German.

Criteria, each 0 to 10:
- distinctive: it could not stand just as well beside one of the companies above or any AI consultancy
- clear: within seconds you know what the company does or stands for
- emotional: it makes you feel something or want to be part of it
- credible: you believe it; it promises nothing you would distrust
- calm: confident without shouting, no hype, no gimmick; visually calm, breathing room, not cramped
- language: idiomatic, natural English (for en) or natural spoken German (for de); not a translation, not stilted
Per surface, 0 to 100, how well the claim works there: banners, slide, og (the link preview), onepager, footer.
Then overall, 0 to 100: how well this works as the company's claim across all surfaces.

Candidates:
L01
  en: Every agent needs a team.
  de: Jeder KI-Agent braucht ein Team.
  images (English banners, English brand surfaces, German banners, German brand surfaces): /private/tmp/claim4-0811/r2/small/m08k-en-banners.jpg, /private/tmp/claim4-0811/r2/small/m08k-en-brand.jpg, /private/tmp/claim4-0811/r2/small/m08k-de-banners.jpg, /private/tmp/claim4-0811/r2/small/m08k-de-brand.jpg
L02
  en: Proud of every release.
  de: Stolz auf jedes Release.
  images (English banners, English brand surfaces, German banners, German brand surfaces): /private/tmp/claim4-0811/r2/small/e01-en-banners.jpg, /private/tmp/claim4-0811/r2/small/e01-en-brand.jpg, /private/tmp/claim4-0811/r2/small/e01-de-banners.jpg, /private/tmp/claim4-0811/r2/small/e01-de-brand.jpg
[cut here: L03 to L06]

Answer with JSON only, no prose before or after: {"L01": {"en": {"distinctive": 0, "clear": 0, "emotional": 0, "credible": 0, "calm": 0, "language": 0, "banners": 0, "slide": 0, "og": 0, "onepager": 0, "footer": 0, "overall": 0, "below_max": "what keeps it from full marks, at most 20 words"}, "de": {...}}, ...} covering every label.
```

Review: large, because the claim stands on every surface and leaves the company.

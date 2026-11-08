# The claim and the home headline as two lines, 07.11.2026

The brand had one `claim` field that served as tagline and as the website's home H1. This round
tested the two jobs apart. The claim is the tagline people repeat, on the closing slide, the
one-pager, the profile banner and in the footer. The home headline is the H1 and says what
changes for the client company. The blind review recommends "Flow is a team sport." / "Flow ist
Teamsport." as the claim and "Your teams have agents. Once every role is in step, your releases
speed up." / "Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden eure Releases
schneller." as the headline. That pair scored 77.8 as one page. Today's page, q6 as the H1 with no
claim line, scored 67.5. Benedikt decided on 07.11., from the admin page: "c3 (Agents in the team.
Teams in flow. / Agenten im Team. Teams im Flow.)" and "k3 (Your teams have agents. Once every role is in
step, your releases speed up. / Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden
eure Releases schneller.)". Both stand in `verbal.json` since v1.29.0.

A second round on 07.11. tested what stands above the home H1 with c3 and k3 and the page headlines
with both. Its result is in "Round 2" below and in the decision item `home-claim-line`. A third
round on 07.11. scored c3 against real competitors' claims and against new candidates on every
surface the claim reaches. c3 lost to "More code isn't faster delivery." / "Mehr Code heißt nicht
schneller liefern." (a6), 78.5 against 66.4. Its result is in "Round 3" below and in the decision
item `claim-round-3`; the rollout of c3 waits for that decision. A fourth round read the
website's page headlines with each claim: "Round 4" below.

## The question

Benedikt, 07.11. (relayed by Ada): "das ist ok aber ich finde der claim ist noch nich 100% da wo er sein sollte.
wir sollten vllt auch zwischen claim und überschrift auf der seite unterscheiden. claim bei apple
ist ja zB "think different". wir müssen noch mal iterieren auf den claims und der headline. perlman
sagt ja auch ganz klar, dass bei headlines das unternehmen und seine transformation und was sich
für das unternehmen ändert im fordergrund steht. daher auch der alte claim."

## What the sources say

Perlman. The eight interviews the 2026-09 research lists (os,
`src/content/documents/marketing/claim-research-2026-09.md`) were fetched again as YouTube's
automatic captions on 07.11. and searched for "headline", "slogan", "tagline" and "claim". The
word "headline" does not occur. The Mindvalley program page, his Mindvalley blog profile and the
brand-promise article were fetched on 07.11. too; none uses "headline", and only the
brand-promise article uses "slogan" or "tagline", in Mindvalley's own words. So no fetched source
has Perlman stating a rule for headlines. What he does say about slogans points the same way as the
rule Benedikt names: each slogan he cites names the new state of the customer.

- Zumba: "in 2006 we created the slogan for Zumba was ditch the workout join the party" [caption]
  (https://www.youtube.com/watch?v=F7GzV75HFB0, 0:10:09).
- Airbnb: "their slogan is belong anywhere. The the mission of the the company is to create a world
  where everybody belongs anywhere" [caption] (https://www.youtube.com/watch?v=kwfwGv-jvXs,
  0:13:21).
- His brand hero is "the identity that your customers will aspire to be" [caption] (trailer,
  https://www.youtube.com/watch?v=sLz6E5QjQeY, 0:02:04).

Read against the two jobs, his slogans are claims, the tagline beside the name, and they name the
customer's new state in the fewest words. Rendering the rule "the company and its change in front"
as the headline rule is our derivation, not his wording.

Tagline and headline practice, fetched 07.11.:

- A tagline "is the phrase that positions the brand in the market", "a component that doesn't change
  and works over the long term" and "associated with the corporate name"; a headline "works over
  the short term and changes from page to page, poster to poster" (Diego Fontana, Pixartprinting,
  "Headlines, taglines and claims: how to tell them apart", 09.10.2020).
- "The value proposition is the substance; the tagline is the form." "Apple's tagline "Think
  Different" says nothing about what Apple provides." Value propositions "inform strategy,
  positioning, and the words that appear on a homepage hero" (Lean Labs, "How is a value proposition
  different from a tagline or slogan?", modified 22.07.2026).
- Searches for B2B homepage headline practice turned up vendor blogs whose conversion figures carry
  no method. They agree on one point, which this test measures directly: a headline that names the
  buyer's outcome rather than the product.

Together: two lines with two jobs is standard practice, the tagline may be short and need not
explain the offer, and the page headline carries the change for the buyer.

## Candidates

Claims, 13 pairs: eight drafts of this run, three from an independent draft, and q6 and f7 as
unmarked controls. Headlines, 13 pairs: eight drafts of this run that put the client company and its
change first, three from the independent draft, and q6 and the retired claim as unmarked controls.
The independent draft came from a fresh Claude model (`claude -p --model opus`) that saw only a
neutral brief: the offer, the buyer, the result, the word flow and five rules (no hype, no contrast,
no list of three, no dash, no "transform"). It saw no candidate, no current or retired line and no
words of Benedikt's. Pass 2 kept the top five of each test and refined them on the reviewers'
reasons. German throughout in the ihr-form.

## Method

- Claim test: per candidate and language one image, 1000 px on the long side: the deck closing slide
  at 1920 x 1080 from the slides catalog ("Thank you." / "Danke."), the one-pager header from the
  documents catalog with the AE-LEAD title and intro from the website's one-pager, and the LinkedIn
  profile banner at 1584 x 396 drawn by `applications/channel-banners/render.py` with the
  candidate's sentences as its lines. The highlight word was off for every candidate. The banner
  is English today; its German render shows the German line.
- Headline test: the live home page (www.hackersandwizards.dev, EN and DE) in headless Chrome, the
  H1 replaced by the candidate and balanced by the browser for every candidate (the live page breaks
  q6 by a rule written for q6), the tuning desk held lined up with its waveform running. Per
  candidate one image of the 1440 px first screens, English over German, and one of the 375 px
  phones from the top to the desk, English beside German.
- Pairing test: the top three claims and the top three headlines of pass 2, nine pairs, on the home
  page with the claim as a small line above the H1, plus today's page (q6 as the H1, no claim
  line) as the control. The control's prompt reads "(no separate claim line)" for its claim.
- Personas: a CIO of a German retail group, a CTO of a Mittelstand manufacturer under board
  pressure, a VP of Engineering at a Berlin scale-up, a Chief Product Officer, a Head of
  Engineering worried about quality and morale, and a brand strategist for DACH B2B tech services;
  the claim test added a senior developer after a two-day training.
- Criteria, fixed before the first score. Claim: memorable, distinctive, credible, fit (fits what
  the company stands for beside its name), energy and calm, language. Headline: clear (what changes
  for your company), relevant, credible, distinctive, fit with the hero, language. Pair: clear,
  relevant, credible, distinctive, together (claim and headline each do their own job, neither
  repeats the other), language. Each 0 to 10, and an overall score 0 to 100.
- Reviewers: Claude (`claude -p --model opus`) and Codex (`gpt-6.1-sol`, high), two runs each, each
  run in its own shuffled order under neutral labels, nothing marking a line as current or naming
  its author. Noise is the mean difference between a reviewer's two runs, and on the panel mean,
  the number the tables compare.

## Result

The claim. "Agents in the team. Teams in flow." (c3) led its own test in both passes, first with all
seven personas and both models: 77.1 in pass 2 against 73.6 for "Flow is a team sport." (c2), at a
panel noise of 1.8. As a page, c3 repeats the headline's words: c3 with k3 scored 73.3 and
"together" 6.2, c2 with k3 77.8 and "together" 8.0, at a noise of 1.1, ahead with both models and
all six personas. Over the claim test and the page together the two tie, c2 75.7 and c3 75.2,
inside the noise. A tie goes to the line that needs no exception: c3 would need the home page to
keep the claim off the line above the H1, c2 needs nothing. The reviewers' reasons against c2:
"X is a team sport" is a familiar formula (distinctive 4.7), and agents go unnamed. Against c3: the
chiasmus reads constructed to some, and it can sound as if adding agents creates flow by itself.

q6 as the claim scored 65.2 in pass 2, eighth of 13, and as the H1 76.8, third. Reviewers read it as
a tagline rather than a headline ("reads more like a tagline than a buying proposition").

The headline. "Your teams have agents. Once every role is in step, your releases speed up." (k3)
leads pass 2 at 80.8, ahead of k2 at 77.7 and q6 at 76.8, at a panel noise of 1.1. It is first with
the CIO, the CPO, the Head of Engineering and the VP of Engineering; k2 with the CTO and the brand
strategist. Claude puts k3 first by 12.4 (EN) and 9.4 (DE) over k2, Codex puts k2 first by 3.3 and
5.7: the lead over k2 holds on the panel mean, not with both models. k3 leads q6 with both models.
k3 names the mechanism the tuning desk shows, fit with the hero 9.4. Its German "Rollen eingespielt"
reads constructed to every Codex reviewer ("people or teams are eingespielt"), and at five lines it
is long for an H1 on the desktop. k2 is the clearest (9.3) and least distinctive (5.1): "any vendor
could say it". The retired claim scored 30.5 as the H1, the lowest of every test.

Pass 2 stopped the search: no claim refinement beat its parent, and the headline gained one line.

## Scores

Overall is the mean of all reviewers, 0 to 100; the criteria are the mean over both languages. Compare lines within one table.

Pass 2 as the claim, 13 pairs (noise 4.8 per reviewer, 1.8 on the panel mean):

| Key | EN                                                | DE                                                          | Origin                  | Overall EN / DE | Claude EN / DE | Codex EN / DE | Memorable | Distinctive | Credible | Fit | Energy and calm | Language |
| --- | ------------------------------------------------- | ----------------------------------------------------------- | ----------------------- | --------------- | -------------- | ------------- | --------- | ----------- | -------- | --- | --------------- | -------- |
| c3  | Agents in the team. Teams in flow.                | Agenten im Team. Teams im Flow.                             | draft                   | 76.6 / 77.6     | 71.2 / 71.6    | 82.0 / 83.6   | 8.1       | 6.3         | 7.6      | 8.6 | 8.2             | 8.3      |
| c2  | Flow is a team sport.                             | Flow ist Teamsport.                                         | draft                   | 73.4 / 73.8     | 66.4 / 66.0    | 80.4 / 81.6   | 8.4       | 4.7         | 8.2      | 7.1 | 8.0             | 9.4      |
| r3  | Teams with agents. Teams in flow.                 | Teams mit Agenten. Teams im Flow.                           | refinement              | 71.7 / 71.6     | 63.1 / 62.3    | 80.3 / 81.0   | 7.3       | 5.3         | 7.4      | 8.1 | 7.6             | 8.0      |
| f7  | Agents bring the speed. Flow takes training.      | Agenten bringen das Tempo. Flow braucht Training.           | control                 | 71.0 / 72.0     | 70.1 / 69.8    | 71.9 / 74.1   | 7.6       | 6.8         | 7.1      | 8.2 | 6.8             | 8.3      |
| i1  | Speed that reaches your customers.                | Tempo, das bei euren Kunden ankommt.                        | independent draft       | 71.6 / 71.2     | 65.4 / 60.4    | 77.8 / 82.1   | 7.0       | 5.5         | 7.3      | 8.1 | 6.5             | 8.4      |
| r4  | With agents, flow is a team sport.                | Mit Agenten wird Flow zum Teamsport.                        | refinement              | 71.6 / 68.5     | 67.7 / 65.0    | 75.5 / 71.9   | 7.1       | 6.2         | 7.3      | 8.0 | 7.0             | 8.0      |
| r1  | Agents in the team. Flow in the company.          | Agenten im Team. Flow im Unternehmen.                       | refinement              | 67.1 / 69.2     | 63.4 / 63.7    | 70.8 / 74.7   | 6.9       | 6.3         | 6.3      | 7.9 | 7.1             | 7.4      |
| q6  | Agents bring the speed. Flow needs teams in tune. | Agenten bringen das Tempo. Flow braucht eingespielte Teams. | control (current claim) | 63.6 / 66.9     | 60.7 / 62.3    | 66.4 / 71.4   | 6.0       | 6.6         | 7.2      | 8.0 | 6.6             | 7.5      |
| r2  | Agents in every team. Every team in flow.         | Agenten in jedem Team. Jedes Team im Flow.                  | refinement              | 64.1 / 63.9     | 63.0 / 61.9    | 65.2 / 65.9   | 7.6       | 5.6         | 5.0      | 7.1 | 6.6             | 8.2      |
| c1  | Teams in flow.                                    | Teams im Flow.                                              | draft                   | 63.8 / 63.9     | 57.3 / 56.2    | 70.3 / 71.6   | 6.9       | 2.9         | 8.1      | 6.5 | 7.9             | 9.1      |
| c4  | Engineering in flow.                              | Engineering im Flow.                                        | draft                   | 63.9 / 62.1     | 54.4 / 52.8    | 73.4 / 71.4   | 6.4       | 3.5         | 8.1      | 6.7 | 7.6             | 8.0      |
| r7  | Agentic engineering in flow.                      | Agentic Engineering im Flow.                                | refinement              | 59.7 / 56.9     | 54.3 / 52.0    | 65.1 / 61.7   | 5.3       | 4.6         | 7.5      | 7.5 | 6.1             | 6.2      |
| r6  | From agents to customers, in flow.                | Von den Agenten bis zum Kunden im Flow.                     | refinement              | 56.1 / 51.0     | 53.0 / 46.6    | 59.3 / 55.5   | 5.0       | 6.2         | 6.6      | 7.4 | 5.5             | 4.8      |

Pass 2 as the home headline, 12 pairs (noise 3.5 per reviewer, 1.1 on the panel mean):

| Key | EN                                                                          | DE                                                                                           | Origin                  | Overall EN / DE | Claude EN / DE | Codex EN / DE | Clear | Relevant | Credible | Distinctive | Fit with the hero | Language |
| --- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------- | --------------- | -------------- | ------------- | ----- | -------- | -------- | ----------- | ----------------- | -------- |
| k3  | Your teams have agents. Once every role is in step, your releases speed up. | Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden eure Releases schneller. | refinement              | 81.9 / 79.8     | 78.8 / 78.6    | 85.0 / 81.0   | 8.5   | 9.3      | 8.2      | 7.3         | 9.4               | 7.4      |
| k2  | Your teams have agents. Now get your releases out sooner.                   | Eure Teams haben Agenten. Jetzt kommen eure Releases früher raus.                            | refinement              | 77.4 / 77.9     | 66.4 / 69.2    | 88.3 / 86.7   | 9.3   | 9.2      | 7.0      | 5.1         | 7.6               | 8.8      |
| q6  | Agents bring the speed. Flow needs teams in tune.                           | Agenten bringen das Tempo. Flow braucht eingespielte Teams.                                  | control (current claim) | 75.5 / 78.1     | 75.8 / 77.4    | 75.2 / 78.8   | 6.8   | 7.6      | 8.2      | 7.6         | 9.5               | 8.3      |
| h2  | Your teams have agents. Now your releases speed up too.                     | Eure Teams haben Agenten. Jetzt werden auch eure Releases schneller.                         | draft                   | 76.5 / 76.4     | 70.6 / 70.8    | 82.3 / 82.0   | 8.9   | 9.2      | 6.7      | 5.2         | 7.9               | 8.3      |
| k1  | Your developers have agents. Now your releases get faster too.              | Eure Entwickler haben Agenten. Jetzt werden auch eure Releases schneller.                    | refinement              | 75.4 / 75.0     | 69.2 / 67.9    | 81.5 / 82.1   | 8.9   | 9.2      | 6.7      | 5.3         | 7.4               | 8.0      |
| k4  | Your agents write the code. Your company learns to ship it sooner.          | Eure Agenten schreiben den Code. Euer Unternehmen lernt, ihn früher auszuliefern.            | refinement              | 78.4 / 72.0     | 70.8 / 64.5    | 86.1 / 79.4   | 8.3   | 8.7      | 7.8      | 6.4         | 7.9               | 7.3      |
| j2  | Your agents already write code faster. Now your customers feel it.          | Eure Agenten schreiben schon schneller Code. Jetzt merken das auch eure Kunden.              | independent draft       | 67.4 / 66.9     | 63.8 / 62.2    | 71.1 / 71.7   | 7.0   | 8.0      | 6.2      | 5.1         | 6.6               | 8.1      |
| h3  | Your agents write the code. Your company learns to ship at their pace.      | Eure Agenten schreiben den Code. Euer Unternehmen lernt, in ihrem Tempo zu liefern.          | draft                   | 68.4 / 63.9     | 66.4 / 61.7    | 70.3 / 66.1   | 7.3   | 8.0      | 5.2      | 6.6         | 7.7               | 7.3      |
| k5  | Your agents write code faster. Now your customers get it sooner.            | Eure Agenten schreiben schneller Code. Jetzt bekommen ihn eure Kunden auch früher.           | refinement              | 69.9 / 62.2     | 61.3 / 56.1    | 78.4 / 68.4   | 7.6   | 8.2      | 6.5      | 4.9         | 6.5               | 6.6      |
| h4  | Your teams work with agents. Your customers notice it in every release.     | Eure Teams arbeiten mit Agenten. Eure Kunden merken es an jedem Release.                     | draft                   | 60.4 / 60.1     | 56.4 / 56.3    | 64.3 / 63.8   | 6.0   | 7.3      | 5.2      | 4.8         | 6.3               | 8.1      |
| h6  | Your company ships at agent speed, with teams in flow.                      | Euer Unternehmen liefert im Tempo der Agenten, mit Teams im Flow.                            | draft                   | 60.2 / 56.6     | 57.4 / 54.5    | 62.9 / 58.7   | 6.6   | 7.6      | 3.9      | 5.6         | 8.2               | 6.7      |
| ret | Your whole company unstoppable, in flow with agentic engineering.           | Euer ganzes Unternehmen unaufhaltsam, im Flow mit Agentic Engineering.                       | control (retired claim) | 31.6 / 29.4     | 30.5 / 27.4    | 32.7 / 31.3   | 3.5   | 4.8      | 2.0      | 3.3         | 5.5               | 3.8      |

The pairing pass, claim above headline on the home page, 10 pages (noise 3.6 per reviewer, 1.1 on the panel mean):

| Key   | Claim EN / DE                                                         | Headline EN / DE                                                                                                                                                           | Overall EN / DE | Claude EN / DE | Codex EN / DE | Clear | Relevant | Credible | Distinctive | Together | Language |
| ----- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------- | ------------- | ----- | -------- | -------- | ----------- | -------- | -------- |
| c2+k3 | Flow is a team sport. / Flow ist Teamsport.                           | Your teams have agents. Once every role is in step, your releases speed up. / Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden eure Releases schneller. | 79.0 / 76.7     | 76.7 / 75.4    | 81.2 / 78.0   | 8.0   | 8.9      | 7.9      | 6.6         | 8.0      | 7.3      |
| c2+k2 | Flow is a team sport. / Flow ist Teamsport.                           | Your teams have agents. Now get your releases out sooner. / Eure Teams haben Agenten. Jetzt kommen eure Releases früher raus.                                              | 75.1 / 73.2     | 65.8 / 65.0    | 84.4 / 81.4   | 8.5   | 8.7      | 6.4      | 5.3         | 8.1      | 8.2      |
| c3+k3 | Agents in the team. Teams in flow. / Agenten im Team. Teams im Flow.  | Your teams have agents. Once every role is in step, your releases speed up. / Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden eure Releases schneller. | 74.2 / 72.5     | 71.0 / 70.2    | 77.3 / 74.7   | 8.0   | 8.9      | 7.9      | 6.7         | 6.2      | 7.1      |
| c2+h2 | Flow is a team sport. / Flow ist Teamsport.                           | Your teams have agents. Now your releases speed up too. / Eure Teams haben Agenten. Jetzt werden auch eure Releases schneller.                                             | 71.7 / 71.5     | 66.7 / 67.1    | 76.7 / 76.0   | 8.0   | 8.5      | 5.9      | 5.3         | 8.0      | 7.9      |
| r3+k3 | Teams with agents. Teams in flow. / Teams mit Agenten. Teams im Flow. | Your teams have agents. Once every role is in step, your releases speed up. / Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden eure Releases schneller. | 70.8 / 68.9     | 65.9 / 65.0    | 75.7 / 72.8   | 8.0   | 8.9      | 7.9      | 6.0         | 5.1      | 7.0      |
| c3+k2 | Agents in the team. Teams in flow. / Agenten im Team. Teams im Flow.  | Your teams have agents. Now get your releases out sooner. / Eure Teams haben Agenten. Jetzt kommen eure Releases früher raus.                                              | 69.3 / 68.2     | 59.1 / 58.4    | 79.6 / 78.0   | 8.4   | 8.7      | 6.2      | 5.3         | 6.0      | 7.9      |
| cur   | (no separate claim line) / (no separate claim line)                   | Agents bring the speed. Flow needs teams in tune. / Agenten bringen das Tempo. Flow braucht eingespielte Teams.                                                            | 66.6 / 68.5     | 65.1 / 65.9    | 68.2 / 71.0   | 6.6   | 7.1      | 7.2      | 7.2         | 4.8      | 8.2      |
| c3+h2 | Agents in the team. Teams in flow. / Agenten im Team. Teams im Flow.  | Your teams have agents. Now your releases speed up too. / Eure Teams haben Agenten. Jetzt werden auch eure Releases schneller.                                             | 66.3 / 66.5     | 60.0 / 60.2    | 72.6 / 72.9   | 8.0   | 8.5      | 5.6      | 5.4         | 5.7      | 7.5      |
| r3+k2 | Teams with agents. Teams in flow. / Teams mit Agenten. Teams im Flow. | Your teams have agents. Now get your releases out sooner. / Eure Teams haben Agenten. Jetzt kommen eure Releases früher raus.                                              | 66.2 / 64.8     | 54.8 / 54.2    | 77.6 / 75.3   | 8.4   | 8.7      | 6.2      | 4.5         | 4.8      | 7.9      |
| r3+h2 | Teams with agents. Teams in flow. / Teams mit Agenten. Teams im Flow. | Your teams have agents. Now your releases speed up too. / Eure Teams haben Agenten. Jetzt werden auch eure Releases schneller.                                             | 62.6 / 62.5     | 54.8 / 54.9    | 70.4 / 70.0   | 8.0   | 8.5      | 5.6      | 4.5         | 4.5      | 7.5      |

Pass 1 as the claim, 13 pairs (noise 4.5 per reviewer, 1.1 on the panel mean):

| Key | EN                                                | DE                                                          | Origin                  | Overall EN / DE | Claude EN / DE | Codex EN / DE | Memorable | Distinctive | Credible | Fit | Energy and calm | Language |
| --- | ------------------------------------------------- | ----------------------------------------------------------- | ----------------------- | --------------- | -------------- | ------------- | --------- | ----------- | -------- | --- | --------------- | -------- |
| c3  | Agents in the team. Teams in flow.                | Agenten im Team. Teams im Flow.                             | draft                   | 77.8 / 78.8     | 72.6 / 72.7    | 82.9 / 84.8   | 8.2       | 7.0         | 7.5      | 8.8 | 8.2             | 8.2      |
| c2  | Flow is a team sport.                             | Flow ist Teamsport.                                         | draft                   | 75.7 / 75.8     | 69.8 / 69.7    | 81.6 / 81.9   | 8.2       | 5.5         | 8.3      | 8.0 | 7.8             | 9.2      |
| i1  | Speed that reaches your customers.                | Tempo, das bei euren Kunden ankommt.                        | independent draft       | 69.2 / 69.8     | 60.9 / 58.1    | 77.5 / 81.4   | 6.6       | 5.8         | 7.3      | 8.1 | 6.3             | 7.8      |
| c1  | Teams in flow.                                    | Teams im Flow.                                              | draft                   | 69.2 / 69.1     | 60.5 / 59.6    | 78.0 / 78.5   | 7.1       | 3.5         | 8.0      | 7.6 | 8.2             | 8.7      |
| f7  | Agents bring the speed. Flow takes training.      | Agenten bringen das Tempo. Flow braucht Training.           | control                 | 68.5 / 68.9     | 67.4 / 66.3    | 69.6 / 71.4   | 7.4       | 7.1         | 7.0      | 8.2 | 6.5             | 8.2      |
| c4  | Engineering in flow.                              | Engineering im Flow.                                        | draft                   | 65.2 / 62.8     | 54.6 / 52.4    | 75.7 / 73.1   | 6.3       | 4.2         | 7.8      | 7.1 | 7.5             | 7.7      |
| q6  | Agents bring the speed. Flow needs teams in tune. | Agenten bringen das Tempo. Flow braucht eingespielte Teams. | control (current claim) | 61.4 / 64.7     | 59.1 / 60.4    | 63.7 / 69.0   | 5.8       | 6.9         | 7.0      | 8.1 | 6.6             | 7.2      |
| i2  | Your teams in flow with their agents.             | Eure Teams im Flow mit ihren Agenten.                       | independent draft       | 60.6 / 59.1     | 53.9 / 51.2    | 67.3 / 66.9   | 4.8       | 6.0         | 7.4      | 8.1 | 6.4             | 6.4      |
| c8  | Play in tune.                                     | Spielt euch ein.                                            | draft                   | 53.3 / 61.4     | 47.6 / 51.2    | 59.0 / 71.6   | 6.9       | 5.4         | 7.5      | 5.2 | 7.2             | 8.4      |
| c5  | Fast together.                                    | Gemeinsam schnell.                                          | draft                   | 56.2 / 57.4     | 49.4 / 50.1    | 63.0 / 64.7   | 7.1       | 2.6         | 6.6      | 6.0 | 5.8             | 8.1      |
| c7  | Build in flow.                                    | Im Flow bauen.                                              | draft                   | 60.5 / 51.0     | 49.4 / 43.6    | 71.6 / 58.3   | 5.9       | 3.8         | 7.5      | 6.0 | 7.1             | 6.5      |
| c6  | Flow for every role.                              | Flow für jede Rolle.                                        | draft                   | 53.9 / 52.6     | 46.8 / 45.8    | 61.0 / 59.4   | 5.4       | 4.3         | 6.1      | 6.4 | 5.9             | 7.4      |
| i3  | Flow that stays with your people.                 | Flow, der bei euren Leuten bleibt.                          | independent draft       | 52.3 / 47.4     | 49.9 / 46.6    | 54.6 / 48.2   | 4.7       | 5.4         | 6.3      | 5.9 | 5.7             | 5.5      |

Pass 1 as the home headline, 13 pairs (noise 4.6 per reviewer, 1.6 on the panel mean):

| Key | EN                                                                                                | DE                                                                                                            | Origin                  | Overall EN / DE | Claude EN / DE | Codex EN / DE | Clear | Relevant | Credible | Distinctive | Fit with the hero | Language |
| --- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------- | --------------- | -------------- | ------------- | ----- | -------- | -------- | ----------- | ----------------- | -------- |
| h2  | Your teams have agents. Now your releases speed up too.                                           | Eure Teams haben Agenten. Jetzt werden auch eure Releases schneller.                                          | draft                   | 79.2 / 79.0     | 72.0 / 72.8    | 86.4 / 85.2   | 9.1   | 9.5      | 7.4      | 5.5         | 7.8               | 8.3      |
| q6  | Agents bring the speed. Flow needs teams in tune.                                                 | Agenten bringen das Tempo. Flow braucht eingespielte Teams.                                                   | control (current claim) | 77.8 / 79.2     | 77.0 / 77.1    | 78.6 / 81.3   | 7.1   | 7.8      | 8.4      | 7.6         | 9.6               | 8.5      |
| h3  | Your agents write the code. Your company learns to ship at their pace.                            | Eure Agenten schreiben den Code. Euer Unternehmen lernt, in ihrem Tempo zu liefern.                           | draft                   | 77.9 / 73.7     | 72.1 / 67.4    | 83.8 / 80.0   | 8.2   | 8.9      | 7.0      | 6.6         | 8.0               | 7.8      |
| j2  | Your agents already write code faster. Now your customers feel it.                                | Eure Agenten schreiben schon schneller Code. Jetzt merken das auch eure Kunden.                               | independent draft       | 74.7 / 72.8     | 71.0 / 68.5    | 78.4 / 77.2   | 8.0   | 8.8      | 6.8      | 6.1         | 7.0               | 8.1      |
| h4  | Your teams work with agents. Your customers notice it in every release.                           | Eure Teams arbeiten mit Agenten. Eure Kunden merken es an jedem Release.                                      | draft                   | 67.9 / 67.3     | 65.0 / 64.9    | 70.8 / 69.8   | 6.9   | 8.0      | 6.0      | 5.2         | 7.0               | 8.2      |
| h6  | Your company ships at agent speed, with teams in flow.                                            | Euer Unternehmen liefert im Tempo der Agenten, mit Teams im Flow.                                             | draft                   | 69.4 / 65.8     | 65.9 / 62.8    | 72.9 / 68.8   | 7.4   | 8.2      | 4.9      | 6.2         | 9.0               | 6.9      |
| j1  | Your company releases as fast as your agents code.                                                | Euer Unternehmen liefert so schnell aus, wie eure Agenten coden.                                              | independent draft       | 67.2 / 63.4     | 66.0 / 60.9    | 68.4 / 65.8   | 9.0   | 9.1      | 3.7      | 6.0         | 7.6               | 7.6      |
| h1  | Your company gets as fast as your agents.                                                         | Euer Unternehmen wird so schnell wie eure Agenten.                                                            | draft                   | 63.8 / 63.9     | 63.0 / 63.1    | 64.6 / 64.7   | 7.8   | 7.9      | 4.1      | 5.0         | 7.6               | 8.5      |
| h8  | Your agents are fast. Now your company gets fast with them.                                       | Eure Agenten sind schnell. Jetzt wird euer Unternehmen mit ihnen schnell.                                     | draft                   | 64.9 / 61.2     | 62.7 / 58.8    | 67.1 / 63.6   | 7.4   | 7.8      | 5.7      | 4.8         | 7.3               | 6.1      |
| h5  | Every role in your company at the speed of your agents.                                           | Jede Rolle in eurem Unternehmen im Tempo eurer Agenten.                                                       | draft                   | 57.4 / 55.3     | 59.4 / 57.6    | 55.3 / 53.1   | 6.1   | 6.7      | 4.1      | 6.1         | 8.5               | 5.9      |
| j3  | Your teams keep the speed they gain, and every change reaches your customers sooner and for less. | Eure Teams behalten das Tempo, das sie gewinnen, und jede Änderung ist früher und günstiger bei euren Kunden. | independent draft       | 58.5 / 52.4     | 56.2 / 49.8    | 60.8 / 55.1   | 6.8   | 9.2      | 5.3      | 4.8         | 4.4               | 5.9      |
| h7  | Your company learns the pace of its agents.                                                       | Euer Unternehmen lernt das Tempo seiner Agenten.                                                              | draft                   | 52.5 / 49.5     | 51.9 / 49.7    | 53.0 / 49.3   | 4.7   | 6.2      | 6.5      | 6.2         | 7.0               | 4.4      |
| ret | Your whole company unstoppable, in flow with agentic engineering.                                 | Euer ganzes Unternehmen unaufhaltsam, im Flow mit Agentic Engineering.                                        | control (retired claim) | 33.4 / 31.0     | 33.8 / 30.5    | 33.1 / 31.4   | 3.8   | 5.1      | 2.0      | 3.5         | 5.9               | 4.1      |

## A reviewer prompt, verbatim (pass 2, headline, CTO, Codex, run 1)

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. You bought coding agents for every team and are under board pressure to show what they changed. You have seen every consulting deck.

A company from Hamburg, hackers&wizards, trains and mentors engineering teams, product teams and their leaders in working with AI coding agents (agentic engineering). Its buyers are CTOs, CIOs and VPs of Engineering whose developers have coding agents while releases come no faster. It is choosing the headline of its homepage: the H1 over the hero, the first thing a buyer reads. The brand also has a separate claim, a short tagline that stands in the footer, on decks and on banners; the headline does its own job.

Each candidate stands as the H1 on the real homepage, unchanged otherwise: the lead sentence under it, the buttons, and beside it a visual of a tuning desk where five role sliders (Leadership, Product, Engineering, QA, DevOps) move from "ad hoc" to "team standard"; once they line up, the delivery waveform plays and the caption reads "in flow". The visual runs; each screenshot holds one frame with the sliders lined up.

Below are 12 candidates. Each has two images, scaled to 1000 px on the long side: the first screen on a 1440 px desktop, English above German; and the top of the page on a 375 px phone down to the visual, English left, German right. Look at every image (read each file), then score every headline on its own, for English and for German.

Criteria, each 0 to 10:
- clear: within seconds you understand what changes for your company
- relevant: it names a change you want for your company
- credible: you believe it; it promises nothing you would distrust
- distinctive: it could not stand just as well on a competitor's homepage
- fit_hero: it fits the hero around it, the lead sentence under it and the visual beside it
- language: idiomatic, natural English (for en) or natural spoken German (for de); not a translation, not stilted
Then overall, 0 to 100: how well this works as the homepage headline.

Candidates:
L01
  en: Your teams have agents. Now your releases speed up too.
  de: Eure Teams haben Agenten. Jetzt werden auch eure Releases schneller.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-h2-desktop.png, /private/tmp/claim-r7-0711/img/head-h2-phone.png
L02
  en: Your developers have agents. Now your releases get faster too.
  de: Eure Entwickler haben Agenten. Jetzt werden auch eure Releases schneller.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-k1-desktop.png, /private/tmp/claim-r7-0711/img/head-k1-phone.png
L03
  en: Your teams work with agents. Your customers notice it in every release.
  de: Eure Teams arbeiten mit Agenten. Eure Kunden merken es an jedem Release.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-h4-desktop.png, /private/tmp/claim-r7-0711/img/head-h4-phone.png
L04
  en: Your teams have agents. Once every role is in step, your releases speed up.
  de: Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden eure Releases schneller.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-k3-desktop.png, /private/tmp/claim-r7-0711/img/head-k3-phone.png
L05
  en: Your agents already write code faster. Now your customers feel it.
  de: Eure Agenten schreiben schon schneller Code. Jetzt merken das auch eure Kunden.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-j2-desktop.png, /private/tmp/claim-r7-0711/img/head-j2-phone.png
L06
  en: Your agents write the code. Your company learns to ship at their pace.
  de: Eure Agenten schreiben den Code. Euer Unternehmen lernt, in ihrem Tempo zu liefern.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-h3-desktop.png, /private/tmp/claim-r7-0711/img/head-h3-phone.png
L07
  en: Your company ships at agent speed, with teams in flow.
  de: Euer Unternehmen liefert im Tempo der Agenten, mit Teams im Flow.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-h6-desktop.png, /private/tmp/claim-r7-0711/img/head-h6-phone.png
L08
  en: Your teams have agents. Now get your releases out sooner.
  de: Eure Teams haben Agenten. Jetzt kommen eure Releases früher raus.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-k2-desktop.png, /private/tmp/claim-r7-0711/img/head-k2-phone.png
L09
  en: Your agents write code faster. Now your customers get it sooner.
  de: Eure Agenten schreiben schneller Code. Jetzt bekommen ihn eure Kunden auch früher.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-k5-desktop.png, /private/tmp/claim-r7-0711/img/head-k5-phone.png
L10
  en: Agents bring the speed. Flow needs teams in tune.
  de: Agenten bringen das Tempo. Flow braucht eingespielte Teams.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-q6-desktop.png, /private/tmp/claim-r7-0711/img/head-q6-phone.png
L11
  en: Your whole company unstoppable, in flow with agentic engineering.
  de: Euer ganzes Unternehmen unaufhaltsam, im Flow mit Agentic Engineering.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-ret-desktop.png, /private/tmp/claim-r7-0711/img/head-ret-phone.png
L12
  en: Your agents write the code. Your company learns to ship it sooner.
  de: Eure Agenten schreiben den Code. Euer Unternehmen lernt, ihn früher auszuliefern.
  images (desktop en over de, phone en beside de): /private/tmp/claim-r7-0711/img/head-k4-desktop.png, /private/tmp/claim-r7-0711/img/head-k4-phone.png

Answer with JSON only, no prose before or after, in this shape:
{"L01": {"en": {"clear": 0, "relevant": 0, "credible": 0, "distinctive": 0, "fit_hero": 0, "language": 0, "overall": 0, "below_max": "what keeps this from full marks, at most 20 words"}, "de": {...}}, ...}
covering every label from L01 to L12.
```

## Round 2: the line above the home H1, the claim on every surface, the page headlines

Benedikt, 07.11., on learning that with c3 the home page would carry no small claim line above the
H1: "das ist ungünstig ich denke da sollte wieder was stehen. bitte variationen erzeugen und
reviewen lassen. auch in der combination überschrift und claim und auch dort wo die banner benutzt
werden ob das da gut abschneidet. wir sollten das sauber und ganzheitlich betrachten und auswerten
und nicht isoliert." And: "was sagen die reviewer eigentlich zu den anderen headlines? da habe ich
noch gar nichts gesehen bisher"

### Sources on a line above the headline

Fetched 07.11.:

- "include a concise tagline on your homepage to communicate who you are and what you do"; "Your
  tagline should be immediately visible on your homepage" (Huei-Hsin Wang, Nielsen Norman Group,
  "Homepage Design: 5 Fundamental Principles", 15.03.2024).
- "Keep the header short and sweet." "Avoid lengthy copy and focus on the value you're offering"
  (Ben Holness, Articulate Marketing, "12 top tips for B2B tech homepages", undated).
- The searches for eyebrow practice turned up design-system pages and vendor blogs without data.
  They agree that an eyebrow is a short label for context (a category, an audience) and is
  redundant where the headline already carries it. None compares a hero with and without one.

So a short line that says who the company is or whom it serves is common practice. Whether it
should be the brand claim is open in these sources; this round measured it.

### Method

- Home: the website at commit 6823935c, copied to a scratch folder, pinned to brand v1.29.0, the
  H1 set to `headline` (k3), run with `astro dev` and shot in headless Chrome at 1440 x 900 and at
  375 px from the top to the tuning desk, English and German, the desk lined up. Variants set the
  line by script in the hero's own classes: the section eyebrow (`meta-line`) above or under the
  H1, the hero footer line's style at the foot of the copy or under the desk. The price in the
  assessment link is removed from every image, since this repository is public.
- Page headlines: the 35 lines the website then had under review (its item `work-ship-decided-page-headlines` now carries the decided set) as text, with c3 and
  k3 fixed above them. Then, for the four the reviewers would change most, the other
  candidates of that review and five new drafts of this round, each scored on its own.
- Personas: CIO of a retail group, CTO of a Mittelstand manufacturer, VP of Engineering at a
  scale-up, Chief Product Officer, Head of Engineering at an insurer, brand strategist for DACH B2B
  tech services. Claude (`claude -p --model opus`) and Codex (`gpt-6.1-sol`, high), two runs each,
  shuffled order and neutral labels per run, nothing marking a version as current or naming an
  author: 120 reviewer runs, the claim on the other surfaces included.
- Criteria, fixed before any score. Home: together, clear, distinctive, calm, language, overall.
  Page set: one company (0 to 10), and
  per headline fit, repeats and change. Alternatives: fit, clear, credible, language, overall.

### Result

The home hero tables are in the item `home-claim-line`; the page headlines were read again with each claim in Round 4.

- The claim in the home hero loses wherever it stands: 67.5 to 72.2 against 79.1 for nothing above the H1 in pass 1 (panel noise 0.2 to 2.1). c3 and k3 both say agents and teams ("together" 5.0 to 6.6).
- A line that is not the claim ties with nothing: in pass 2 "For CTOs and their teams" 77.6,
  nothing 78.6 (noise 1.4). Claude reviewers miss a buyer cue without a line; Codex reviewers miss
  nothing. Pass 2 found no hero above pass 1's leader: a plateau.
- German "Wenn alle Rollen zusammenspielen" reads better than "eingespielt sind" with both models
  in both passes (language 8.5 and 8.3 against 7.2 and 7.5); it runs the desktop H1 to six lines.
- The claim on the other surfaces, c3 and q6 included: see Round 3.
- The website's page headlines read as one company with c3 and k3 at 7.6 of 10. Three recommended
  lines repeat k3's opening or its arc for 22 to 24 of 24 reviewers: Trainings overview, Training
  Leaders, Software Factory. With Enablement they are the four to change; the item names the line
  that fits better for each, 76.8 to 81.6 against 59.3 to 72.5.

Skipped combinations: the trainer hub, os documents other than the one-pager.

### A reviewer prompt, verbatim (round 2, home pass 1, CTO, Codex, run 1)

The list of candidates is cut after the fourth of eight.

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. You bought coding agents for every team and are under board pressure to show what they changed. You have seen every consulting deck.

A company from Hamburg, hackers&wizards, trains and mentors engineering teams, product teams and their leaders in working with AI coding agents (agentic engineering). Its buyers are CTOs, CIOs and VPs of Engineering whose developers have coding agents while releases come no faster. German copy uses the informal plural (ihr). It is deciding what stands in the hero of its homepage around the H1. The H1 is the same in every candidate except where the candidate text says otherwise; the candidates differ in whether a short line stands near the H1, what it says and where it sits. The brand also uses a short claim on decks, banners and in the footer.

Each candidate is shown on the real homepage, unchanged otherwise: the lead sentence under the H1, the buttons, a link to an assessment, and beside it a visual of a tuning desk where five role sliders (Leadership, Product, Engineering, QA, DevOps) move from "ad hoc" to "team standard"; once they line up, the delivery waveform plays and the caption reads "in flow". Real display: a 1440 px desktop browser and a 375 px phone. Images are scaled to 1000 px on the long side. Look at every image (read each file), then score every candidate on its own, for English and for German.

Criteria, each 0 to 10:
- together: the short line (where there is one) and the H1 each do their own job, neither repeats the other, and the hero reads as one message; with no short line, judge whether the hero misses one
- clear: within seconds you understand who this company is and what changes for your company
- distinctive: it could not stand just as well on a competitor's homepage
- calm: visual and verbal calm, breathing room, the hero not cramped or busy
- language: idiomatic, natural English (for en) or natural spoken German (for de); not a translation, not stilted
Then overall, 0 to 100: how well this hero works as the first screen of the homepage.

Candidates:
H01
  H1: Your teams have agents. Once every role is in step, your releases speed up. / Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden eure Releases schneller.
  short line above the H1: Agents in the team. Teams in flow. / Agenten im Team. Teams im Flow.
  images (desktop English, desktop German, phone English left and German right): /private/tmp/claimline-0711/img/r-home-eyebrow-c3-desktop-en.png, /private/tmp/claimline-0711/img/r-home-eyebrow-c3-desktop-de.png, /private/tmp/claimline-0711/img/r-home-eyebrow-c3-phone.png
H02
  H1: Your teams have agents. Once every role is in step, your releases speed up. / Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden eure Releases schneller.
  short line above the H1: For CTOs, CIOs and engineering leaders / Für CTOs, CIOs und Engineering-Leitungen
  images (desktop English, desktop German, phone English left and German right): /private/tmp/claimline-0711/img/r-home-eyebrow-audience-desktop-en.png, /private/tmp/claimline-0711/img/r-home-eyebrow-audience-desktop-de.png, /private/tmp/claimline-0711/img/r-home-eyebrow-audience-phone.png
H03
  H1: Your teams have agents. Once every role is in step, your releases speed up. / Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden eure Releases schneller.
  short line under the tuning desk: Agents in the team. Teams in flow. / Agenten im Team. Teams im Flow.
  images (desktop English, desktop German, phone English left and German right): /private/tmp/claimline-0711/img/r-home-desk-c3-desktop-en.png, /private/tmp/claimline-0711/img/r-home-desk-c3-desktop-de.png, /private/tmp/claimline-0711/img/r-home-desk-c3-phone.png
H04
  H1: Your teams have agents. Once every role is in step, your releases speed up. / Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller.
  no short line
  images (desktop English, desktop German, phone English left and German right): /private/tmp/claimline-0711/img/r-home-none-z-desktop-en.png, /private/tmp/claimline-0711/img/r-home-none-z-desktop-de.png, /private/tmp/claimline-0711/img/r-home-none-z-phone.png
...
```

Review: large, because the claim and the home headline leave the company and stand on every surface.

## Round 3: a more distinctive claim

Benedikt, 07.11., on learning that the round 2 reviewers found c3 interchangeable with any AI
consultancy (relayed by Ada): "das ist nicht gut. dann sollten wir noch mal weitere varianten bauen
und bewerten damit wir da besser werden"

### What makes a claim distinctive

Fetched 07.11.:

- A tagline "can be merely serviceable (as opposed to strategic) when it's based in table stakes,
  not brand differentiation"; "Strong taglines communicate how you meet stakeholders' needs in a way
  no other partner can" (DeSantis Breindel, "B2B Taglines: The Hardest Working Words in Branding",
  17.06.2024, first published 28.08.2021 by Hannah Foltz).
- Screen a tagline for whether it is "too predictable or trite", whether competitors say the same,
  and whether it is "too abstract"; abstract taglines "often fail to resonate with anybody"; "Aim
  for a tagline that is two to five words long" (Joe Pope, Hinge, "Creating a Professional Services
  Tagline", 13.08.2024).

Both are agency texts without data. They agree on the test this round applies: distinctive means
measured against what the neighbours actually say.

### The neighbours

Claims and headlines read from each homepage's markup (title, meta description, H1) on 07.11. The reviewers saw one more German consultancy, which this public file does not name:

| Company        | Line                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| re:cinq        | "We Help Engineering Organisations Become AI Native"; title "AI Native Transformations"                    |
| Thoughtworks   | "AI that works." (og:title); H1 "Change the economics of how your business runs and grows"                 |
| INNOQ          | "We give technology a purpose." / "Wir geben Technologie einen Sinn."                                      |
| Equal Experts  | "A global network of technology innovators"; "Equal Experts isn't a traditional consultancy." (about page) |
| codecentric    | "KI-native Softwareentwicklung" (title)                                                                    |
| Slalom Germany | "Bringen Sie KI in den Flow." (H1)                                                                         |
| Globant        | "Our people and AI agents build together." (meta description)                                              |
| Endava         | "Transforming businesses with intelligence"; H1 "Technology is our how. And people are our why."           |
| DabApps        | "Building software people trust"; "Software development, with AI where it matters"                         |
| Zühlke         | "Machen Sie Ihre Technologieinvestitionen zum Wettbewerbsvorteil"                                          |

Two sit next to c3: Slalom's "in den Flow" and Globant's people and agents building together.
Reviewers named both, unprompted, as the reason c3 scored low on "distinctive".

### Candidates

34 pairs along four routes (the outcome for the client, the method, the stance against the market,
the audience or the name): 18 drafts of this run and 8 each from two fresh Claude models
(`claude -p --model opus`) that saw only a neutral brief: the offer and facts h&w can stand behind,
the neighbours above, and the rules (two to seven words, no figures, no hype words, no dash). They
saw no candidate, no current or retired line and no words of Benedikt's. Codex authored none: the
`delegation` skill keeps Codex to reviewing, so the brief's "from Claude and Codex" was applied to
the review only. c3 and q6 went in as unmarked controls. German in the ihr-form.

### Method

- Prefilter: the 36 lines as text with the neighbours listed, three personas (CTO, VP of
  Engineering, brand strategist), Claude and Codex, one run each. Criteria: distinctive (against the
  neighbours or any AI consultancy), clear, credible, calm, language, overall.
- Finalists: the strongest eight across routes (m12 dropped as a near twin of a7 and m01), with c3
  and q6, drawn on every surface: the seven claim banners by `applications/channel-banners/render.py`
  from a scratch copy with the claim swapped in (no accent word, the photo circle laid over where
  the renderer's comments measured it, YouTube cut to its desktop strip); the deck closing slide from
  the slides package's built print catalog with the claim line replaced (1920 x 1080); the header
  of the AE-LEAD one-pager without price (os) with its claim line replaced; the link preview from
  the website's `scripts/og/template.html` the way `generate.mjs` fills it; and the website, copied to
  a scratch folder, pinned to brand v1.29.0, H1 set to k3, run with `astro dev`: the claim as the
  eyebrow above the H1 at 1440 x 900 and at 375 px down to the tuning desk, and the footer at both
  widths. Plus the home page with nothing above the H1. English and German throughout. The price in
  the assessment link is removed from every image.
- Personas: as in round 2 (CIO, CTO, VP of Engineering, CPO, Head of Engineering, brand
  strategist). Claude and Codex, two runs each, shuffled order and neutral labels per run, nothing
  marking a claim as current or naming an author.
- Criteria, fixed before any score: distinctive, clear, fit with k3, calm, credible, language (0 to
  10); per surface 0 to 100 (banners, slide, one-pager, link preview, footer, above the H1); overall
  0 to 100. The empty slot above the H1 scored "home" on the same scale.
- Pass 2: the reviewers' reasons on the leader a6 fell into two causes, the German "heißt nicht
  schneller liefern" (clipped, language 6 to 7 with Claude) and a negation that names the problem but
  not h&w. Each got a fix (a6g, a6t), scored beside the unchanged a6, the four next claims, c3 and
  q6. a6t's first German draft, "Mehr Code ist noch kein schnelleres Release.", ran past the banner
  edge on LinkedIn, X and XING and was shortened before review.
- 54 reviewer runs: 6 in the prefilter, 24 in each pass.

### Result

- c3 is the least distinctive line of the finalists (4.2 against the neighbours) and repeats k3
  above the H1 (fit 4.3). It scores 66.4 overall in pass 2, ahead only of q6 (56.3).
- a6 leads both passes, 77.0 and 78.5 (panel noise 1.3 and 0.8), 12.1 ahead of c3 in pass 2 with
  Claude (74.5 against 61.1) and Codex (82.5 against 71.6), and ahead on every surface. It is the
  most credible line (9.1) and fits k3 (8.2).
- Above the H1, a6 ties with the empty slot for both models (80.9 against 79.8): the claim in the
  home hero works once it does not repeat k3. That changes the answer in `home-claim-line`.
- m01 ties with a6 (2.0 behind, its own noise 2.2) but repeats k3 above the H1 (73.2). b4 leads
  above the H1 and on the slide but says too little alone on banners and the link preview.
- Neither pass 2 fix beat a6: a6g's German scored lower (70.6 against 77.2), a6t lost calm and fit.
  A plateau, so no third pass. a6's German stays its weak point with Claude (72.5 against 76.5 for
  its English).

Per surface, pass 2, and the criteria: item `claim-round-3`. Images: `round3-linkedin-banners.jpg`
(the LinkedIn profile banner of all twelve claims), `round3-a6-*.jpg` and `round3-c3-*.jpg` (every
surface, English and German) in `2026-11-07-claim-and-headline/`; every claim's images in the item.

Skipped combinations: the trainer hub decks, os documents other than the one-pager, the banners on
a phone. The platform mocks were not checked against a fresh screenshot of each platform this
round; they use the renderer's measured crops.

Prefilter, text only (6 reviewer runs, one run each, so no noise measured). The a7 text here is
"Licenses"; the finalist uses "Licences", the website's spelling:

| Key | EN                                                     | DE                                                                | Origin                        | Overall | EN / DE     | Claude / Codex | Distinctive | Clear | Credible | Calm | Language |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------- | ------- | ----------- | -------------- | ----------- | ----- | -------- | ---- | -------- |
| m08 | Every agent needs a team.                              | Jeder Agent braucht ein Team.                                     | this run, stance              | 75.8    | 76.2 / 75.5 | 69.3 / 82.3    | 6.8         | 7.3   | 8.3      | 9.5  | 9.3      |
| b4  | Until you don't need us.                               | Bis ihr uns nicht mehr braucht.                                   | independent draft B, method   | 75.0    | 74.5 / 75.5 | 64.3 / 85.7    | 7.2         | 6.4   | 8.3      | 9.5  | 9.4      |
| a6  | More code isn't faster delivery.                       | Mehr Code heißt nicht schneller liefern.                          | independent draft A, stance   | 73.9    | 75.8 / 72.0 | 65.8 / 82.0    | 7.0         | 8.4   | 9.3      | 8.3  | 8.1      |
| m15 | Speed is a team skill.                                 | Tempo ist Teamarbeit.                                             | this run, stance              | 73.2    | 74.8 / 71.7 | 63.2 / 83.3    | 5.8         | 7.8   | 8.6      | 9.5  | 9.2      |
| m01 | You buy agents. You build teams.                       | Agenten kauft ihr. Teams baut ihr auf.                            | this run, stance              | 73.1    | 72.7 / 73.5 | 61.0 / 85.2    | 6.8         | 7.4   | 8.3      | 8.5  | 8.3      |
| a7  | Licenses are bought in a day. Practice isn't.          | Lizenzen kauft ihr an einem Tag. Praxis nicht.                    | independent draft A, stance   | 72.4    | 73.3 / 71.5 | 70.8 / 74.0    | 7.5         | 7.7   | 8.7      | 8.3  | 7.8      |
| a4  | Faster with agents. And still fast without us.         | Schneller mit Agenten. Auch wenn wir längst weg sind.             | independent draft A, outcome  | 72.3    | 72.8 / 71.8 | 57.5 / 87.2    | 7.6         | 7.7   | 7.7      | 7.7  | 7.8      |
| m12 | Tools are bought. Practice is built.                   | Tools kauft man. Praxis baut man auf.                             | this run, stance              | 71.7    | 74.7 / 68.7 | 67.7 / 75.7    | 6.5         | 7.2   | 9.3      | 9.5  | 7.4      |
| m02 | The agent is the easy part.                            | Der Agent ist der leichte Teil.                                   | this run, stance              | 71.6    | 76.0 / 67.2 | 67.2 / 76.0    | 7.3         | 6.8   | 8.2      | 8.8  | 8.2      |
| b1  | We train where you ship.                               | Wir trainieren da, wo ihr ausliefert.                             | independent draft B, method   | 71.2    | 74.5 / 67.8 | 61.7 / 80.7    | 7.2         | 7.4   | 8.5      | 9.0  | 7.7      |
| m16 | Agents in your code. Practitioners in your team.       | Agenten im Code. Praktiker im Team.                               | this run, method              | 71.0    | 70.8 / 71.2 | 65.7 / 76.3    | 6.7         | 7.5   | 8.5      | 8.5  | 8.1      |
| m17 | Engineering first. Agents second.                      | Erst Engineering. Dann Agenten.                                   | this run, stance              | 67.8    | 68.7 / 67.0 | 61.7 / 74.0    | 5.7         | 8.0   | 8.3      | 8.3  | 8.8      |
| m11 | Agents write fast. Teams ship fast.                    | Agenten schreiben schnell. Teams liefern schnell.                 | this run, outcome             | 67.2    | 67.8 / 66.5 | 57.3 / 77.0    | 5.7         | 8.0   | 6.5      | 8.2  | 8.4      |
| b5  | Less wizardry, more engineering.                       | Weniger Zauberei, mehr Engineering.                               | independent draft B, name     | 66.4    | 67.2 / 65.7 | 57.5 / 75.3    | 6.8         | 6.8   | 8.5      | 7.8  | 8.8      |
| a1  | Agents write the code. Your teams get it to customers. | Agenten schreiben den Code. Eure Teams bringen ihn zu den Kunden. | independent draft A, outcome  | 65.3    | 67.2 / 63.5 | 56.5 / 74.2    | 6.0         | 9.0   | 7.7      | 8.7  | 8.2      |
| b8  | Wizardry is a team sport.                              | Zaubern ist Teamsport.                                            | independent draft B, name     | 64.3    | 64.7 / 64.0 | 60.2 / 68.5    | 7.7         | 5.2   | 7.2      | 6.6  | 8.9      |
| b7  | The magic is in the practice.                          | Der Zauber steckt in der Übung.                                   | independent draft B, name     | 63.5    | 64.2 / 62.8 | 55.8 / 71.2    | 6.2         | 5.4   | 8.1      | 8.6  | 8.5      |
| m14 | From prompt to production, as a team.                  | Vom Prompt bis in Produktion, als Team.                           | this run, method              | 63.3    | 65.8 / 60.8 | 53.0 / 73.7    | 4.3         | 8.1   | 7.8      | 8.3  | 7.3      |
| m10 | Speed your customers feel.                             | Tempo, das eure Kunden spüren.                                    | this run, outcome             | 62.8    | 62.0 / 63.5 | 52.5 / 73.0    | 4.2         | 6.6   | 7.0      | 8.3  | 9.0      |
| m05 | See one. Do one. Teach one.                            | Zusehen. Mitmachen. Weitergeben.                                  | this run, method              | 62.1    | 60.2 / 64.0 | 59.7 / 64.5    | 5.2         | 5.9   | 8.3      | 9.2  | 9.2      |
| m03 | Less vibe. More engineering.                           | Weniger Vibe. Mehr Engineering.                                   | this run, stance              | 61.8    | 63.7 / 60.0 | 60.3 / 63.3    | 5.8         | 7.5   | 7.7      | 5.7  | 7.9      |
| a8  | Agents for the whole team, not just the developers.    | Agenten fürs ganze Team, nicht nur für die Entwicklung.           | independent draft A, audience | 61.7    | 62.5 / 60.8 | 50.0 / 73.3    | 5.7         | 8.4   | 8.2      | 8.2  | 7.8      |
| b6  | Your agents are ready. Is your team?                   | Eure Agenten sind bereit. Euer Team auch?                         | independent draft B, audience | 59.6    | 59.8 / 59.3 | 56.2 / 63.0    | 5.2         | 8.3   | 6.3      | 5.2  | 9.1      |
| c3  | Agents in the team. Teams in flow.                     | Agenten im Team. Teams im Flow.                                   | control (current claim)       | 59.1    | 59.8 / 58.3 | 46.2 / 72.0    | 3.8         | 7.0   | 7.0      | 7.7  | 7.6      |
| m18 | Built by teams. Sped up by agents.                     | Von Teams gebaut. Von Agenten beschleunigt.                       | this run, outcome             | 58.1    | 59.2 / 57.0 | 47.3 / 68.8    | 3.8         | 7.5   | 7.2      | 8.3  | 7.2      |
| m04 | Ship what your agents write.                           | Liefert, was eure Agenten schreiben.                              | this run, outcome             | 58.0    | 60.3 / 55.7 | 54.3 / 61.7    | 6.3         | 7.8   | 5.3      | 6.9  | 8.0      |
| q6  | Agents bring the speed. Flow needs teams in tune.      | Agenten bringen das Tempo. Flow braucht eingespielte Teams.       | control (retired)             | 56.0    | 54.5 / 57.5 | 43.3 / 68.7    | 4.8         | 7.1   | 6.8      | 7.5  | 6.9      |
| a3  | Every role in tune. Every release sooner.              | Alle Rollen eingespielt. Jedes Release früher.                    | independent draft A, outcome  | 55.3    | 55.7 / 55.0 | 50.7 / 60.0    | 5.0         | 7.2   | 4.8      | 6.9  | 7.2      |
| m06 | Every role, one rhythm.                                | Jede Rolle, ein Takt.                                             | this run, method              | 53.2    | 53.5 / 53.0 | 50.5 / 56.0    | 4.6         | 4.5   | 8.0      | 9.3  | 7.9      |
| m13 | For every role that builds the product.                | Für jede Rolle, die das Produkt baut.                             | this run, audience            | 51.8    | 53.3 / 50.2 | 43.7 / 59.8    | 4.2         | 5.2   | 8.8      | 9.3  | 7.2      |
| m09 | Agentic engineering, lived.                            | Agentic Engineering, gelebt.                                      | this run, method              | 49.9    | 49.5 / 50.3 | 40.2 / 59.7    | 3.8         | 5.9   | 7.0      | 7.8  | 5.3      |
| b3  | Agents need practice, not licences.                    | Agenten brauchen Übung, keine Lizenzen.                           | independent draft B, stance   | 49.8    | 50.3 / 49.3 | 60.0 / 39.7    | 6.7         | 5.7   | 4.8      | 7.2  | 7.9      |
| b2  | Every role at the table.                               | Jede Rolle mit am Tisch.                                          | independent draft B, audience | 49.2    | 49.0 / 49.3 | 44.3 / 54.0    | 3.5         | 4.7   | 8.8      | 9.3  | 8.4      |
| m07 | Make your team the wizards.                            | Macht euer Team zu Wizards.                                       | this run, name                | 48.9    | 53.2 / 44.7 | 44.7 / 53.2    | 7.1         | 5.2   | 5.4      | 4.8  | 5.9      |
| a2  | The speed of your agents, at your customers.           | Das Tempo eurer Agenten, bei euren Kunden.                        | independent draft A, outcome  | 44.9    | 44.0 / 45.8 | 42.7 / 47.2    | 5.8         | 5.0   | 6.0      | 7.5  | 4.3      |
| a5  | Vibe coding is the new technical debt.                 | Vibe Coding sind die neuen technischen Schulden.                  | independent draft A, stance   | 37.8    | 42.3 / 33.3 | 42.3 / 33.3    | 5.7         | 7.2   | 5.0      | 3.0  | 6.2      |

Pass 1, ten claims on every surface (noise 1.3 on the panel mean, 3.9 per reviewer):

| Key | EN                                                | DE                                                          | Origin                       | Overall | EN / DE     | Claude / Codex | Distinctive | Clear | Fit with k3 | Calm | Credible | Language |
| --- | ------------------------------------------------- | ----------------------------------------------------------- | ---------------------------- | ------- | ----------- | -------------- | ----------- | ----- | ----------- | ---- | -------- | -------- |
| a6  | More code isn't faster delivery.                  | Mehr Code heißt nicht schneller liefern.                    | independent draft A, stance  | 77.0    | 78.9 / 75.2 | 72.9 / 81.2    | 6.9         | 7.7   | 8.4         | 8.0  | 9.0      | 7.9      |
| m01 | You buy agents. You build teams.                  | Agenten kauft ihr. Teams baut ihr auf.                      | this run, stance             | 75.8    | 76.8 / 74.8 | 69.2 / 82.4    | 7.1         | 7.3   | 6.6         | 8.4  | 8.2      | 8.2      |
| b4  | Until you don't need us.                          | Bis ihr uns nicht mehr braucht.                             | independent draft B, method  | 75.5    | 75.0 / 76.1 | 72.1 / 79.0    | 7.2         | 5.1   | 9.3         | 9.0  | 8.3      | 9.2      |
| m08 | Every agent needs a team.                         | Jeder Agent braucht ein Team.                               | this run, stance             | 75.5    | 75.6 / 75.4 | 74.5 / 76.5    | 5.9         | 7.4   | 6.0         | 8.9  | 7.8      | 9.4      |
| m15 | Speed is a team skill.                            | Tempo ist Teamarbeit.                                       | this run, stance             | 74.8    | 75.2 / 74.3 | 73.3 / 76.2    | 4.9         | 7.3   | 5.0         | 9.3  | 8.4      | 9.1      |
| m02 | The agent is the easy part.                       | Der Agent ist der leichte Teil.                             | this run, stance             | 73.6    | 77.3 / 70.0 | 74.8 / 72.5    | 7.3         | 6.4   | 8.4         | 8.0  | 7.7      | 7.8      |
| a7  | Licenses are bought in a day. Practice isn't.     | Lizenzen kauft ihr an einem Tag. Praxis nicht.              | independent draft A, stance  | 71.3    | 71.9 / 70.8 | 67.6 / 75.0    | 7.4         | 7.4   | 8.3         | 7.0  | 8.4      | 7.4      |
| a4  | Faster with agents. And still fast without us.    | Schneller mit Agenten. Auch wenn wir längst weg sind.       | independent draft A, outcome | 66.5    | 68.2 / 64.8 | 54.9 / 78.1    | 6.9         | 7.2   | 6.0         | 6.3  | 6.5      | 7.4      |
| c3  | Agents in the team. Teams in flow.                | Agenten im Team. Teams im Flow.                             | control (current claim)      | 66.2    | 66.7 / 65.8 | 60.7 / 71.8    | 4.0         | 6.7   | 4.2         | 8.1  | 7.1      | 7.4      |
| q6  | Agents bring the speed. Flow needs teams in tune. | Agenten bringen das Tempo. Flow braucht eingespielte Teams. | control (retired)            | 56.9    | 57.7 / 56.1 | 51.0 / 62.8    | 4.5         | 6.9   | 2.6         | 5.8  | 6.0      | 6.6      |

Pass 1 per surface:

| Key | Banners | Slide | One-pager | Link preview | Footer | Above the H1 |
| --- | ------- | ----- | --------- | ------------ | ------ | ------------ |
| a6  | 76.8    | 79.0  | 78.0      | 77.8         | 75.8   | 80.8         |
| m01 | 78.7    | 79.5  | 76.5      | 79.1         | 77.8   | 72.9         |
| b4  | 69.6    | 82.6  | 77.0      | 68.0         | 78.7   | 83.5         |
| m08 | 79.7    | 78.4  | 77.6      | 76.9         | 79.6   | 73.0         |
| m15 | 79.7    | 82.3  | 78.0      | 80.5         | 79.8   | 70.5         |
| m02 | 74.9    | 74.7  | 75.2      | 74.5         | 72.8   | 78.5         |
| a7  | 70.4    | 68.5  | 71.4      | 67.6         | 70.5   | 74.2         |
| a4  | 67.7    | 69.5  | 66.1      | 67.6         | 69.2   | 63.7         |
| c3  | 73.6    | 73.3  | 70.4      | 73.4         | 72.6   | 62.9         |
| q6  | 61.2    | 62.2  | 58.0      | 61.0         | 61.2   | 49.4         |

Nothing above the H1 scored 80.1 in pass 1 and 79.8 in pass 2.

### A reviewer prompt, verbatim (round 3, pass 1, CTO, Codex, run 1)

The list of candidates is cut after the fourth of ten, and one neighbour line is cut where marked.

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. You bought coding agents for every team and are under board pressure to show what they changed. You have seen every consulting deck.

A company from Hamburg, hackers&wizards, trains and mentors engineering teams, product teams and their leaders in agentic engineering, working with AI coding agents as a team. Its buyers are CTOs, CIOs and VPs of Engineering in German-speaking Europe whose developers have coding agents while releases come no faster. German copy uses the informal plural (ihr). It is choosing its brand claim: the short tagline beside the company name wherever the brand appears. The homepage headline (H1) is fixed and stays the same in every candidate: "Your teams have agents. Once every role is in step, your releases speed up." / "Eure Teams haben Agenten. Wenn alle Rollen eingespielt sind, werden eure Releases schneller.".

These are the claims and headlines of the companies it is compared with:
- "We Help Engineering Organisations Become AI Native" / "AI Native Transformations" (re:cinq)
- "AI that works." / "Change the economics of how your business runs and grows" (Thoughtworks)
- "We give technology a purpose." / "Wir geben Technologie einen Sinn." (INNOQ)
- "A global network of technology innovators" / "Equal Experts isn't a traditional consultancy." (Equal Experts)
[one neighbour line cut here: its company name stays out of this public file]
- "KI-native Softwareentwicklung" (codecentric)
- "Bringen Sie KI in den Flow." (Slalom Germany)
- "Our people and AI agents build together." (Globant)
- "Transforming businesses with intelligence" / "Technology is our how. And people are our why." (Endava)
- "Building software people trust" / "Software development, with AI where it matters" (DabApps)
- "Machen Sie Ihre Technologieinvestitionen zum Wettbewerbsvorteil" (Zühlke)

Each candidate claim is shown on every surface it reaches, everything else unchanged. Per candidate and language three images, scaled to 1000 px on the long side:
1. banners: the social profile banners as each platform shows them, grey circles marking where the platform's profile photo covers the banner. Row 1: LinkedIn profile banner (1584 x 396), X header (1500 x 500). Row 2: XING cover, Facebook profile cover. Row 3: Sessionize cover, Brella event cover. Row 4: the strip of the YouTube channel banner every device shows.
2. brand surfaces: the closing slide of a talk deck (1920 x 1080, the claim under the speakers), the header of a training one-pager (the claim as the small line above the title, A4) and the link preview card a shared link shows (1200 x 630).
3. website: the homepage first screen on a 1440 px desktop with the claim as a small line above the H1, the same on a 375 px phone down to the visual, and the website footer (desktop, and the phone footer below it) with the claim under the logo.
Real display: the banners on LinkedIn, X, XING, Facebook, Sessionize, Brella and YouTube on desktop and phone; the slide projected; the one-pager printed or as PDF; the website in a desktop browser and on a phone.

Look at every image (read each file), then score every candidate on its own, for English and for German.

Criteria, each 0 to 10:
- distinctive: it could not stand just as well beside one of the companies above or any AI consultancy
- clear: you get what the company stands for within seconds
- fit_k3: on the homepage, the claim line and the fixed H1 each do their own job and do not repeat each other
- calm: confident without shouting, no hype, no gimmick; visually calm, breathing room, not cramped
- credible: you believe it; it promises nothing you would distrust
- language: idiomatic, natural English (for en) or natural spoken German (for de); not a translation, not stilted
Per surface, 0 to 100, how well the claim works there: banners, slide, onepager, og (the link preview), footer, home (the line above the H1).
Then overall, 0 to 100: how well this works as the company's claim across all surfaces.

Finally, the homepage without any line above the H1 (images /private/tmp/claim3-0711/r1/sheets/none-en-web.png and /private/tmp/claim3-0711/r1/sheets/none-de-web.png): score "home" 0 to 100 for English and German the same way, so it compares with each candidate's home score.

Candidates:
L01
  en: Faster with agents. And still fast without us.
  de: Schneller mit Agenten. Auch wenn wir längst weg sind.
  images (English banners, brand surfaces, website; then the same in German): /private/tmp/claim3-0711/r1/sheets/a4-en-banners.png, /private/tmp/claim3-0711/r1/sheets/a4-en-brand.png, /private/tmp/claim3-0711/r1/sheets/a4-en-web.png, /private/tmp/claim3-0711/r1/sheets/a4-de-banners.png, /private/tmp/claim3-0711/r1/sheets/a4-de-brand.png, /private/tmp/claim3-0711/r1/sheets/a4-de-web.png
L02
  en: More code isn't faster delivery.
  de: Mehr Code heißt nicht schneller liefern.
  images (English banners, brand surfaces, website; then the same in German): /private/tmp/claim3-0711/r1/sheets/a6-en-banners.png, /private/tmp/claim3-0711/r1/sheets/a6-en-brand.png, /private/tmp/claim3-0711/r1/sheets/a6-en-web.png, /private/tmp/claim3-0711/r1/sheets/a6-de-banners.png, /private/tmp/claim3-0711/r1/sheets/a6-de-brand.png, /private/tmp/claim3-0711/r1/sheets/a6-de-web.png
L03
  en: Every agent needs a team.
  de: Jeder Agent braucht ein Team.
  images (English banners, brand surfaces, website; then the same in German): /private/tmp/claim3-0711/r1/sheets/m08-en-banners.png, /private/tmp/claim3-0711/r1/sheets/m08-en-brand.png, /private/tmp/claim3-0711/r1/sheets/m08-en-web.png, /private/tmp/claim3-0711/r1/sheets/m08-de-banners.png, /private/tmp/claim3-0711/r1/sheets/m08-de-brand.png, /private/tmp/claim3-0711/r1/sheets/m08-de-web.png
L04
  en: Speed is a team skill.
  de: Tempo ist Teamarbeit.
  images (English banners, brand surfaces, website; then the same in German): /private/tmp/claim3-0711/r1/sheets/m15-en-banners.png, /private/tmp/claim3-0711/r1/sheets/m15-en-brand.png, /private/tmp/claim3-0711/r1/sheets/m15-en-web.png, /private/tmp/claim3-0711/r1/sheets/m15-de-banners.png, /private/tmp/claim3-0711/r1/sheets/m15-de-brand.png, /private/tmp/claim3-0711/r1/sheets/m15-de-web.png
...
```

Review: large, because the claim stands on every surface and leaves the company.

## Round 4: the page headlines with each claim

Benedikt, 07.11., on the website's page headlines (item `work-ship-decided-page-headlines`): "alle bitte anhand deiner
recommendation aber denk dran auch noch den test mit claim und home headline und allen Bannern
abzuwarten so das alles zusammen passt. ich folge dann überall deinen Empfehlungen"

The website's recommended page headlines fit a6 and c3 equally: as a set, 77.5 with a6 (noise 2.9)
and 77.8 with c3 (noise 1.2). Six lines change with either claim, one line depends on the claim:
Blog's English "What faster code generation does to your delivery, with sources." repeats a6 for
24 of 24 reviewers (with c3, 10 of 24 find it echoes k3), so with a6 it becomes "What agents change in your releases,
and what the research shows." The final set per claim is in the website item
`work-ship-decided-page-headlines`; every score and the three flags are in the git history its evidence names.

### Method

- Website at commit e370f70b in a scratch folder, run with `astro dev`: the claim set in the
  footer and the home link preview, the home H1 k3 (German with "zusammenspielen"), and the line
  above the H1 that `home-claim-line` recommends for each claim: a6 itself, or "For CTOs and their
  teams" with c3. Each of the 35 pages with its recommended H1, English and German, at 1440 x 900
  and 375 x 812, in headless Chrome. Prices are hidden in every image.
- Pass 1, one claim per reviewer run: the home hero, footer and link preview, the 35 first screens
  four to an image at 1440 px and three to an image at 375 px, every headline also as text. Beside
  it, candidates for the three flags raised in round 2 (the second case page's quote, procurement
  as a label, "KI-Agenten" against "Agenten"), and two of Benedikt's three anchor headlines with the
  lines that replace them; pass 2 carried all three.
- Pass 2, for the pages pass 1 flagged (at least half the panel would change the line, or it
  repeats the claim for nearly every reviewer; Trainings by tool and the Assessment qualified and
  got none, since the Copilot and Pilot changes remove what they shared): three or four candidates each in its page hero at
  1440 px, the current line and one line from an independent drafter (a fresh
  `claude -p --model opus` that saw the page, its lead and the rules, never the current line)
  among them.
- Personas as in round 3. Claude (`claude -p --model opus`) and Codex (`gpt-6.1-sol`, high), two
  runs each, per claim: 48 reviewer runs per pass, 96 in all, each in its own shuffled order under neutral labels,
  with nothing marking a line as current.
- Criteria, fixed before any score: voice (one voice with the claim and k3), clear, no repetition
  (of the claim, k3 or another page), language, 0 to 10; overall 0 to 100 for the set and each
  candidate. Two Claude runs scored the set criteria 0 to 100; they were divided by 10.

### Result

- The set (a6 / c3): one voice 8.1 / 8.1, clear 8.0 / 7.9, no repetition 6.7 / 6.9, language
  7.8 / 7.8. Claude scores it 74.2 / 73.4, Codex 80.8 / 82.2.
- The six changed lines, each ahead of the line it replaces outside the noise with both models: the Copilot training (it
  and the trainings-by-tool page said the same), Enablement, Factory Pilot ("Auslieferung" reads
  as logistics), Knowledge base, the DIY retailer case and Procurement and legal. The podcast keeps
  its current line, one of Benedikt's anchors: Claude prefers it over the replacement the website
  item had recommended by more than the noise with each claim, while Codex prefers the replacement
  in pass 1.
- "KI-Agenten" on German pages (a6 / c3, noise in brackets): as recommended 80.8 (3.0) / 80.1
  (1.8), "Agenten" throughout 80.6 (2.5) / 81.5 (1.1), German following the English 79.9 (0.8) /
  79.6 (0.6). A tie, so the lines stay as they are.
- The second case page's quote: no alternative leads outside the noise. The reviewers' objection
  (adoption, not delivery) needs a delivery fact the case does not have.
- Benedikt's three anchors (a6 / c3): "Your whole team works with AI agents, all the same way."
  69.4 / 69.4, "Your next engineering decision, from people who already made it." 83.2 / 79.3, "Go
  to your board with evidence: what limits you first, and what comes next." 83.5 / 82.7. No line
  reached the 90 the website's copy rule asks for. Pass 2 stopped on a plateau, and the best lines
  it reached are recommended.

Skipped combinations: the banners, the closing slide and the one-pager with the page headlines
(round 3 scored the claim there); the pass-2 candidates at 375 px; a second set score after pass 2.

### A reviewer prompt, verbatim (round 4, pass 1, a6, CTO, Codex, run 1)

The page list is cut after the third page, and the alternatives and wording versions are cut
where marked. The image paths point to the run's scratch folder.

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. You bought coding agents for every team and are under board pressure to show what they changed. You have seen every consulting deck.

A company from Hamburg, hackers&wizards, trains and mentors engineering teams, product teams and their leaders in agentic engineering, working with AI coding agents as a team, and helps companies build Software Factories. Its buyers are CTOs, CIOs and VPs of Engineering in German-speaking Europe whose developers have coding agents while releases come no faster. German copy uses the informal plural (ihr). It is checking whether the H1 headlines of its website pages, English and German, read as one voice with its brand claim and its homepage headline.

The brand claim, the short tagline beside the company name: "More code isn't faster delivery." / "Mehr Code heißt nicht schneller liefern.". It stands in the website footer under the logo and on the link preview card a shared link of the homepage shows.
The homepage headline (H1): "Your teams have agents. Once every role is in step, your releases speed up." / "Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller.". In the homepage hero the claim stands as the small line above the H1.

Real display: a 1440 px desktop browser and a 375 px phone; the link preview in a chat or social feed. Images are scaled to 1000 px on the long side. Look at every image (read each file):
- /private/tmp/hlclaim-0711/review/a6/home-desktop.jpg: the homepage first screen, 1440 px, English above German
- /private/tmp/hlclaim-0711/review/a6/home-phone.jpg: the homepage on a 375 px phone down to the visual, English left, German right
- /private/tmp/hlclaim-0711/review/a6/footer-desktop.jpg, /private/tmp/hlclaim-0711/review/a6/footer-phone.jpg: the website footer, desktop and phone, English and German
- /private/tmp/hlclaim-0711/review/a6/og-home.jpg: the link preview card of the homepage, English above German
- the first screen of every page below with its H1, 1440 px, four pages per image, each labelled: /private/tmp/hlclaim-0711/review/a6/pages-desktop-de-07.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-en-09.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-en-03.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-en-02.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-de-02.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-de-06.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-en-07.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-en-06.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-de-05.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-en-08.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-en-01.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-en-05.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-en-04.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-de-09.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-de-01.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-de-03.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-de-04.jpg, /private/tmp/hlclaim-0711/review/a6/pages-desktop-de-08.jpg
- the same pages on a 375 px phone, three pages per image, English row above German row, each labelled: /private/tmp/hlclaim-0711/review/a6/pages-phone-09.jpg, /private/tmp/hlclaim-0711/review/a6/pages-phone-05.jpg, /private/tmp/hlclaim-0711/review/a6/pages-phone-12.jpg, /private/tmp/hlclaim-0711/review/a6/pages-phone-01.jpg, /private/tmp/hlclaim-0711/review/a6/pages-phone-07.jpg, /private/tmp/hlclaim-0711/review/a6/pages-phone-11.jpg, /private/tmp/hlclaim-0711/review/a6/pages-phone-06.jpg, /private/tmp/hlclaim-0711/review/a6/pages-phone-04.jpg, /private/tmp/hlclaim-0711/review/a6/pages-phone-08.jpg, /private/tmp/hlclaim-0711/review/a6/pages-phone-10.jpg, /private/tmp/hlclaim-0711/review/a6/pages-phone-02.jpg, /private/tmp/hlclaim-0711/review/a6/pages-phone-03.jpg

The pages and their H1, in English and German:
P04 (podcast)
  en: Conversations with the people building software factories today.
  de: Gespräche mit den Leuten, die heute Software Factories bauen.
P30 (training in Cursor)
  en: Your team runs Cursor's agent in a mode your security team allows.
  de: Euer Team nutzt den Agenten von Cursor in einem Modus, den eure Security erlaubt.
P18 (index of seven trainings)
  en: Find the training for each role on your team, from developers to leaders.
  de: Findet die Schulung für jede Rolle in eurem Team, von Entwicklung bis Führung.
[cut here: the other 32 pages]

[cut here: the alternatives for four pages and the three wording versions, each with its images]

Criteria, each 0 to 10:
- voice: it reads as the same company as the claim and the homepage headline, one voice
- clear: within seconds you understand what changes for your company or team
- no_repetition: it does not repeat the claim, the homepage headline or another page's headline (10 = repeats nothing)
- language: idiomatic, natural English (for en) or natural spoken German (for de); not a translation, not stilted
For the whole set of pages: one_voice instead of voice, and overall 0 to 100: how well the site's headlines work together with the claim and the homepage headline. For each alternative and each wording version: overall 0 to 100.

Answer with JSON only, no prose before or after, in this shape:
{"set": {"en": {"one_voice": 0, "clear": 0, "no_repetition": 0, "language": 0, "overall": 0, "below_max": "what keeps the set from full marks, at most 25 words"}, "de": {...}}, "pages": {"P01": {"en": {"voice": 0, "clear": 0, "no_repetition": 0, "language": 0, "repeats": "what it repeats, or empty", "change": false, "why": "if change, at most 15 words"}, "de": {...}}, ...}, "alternatives": {"G1-A": {"en": {"voice": 0, "clear": 0, "no_repetition": 0, "language": 0, "overall": 0, "below_max": "at most 15 words"}, "de": {...}}, ...}, "wording": {"V1": {"en": {"voice": 0, "clear": 0, "no_repetition": 0, "language": 0, "overall": 0, "below_max": "at most 15 words"}, "de": {...}}, ...}}
covering every page P01 to P35, every alternative label and V1 to V3.
```

Review: large, because the headlines of every page change in one decision and stand beside the
claim.

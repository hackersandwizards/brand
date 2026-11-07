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

A second round on 07.11. tested what stands above the home H1 with c3 and k3, the claim on every
other surface, and the page headlines with both. Its result is in "Round 2" below and in the
decision item `home-claim-line`.

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
- Surfaces: the seven claim banners drawn by `applications/channel-banners/render.py` from a
  scratch copy of `verbal.json` with c3 and with q6 (three of the c3 files compared byte for byte match the shipped ones), the photo circle laid over where the renderer's comments measured it (X, XING, Facebook)
  and YouTube cut to its desktop strip; the deck closing slide from the slides package's built
  print catalog; the header of the AE-LEAD one-pager (os, the version without price); the website
  footer at 1440 and 375 px; and the link preview from the website's `scripts/og/generate.mjs`.
  The mocks were not checked against a fresh screenshot of each platform this round.
- Page headlines: the 35 lines of the website item `decide-page-headlines` as text, with c3 and
  k3 fixed above them. Then, for the four the reviewers would change most, the website item's
  other candidates and five new drafts of this round, each scored on its own.
- Personas: CIO of a retail group, CTO of a Mittelstand manufacturer, VP of Engineering at a
  scale-up, Chief Product Officer, Head of Engineering at an insurer, brand strategist for DACH B2B
  tech services. Claude (`claude -p --model opus`) and Codex (`gpt-6.1-sol`, high), two runs each,
  shuffled order and neutral labels per run, nothing marking a version as current or naming an
  author: 120 reviewer runs.
- Criteria, fixed before any score. Home: together, clear, distinctive, calm, language, overall.
  Surfaces: fit, clear, distinctive, calm, language, overall. Page set: one company (0 to 10), and
  per headline fit, repeats and change. Alternatives: fit, clear, credible, language, overall.

### Result

The tables are in the item `home-claim-line`.

- The claim in the home hero loses wherever it stands: 67.5 to 72.2 against 79.1 for nothing above
  the H1 (panel noise 0.2 to 2.1). c3 and k3 both say agents and teams ("together" 5.0 to 6.6).
- A line that is not the claim ties with nothing: in pass 2 "For CTOs and their teams" 77.6,
  nothing 78.6 (noise 1.4). Claude reviewers miss a buyer cue without a line; Codex reviewers miss
  nothing. Pass 2 found no hero above pass 1's leader: a plateau.
- German "Wenn alle Rollen zusammenspielen" reads better than "eingespielt sind" with both models
  in both passes (language 8.5 and 8.3 against 7.2 and 7.5); it runs the desktop H1 to six lines.
- On the other eleven surfaces q6 scores 73.5 and c3 71.2 on the panel mean. Only Claude carries
  that lead; Codex ties and prefers c3 on six surfaces. c3 is calmer, reads better on the banners and says less (distinctive 4.7 against 6.2). The images, c3 and q6 per surface, are in `2026-11-07-claim-and-headline/`.
- The website's page headlines read as one company with c3 and k3 at 7.6 of 10. Three recommended
  lines repeat k3's opening or its arc for 22 to 24 of 24 reviewers: Trainings overview, Training
  Leaders, Software Factory. With Enablement they are the four to change; the item names the line
  that fits better for each, 76.8 to 81.6 against 59.3 to 72.5.

Skipped combinations: the LinkedIn company cover, the featured link and the OMR cover (they carry no
claim), the claim banners on a phone, the trainer hub, os documents other than the one-pager.

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

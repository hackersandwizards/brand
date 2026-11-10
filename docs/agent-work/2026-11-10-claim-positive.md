# The client's change first: more claims and headlines, 10.11.2026

No. No line beats both anchors on the reader's path and on the new criterion without losing the panel. The decision stays with Benedikt in `decide-claim-amdahl`, with keeping tpe-tune recommended and three lines of this round as further options.

Keys used below: tpe is tpe-tune, the decided claim "Agents pay off when your people are in tune."; x4 is "Agents speed up code. Your handoffs set the pace."; dh is the decided headline "Your teams have agents. Once all roles are in tune, your releases speed up.".

The closest is a two-beat line: "Your developers got faster. Your releases are next." / "Eure Entwickler sind schneller geworden. Jetzt ziehen eure Releases nach." (e5x).

- The new criterion, the client's change leading the line: 8.8 of 10 on the panel against 5.2 for tpe-tune and 5.4 for x4, ahead in every model and run cell.
- The reader's path: it and its earlier wordings stand 4.9 to 19.9 points ahead of tpe-tune in every cell of three rounds. Against x4 the line leads in every cell of round 1 (3.6 to 5.9) and not in every cell of rounds 2 and 3 (79.3 against 78.5 in round 3), a tie by the rule.
- The panel: it loses to x4. The first wording (e5) trailed x4 by about 6 points in every cell of round 1, and tpe-tune by 6.4 and 6.5 with Codex. The final pair's own numbers come from round 2, where four wordings of the line stood in one prompt: English 73.1 against 76.8 for x4 and 70.5 for tpe-tune, German 65.5 against 76.7 and 75.2. The pair alone beside the anchors was not scored. Reviewers miss the agents and what the gain depends on (core 4.6, together 2.6 of 10).

The line that holds the panel on average is "Faster releases with agents, when your people are in tune." / "Schnellere Releases mit KI-Agenten, wenn eure Leute eingespielt sind." (r1): 9.2 on the criterion, panel 76.4 between tpe-tune (74.8) and x4 (77.5) in round 1. The models split on it. Codex puts it 4.7 to 5.3 ahead of both anchors, Claude 0.7 to 10.1 behind, and on the path it trails x4 with Claude by 7.8 and 11.2.

A headline with the gain first, "Faster releases with the agents your teams already have. Once all roles are in tune." / "Schnellere Releases mit den Agenten, die eure Teams schon haben. Sobald alle Rollen zusammenspielen." (hb), scores 9.4 to 9.8 on the criterion against 2.9 to 3.2 for the decided headline. It leads the decided headline outside the noise in two of three hero rounds and ties it in the third, and on the path Claude scores every pair lower with it and Codex higher. By the rule it does not win.

What the round shows: tpe-tune and x4 earn their panel scores with the condition they state (people in tune) or the diagnosis (handoffs set the pace). A line that drops both and leads with the gain wins the criterion and the path against tpe-tune, and loses the panel. A line that keeps the condition behind the gain reads generic to Claude ("sounds like a generic vendor promise"). None of the 49 claim pairs scored got out of that trade. If the gain is to lead somewhere, the headline is where it costs least; that is my judgement, apart from the rule, and it stands with the top five below.

## The rule, fixed before the first reviewer run

The rule file was written at 12:03 CET, one minute before the first reviewer run. Its header carries a wrong clock time, kept as written.

```text
Decision rule and budget, fixed 10.11.2026 12:40 CET, before any reviewer run of this round.

The new criterion (his, worded from the research), scored apart from overall in every prompt:
  gain_first, 0 to 10: the first thing the line makes you see is what gets better for the client company and its people, ahead of the provider's service and ahead of the problem.
  gain: one clause naming what the line says gets better for the client; "nothing" is an answer.

Claims. A new line is recommended over the anchors tpe and x4 only if all of these hold, each read against the anchors scored in the same round:
 1 Criterion: its gain_first leads both anchors on the panel and on the path, outside the noise (the larger run gap of the two lines compared), in both runs and with both models. A line that trails either anchor on gain_first is not recommended, whatever its other scores.
 2 Path: with the decided headline it leads both tpe and x4 on the path overall, outside the noise, in both runs and with both models.
 3 Panel: it does not trail either anchor on the panel overall beyond the noise, in any of the four model and run cells.
 4 German: its German panel overall is within its own noise of its English, or ahead.
 5 Cold read: at least 24 of 32 readings (banner alone and with the descriptor, both languages) name people and a result for the company.
 A lead inside the noise is a tie. If no line passes 1 to 5 the answer to the report's first question is no, the recommendation in the item stays the line that changes nothing, and the best new lines enter the item as options with what they cost.
Headlines. A headline candidate wins over the decided headline only if it leads on the hero overall (what it says) outside the noise in both runs and with both models, does not trail on gain_first, holds in German (German cells lead or tie, no German loss on the path), and its German runs at most as many lines at 1440 px as the decided headline. Layout is reported apart and decides nothing.
Sanity: in the text screen the two planted lines that must miss (one whose subject is the problem, one whose subject is the provider's service) land below the planted line that must hit on gain_first with both models; else the criterion measures nothing and is reworded before the panel. x4 must lead tpe on the path as on 10.11.; else the path is suspect.
Finalists for the panel are picked by gain_first first (above both anchors with both models), screen overall second.
Stop: a route whose best line does not move in two rounds is dropped.

Budget, at most 350 reviewer runs:
 screen 1: claims 12 (two halves x 3 personas x 2 models), headlines 6
 screen 2 (refined lines): 6
 panel: 40 per round, 2 rounds at most
 path: 32 per round, 2 rounds at most
 hero: 12 per round, 2 rounds at most, a German-only round of 12 if a headline leads
 cold reads: 32 per finalist, 2 finalists at most; anchors 16 each; control f6 8
 classifiers: 3 passes each
Reviewers: claude -p --model claude-opus-5-5 --effort medium; codex exec -m gpt-6.1-sol, reasoning high. Six at a time.
```

## What the earlier research says, and what this run fetched

"Jeffrey Perlman" needs no guess. h&w's own records name him: the former CMO of Zumba and later Chief Strategy Officer of Mindvalley, author of its program "Building an Unstoppable Brand". The claim research of 19.09.2026 in Company OS (`src/content/documents/marketing/claim-research-2026-09.md`) reads his interviews beside Daniel Priestley's and the positioning literature, and Benedikt named him again on 07.11. (`2026-11-07-claim-and-headline.md`). The brief's premise that no such author is known was wrong.

What stays open is narrower: no fetched source has Perlman stating a rule for headlines. The 07.11. report found the word "headline" in none of his eight interviews, and this run's captions agree. What he does give is his slogans and his brand hero, and each names the customer's new state.

The passage this round builds on is the summary of that September research, in its own words: "Taken together, a B2B claim next to an unclear company name has to: say what we do or name the category (B1, B3, B4); name the client's result, not the product (B3, B7, B8); rest on an insight that makes our value obvious (B2, and JP6); stay concrete rather than figurative (B3, B4); be distinctive and repeated unchanged (B5), with the proof in the copy under it (B6, DP4)". The business foundation says the same for all copy: "Then name the outcome for the client, not output: the speed the teams gain reaches the customers, it shows in less lead time from idea to first users and a lower cost per shipped change".

Every quotation below was fetched on 10.11.2026 and copied from the page or file named. `[caption]` marks YouTube's automatic captions, which are machine speech.

**The customer's new state leads (Perlman).**

- "2006 we created the slogan for Zumba was ditch the workout join the party" [caption] (Jeffrey Perlman, Mindvalley talk, https://www.youtube.com/watch?v=F7GzV75HFB0, 0:10:09).
- "Airbnb their slogan is belong anywhere. The the mission of the the company is to create a world where everybody belongs anywhere." [caption] (interview, https://www.youtube.com/watch?v=kwfwGv-jvXs, 0:13:21).
- "brand hero is the identity that your customers will aspire to be" [caption] (program trailer, https://www.youtube.com/watch?v=sLz6E5QjQeY, 0:02:04).
- His limit on speed as the lead benefit: functional brands sit "in a very crowded space on a race to the bottom competing on price, speed, quality" [caption] (kwfwGv-jvXs, 0:33:35).
- "A brand promise is what you resolve for your customer at the functional level, better than anybody else." (Mindvalley blog, "How to Write a Brand Promise", https://blog.mindvalley.com/brand-promise/).

**The buyer has to see what improves (Priestley).**

- "Before people buy your products and services, they need to see what area of their life is going to improve as a result. Once they understand what your products and services improve, they want to know where they currently rank and how far forward they could move the score by working with you." (Daniel Priestley with Glen Carlson, "Scorecard Marketing", revised edition, p. 46, https://cdn.scoreapp.com/assets/book/Scorecard_Marketing_by_Daniel_Priestley_2nd_edition.pdf). He says it of the headlines he lists just before: "When you read these headlines, part of your brain lights up and wants to know the answer."
- His limit: the category comes plain. "same should be boring same should be universally understood" [caption] (https://www.youtube.com/watch?v=Y96oPmA-b9c, 0:02:03), from his framework "Name, Same, Fame, Aim, and Game" (X post of 08.03.2025, read through `api.fxtwitter.com`).
- A search for a headline formula of his ("Are you ready to ...") found the scorecard titles above and no formula he states, so none is attributed to him.

**The customer is the hero, and the line ends on their success (Donald Miller, StoryBrand).**

- "they are the hero who has a problem we are the guide helping them win the day" [caption] (https://www.youtube.com/watch?v=YFDJYdMd1wU, 0:02:19).
- The third part of his one-liner is "the successful ending to their story" [caption] (https://www.youtube.com/watch?v=HFergI0UOAs, 0:04:04).
- His limit: "your tagline can be more elusive if the name of your business is clear if the the name of your business is elusive then your tagline needs to be clear" [caption] (https://www.youtube.com/watch?v=RIekCKk5wwM, 0:01:28). "hackers&wizards" does not say what the company does.

**The standard works.**

- Claude C. Hopkins, "Scientific Advertising" (1923; an OCR upload at https://archive.org/details/scientific-advertising, which misspells "cite"): "The purpose of a headline is to pick out people you can interest." and "The best ads ask no one to buy. [...] The ads are based entirely on service. [...] They site advantages to users."
- Samuel Hulick: "People don't buy products; they buy better versions of themselves." (UserOnboard, "Features vs. Benefits", https://www.useronboard.com/features-vs-benefits/).
- Clayton Christensen: "when faced with a job that needs doing, they essentially "hire" a product to do that job" (Harvard Business School Working Knowledge, "Clay Christensen's Milkshake Marketing", 14.02.2011, https://www.library.hbs.edu/working-knowledge/clay-christensens-milkshake-marketing).
- Research on slogans: "the liking for a slogan may be unrelated to media expenditure, and driven largely by the clarity of the message, the exposition of the benefits, rhymes, and creativity" (Dass, Kohli, Kumar and Thomas, "A study of the antecedents of slogan liking", Journal of Business Research 67(12), 2014, abstract at https://ideas.repec.org/a/eee/jbrese/v67y2014i12p2504-2511.html).

**The limits.**

- Jakob Nielsen: "A website's tagline must explain what the company does and what makes it unique among competitors." His two tests: "Would it work just as well for competitors? Would any company ever claim the opposite?" (Nielsen Norman Group, "Tagline Blues: What's the Site About?", 21.07.2001, https://www.nngroup.com/articles/tagline-blues-whats-the-site-about/).
- April Dunford: "Positioning is not equivalent to messaging. It isn't a tagline." ("A Quickstart Guide to Positioning", 15.03.2021, https://www.aprildunford.com/post/a-quickstart-guide-to-positioning).
- h&w's own measurement: outcome lines without an idea scored 55 to 67 on 07.11. (`2026-11-07-claim-and-headline.md`: "Every role in tune. Every release sooner." 55.3, "Speed your customers feel." 62.8).

Not fetched: Bain's "B2B Elements of Value" returned an empty page, and Ogilvy and Caples have no primary source online that I could reach, so none of them is quoted.

### The criterion, in one sentence

`gain_first`, 0 to 10: the first thing the line makes you see is what gets better for the client company and its people, ahead of the provider's service and ahead of the problem. Each reviewer also names in one clause what the line says gets better; "nothing" is an answer.

### The routes

| Route          | Principle                                                                                  | Example                                                         |
| -------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| outcome-first  | Priestley: the buyer sees what improves; Dass et al.: the benefit stated clearly           | Faster releases, when your people and agents are in tune.       |
| client as hero | Miller: the customer is the hero and wins; Perlman's brand hero                            | A team in tune ships at agent speed.                            |
| from-to        | Perlman's slogan shape: the old state left, the new state named                            | From faster code to faster releases, as one team.               |
| image-first    | the Amdahl image (handoff, pace, the open road) with the improvement in front              | Every handoff a head start.                                     |
| two beats      | Hopkins: the first beat picks out the reader by their situation, the second names the gain | Your developers got faster. Now your releases do.               |
| emotional      | Perlman: the identity customers aspire to                                                  | Be the team that ships as fast as it codes.                     |
| descriptive    | Nielsen, Miller: say what the company does for whom                                        | Shorter lead times, with every role in tune around your agents. |

## Candidates

I wrote 36 claim pairs across the seven routes and twelve headline pairs, each German line written in German rather than translated. The rules: positive, no negation, no figures, no dash, at most twelve words (two refinements, r2 and r8, run to thirteen), "KI-Agenten" in the German claims and "Agenten" in the German headlines as in the decided lines, the ihr-form, no "speed up code", and "handoff" / "Übergabe" in one line only, d2, to test the word in the positive. The refinements between rounds bring the claims to 51 pairs and the headlines to 16.

Three control lines stood among the claims under neutral labels: c7, whose subject is the problem, d01, whose subject is the provider's service, and "hit", a bare outcome.

The text screen is the Amdahl round's: a CTO, a conference organiser and a brand strategist for the claims, split into two halves with the anchors and controls in both; a CTO, a VP of Engineering and a Head of Engineering at an insurer for the headlines; Claude and Codex, one run each, both languages in one prompt.

### Screen 1: claims

| Key | Line (EN / DE)                                                                                                                                                    | Route                | Overall | Claude / Codex | Gain first | Claude / Codex | People |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------- | -------------- | ---------- | -------------- | ------ |
| b3  | A team in tune ships at agent speed. / Ein eingespieltes Team liefert im Tempo der KI-Agenten.                                                                    | client-as-hero       | 77.2    | 75.0 / 79.3    | 7.0        | 6.7 / 7.3      | 7.8    |
| e5  | Your developers got faster. Now your releases do. / Eure Entwickler sind schneller geworden. Jetzt werden es eure Releases.                                       | two-beats            | 77.0    | 70.0 / 84.0    | 7.8        | 6.7 / 9.0      | 7.5    |
| a7  | Faster releases, when your people and agents are in tune. / Schnellere Releases, wenn eure Leute und KI-Agenten eingespielt sind.                                 | outcome-first        | 76.8    | 68.7 / 85.0    | 9.0        | 8.0 / 10.0     | 8.7    |
| e1  | Your people in tune. Your releases at agent speed. / Eure Leute eingespielt. Eure Releases im Tempo der KI-Agenten.                                               | two-beats            | 76.5    | 70.3 / 82.7    | 7.2        | 6.3 / 8.0      | 9.0    |
| tpe | Agents pay off when your people are in tune. / KI-Agenten lohnen sich, wenn eure Leute eingespielt sind.                                                          | anchor               | 74.8    | 71.2 / 78.5    | 7.1        | 5.5 / 8.7      | 9.0    |
| f1  | Be the team that ships as fast as it codes. / Werdet das Team, das so schnell liefert, wie es programmiert.                                                       | emotional            | 73.7    | 66.7 / 80.7    | 8.3        | 7.0 / 9.7      | 7.7    |
| x4  | Agents speed up code. Your handoffs set the pace. / KI-Agenten schreiben Code schneller. Eure Übergaben bestimmen das Tempo.                                      | anchor               | 73.5    | 69.0 / 78.0    | 4.5        | 2.3 / 6.7      | 5.8    |
| e2  | Agents code fast. Hand in hand, your people ship fast. / KI-Agenten programmieren schnell. Hand in Hand liefern eure Leute schnell.                               | two-beats            | 73.0    | 66.7 / 79.3    | 4.8        | 4.0 / 5.7      | 9.2    |
| c1  | From faster code to faster releases, as one team. / Von schnellerem Code zu schnelleren Releases, als ein Team.                                                   | from-to              | 72.5    | 59.0 / 86.0    | 8.3        | 7.0 / 9.7      | 6.5    |
| a6  | Releases at agent speed, from a team in tune. / Releases im Tempo der KI-Agenten, von einem eingespielten Team.                                                   | outcome-first        | 71.5    | 67.3 / 75.7    | 9.2        | 8.3 / 10.0     | 7.7    |
| c3  | Your releases catch up with your agents. / Eure Releases holen eure KI-Agenten ein.                                                                               | from-to              | 70.8    | 66.0 / 75.7    | 7.8        | 6.7 / 9.0      | 1.3    |
| c2  | Agent speed becomes release speed when your people are in tune. / Aus dem Tempo der KI-Agenten wird Release-Tempo, wenn eure Leute eingespielt sind.              | from-to              | 69.8    | 57.7 / 82.0    | 7.2        | 5.3 / 9.0      | 8.5    |
| g2  | Shorter lead times, with every role in tune around your agents. / Kürzere Lead Times, weil alle Rollen mit euren KI-Agenten eingespielt sind.                     | descriptive          | 69.3    | 64.3 / 74.3    | 9.0        | 8.0 / 10.0     | 7.5    |
| c4  | Agents made your developers faster. Now your whole team is. / KI-Agenten haben eure Entwickler schneller gemacht. Jetzt wird es euer ganzes Team.                 | from-to              | 69.2    | 63.0 / 75.3    | 8.0        | 6.7 / 9.3      | 8.5    |
| a3  | Sooner at your customers, with agents and a team in tune. / Früher bei euren Kunden, mit KI-Agenten und einem eingespielten Team.                                 | outcome-first        | 68.0    | 61.3 / 74.7    | 9.0        | 8.0 / 10.0     | 7.8    |
| c5  | Fast code becomes fast releases in your people's hands. / Aus schnellem Code werden schnelle Releases, in den Händen eurer Leute.                                 | from-to              | 67.3    | 57.0 / 77.7    | 6.7        | 5.0 / 8.3      | 8.8    |
| d1  | Hand in hand, your people ship at agent speed. / Hand in Hand liefern eure Leute im Tempo der KI-Agenten.                                                         | image-first          | 67.3    | 65.7 / 69.0    | 6.8        | 6.3 / 7.3      | 9.3    |
| b5  | Your whole team picks up the pace of your agents. / Euer ganzes Team nimmt das Tempo eurer KI-Agenten auf.                                                        | client-as-hero       | 66.3    | 62.3 / 70.3    | 7.2        | 5.7 / 8.7      | 8.7    |
| a1  | Your releases speed up when your people pull together. / Eure Releases werden schneller, wenn eure Leute an einem Strang ziehen.                                  | outcome-first        | 66.3    | 60.0 / 72.7    | 9.0        | 8.0 / 10.0     | 9.0    |
| a4  | Faster from idea to customer, as one team with your agents. / Schneller von der Idee zum Kunden, als ein Team mit euren KI-Agenten.                               | outcome-first        | 65.8    | 53.3 / 78.3    | 8.8        | 7.7 / 10.0     | 6.5    |
| b1  | Your team ships as fast as your agents code. / Euer Team liefert so schnell, wie eure KI-Agenten programmieren.                                                   | client-as-hero       | 65.7    | 62.7 / 68.7    | 9.0        | 8.0 / 10.0     | 7.2    |
| b2  | Your people carry agent speed to your customers. / Eure Leute bringen das Tempo der KI-Agenten zu euren Kunden.                                                   | client-as-hero       | 64.8    | 61.0 / 68.7    | 6.3        | 5.3 / 7.3      | 9.0    |
| e4  | Ship as one. Ship sooner. / Gemeinsam liefern. Früher liefern.                                                                                                    | two-beats            | 64.7    | 51.0 / 78.3    | 7.5        | 6.7 / 8.3      | 6.2    |
| a2  | Ship as fast as your agents code. / Liefert so schnell, wie eure KI-Agenten programmieren.                                                                        | outcome-first        | 63.8    | 53.3 / 74.3    | 8.8        | 7.7 / 10.0     | 4.2    |
| b4  | Your people pass agent speed on to your customers. / Eure Leute geben das Tempo der KI-Agenten an eure Kunden weiter.                                             | client-as-hero       | 62.3    | 57.7 / 67.0    | 6.3        | 5.7 / 7.0      | 9.0    |
| c7  | Your agents are waiting for the rest of the team. / Eure KI-Agenten warten auf den Rest des Teams.                                                                | control-miss-problem | 61.7    | 62.3 / 61.0    | 0.4        | 0.8 / 0.0      | 7.2    |
| d3  | One team, one pace, from idea to customer. / Ein Team, ein Tempo, von der Idee bis zum Kunden.                                                                    | image-first          | 61.7    | 52.0 / 71.3    | 5.5        | 5.3 / 5.7      | 7.2    |
| e3  | Your people set the pace. Your agents hold it. / Eure Leute geben das Tempo vor. Eure KI-Agenten halten es.                                                       | two-beats            | 61.3    | 62.0 / 60.7    | 5.3        | 5.0 / 5.7      | 9.0    |
| a5  | Your ideas reach customers at the pace of your agents. / Eure Ideen erreichen eure Kunden im Tempo eurer KI-Agenten.                                              | outcome-first        | 60.8    | 55.0 / 66.7    | 9.0        | 8.0 / 10.0     | 3.0    |
| g3  | Your engineering and product teams release sooner with agents. / Eure Engineering- und Produktteams liefern mit KI-Agenten früher aus.                            | descriptive          | 59.7    | 47.0 / 72.3    | 8.7        | 7.7 / 9.7      | 7.7    |
| d4  | A clear run for your teams, from idea to customer. / Freie Bahn für eure Teams, von der Idee bis zum Kunden.                                                      | image-first          | 58.7    | 48.3 / 69.0    | 8.5        | 7.3 / 9.7      | 7.2    |
| g1  | Engineering and product teams that ship as fast as their agents code. / Engineering- und Produktteams, die so schnell liefern, wie ihre KI-Agenten programmieren. | descriptive          | 57.5    | 48.0 / 67.0    | 7.0        | 6.0 / 8.0      | 8.0    |
| d2  | Every handoff a head start. / Jede Übergabe ein Vorsprung.                                                                                                        | image-first          | 57.2    | 55.0 / 59.3    | 6.5        | 5.3 / 7.7      | 4.7    |
| f4  | Your whole team, up to speed. / Euer ganzes Team kommt auf Tempo.                                                                                                 | emotional            | 57.2    | 44.3 / 70.0    | 7.8        | 6.0 / 9.7      | 8.0    |
| b6  | Your team sets a pace your customers can feel. / Euer Team macht Tempo, das eure Kunden spüren.                                                                   | client-as-hero       | 55.5    | 44.0 / 67.0    | 8.3        | 7.7 / 9.0      | 7.3    |
| hit | Your releases reach your customers sooner. / Eure Releases sind früher bei euren Kunden.                                                                          | control-hit          | 53.4    | 43.3 / 63.5    | 9.6        | 9.2 / 10.0     | 1.9    |
| f5  | Speed that gets there. / Tempo, das ankommt.                                                                                                                      | emotional            | 53.2    | 43.0 / 63.3    | 6.8        | 5.0 / 8.7      | 0.8    |
| d5  | From hand to hand at agent speed. / Von Hand zu Hand im Tempo der KI-Agenten.                                                                                     | image-first          | 50.2    | 45.3 / 55.0    | 3.8        | 3.3 / 4.3      | 6.3    |
| d01 | We teach teams to ship with agents. / Wir machen eure Teams fit für Agenten.                                                                                      | control-miss-service | 49.0    | 41.2 / 56.8    | 1.7        | 1.5 / 1.8      | 7.4    |
| f2  | Fast all the way to your customers. / Schnell bis zu euren Kunden.                                                                                                | emotional            | 48.2    | 35.3 / 61.0    | 8.5        | 7.0 / 10.0     | 2.0    |
| f3  | Ship at the speed of your ideas. / Liefert im Tempo eurer Ideen.                                                                                                  | emotional            | 48.0    | 39.0 / 57.0    | 8.8        | 7.7 / 10.0     | 3.3    |

### Screen 2: claims

| Key | Line (EN / DE)                                                                                                                                                                | Route                | Overall | Claude / Codex | Gain first | Claude / Codex | People |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------- | -------------- | ---------- | -------------- | ------ |
| r1  | Faster releases with agents, when your people are in tune. / Schnellere Releases mit KI-Agenten, wenn eure Leute eingespielt sind.                                            | refined              | 76.5    | 69.7 / 83.3    | 9.5        | 9.0 / 10.0     | 9.0    |
| d8  | Agents write code. People in tune ship faster. / KI-Agenten schreiben Code. Wer eingespielt ist, liefert schneller.                                                           | measured-reference   | 75.3    | 66.7 / 84.0    | 4.0        | 3.7 / 4.3      | 8.8    |
| r6  | Faster releases, when your people and agents play as one. / Schnellere Releases, wenn eure Leute und KI-Agenten zusammenspielen.                                              | refined              | 74.2    | 65.0 / 83.3    | 9.5        | 9.0 / 10.0     | 7.7    |
| a7  | Faster releases, when your people and agents are in tune. / Schnellere Releases, wenn eure Leute und KI-Agenten eingespielt sind.                                             | outcome-first        | 73.2    | 64.0 / 82.3    | 9.5        | 9.0 / 10.0     | 7.5    |
| x4  | Agents speed up code. Your handoffs set the pace. / KI-Agenten schreiben Code schneller. Eure Übergaben bestimmen das Tempo.                                                  | anchor               | 73.0    | 70.7 / 75.3    | 4.7        | 2.3 / 7.0      | 6.2    |
| tpe | Agents pay off when your people are in tune. / KI-Agenten lohnen sich, wenn eure Leute eingespielt sind.                                                                      | anchor               | 70.7    | 65.3 / 76.0    | 6.5        | 5.0 / 8.0      | 9.0    |
| r8  | Your developers got faster. With your people in tune, your releases do too. / Eure Entwickler sind schneller geworden. Mit eingespielten Leuten werden es auch eure Releases. | refined              | 70.7    | 65.7 / 75.7    | 8.2        | 7.3 / 9.0      | 9.3    |
| r9  | Your teams ship sooner with agents, once every role is in tune. / Eure Teams liefern mit KI-Agenten früher, sobald alle Rollen eingespielt sind.                              | refined              | 70.0    | 65.3 / 74.7    | 8.3        | 7.3 / 9.3      | 8.5    |
| r3  | Your developers got faster. Now your whole team ships faster. / Eure Entwickler sind schneller geworden. Jetzt liefert euer ganzes Team schneller.                            | refined              | 69.7    | 65.7 / 73.7    | 8.5        | 7.7 / 9.3      | 8.7    |
| e5  | Your developers got faster. Now your releases do. / Eure Entwickler sind schneller geworden. Jetzt werden es eure Releases.                                                   | two-beats            | 68.5    | 61.3 / 75.7    | 8.7        | 8.0 / 9.3      | 7.0    |
| b3  | A team in tune ships at agent speed. / Ein eingespieltes Team liefert im Tempo der KI-Agenten.                                                                                | client-as-hero       | 68.3    | 71.0 / 65.7    | 6.5        | 7.0 / 6.0      | 7.7    |
| r4  | Agents made your developers faster. Now your releases get faster too. / KI-Agenten haben eure Entwickler schneller gemacht. Jetzt werden es auch eure Releases.               | refined              | 66.5    | 59.0 / 74.0    | 8.2        | 7.3 / 9.0      | 7.2    |
| r2  | Your releases catch up with your agents when your people are in tune. / Eure Releases holen eure KI-Agenten ein, wenn eure Leute eingespielt sind.                            | refined              | 65.5    | 62.0 / 69.0    | 6.7        | 6.0 / 7.3      | 8.8    |
| r7  | A team in tune ships as fast as it codes. / Ein eingespieltes Team liefert so schnell, wie es programmiert.                                                                   | refined              | 65.2    | 67.3 / 63.0    | 6.2        | 6.3 / 6.0      | 8.0    |
| c7  | Your agents are waiting for the rest of the team. / Eure KI-Agenten warten auf den Rest des Teams.                                                                            | control-miss-problem | 60.7    | 65.3 / 56.0    | 0.7        | 1.3 / 0.0      | 7.2    |
| r5  | Your releases speed up when your whole team does. / Eure Releases werden schneller, wenn euer ganzes Team schneller wird.                                                     | refined              | 57.8    | 60.0 / 55.7    | 9.0        | 8.0 / 10.0     | 8.2    |
| hit | Your releases reach your customers sooner. / Eure Releases sind früher bei euren Kunden.                                                                                      | control-hit          | 45.5    | 36.7 / 54.3    | 9.8        | 9.7 / 10.0     | 3.3    |

### Screen 1: headlines

| Key | Headline (EN / DE)                                                                                                                                                                                          | Route          | Overall | Claude / Codex | Gain first |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------------- | ---------- |
| hb  | Faster releases with the agents your teams already have. Once all roles are in tune. / Schnellere Releases mit den Agenten, die eure Teams schon haben. Sobald alle Rollen zusammenspielen.                 | outcome-first  | 80.2    | 73.7 / 86.7    | 9.5        |
| hh  | Your releases speed up once all roles are in tune. Your teams already have the agents. / Eure Releases werden schneller, sobald alle Rollen zusammenspielen. Die Agenten haben eure Teams schon.            | outcome-first  | 74.8    | 68.7 / 81.0    | 9.2        |
| hf  | Your releases catch up with your agents. Once all roles are in tune. / Eure Releases holen eure Agenten ein. Sobald alle Rollen zusammenspielen.                                                            | image-first    | 74.7    | 77.3 / 72.0    | 8.0        |
| dh  | Your teams have agents. Once all roles are in tune, your releases speed up. / Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller.                                   | anchor         | 73.2    | 66.7 / 79.7    | 3.3        |
| he  | From faster code to faster releases. With every role, as one team. / Von schnellerem Code zu schnelleren Releases. Mit allen Rollen, als ein Team.                                                          | from-to        | 71.8    | 59.7 / 84.0    | 7.5        |
| hk  | Shorter lead time, because every role is in tune with your agents. / Kürzere Lead Time, weil alle Rollen mit euren Agenten zusammenspielen.                                                                 | descriptive    | 71.8    | 64.3 / 79.3    | 9.3        |
| d1k | Your developers code faster with agents. Releases speed up once product, QA and ops keep pace. / Mit KI-Agenten programmiert ihr schneller. Releases kommen früher, wenn Produkt, QA und Betrieb mithalten. | anchor         | 70.2    | 65.3 / 75.0    | 5.5        |
| hl  | Your teams ship sooner. Because product, engineering and operations are in tune with agents. / Eure Teams liefern früher. Weil Produkt, Entwicklung und Betrieb mit Agenten zusammenspielen.                | outcome-first  | 68.8    | 57.3 / 80.3    | 9.0        |
| hg  | The speed of your agents reaches your customers. Once all roles are in tune. / Das Tempo eurer Agenten kommt bei euren Kunden an. Sobald alle Rollen zusammenspielen.                                       | outcome-first  | 68.0    | 68.7 / 67.3    | 7.7        |
| hc  | Your ideas reach your customers sooner. With agents and every role in tune. / Eure Ideen sind früher bei euren Kunden. Mit Agenten und Rollen, die zusammenspielen.                                         | outcome-first  | 67.0    | 55.3 / 78.7    | 9.5        |
| hi  | Your whole team ships at the pace of your agents. From idea to customer. / Euer ganzes Team liefert im Tempo eurer Agenten. Von der Idee bis zum Kunden.                                                    | client-as-hero | 59.2    | 56.7 / 61.7    | 8.8        |
| ha  | Your releases get as fast as your agents. Once all roles are in tune. / Eure Releases werden so schnell wie eure Agenten. Sobald alle Rollen zusammenspielen.                                               | outcome-first  | 59.0    | 63.7 / 54.3    | 9.2        |
| hd  | Ship as fast as your agents code. Once all roles are in tune. / Liefert so schnell, wie eure Agenten programmieren. Sobald alle Rollen zusammenspielen.                                                     | emotional      | 56.3    | 56.0 / 56.7    | 8.3        |
| hj  | Agents made your developers faster. Now your whole company gets faster. / Mit Agenten sind eure Entwickler schneller geworden. Jetzt wird es euer ganzes Unternehmen.                                       | from-to        | 53.3    | 50.0 / 56.7    | 7.2        |

What the reviewers named in screen 1: "at agent speed" / "im Tempo der KI-Agenten" overpromises, "in tune" stays soft, tpe's "pay off" names no benefit, and x4 is "a diagnosis, not a gain". Screen 2 scored nine refinements (r1 to r9) beside the best of screen 1, the anchors and d8, the best measured line of 08.11. Between the screen and the panel, e5's German became "Jetzt sind eure Releases dran." ("Jetzt werden es eure Releases." read as unfinished).

Finalists were picked by the criterion first and the screen's overall second, as the rule says. b3 fell out in screen 2 (68.3). For round 2 I wrote three variants of e5 that answer its reviewers: e5f ("Now your releases follow." / "Jetzt ziehen eure Releases nach."), e5n ("Your releases are next." / "Als Nächstes eure Releases.") and e5a with the agents ("Agents speed up your developers. Now your releases follow." / "KI-Agenten machen Entwickler schneller. Jetzt ziehen eure Releases nach."). t2 answers r1's reviewers: "Faster releases with agents take the whole team." / "Schnellere Releases mit KI-Agenten brauchen das ganze Team.". Two more of that kind were rendered and not scored, to stay inside the budget: t1, "Faster releases with agents take a team in tune.", and t3, "Your releases speed up where your people work hand in hand.".

e5x pairs e5n's English, the best English of round 2 on the panel and the path, with e5f's German, the best German on the path (80.6); on the panel the three German wordings stand within 1.7 points of each other. Path round 3 and the cold reads measure it as a pair. Its panel numbers are each language's from round 2 and stand in no round table: overall 69.3, the criterion 8.8, core 4.6, together 2.6.

## Rendered panel: LinkedIn app and laptop, one-pager header, website footer (80 runs)

The renders are rebuilt the way the Amdahl round built them: `render.py`'s profile banner with the descriptor, pasted into the LinkedIn screenshots of 08.11.; the documents engine's onepager sample with the line above the title; the live site's footer at 1440 px with the line in place of the current claim. Personas, models and the prompt are the Amdahl round's, with the criterion added after the overall score. Five personas, Claude and Codex, two runs, English and German apart.

**Panel round 1**

| Key | Overall | Noise | Claude / Codex | EN / DE     | Gain first | Claude / Codex | Banners | One-pager | Footer | Distinctive | Clear | Emotional | Credible | Calm | Core | People | Together |
| --- | ------- | ----- | -------------- | ----------- | ---------- | -------------- | ------- | --------- | ------ | ----------- | ----- | --------- | -------- | ---- | ---- | ------ | -------- |
| tpe | 74.8    | 1.0   | 71.2 / 78.2    | 73.8 / 75.7 | 5.4        | 4.1 / 6.8      | 79.6    | 76.8      | 79.5   | 5.5         | 7.7   | 6.0       | 7.9      | 9.1  | 7.3  | 9.2    | 7.7      |
| x4  | 77.5    | 0.9   | 76.6 / 78.5    | 78.2 / 76.8 | 4.8        | 3.1 / 6.4      | 80.2    | 79.0      | 75.0   | 7.7         | 7.8   | 7.5       | 8.6      | 8.1  | 7.9  | 6.3    | 8.0      |
| r1  | 76.4    | 1.9   | 69.5 / 83.3    | 74.2 / 78.5 | 9.2        | 8.3 / 10.0     | 78.3    | 76.8      | 75.8   | 5.8         | 8.0   | 6.6       | 7.6      | 7.6  | 9.1  | 8.8    | 7.7      |
| r3  | 69.5    | 1.6   | 66.0 / 73.0    | 72.8 / 66.2 | 9.0        | 8.2 / 9.7      | 69.8    | 70.3      | 69.0   | 5.3         | 8.7   | 6.8       | 6.4      | 6.0  | 5.2  | 8.9    | 7.8      |
| e5  | 71.2    | 0.7   | 70.5 / 71.8    | 71.4 / 71.0 | 8.5        | 7.7 / 9.3      | 77.5    | 75.3      | 74.3   | 6.3         | 8.3   | 7.5       | 6.9      | 7.9  | 5.0  | 6.8    | 3.7      |
| f1  | 72.5    | 0.0   | 69.0 / 76.0    | 74.0 / 71.0 | 8.5        | 7.8 / 9.2      | 80.4    | 77.1      | 77.5   | 6.3         | 7.9   | 7.9       | 6.2      | 8.8  | 4.2  | 7.8    | 6.4      |

| Key | Overall lead over tpe (Claude r1, r2; Codex r1, r2) | Overall lead over x4     | Gain first lead over tpe | Gain first lead over x4 |
| --- | --------------------------------------------------- | ------------------------ | ------------------------ | ----------------------- |
| r1  | -0.7, -2.9, +4.9, +5.3                              | -4.2, -10.1, +4.7, +5.1  | +4.7, +3.8, +3.2, +3.3   | +5.6, +4.9, +3.7, +3.5  |
| r3  | -7.7, -2.8, -5.5, -5.1                              | -11.2, -10.0, -5.7, -5.3 | +4.4, +3.9, +3.0, +2.9   | +5.3, +5.0, +3.5, +3.1  |
| e5  | -2.4, +1.0, -6.4, -6.5                              | -5.9, -6.2, -6.6, -6.7   | +3.8, +3.3, +2.6, +2.6   | +4.7, +4.4, +3.1, +2.8  |
| f1  | -2.9, -1.6, -2.6, -2.0                              | -6.4, -8.8, -2.8, -2.2   | +4.1, +3.3, +2.5, +2.5   | +5.0, +4.4, +3.0, +2.7  |

**Panel round 2**

| Key | Overall | Noise | Claude / Codex | EN / DE     | Gain first | Claude / Codex | Banners | One-pager | Footer | Distinctive | Clear | Emotional | Credible | Calm | Core | People | Together |
| --- | ------- | ----- | -------------- | ----------- | ---------- | -------------- | ------- | --------- | ------ | ----------- | ----- | --------- | -------- | ---- | ---- | ------ | -------- |
| tpe | 72.8    | 1.0   | 68.4 / 77.2    | 70.5 / 75.2 | 5.2        | 3.9 / 6.5      | 76.5    | 74.5      | 76.8   | 5.6         | 7.3   | 5.9       | 7.8      | 9.0  | 6.9  | 9.5    | 8.1      |
| x4  | 76.7    | 0.6   | 75.6 / 77.8    | 76.8 / 76.7 | 5.4        | 3.7 / 7.1      | 78.8    | 78.9      | 71.6   | 7.7         | 7.5   | 7.6       | 8.4      | 7.8  | 8.3  | 6.2    | 7.6      |
| e5  | 65.3    | 0.7   | 65.5 / 65.2    | 64.2 / 66.5 | 8.5        | 8.0 / 9.1      | 71.8    | 70.3      | 69.0   | 5.7         | 7.6   | 7.1       | 6.3      | 7.8  | 4.4  | 7.5    | 2.5      |
| e5f | 67.1    | 1.3   | 67.3 / 66.8    | 68.8 / 65.5 | 8.7        | 8.2 / 9.2      | 73.7    | 72.1      | 71.2   | 5.6         | 8.0   | 7.0       | 6.2      | 7.7  | 4.5  | 7.5    | 2.6      |
| e5n | 68.9    | 0.0   | 67.0 / 70.8    | 73.1 / 64.8 | 8.7        | 8.1 / 9.3      | 76.5    | 74.5      | 73.2   | 5.8         | 8.2   | 7.5       | 6.7      | 8.1  | 4.5  | 7.5    | 2.5      |
| e5a | 64.9    | 0.6   | 62.4 / 67.3    | 65.0 / 64.8 | 7.3        | 6.3 / 8.4      | 71.0    | 70.0      | 67.4   | 5.0         | 8.2   | 6.4       | 6.2      | 7.0  | 5.7  | 6.8    | 2.6      |
| t2  | 74.3    | 0.5   | 63.6 / 85.0    | 70.3 / 78.3 | 9.0        | 8.0 / 10.0     | 76.9    | 76.5      | 75.8   | 5.5         | 7.6   | 6.1       | 8.2      | 8.4  | 8.7  | 7.8    | 8.8      |

| Key | Overall lead over tpe (Claude r1, r2; Codex r1, r2) | Overall lead over x4       | Gain first lead over tpe | Gain first lead over x4 |
| --- | --------------------------------------------------- | -------------------------- | ------------------------ | ----------------------- |
| e5  | -3.2, -2.6, -11.4, -12.6                            | -9.7, -10.5, -13.1, -12.1  | +3.8, +4.5, +2.6, +2.5   | +4.1, +4.5, +1.8, +2.1  |
| e5f | +0.1, -2.2, -9.2, -11.5                             | -6.4, -10.1, -10.9, -11.0  | +4.2, +4.6, +2.8, +2.5   | +4.5, +4.6, +2.0, +2.1  |
| e5n | -0.8, -1.9, -5.9, -6.9                              | -7.3, -9.8, -7.6, -6.4     | +4.2, +4.3, +3.0, +2.7   | +4.5, +4.3, +2.2, +2.3  |
| e5a | -6.5, -5.5, -8.9, -10.8                             | -13.0, -13.4, -10.6, -10.3 | +2.2, +2.7, +2.1, +1.7   | +2.5, +2.7, +1.3, +1.3  |
| t2  | -4.6, -4.9, +8.2, +7.4                              | -11.1, -12.8, +6.5, +7.9   | +3.8, +4.5, +3.6, +3.4   | +4.1, +4.5, +2.8, +3.0  |

Round 2 put four wordings of the two-beat line into one prompt. e5, with unchanged renders, scored 5.9 lower there than in round 1, tpe 2.0 and x4 0.8 lower. The path shows the same: e5 scored 81.6 in round 1 and 75.3 in round 2, x4 1.0 and tpe 1.2 lower. So round 2 ranks the wordings against each other, and the line's level against the anchors comes from the rounds where every claim stands equally often: round 1 on the panel, rounds 1 and 3 on the path. The set is the one changed factor I can name; no control shows that it caused the drop.

x4 leads tpe on the panel here by 2.7 and 3.9, with Claude (+3.5 to +7.9) and not with Codex (-0.5 to +1.7), the pattern of the Amdahl round at a level 1.8 to 5.0 points lower. What keeps the lines below the maximum, by a keyword count over the reviewers' reasons:

- tpe: "pay off" / "lohnen sich" in 63 of 80 reviews, "in tune" / "eingespielt" in 62.
- x4: "handoffs" / "Übergaben" in 73 of 80.
- The e5 family: no condition or cause in more than half of the reviews ("it never says what the speed depends on"), no agents, and e5n's "are next" "can read as a threat". e5a puts the agents in and scores lower on the criterion, the panel and the path.
- r1: "in tune" / "eingespielt" in all 40 by the same count, and with Claude "a generic vendor promise" with the condition "as an afterthought".
- t2: "the whole team" as too general in 31 of 40; the German "Releases brauchen das ganze Team" reads stiff to Claude.
- f1: the missing agents in 39 of 40; "reads like a motivational slogan".

## The reader's path (96 runs)

Each sheet shows the founder's LinkedIn profile in the app and on the laptop, the home page at 1440 px (and 390 px for English) with the H1, and the footer. Four personas, both models, two runs, English and German apart, the Amdahl round's prompt. The criterion is asked for the claim.

**Path round 1**

| Pair   | Overall | Noise | Claude / Codex | EN / DE     | Gain first | Clear | Relevant | Credible | Distinctive | One message | Claim |
| ------ | ------- | ----- | -------------- | ----------- | ---------- | ----- | -------- | -------- | ----------- | ----------- | ----- |
| tpe+dh | 66.1    | 1.4   | 59.6 / 72.7    | 65.1 / 67.1 | 5.8        | 6.5   | 7.2      | 7.2      | 4.8         | 7.0         | 5.9   |
| x4+dh  | 76.7    | 0.3   | 73.3 / 80.1    | 75.6 / 77.8 | 3.7        | 7.7   | 8.2      | 8.2      | 7.8         | 8.2         | 7.2   |
| r1+dh  | 72.0    | 1.4   | 63.8 / 80.2    | 69.9 / 74.2 | 9.3        | 8.4   | 8.8      | 7.0      | 4.8         | 6.4         | 6.8   |
| r3+dh  | 74.6    | 1.0   | 70.1 / 79.2    | 75.8 / 73.4 | 8.4        | 8.4   | 8.7      | 6.3      | 5.6         | 8.0         | 7.0   |
| e5+dh  | 81.6    | 0.0   | 78.7 / 84.6    | 79.9 / 83.3 | 8.4        | 8.8   | 9.4      | 7.2      | 6.7         | 8.7         | 8.5   |
| f1+dh  | 74.1    | 2.1   | 67.9 / 80.2    | 74.8 / 73.3 | 8.8        | 7.4   | 8.4      | 6.1      | 6.4         | 8.0         | 7.7   |

| Pair  | Overall lead over tpe+dh (Claude r1, r2; Codex r1, r2) | Overall lead over x4+dh (Claude r1, r2; Codex r1, r2) |
| ----- | ------------------------------------------------------ | ----------------------------------------------------- |
| r1+dh | +4.8, +3.8, +7.1, +8.0                                 | -7.8, -11.2, -0.5, +0.8                               |
| r3+dh | +11.1, +9.9, +5.5, +7.5                                | -1.4, -5.1, -2.1, +0.2                                |
| e5+dh | +18.4, +19.9, +11.2, +12.5                             | +5.9, +4.9, +3.6, +5.2                                |
| f1+dh | +5.5, +11.1, +6.9, +8.2                                | -7.0, -3.9, -0.8, +1.0                                |

**Path round 2**

| Pair   | Overall | Noise | Claude / Codex | EN / DE     | Gain first | Clear | Relevant | Credible | Distinctive | One message | Claim |
| ------ | ------- | ----- | -------------- | ----------- | ---------- | ----- | -------- | -------- | ----------- | ----------- | ----- |
| tpe+dh | 64.9    | 0.6   | 57.9 / 71.9    | 64.8 / 65.1 | 5.4        | 6.2   | 7.1      | 7.2      | 4.9         | 6.8         | 5.8   |
| x4+dh  | 75.7    | 1.1   | 72.0 / 79.4    | 74.6 / 76.8 | 4.5        | 7.5   | 8.1      | 8.2      | 7.7         | 8.1         | 7.2   |
| e5+dh  | 75.3    | 1.9   | 71.8 / 78.9    | 71.6 / 79.1 | 8.1        | 7.8   | 9.0      | 6.8      | 6.0         | 8.2         | 7.4   |
| e5f+dh | 78.3    | 1.1   | 76.1 / 80.6    | 76.1 / 80.6 | 8.5        | 8.4   | 9.1      | 6.8      | 6.0         | 8.4         | 7.9   |
| e5n+dh | 79.1    | 1.9   | 74.1 / 84.1    | 80.2 / 77.9 | 8.2        | 8.3   | 9.0      | 7.2      | 6.1         | 8.5         | 8.1   |
| e5a+dh | 73.8    | 0.1   | 69.4 / 78.3    | 72.9 / 74.8 | 7.0        | 8.2   | 8.7      | 6.3      | 5.2         | 7.9         | 7.2   |
| t2+dh  | 70.7    | 0.6   | 58.8 / 82.6    | 68.3 / 73.1 | 8.3        | 7.8   | 8.5      | 7.7      | 5.2         | 7.1         | 6.7   |

| Pair   | Overall lead over tpe+dh (Claude r1, r2; Codex r1, r2) | Overall lead over x4+dh (Claude r1, r2; Codex r1, r2) |
| ------ | ------------------------------------------------------ | ----------------------------------------------------- |
| e5+dh  | +13.0, +14.6, +9.1, +4.9                               | -1.4, +0.9, +1.4, -2.5                                |
| e5f+dh | +17.0, +19.4, +8.2, +9.1                               | +2.6, +5.6, +0.5, +1.8                                |
| e5n+dh | +17.4, +14.9, +12.2, +12.1                             | +3.0, +1.1, +4.5, +4.8                                |
| e5a+dh | +10.9, +12.0, +6.4, +6.5                               | -3.5, -1.8, -1.4, -0.9                                |
| t2+dh  | +1.2, +0.5, +10.4, +11.1                               | -13.1, -13.2, +2.6, +3.8                              |

**Path round 3**

| Pair   | Overall | Noise | Claude / Codex | EN / DE     | Gain first | Clear | Relevant | Credible | Distinctive | One message | Claim |
| ------ | ------- | ----- | -------------- | ----------- | ---------- | ----- | -------- | -------- | ----------- | ----------- | ----- |
| tpe+dh | 67.6    | 0.4   | 62.1 / 73.1    | 67.3 / 67.8 | 6.1        | 6.6   | 7.4      | 7.1      | 4.8         | 6.7         | 5.8   |
| x4+dh  | 78.5    | 0.5   | 76.8 / 80.2    | 77.4 / 79.6 | 4.2        | 7.8   | 8.5      | 8.2      | 7.8         | 8.3         | 7.6   |
| tpe+hb | 69.1    | 1.6   | 60.6 / 77.6    | 69.6 / 68.6 | 6.1        | 7.1   | 7.8      | 6.8      | 4.8         | 7.1         | 5.8   |
| x4+hb  | 78.9    | 2.5   | 73.6 / 84.2    | 78.2 / 79.5 | 4.2        | 8.2   | 8.5      | 8.0      | 7.8         | 8.3         | 7.6   |
| e5x+dh | 79.3    | 0.1   | 76.8 / 81.8    | 80.2 / 78.4 | 9.1        | 8.4   | 9.2      | 6.9      | 6.4         | 8.1         | 8.5   |
| e5x+hb | 79.3    | 2.3   | 73.1 / 85.6    | 81.0 / 77.7 | 9.1        | 8.7   | 9.2      | 6.7      | 6.2         | 7.6         | 8.5   |

| Pair   | Overall lead over tpe+dh (Claude r1, r2; Codex r1, r2) | Overall lead over x4+dh (Claude r1, r2; Codex r1, r2) |
| ------ | ------------------------------------------------------ | ----------------------------------------------------- |
| tpe+hb | -0.1, -2.9, +4.4, +4.6                                 | -15.2, -17.1, -2.5, -2.9                              |
| x4+hb  | +14.0, +9.0, +10.8, +11.5                              | -1.1, -5.2, +3.9, +4.0                                |
| e5x+dh | +14.6, +14.9, +8.6, +8.9                               | -0.5, +0.6, +1.8, +1.4                                |
| e5x+hb | +13.0, +9.1, +12.5, +12.5                              | -2.1, -5.1, +5.6, +5.0                                |

x4 leads tpe on the path in every cell of every round (+6.9 to +15.1), as on the morning of 10.11., so the path measures what it measured then. The two-beat lines lead tpe by more. Against x4, e5 leads in every cell of round 1 (+3.6 to +5.9). e5x in round 3 leads with Codex by 1.4 and 1.8 and stands at -0.5 and +0.6 with Claude, at a noise of 0.5. In the crowded round 2, e5 ties x4, and e5n and e5f each lead in three of four cells. The lead of round 1 did not repeat in every cell, so by the rule it is a tie with x4.

The headline hb splits the models on the path. The averages hold: tpe with hb scores 69.1 against 67.6 with the decided headline, x4 78.9 against 78.5, e5x 79.3 against 79.3. Claude scores every pair lower with hb, by 1.5 to 3.7 on its mean and by 2.9 to 5.8 in its second run. Codex scores every pair higher, by 3.8 to 4.5. In German with tpe the cells are -1.2 and -3.2 with Claude and +3.8 and +3.8 with Codex, at a noise of 1.6. With the decided headline, path reviewers of e5x write that "the H1 puts the gain last"; with hb they write that banner and H1 both say "releases faster".

## The criterion: does the client's change lead?

`gain_first` and the `gain` clause stand in every prompt after the overall score, "apart from these scores, and left out of overall". The planted lines came back as planted in the text screen, with both models: c7 (the problem) 0.4 and d01 (the service) 1.7 against 9.6 for the bare outcome.

| Line                 | Panel | Claude / Codex | Path | What reviewers say gets better                                                                   |
| -------------------- | ----- | -------------- | ---- | ------------------------------------------------------------------------------------------------ |
| x4                   | 5.4   | 3.7 / 7.1      | 4.2  | Claude: "nothing" in 18 of 40 panel and 47 of 48 path reviews. Codex: "code gets written faster" |
| tpe                  | 5.2   | 3.9 / 6.5      | 6.1  | "the investment in AI agents pays off", "without saying what for"                                |
| e5x (e5n EN, e5f DE) | 8.8   | 8.3 / 9.3      | 9.1  | "releases catch up with faster developers"                                                       |
| r1                   | 9.2   | 8.3 / 10.0     | 9.3  | "faster releases with AI agents"                                                                 |
| t2                   | 9.0   | 8.0 / 10.0     | 8.3  | "faster releases with AI agents"                                                                 |
| f1                   | 8.5   | 7.8 / 9.2      | 8.8  | "the team delivers as fast as it writes code"                                                    |
| dh (headline, hero)  | 3.2   | 3.2 / 3.2      |      | "releases speed up", placed last                                                                 |
| hb (headline, hero)  | 9.8   | 9.5 / 10.0     |      | "releases get faster using agents already paid for"                                              |

Anchors and e5x are from round 2 (path: round 3), r1 and f1 from round 1, t2 from round 2, the headlines from hero round 2. Every new line leads both anchors on the criterion outside the noise (at most 0.3) in every cell. On the path x4 scores lowest of all claims on what Benedikt asked for, below tpe in all three rounds (3.7 to 4.5 against 5.4 to 6.1); on the panel the two anchors tie. The decided headline names the gain, and names it last (3.2).

## Cold reads: the banner alone and with the descriptor (104 runs)

One banner in the LinkedIn app or on the laptop, "you know nothing else about the company", what does it tell you. CTO, VP of Engineering, engineering lead, Head of HR; both models; banner alone and with the descriptor; English and German. f6 ("Every agent needs a team in tune.", with descriptor) is the Amdahl round's control that must miss the result. A blind classifier (three shuffled passes, majority) marked the three facts of the Amdahl round and two more: whether the reading states a gain for the reader's company, and whether it says what the company offers. Four planted readings separate on people and core, two marked and two unmarked. For the gain mark two more were planted, one each way, and both came back. That mark reads leniently: of f6's readings, 7 of 8 state a gain where 3 of 8 name a result.

| Line | Readings | People | Result | Core | States a gain | Names an offer, banner alone | Names an offer, with descriptor |
| ---- | -------- | ------ | ------ | ---- | ------------- | ---------------------------- | ------------------------------- |
| e5x  | 32       | 32     | 32     | 0    | 32            | 16 / 16                      | 16 / 16                         |
| r1   | 32       | 32     | 32     | 31   | 32            | 8 / 16                       | 16 / 16                         |
| tpe  | 16       | 16     | 16     | 16   | 16            | 4 / 8                        | 8 / 8                           |
| x4   | 16       | 16     | 16     | 16   | 8             | 3 / 8                        | 8 / 8                           |
| f6   | 8        | 8      | 3      | 8    | 7             |                              | 8 / 8                           |

f6 misses the result, so the read separates. Three readings stand out:

- Half of x4's readers restate a diagnosis and no gain ("It's telling me to look at our handoffs as the constraint"). That is Benedikt's objection, measured.
- No reader of e5x says that agents alone are not enough. All 16 banner-alone readers take it as an offer "to help us turn that faster development into faster releases", and 8 of them name no AI.
- What the company does, training and mentoring, comes from the descriptor: with it, every reading of every line names training or mentoring; without it, 0 of 16 for e5x, 4 of 16 for r1, 1 of 8 for tpe and 2 of 8 for x4 (keyword count).

## The home headline (36 runs)

The live home page in headless Chrome with the H1 replaced and the assessment link with its price hidden. Desktop English and German at 1440 × 900, English phone at 390 × 844; the Amdahl round's question and criteria, layout scored apart, the criterion added.

hb led the headline screen by more than five points (80.2; hh 74.8 and hf 74.7 next). Round 1 took hb, hf and the variants hn and hm; round 2 took hq and hs:

- hn: Faster releases with the agents your teams have. Once all roles are in tune. / Schnellere Releases mit den Agenten eurer Teams. Sobald alle Rollen zusammenspielen.
- hm: Your releases speed up once all roles are in tune around your agents. / Eure Releases werden schneller, sobald alle Rollen mit euren Agenten zusammenspielen.
- hq: Your releases pick up the speed of your agents. Once all roles are in tune. / Eure Releases nehmen das Tempo eurer Agenten auf. Sobald alle Rollen zusammenspielen.
- hs: Release faster with the agents your teams already have. Once all roles are in tune. / Liefert schneller mit den Agenten, die eure Teams schon haben. Sobald alle Rollen zusammenspielen.

**Hero round 1**

| Key | Overall | Noise | Claude / Codex | Gain first | Lead over the decided headline (Claude r1, r2; Codex r1, r2) | Layout |
| --- | ------- | ----- | -------------- | ---------- | ------------------------------------------------------------ | ------ |
| dh  | 73.1    | 1.2   | 67.5 / 78.7    | 3.2        |                                                              | 6.2    |
| hb  | 76.0    | 1.0   | 69.2 / 82.8    | 9.4        | +1.3, +2.0, +4.3, +4.0                                       | 6.2    |
| hn  | 74.5    | 1.3   | 68.3 / 80.7    | 9.4        | +1.0, +0.7, +2.0, +2.0                                       | 7.8    |
| hf  | 75.7    | 0.0   | 78.5 / 72.8    | 7.4        | +11.0, +11.0, -7.0, -4.7                                     | 8.9    |
| hm  | 71.4    | 0.5   | 69.2 / 73.7    | 9.2        | +0.7, +2.7, -5.7, -4.3                                       | 5.6    |

**Hero round 2**

| Key | Overall | Noise | Claude / Codex | Gain first | Lead over the decided headline (Claude r1, r2; Codex r1, r2) | Layout |
| --- | ------- | ----- | -------------- | ---------- | ------------------------------------------------------------ | ------ |
| dh  | 76.2    | 2.3   | 73.2 / 79.2    | 3.2        |                                                              | 6.6    |
| hb  | 77.1    | 1.5   | 72.7 / 81.5    | 9.8        | -1.3, +0.3, +2.3, +2.3                                       | 6.9    |
| hq  | 65.0    | 0.7   | 61.3 / 68.7    | 8.2        | -11.7, -12.0, -12.3, -8.7                                    | 7.8    |
| hs  | 73.5    | 2.0   | 67.3 / 79.7    | 9.0        | -6.3, -5.3, +0.7, +0.3                                       | 6.9    |

**Hero German only**

| Key | Overall | Noise | Claude / Codex | Gain first | Lead over the decided headline (Claude r1, r2; Codex r1, r2) | Layout |
| --- | ------- | ----- | -------------- | ---------- | ------------------------------------------------------------ | ------ |
| dh  | 72.0    | 0.3   | 65.0 / 79.0    | 2.9        |                                                              | 5.2    |
| hb  | 76.2    | 0.3   | 68.7 / 83.7    | 9.4        | +3.0, +4.3, +4.7, +4.7                                       | 6.3    |
| hq  | 67.2    | 2.3   | 65.3 / 69.0    | 7.4        | -0.7, +1.3, -11.7, -8.3                                      | 8.2    |
| hs  | 70.2    | 3.3   | 61.7 / 78.7    | 8.4        | -6.0, -0.7, -1.3, +0.7                                       | 6.2    |

hb keeps the decided headline's content and turns its order: the gain first, the agents the teams have as the means, the roles as the condition. It leads in every cell of round 1 (by 0.1 more than the noise with Claude) and of the German-only round, and ties in round 2, where no cell stands outside the noise of 2.3. It runs five lines in English and six in German at 1440 px, as the decided headline does. Its reviewers name the "already" that repeats the subline's "already use", the "generic" opening noun phrase, and the trailing fragment. hn drops "already" and runs five lines in German; it ties the decided headline (round 1). hf, "Your releases catch up with your agents.", splits the models: Claude puts it 11.0 ahead of the decided headline in both runs, Codex 7.0 and 4.7 behind. hq ("pick up the speed of your agents") overpromises, hs ("Release faster") reads as pressure.

## Against the rule

| Requirement                                        | e5x                                                                                                                            | r1                                           | t2                                                           | f1                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------ | -------------------------- |
| 1 Criterion leads both anchors, all cells          | yes                                                                                                                            | yes                                          | yes                                                          | yes                        |
| 2 Path leads tpe and x4, all cells                 | tpe yes; x4 in every cell of round 1 only                                                                                      | tpe yes; x4 no: Claude -7.8 and -11.2        | no: Claude +1.2 and +0.5 to tpe at a noise of 0.6, -13 to x4 | tpe yes; x4 no with Claude |
| 3 Panel: no cell behind an anchor beyond the noise | no: e5 in round 1 about -6 to x4 in every cell, -6.4 and -6.5 to tpe with Codex; the pair alone beside the anchors is unscored | no: Claude -2.9 to tpe, -4.2 and -10.1 to x4 | no: Claude -4.6 to -12.8                                     | no: -1.6 to -2.9 to tpe    |
| 4 German within its noise of the English, or ahead | no for the pair (e5f's German 65.5 against e5n's English 73.1); e5 itself held                                                 | German ahead (78.5 against 74.2)             | German ahead (78.3 against 70.3)                             | no (71.0 against 74.0)     |
| 5 Cold read: people and a result in 24 of 32       | 32                                                                                                                             | 32                                           | not measured                                                 | not measured               |

The headline hb: leads on the hero outside the noise in both runs and with both models in round 1 and in German, not in round 2; ahead on the criterion in every cell; German six lines as now. On the German path with tpe it gains with Codex (+3.8 in both runs) and loses with Claude (-1.2 and -3.2, the second outside the noise of 1.6). With a lead in two of three hero rounds and a German loss with one model, hb does not win by the rule.

No line passes, so the answer to the first question is no and the recommendation stays the line that changes nothing.

## The top five, the principle each follows, and what each costs

| Line                                                                                                                                                                                                        | Principle                                                                                                  | What it costs                                                                                                                                                                                                                                                 | Score | Noise | tpe / x4 in the same rounds |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----- | --------------------------- |
| e5x: Your developers got faster. Your releases are next. / Eure Entwickler sind schneller geworden. Jetzt ziehen eure Releases nach.                                                                        | Hopkins: the first beat picks out the reader by their situation; Priestley: the second shows what improves | The panel against x4, about 6 points in round 1. It names neither agents nor people working together, so the position's point, that the gain depends on every role, moves to the headline and the descriptor. It assumes a gain the reader may not have seen. | 75.3  | 0.7   | 71.2 / 78.0                 |
| r1: Faster releases with agents, when your people are in tune. / Schnellere Releases mit KI-Agenten, wenn eure Leute eingespielt sind.                                                                      | Priestley and Dass et al.: the benefit stated first and plainly; the condition is the decided claim's      | Distinctiveness (5.8 against 7.7 for x4): Claude reads a generic promise. It nearly restates the decided headline, so on the path banner and H1 do the same job, and it trails x4 there. The footer and the phone banner get long.                            | 74.2  | 1.9   | 70.5 / 77.1                 |
| t2: Faster releases with agents take the whole team. / Schnellere Releases mit KI-Agenten brauchen das ganze Team.                                                                                          | The same, with the condition as the client's own team (Miller: the customer is the hero)                   | The widest model split on the panel (Claude 63.6, Codex 85.0). "The whole team" stays general, the German reads stiff, and it gives up "in tune".                                                                                                             | 72.5  | 0.6   | 68.9 / 76.2                 |
| f1: Be the team that ships as fast as it codes. / Werdet das Team, das so schnell liefert, wie es programmiert.                                                                                             | Perlman's brand hero: the identity the customer aspires to                                                 | No agents and no condition (core 4.2). The best banners of the new lines (80.4) and calm (8.8), but the panel trails tpe in every cell, and the German sounds translated.                                                                                     | 73.3  | 2.1   | 70.5 / 77.1                 |
| hb, a headline: Faster releases with the agents your teams already have. Once all roles are in tune. / Schnellere Releases mit den Agenten, die eure Teams schon haben. Sobald alle Rollen zusammenspielen. | Priestley and Miller's "successful ending": the outcome opens, the means and the condition follow          | A tie on the hero in one of three rounds. On the path Claude scores every pair 1.5 to 3.7 lower with it and Codex 3.8 to 4.5 higher. "Already" repeats the subline, which would need a new sentence; the second sentence is a fragment.                       | 77.1  | 2.3   | decided headline 76.2       |

For the claims, score is the mean of panel and path, as in the item, and noise the larger run gap. e5x's score takes the panel of round 1 (its first wording, 71.2) and the path of round 3. hb's score is its second hero round and compares only with the decided headline there.

e5x, r1 and hb go into the item `decide-claim-amdahl` as further options once the item is on `origin/main`. `recommended` stays tpe-tune.

My judgement, apart from the rule: hb with tpe-tune keeps the people in the claim and puts the client's change first on the home page. The averages hold on the hero and on the path, and Claude reads the path lower. No move of this round is free: each gain-first claim pays with the panel or with distinctiveness, and the headline pays with one model's path score.

## Routes that failed, and why

- **Image-first** (d1 to d5): 50.2 to 67.3 in the screen. "Every handoff a head start." (57.2) scored 4.7 on people: the handoff reads as process again, in the positive too. "At agent speed" and "hand in hand" promise more than a reader believes.
- **Client as hero** (b1 to b6): the best, "A team in tune ships at agent speed.", fell from 77.2 to 68.3 in the second screen; "agent speed" overpromises.
- **From-to** (c1 to c5): Claude reads the pattern as a template (c1: Claude 59.0, Codex 86.0).
- **Emotional** (f1 to f5): the short ones name no one and nothing ("Speed that gets there." 53.2). f1 reached the panel and trails tpe in every cell.
- **Descriptive** (g1 to g3): 57.5 to 69.3, long and interchangeable.
- **Two beats with the people in the second beat** (r3, r8): "Now your whole team ships faster." loses the panel (69.5) and trails or ties x4 on the path (-5.1 to +0.2).
- **Two beats with the agents** (e5a): lower than e5 on the criterion (7.3), the panel (64.9) and the path (73.8).
- **Outcome-first in one sentence with the condition** (a7, r1, t2): stopped after two rounds. The panel average sits between the anchors both times, and the model split does not close (r1: Claude 69.5, Codex 83.3; t2: 63.6, 85.0).
- **Two beats** (e5 and its variants): stopped after two rounds. The wording fixes move the English panel (64.2 to 73.1) and not the German (66.5 to 65.5 and 64.8), and no variant reaches x4.

## Assumptions

- "The new claim" is x4 and the decided claim is tpe-tune, as the brief says. Neither is in `verbal.json`, which still holds the claim before both.
- "Jeffrey Perlman" is the Perlman of h&w's records; the look-alike search fell away. Open: no fetched source has him state a rule for headlines.
- The Amdahl round ran `claude -p --model opus` without an effort flag. This round pins `--model claude-opus-5-5 --effort medium`, the settings default, and takes the two as the same reviewer.
- The criterion is asked after the overall score, so the old scores stay comparable. In the path prompt it is asked for the claim.
- The headline anchor is the decided headline alone. d1k, the Amdahl round's headline option, stood in the headline screen (70.2) and was not carried into the hero.
- Claims may run to twelve words, three more than the Amdahl round allowed, since two-beat lines need them; r2 and r8 run to thirteen.
- The one-pager header comes from the documents engine's built sample, read from its checkout as the Amdahl round did.
- The classifier's "names an offer" counts any offer ("offers to help us speed up releases"); the training count beside it is a keyword count.

## Skipped and caveats

- Reviewers are two models in personas, the same as in every earlier round. No human reader was asked.
- Every model split runs the same way: Codex rates outcome-first lines higher, Claude rates distinctiveness higher. The rule asks for both, so no line that splits them passes.
- The rule planned two path rounds. A third scored the headline hb with the claims; the total stayed under 350.
- The German sheets keep the English profile labels of the 08.11. LinkedIn screenshot. The one-pager intro is invented.
- X header, Sessionize cover, closing slide and link preview were not shown.
- t1 and t3 were rendered and not scored. The missing measurement is one panel of tpe, x4 and e5x alone, 40 runs; seven runs were left. hn's German-only round and a path with hn were not run either.
- Trademarks are not queried for any new line.
- Nothing changed in `verbal.json`, the applications or any published text.

## Images

- e5x: [panel surfaces](2026-11-10-claim-positive/e5x-panel.jpg), [in German](2026-11-10-claim-positive/e5x-panel-de.jpg), [the reader's path with the decided headline](2026-11-10-claim-positive/e5x-path.jpg), [in German](2026-11-10-claim-positive/e5x-path-de.jpg)
- r1: [panel surfaces](2026-11-10-claim-positive/r1-panel.jpg), [in German](2026-11-10-claim-positive/r1-panel-de.jpg)
- t2: [panel surfaces](2026-11-10-claim-positive/t2-panel.jpg); f1: [panel surfaces](2026-11-10-claim-positive/f1-panel.jpg)
- The headline hb: [English at 1440 px](2026-11-10-claim-positive/hb-hero.jpg), [German](2026-11-10-claim-positive/hb-hero-de.jpg), [the path with tpe-tune](2026-11-10-claim-positive/tpe-hb-path.jpg), [in German](2026-11-10-claim-positive/tpe-hb-path-de.jpg)
- The anchors on the same surfaces are in the folder of the [Amdahl report](2026-11-10-claim-amdahl.md).

## A reviewer prompt, verbatim (panel round 2, CTO, Claude, run 1, English)

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. A training company from Hamburg, hackers&wizards, trains and mentors engineering and product teams and their leaders in working with AI coding agents. It is choosing the claim, the short line that stands on its LinkedIn profile banner and its other profile banners, in the header of its training one-pagers and in its website footer. Audience: CTOs, CIOs, VPs of Engineering and senior engineers in German-speaking companies. Each image shows the same set of real surfaces at display size (the LinkedIn profile in the iPhone app and on a laptop, a one-pager header, the website footer at 1440 px), each with a different claim line; language: English. Read every image file.

LH: /tmp/claim-pos/blind/9e3a1add88.jpg  (line: Your developers got faster. Your releases are next.)
GR: /tmp/claim-pos/blind/b9238e4a92.jpg  (line: Agents speed up your developers. Now your releases follow.)
JM: /tmp/claim-pos/blind/48d21f0461.jpg  (line: Faster releases with agents take the whole team.)
ST: /tmp/claim-pos/blind/a700832ff9.jpg  (line: Your developers got faster. Now your releases do.)
XQ: /tmp/claim-pos/blind/a45f27d5b6.jpg  (line: Agents pay off when your people are in tune.)
JB: /tmp/claim-pos/blind/48680ef4cb.jpg  (line: Your developers got faster. Now your releases follow.)
TN: /tmp/claim-pos/blind/62d3a08246.jpg  (line: Agents speed up code. Your handoffs set the pace.)

Score each line, 0 to 10:
- distinctive: it could not stand just as well on a competitor's page
- clear: you understand the line at a glance
- emotional: it makes you want to know more
- credible: you believe it
- calm: visually calm and legible on the banners, one-pager and footer, not cramped
- language: natural, idiomatic English
- core: the line says what a company gets from AI agents and what that depends on
- people: you read it as being about human people, not about software
- together: it carries the idea of people working together across their roles
Then banners, onepager, footer (how well the line works on each of them), each 0 to 100, and overall, 0 to 100.
Apart from these scores, and left out of overall:
- gain_first, 0 to 10: the first thing the line makes you see is what gets better for the client company and its people, ahead of the provider's service and ahead of the problem
- gain: name in one clause what the line says gets better for the client; write "nothing" if it names nothing
Name for each line the one question it leaves open for you, and what keeps it below the maximum.
Answer with JSON only: {"<label>": {"distinctive":0,"clear":0,"emotional":0,"credible":0,"calm":0,"language":0,"core":0,"people":0,"together":0,"banners":0,"onepager":0,"footer":0,"overall":0,"gain_first":0,"gain":"one clause","open_question":"at most 15 words","below_max":"at most 20 words"}, ...} covering every label.
```

Runs: 24 screen, 80 panel, 96 path, 36 hero, 104 cold reads, 3 classifier: 343 of the 350 allowed. Claude 173, Codex 170.

Review: large, because the claim and the headline leave the company on every banner and the home page.

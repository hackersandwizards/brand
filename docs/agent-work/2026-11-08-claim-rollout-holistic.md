# Claim rollout, holistic: profile texts and banners in context

Pasting the claim onto a profile loses everywhere. On every surface and in both languages, the claim line added to the current text scores below the current text itself: 4 to 15 points in the blind reviews, outside the noise. The texts that win make the claim concrete where a reader looks for it. Where a banner above already says the sentence, the text leaves it to the banner; the company page, whose cover carries no claim, says it in the About.

Benedikt's texts take these forms:

| Surface                                  | Winner | What changed                                                                                                                      | Score against current (noise), per language              |
| ---------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| LinkedIn profile, headline and About     | Z      | Headline stays offer first. Only the About's third paragraph changes: it says what shipping together means in place of "In flow". | EN 80.8 vs 77.5 (1.3 / 0.6), DE 82.0 vs 77.7 (1.7 / 1.8) |
| LinkedIn company page, tagline and About | Y      | Tagline carries "ship together", About opens on the problem and the claim, closes with "Book a call".                             | EN 82.6 vs 72.3 (0.2 / 0.1), DE 82.6 vs 72.4 (0.2 / 0.2) |
| Sessionize, tagline and bio              | Y      | Tagline carries the line, bio states the company's offer plainly.                                                                 | EN 80.0 vs 67.2 (1.7 / 1.8), DE 79.3 vs 63.3 (0.5 / 2.9) |
| Practitioners short bio                  | C      | The opening clause now says the teams ship together and the speed reaches customers.                                              | EN 78.3 vs 72.5 (0.6 / 1.0), DE 80.0 vs 74.3 (0.1 / 0.5) |

Each lead over the current text is outside the noise in both runs and with both models. The texts are in item `work-update-external-profiles-after-claim`, old against new. The practitioners bio is a brief below: that repository changes it in its own run. Live state of each field: Sessionize read live 08.11.; LinkedIn is blocked for an automated read, so its texts come from the 31.10. record (Company OS `docs/agent-work/2026-11-01-profile-texts.md`, sections 9, 11 and 12), confirmed against the 31.10. screenshots of the opening lines.

Superseded on 10.11.: the claim changed to r1, "Faster releases with agents, when your people are in tune." (`decide-claim-amdahl`). Every text here carries u1, the claim before it. The banners are re-rendered and the texts redone for r1 in `work-update-external-profiles-after-claim`; this report stands as the measurement of 08.11.

The brief's premise was out of date on one point: since 31.10. the company page tagline and the LinkedIn About carry the offer rather than a claim, so "the current text with the claim merely swapped" means the claim pasted onto them. It was scored as that, beside the unchanged live text.

## Scores

Scale 0 to 100. Noise is the gap between the means of run 1 and run 2 of the same panel. Scores compare only within one round, so each row of a table stands alone. Keys: L current text (live, except the German Sessionize bio and tagline, which were written 31.10. and never entered), S the claim pasted onto it, A, B, C, Y, Z drafts, X the independent counter-draft.

**Round 1: every candidate.** 20 runs per candidate (5 personas, Claude and Codex, two runs).

| Surface       | L    | S (paste) | Best of the drafts     |
| ------------- | ---- | --------- | ---------------------- |
| Profile EN    | 80.4 | 65.1      | X 83.5, A 78.9         |
| Profile DE    | 80.0 | 65.7      | A 80.8, X 78.0         |
| Company EN    | 74.8 | 68.0      | C 80.4, B 80.2, X 79.9 |
| Company DE    | 75.8 | 67.3      | C 81.8, B 81.8, X 77.3 |
| Sessionize EN | 67.1 | 59.6      | X 82.5, C 79.8         |
| Sessionize DE | 63.0 | 58.1      | X 81.5, C 77.5         |

The practitioners bios appear in round 2 only: round 1's images of that page all showed the old bio by a fault in the mock (text-only reads; reran with correct images).

**Round 2: the leaders against a tuned version.** Same panel. The tuned versions took round 1's recurring reasons: Company Y puts B's clear tagline on C's About and ends on a call to book, Sessionize Y keeps the line in the tagline and the bio plain, Practitioners Y and C make the claim clause concrete, Y on the profile rewrites the opening.

| Surface          | L             | Tuned / leaders                        |
| ---------------- | ------------- | -------------------------------------- |
| Company EN       | 72.3          | Y 82.6, B 76.7, X 76.0, C 75.9         |
| Company DE       | 72.4          | Y 82.6, C 76.4, B 76.3, X 72.8         |
| Sessionize EN    | 67.2          | Y 80.0, X 78.9, C 77.8                 |
| Sessionize DE    | 63.3          | Y 79.3, X 76.8, C 74.3                 |
| Practitioners EN | 72.5 (S 68.5) | Y 78.7, C 78.3, A 75.4, B 69.3, X 68.9 |
| Practitioners DE | 74.3 (S 66.9) | C 80.0, Y 79.7, A 74.1, B 70.8, X 63.1 |
| Profile EN       | 81.7          | X 78.8, Y 76.9, A 76.1                 |
| Profile DE       | 81.0          | A 78.4, Y 77.4, X 73.5                 |

On the profile the current text beat every rewrite in round 2. Reviewers named two causes: the About and headline that repeat the claim right under the banner, which says it already, and the current text's own gap, that "In flow" never connects to the banner's line. So a further round tested one small change.

**Profile round 2b.** Z is the current text with only its third paragraph rewritten.

| Surface    | L                | Z          | X          | A          |
| ---------- | ---------------- | ---------- | ---------- | ---------- |
| Profile EN | 77.5 (noise 0.6) | 80.8 (1.3) | 82.3 (0.1) | 72.9 (0.4) |
| Profile DE | 77.7 (1.8)       | 82.0 (1.7) | 78.5 (0.3) | 74.6 (1.0) |

Z leads L in both languages, in both runs and with both models. In English, X and Z tie by the noise (Claude has X ahead, Codex Z ahead). In German, Z leads X. Z wins the tie on fewer changes: one paragraph against a rewritten text.

The practitioners tie (C and Y) goes to C: the second sentence of Y reads "Then the speed they gain ...", which reviewers call translated. The Sessionize tie (Y and X in English) goes to Y, which also leads in German.

Criteria, fixed before any score: first_screen_clear, carries_line, one_with_page, fits_mission_vision, credible, natural_language, next_step, then overall. What keeps the winners below the top, both models: no client example behind the promise, which a bio may not add here (only facts the current texts and records hold), and the first screen repeating the offer the banner names.

## Banners in context

Beside the winning texts, the shipped v1.56.0 banners against the banners that stood live before. Personas: CTO, VP of Engineering, senior brand designer, engineering manager; Claude and Codex; two runs. English banners, shown beside the English and the German profile text.

| Surface                   | Shipped          | Previous   | Lead |
| ------------------------- | ---------------- | ---------- | ---- |
| LinkedIn profile, EN text | 78.9 (noise 0.3) | 75.2 (0.4) | +3.7 |
| LinkedIn profile, DE text | 78.1 (0.9)       | 75.1 (0.4) | +3.0 |
| Sessionize                | 81.1 (0.4)       | 71.4 (0.3) | +9.7 |

The company cover carries no claim and did not change: not scored. X, YouTube, Brella and Facebook were judged in the set round of the previous report and skipped here.

**XING, the known weak point** ([in place](2026-11-08-claim-rollout-holistic/xing-shipped.jpg))**.** The descriptor is 8 px tall on a 390 px phone. Four renders on the live XING page (cover swapped in), phone and 1024 px:

| Version                                   | Overall | Noise | Legible | Breathing | Hierarchy |
| ----------------------------------------- | ------- | ----- | ------- | --------- | --------- |
| Shipped                                   | 77.4    | 1.1   | 6.5     | 7.8       | 8.2       |
| Claim 46.6 px, descriptor 0.62            | 76.5    | 1.0   | 6.7     | 7.1       | 8.4       |
| Descriptor 0.665, one row                 | 69.6    | 0.4   | 6.4     | 5.4       | 7.8       |
| Descriptor 0.86, two rows, smaller lockup | 68.4    | 0.0   | 7.6     | 4.6       | 6.4       |
| Previous cover                            | 51.3    | 0.1   | 6.4     | 7.8       | 7.2       |

Every enlargement costs more breathing room at the 1024 px crop than it gains on the phone, as round 2 of the rollout found. The second row is the only change readers score more legible (7.6), and it nearly touches the banner's bottom edge. The shipped banner stays. No render change, so no release.

## Method

Review: large, because the texts stand on every external profile. Audience: CIOs, CTOs and engineering leaders opening a profile after a first contact, program committees on Sessionize. Display: LinkedIn in the iPhone app and on the desktop site on a laptop, logged in; Sessionize and the website team page live on a laptop and a 390 px phone, the field text swapped in the page; XING live with the cover swapped in. Personas per surface: CTO of a Mittelstand manufacturer, VP of Engineering, senior brand strategist, bilingual copy editor, and one reader of that surface (engineering manager checking a profile before answering, head of L&D comparing providers, program committee member). Claude (`opus`) and Codex (`gpt-6.1-sol`, high), two runs, labels and order shuffled per reviewer, file names hashed. Each reviewer saw the banner, photo and layout on the page, plus the full expanded text, and the step before and after the page: a post or message first, then the company home page's headline and lead.

Runs: 160 in round 1, 160 in round 2, 40 in round 2b, 64 banners: 424. An independent counter-draft (a separate `claude -p`, given the same facts, never shown these drafts) entered every round.

The LinkedIn mock (`app` and `desktop`) is built from the 31.10. real screenshots (banner boxes and photo at the measured sizes) and checked against them. Banners are English on the German profile too: the banners are English only.

Not re-run: round 1 and 2 reviewers read the home headline "Once every role is in step, your releases speed up." as the step after the page; v1.57.0 changes it to "in tune" after the rounds ran. One word of the step-after context, not re-scored.

Skipped and named: OMR, XING, X, YouTube, Brella and Facebook text fields stay "not read", and Stefan's LinkedIn About was not rewritten. The Featured link title stays as the claim, not scored in context.

## Brief for the practitioners repository

This bio carries u1 and is superseded with it. As briefed on 08.11.: change Benedikt's short bio to the text below, then `bun run export` and name the entry's `entry.json` in the commit. Scored in context as C. The bio changes only with his yes; his file is `status: draft`. In place: [English](2026-11-08-claim-rollout-holistic/practitioners-en-new.jpg), [German](2026-11-08-claim-rollout-holistic/practitioners-de-new.jpg).

Benedikt's short bio, EN and DE, exact new text:

```text
Benedikt Stemmildt is Founder & Co-CEO of hackers&wizards in Hamburg, which runs AI training and mentoring in agentic engineering, so that engineering and product teams ship together and the speed they gain shows up for their customers. He has been a technologist since he was a kid, and for twenty years one thing has driven him: developers in flow, building great products. He co-wrote Building the Agentic Software Factory with Alex Merced (Packt), hosts the Rethink Engineering podcast, is program chair of code.talks and curates CASE Berlin. Before that he worked as an engineer, architect and CIO at OTTO, Breuninger and BLUME2000.
```

```text
Benedikt Stemmildt ist Gründer und Co-CEO von hackers&wizards in Hamburg. Die Firma gibt KI-Schulungen in Agentic Engineering für Engineering- und Produktteams und begleitet sie danach mit Mentoring, damit die Teams gemeinsam liefern und ihr Tempogewinn bei ihren Kunden ankommt. Technik begeistert ihn seit seiner Kindheit, und seit zwanzig Jahren treibt ihn eine Sache an: Entwickler:innen im Flow, die großartige Produkte bauen. Mit Alex Merced hat er das Buch Building the Agentic Software Factory (Packt) geschrieben. Er moderiert den Podcast Rethink Engineering, leitet das Programm der code.talks und kuratiert die CASE Berlin. Davor war er Engineer, Architekt und CIO bei OTTO, Breuninger und BLUME2000.
```

## Consumers, for the stage-2 briefs

Pin raises and H1 work can start. Each review of copy around the claim is redone for r1, the claim since 10.11. Each brief carries the rule that a surface's copy around the claim or the headline is rewritten to fit it and blind-reviewed in that surface's context against the current copy, aiming at the highest score. What the copy around the claim needs, per repository:

- **website**: home hero, lead and footer around the claim and H1 (v1.57.0 headline): `claimLines` splits at ". " and leaves an empty first line with a one-sentence claim, so the footer needs writing around one sentence. The lead and social cards need checking against the claim as one sentence.
- **os**: the onepager header reads the claim as a one-liner under the title, so its own descriptor line around it needs a review; handbook `business-foundation.md` lines 152 and 313 and `linkedin/profile-and-page-drafts-2026-09.md` follow the texts in the profiles item, not a claim swap.
- **slides**: the closing slide shows the claim alone; check its size and wrap at 47 and 59 characters, nothing around it to rewrite.
- **talks**: pin raise and the closing's claim; speaker intros that named the old claim get read then.
- **documents**: `DocProposal.astro` imports `verbal.json`; read the proposal copy around the claim once the pin rises.
- **trainer-hub, mail, admin, certificate-verifier, hycle-private**: pin raise only, no copy around the claim on `origin/main`.
- **practitioners**: the brief above; other trainers' bios carry no claim.
- **personal site** (`benedikt.stemmildt.com`): its hero "Developers in flow, building great products." is his own line, not the claim; nothing to change.
- **hub** (`~/.claude`): `voice/brand-voice.md` "Core positioning" still says the claim is the primary headline and flow the emotional result: rewrite for the claim as the sign-off line and the headline as the H1.
- **scaffolding, bench**: nothing.

## One reviewer prompt, verbatim

Profile round 2b, English, CTO, Claude, run 1 (paths shortened to `<run>`).

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. You look at a LinkedIn personal profile, shown as it appears in the LinkedIn iPhone app (left, 390 px wide) and on the desktop site on a laptop (right, 804 px column), logged in of the training company hackers&wizards and its founder Benedikt Stemmildt. The audience is CIOs, CTOs and engineering leaders who open this page after a first contact; the display size is the one shown in each image.
Read every image file named below. Language of the text: English. Each version is the same page, with different text. The banner, photo and layout are the same in every version. Below each image name is the full text of the fields that change, the About text as it reads after expanding "see more".
The step before this page: the reader saw a post or received a message from this company or person. The step after this page: the company's home page, which opens with the headline "Your teams have agents. Once all roles are in tune, your releases speed up." and the line "Hands-on training and mentoring in agentic engineering with AI coding agents, for engineering and product teams, their leaders and the people they work with.".
The company's line, which appears on its banners and closing slides: "Agents pay off when your people ship together."
Its stated mission: "We bring every role that builds our clients' products into flow with agentic engineering, as one team."
Its stated vision: "A world where the whole organization is in flow, because every role it takes to build its products is tuned to the others. Where agentic engineering is lived, not performed."

Version VD
Image: <run>/68473669cd.jpg
Headline:
Founder & Co-CEO hackers&wizards | Shipping as one team with agents | Co-author, Building the Agentic Software Factory (Packt) | Host, Rethink Engineering | Program chair, code.talks | Curator, CASE Berlin

About (full text behind 'see more'):
Your developers use AI agents and your releases come no faster. The gains stay with a few people, the token bill grows, and product, review and approvals do not speed up. With hackers&wizards I train everyone who builds your product to ship together with agents, so the speed reaches your customers.

Stefan Munz and I founded hackers&wizards in Hamburg. We bring engineering, product, design, QA, operations and the people who lead them into flow with agentic engineering, as one team. A customer's request then reaches production without waiting on the handoffs that kept your old pace. We measure the result against a baseline taken at the start: less time from request to production and a lower cost per shipped change.

Our seven team trainings last one or two days and are designed to work together. Each runs on your own code and in the coding agent your team already uses. After every two-day training, mentoring stays on call inside your refinement, planning, review and retro. Where you need a verdict before spending, we start with an assessment. Our trainers come from a network of 70+ practitioners. Your own people carry on by themselves and keep their craft.

I have been a technologist since I was a kid, and for twenty years developers in flow, building great products, have driven me. Before hackers&wizards I worked as engineer, architect and CIO at OTTO, Breuninger and BLUME2000. As a company we bring more than 20 years of building large software systems. We have worked with agents since the first agentic coding tools at the end of 2022.

I co-wrote Building the Agentic Software Factory with Alex Merced (Packt, November 2026) and host the Rethink Engineering podcast with re:cinq. I am program chair of code.talks and curate CASE Berlin. On stage I talk about moving teams from vibe coding to agentic engineering, architecture when AI writes more code, and developer experience as strategy.

Book a call with me: https://haw.dev/call

---

Version RD
Image: <run>/7878544121.jpg
Headline:
Founder & Co-CEO, hackers&wizards | AI training and mentoring in agentic engineering for engineering and product teams | Co-author, Building the Agentic Software Factory (Packt) | Program chair, code.talks

About (full text behind 'see more'):
I'm Founder & Co-CEO of hackers&wizards in Hamburg. We run AI training and mentoring in agentic engineering for engineering and product teams, on your own code and in the agent your team already uses. I work for CIOs and CTOs whose developers use AI agents and whose releases come no faster.

What we usually find: the gains stay with a few people, the token bill grows, and product, review and leadership keep their old pace. We treat that as an organizational problem before a technical one, and we work on it with everyone who builds the product: engineering, product, design, QA, operations and the people who lead them.

Shipping together means a customer's request reaches production without waiting on handoffs, reviews and approvals that kept their old pace. Then every role is in tune with the others and the whole team is in flow. You see it in less time from request to production and a lower cost per shipped change, measured against a baseline we take with you at the start.

The way there: seven team trainings of one or two days, designed to work together, with mentoring on call after every two-day training. Where you need a verdict first, we start with an assessment. Afterwards your own people carry on by themselves. The goal: the speed your teams gain reaches your customers.

For twenty years one thing has driven me: developers in flow, building great products. I worked as engineer, architect and CIO at OTTO, Breuninger and BLUME2000, and we have worked with agents since the first tools at the end of 2022. Our trainers come from a network of 70+ practitioners.

I co-wrote Building the Agentic Software Factory with Alex Merced (Packt), host the Rethink Engineering podcast with re:cinq, chair the program of code.talks and curate CASE Berlin.

Book a call: https://haw.dev/call

---

Version ZE
Image: <run>/fc4a9ea89b.jpg
Headline:
Founder & Co-CEO, hackers&wizards | AI training and mentoring in agentic engineering, so your people ship together | Co-author, Building the Agentic Software Factory (Packt) | Program chair, code.talks

About (full text behind 'see more'):
I'm Founder & Co-CEO of hackers&wizards in Hamburg. We run AI training and mentoring in agentic engineering for engineering and product teams, because agents pay off when your people ship together. I work for CIOs and CTOs whose developers use AI agents and whose releases come no faster.

What we usually find: the gains stay with a few people, the token bill grows, and product, review and leadership keep their old pace. We treat that as an organizational problem before a technical one, and we work on it with everyone who builds the product: engineering, product, design, QA, operations and the people who lead them.

Shipping together means a customer's request reaches production without waiting on handoffs, reviews and approvals that kept their old pace. Then every role is in tune with the others and the whole team is in flow. You see it in less time from request to production and a lower cost per shipped change, measured against a baseline we take with you at the start.

The way there: seven team trainings of one or two days, designed to work together, with mentoring on call after every two-day training. Where you need a verdict first, we start with an assessment. Afterwards your own people carry on by themselves. The goal: the speed your teams gain reaches your customers.

For twenty years one thing has driven me: developers in flow, building great products. I worked as engineer, architect and CIO at OTTO, Breuninger and BLUME2000, and we have worked with agents since the first tools at the end of 2022. Our trainers come from a network of 70+ practitioners.

I co-wrote Building the Agentic Software Factory with Alex Merced (Packt), host the Rethink Engineering podcast with re:cinq, chair the program of code.talks and curate CASE Berlin.

Book a call: https://haw.dev/call

---

Version ND
Image: <run>/eff875356d.jpg
Headline:
Founder & Co-CEO, hackers&wizards | AI training and mentoring in agentic engineering for engineering and product teams | Co-author, Building the Agentic Software Factory (Packt) | Program chair, code.talks

About (full text behind 'see more'):
I'm Founder & Co-CEO of hackers&wizards in Hamburg. We run AI training and mentoring in agentic engineering for engineering and product teams, on your own code and in the agent your team already uses. I work for CIOs and CTOs whose developers use AI agents and whose releases come no faster.

What we usually find: the gains stay with a few people, the token bill grows, and product, review and leadership keep their old pace. We treat that as an organizational problem before a technical one, and we work on it with everyone who builds the product: engineering, product, design, QA, operations and the people who lead them.

In flow, a customer's request reaches production without waiting on handoffs, reviews and approvals that kept their old pace. You see it in less time from request to production and a lower cost per shipped change, measured against a baseline we take with you at the start.

The way there: seven team trainings of one or two days, designed to work together, with mentoring on call after every two-day training. Where you need a verdict first, we start with an assessment. Afterwards your own people carry on by themselves. The goal: the speed your teams gain reaches your customers.

For twenty years one thing has driven me: developers in flow, building great products. I worked as engineer, architect and CIO at OTTO, Breuninger and BLUME2000, and we have worked with agents since the first tools at the end of 2022. Our trainers come from a network of 70+ practitioners.

I co-wrote Building the Agentic Software Factory with Alex Merced (Packt), host the Rethink Engineering podcast with re:cinq, chair the program of code.talks and curate CASE Berlin.

Book a call: https://haw.dev/call

Score each version on these criteria, 0 to 10 each, judging the text in its place on the page: first_screen_clear (what is on the first screen says what is on offer and for whom); carries_line (reading the whole, the company's line becomes concrete and is believable, without being repeated like a slogan); one_with_page (the text reads as one with the banner and the page around it, with no duplication or clash); fits_mission_vision; credible (facts over slogans, a person or company you would trust); natural_language (reads as natural English for this reader); next_step (you would answer, follow or book a call). Then give each version an overall score from 0 to 100.
For each version, name in one sentence what keeps its lowest criterion below 10 and which question this page leaves open for you as a reader.
Answer as JSON only: {"candidates": {"<version label>": {"criteria": {"first_screen_clear": <0-10>, "carries_line": <0-10>, "one_with_page": <0-10>, "fits_mission_vision": <0-10>, "credible": <0-10>, "natural_language": <0-10>, "next_step": <0-10>}, "overall": <0-100>, "lowest_reason": "...", "open_question": "..."}}}
```

Review: large, because the texts leave the company on every external profile.

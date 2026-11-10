# Amdahl's law and the claim: does it give a better claim or headline? 10.11.2026

One line that carries Amdahl's point beats the decided claim on the reader's path, but only ties it on the rendered panel. So the decision goes to Benedikt with keeping tpe-tune recommended (item `decide-claim-amdahl`). The line is "Agents speed up code. Your handoffs set the pace." / "KI-Agenten schreiben Code schneller. Eure Übergaben bestimmen das Tempo." (x4). On the path from the LinkedIn profile through the home page to the footer, it leads tpe-tune by 12.8 points, outside the noise in every cell, and it holds with the buyers' problem taken out of the prompt. On the panel of banner, one-pager and footer it leads by 1.5: Claude +2.2 and +3.3 in its two runs, Codex +0.8 in its first and +0.0 in its second. That makes it a tie by the rule set before any score. Its cost is people: reviewers read "handoffs" as process. An English headline in the same spirit beats the decided headline on the home page, but no German version of it holds.

The rule, fixed before the first panel score: a claim candidate wins only if it leads tpe-tune on the panel outside the noise in both runs and with both models, keeps its German within its own noise, passes the cold read bar (24 of 32) and does not trail on the path. A headline candidate wins only if it leads the decided headline on the hero, judged on what it says, in both runs and with both models. The anchor q6 had to land below tpe-tune.

## What Amdahl's law says

Gene Amdahl argued at the AFIPS Spring Joint Computer Conference 1967 (vol. 30, pp. 483 to 485) that a faster parallel part buys little while the part that stays sequential keeps its pace. The paper has no formula; the reprint's editor notes it has no equations (IEEE SSCS News, Summer 2007). Its argument, in Amdahl's words:

- "The first characteristic of interest is the fraction of the computational load which is associated with data management housekeeping."
- "Overhead alone would then place an upper limit on throughput of five to seven times the sequential processing rate, even if the housekeeping were done in a separate processor."
- "A fairly obvious conclusion which can be drawn at this point is that the effort expended on achieving high parallel processing rates is wasted unless it is accompanied by achievements in sequential processing rates of very nearly the same magnitude."

The formula the law is known by comes from John L. Gustafson's restatement (Communications of the ACM 31(5), May 1988, pp. 532 to 533): with a serial share s and N processors, speedup is 1 / (s + p / N), so even infinitely many processors give at most 1 / s.

Gustafson's counterpoint: "in practice, the problem size scales with the number of processors", so "it may be most realistic to assume that run time, not problem size, is constant." His scaled speedup, N + (1 − N) s, grows almost linearly. Yuan Shi (Temple University, October 1996) shows "that these two laws are in fact identical" once the serial share is defined the same way. They answer different questions: how much sooner the same work is done (Amdahl), or how much more work fits in the same time (Gustafson).

## How it is used for team and organisation speed

Applied to software delivery, the parallel part is writing code, which coding agents speed up, and the rest of the path from idea to customer stays at human speed until it changes too:

- Evan Meagher, "Amdahl's law and agentic coding" (30.01.2026): "the writing of the code wasn't the bottleneck." His remedy: "Listen to your engineers when they try to tell you what's slowing them down."
- Kyle Mathews, "Amdahl's law for AI agents" (Electric, URL dated 19.02.2026): agent speedup is "bounded by 1/H, where H is the fraction of the workflow that requires human judgment." He wants each human intervention to make the next one of its kind unnecessary.
- Fernando Bordallo, "How Amdahl's law still applies to modern-day AI inefficiencies" (Atlassian, 03.04.2026): "AI often speeds up work in areas that were never the real bottleneck", and "Speeding up a part that is not the constraint does not improve the system."
- DORA's 2025 report does not use the law, but finds the same pattern: "AI's primary role is as an amplifier, magnifying an organization's existing strengths and weaknesses."

In Gustafson's reading a faster coding step lets a team do more in the same release cycle. That is output: more code, more pull requests. It is the reading `brand-voice` excludes as proof of results.

## How it relates to the position h&w states

h&w's position already is Amdahl's argument in positive form, and the decided lines carry it:

- `position`: "CIOs and CTOs whose developers have coding agents and whose releases come no faster" describes the cap; "until every role works in tune with the others" is lowering the serial share across roles; "shows in lead time and in the cost of every shipped change" measures it the way Amdahl does, the same work done sooner.
- The decided home headline, "Your teams have agents. Once all roles are in tune, your releases speed up.", states the law's consequence.
- The decided claim, "Agents pay off when your people are in tune.", is Amdahl's "wasted unless accompanied by" turned positive: the payoff of the fast part depends on the rest.
- What the decided lines leave out is the law's own image: the part that stays slow sets the pace of the whole. That is the ground this run tested.

The other speaker's slides are the trigger only: no candidate quotes or paraphrases their sentence, and no line names the law.

## Candidates

Twelve claims and seven headlines went into a text screen. I wrote four of the claims and two of the headlines. A fresh drafter (`claude -p`, Opus) wrote eight claims and four headlines; two of its claims stayed out of the screen as close to measured lines ("Fast code reaches customers at your team's pace.", "Faster together, from idea to customer."). The drafter it saw the position, the decided headline, the law's point in plain words without its name, the rules and ten measured lines. It did not see which line is the claim. The rules: positive, no negation (no "not", "only", "without", "nur", "ohne"), three to nine words, no figures, no dash, no "flow", "KI-Agenten" in German, the ihr-form. tpe-tune and q6 stood among the claims under neutral labels.

| Key | Line (EN / DE)                                                                                                             | Screen | Claude / Codex |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------ | -------------- |
| x4  | Agents speed up code. Your handoffs set the pace. / KI-Agenten beschleunigen den Code. Eure Übergaben bestimmen das Tempo. | 80.8   | 79.0 / 82.7    |
| tpe | Agents pay off when your people are in tune. / KI-Agenten lohnen sich, wenn eure Leute eingespielt sind.                   | 76.5   | 73.3 / 79.7    |
| x3  | Agents pay off when your whole team keeps pace. / KI-Agenten lohnen sich, wenn euer ganzes Team Schritt hält.              | 75.5   | 70.3 / 80.7    |
| c7  | Your agents are waiting for the rest of the team. / Eure KI-Agenten warten auf den Rest des Teams.                         | 72.3   | 71.3 / 73.3    |
| x1  | Agents are as fast as your whole team. / KI-Agenten sind so schnell wie euer ganzes Team.                                  | 69.8   | 76.0 / 63.7    |
| q6  | Agents bring the speed. Flow needs teams in tune. (anchor)                                                                 | 69.7   | 62.7 / 76.7    |
| c1  | Your agents move at the pace of your people.                                                                               | 68.3   | 65.7 / 71.0    |
| c5  | From idea to customer, your people set the pace.                                                                           | 63.0   | 55.0 / 71.0    |
| c8  | Every role at agent speed.                                                                                                 | 57.2   | 52.3 / 62.0    |
| x2  | Agents pay off when every step speeds up.                                                                                  | 57.0   | 52.3 / 61.7    |
| c4  | Agent speed belongs to the whole team.                                                                                     | 56.8   | 49.3 / 64.3    |
| c3  | Every role faster, every agent worth it.                                                                                   | 53.8   | 47.7 / 60.0    |

The screen: CTO, conference organiser and brand strategist, Claude and Codex, one run each, both languages. x3's "keeps pace" read as pressure on the people ("casts people as chasing machines"), c7 as blame. Between screen and panel, x4's German became "KI-Agenten schreiben Code schneller." ("beschleunigen den Code" read stiff), and a variant took the people's side: x4t, "Agents speed up code. Your teamwork sets the pace." / "... Euer Zusammenspiel bestimmt das Tempo.".

The headline screen (CTO, VP of Engineering, Head of Engineering at an insurer; both models) put the decided headline first (77.5), the drafter's "Your developers code faster with agents. Releases arrive sooner when planning, review and operations keep pace." second (77.0). Its short form d1k, "... Releases speed up once product, QA and ops keep pace.", went to the hero.

## Rendered panel: LinkedIn app and laptop, one-pager header, website footer (40 runs)

The banner is `render.py`'s profile banner with the descriptor, pasted into the LinkedIn screenshots of 08.11. (photo laid back over it); two-sentence lines break after the first sentence, each line's word in the accent. The one-pager header is the documents engine's onepager sample with the line above the title; the footer is the live site at 1440 px with the line in place of the current claim. Personas: CTO, VP of Engineering, conference organiser, senior engineer looking for a job, brand strategist; Claude and Codex; two runs; English and German apart.

| Key | Overall | Noise | Claude / Codex | EN / DE     | Banners | One-pager | Footer | Distinctive | Clear | Calm | Core | People | Together |
| --- | ------- | ----- | -------------- | ----------- | ------- | --------- | ------ | ----------- | ----- | ---- | ---- | ------ | -------- |
| x4  | 79.3    | 0.2   | 78.1 / 80.5    | 79.5 / 79.2 | 80.5    | 79.0      | 74.0   | 7.4         | 8.0   | 7.7  | 8.7  | 6.6    | 7.9      |
| x4t | 79.3    | 0.4   | 75.0 / 83.7    | 78.1 / 80.6 | 80.5    | 78.2      | 74.6   | 5.4         | 8.8   | 7.5  | 8.6  | 8.4    | 8.7      |
| tpe | 77.8    | 0.1   | 75.3 / 80.2    | 77.4 / 78.1 | 81.5    | 79.2      | 82.4   | 5.3         | 8.4   | 9.0  | 7.7  | 9.6    | 7.5      |
| q6  | 70.7    | 0.2   | 67.2 / 74.2    | 70.4 / 71.0 | 75.7    | 73.9      | 76.1   | 5.4         | 6.5   | 8.7  | 7.0  | 7.9    | 8.0      |

Leads over tpe per model and run: x4 Claude +2.2 and +3.3, Codex +0.8 and +0.0; x4t Claude -0.8 and +0.1, Codex +3.7 and +3.4. The anchor q6 lands 7.1 below tpe. What keeps them below the maximum, counted over 40 reviews each:

- x4: "handoffs" / "Übergaben" in 40 ("sounds like process rather than people and can read as agent handoffs"), the footer's four or five lines in 16, "speed up code" read as faster-running software in 6.
- x4t: "teamwork" / "Zusammenspiel" as generic in 36 ("any consultancy could claim it").
- tpe: "in tune" / "eingespielt" in 33, "pay off" / "lohnen sich" in 22 ("names no concrete benefit").

## Cold reads: the banner alone and with the descriptor (112 runs)

One banner in the LinkedIn app or on the laptop, "you know nothing else about the company", what does it tell you. CTO, VP of Engineering, engineering lead, Head of HR; both models; banner alone and with the descriptor; English and German. A blind classifier (three shuffled passes, majority) marked people, a result for the company, and core (agents alone are not enough). Planted readings came back as planted.

| Line | People  | Result  | Core    |
| ---- | ------- | ------- | ------- |
| tpe  | 32 / 32 | 32 / 32 | 32 / 32 |
| x4   | 32 / 32 | 32 / 32 | 32 / 32 |
| x4t  | 32 / 32 | 32 / 32 | 32 / 32 |
| f6   | 16 / 16 | 7 / 16  | 14 / 16 |

f6 ("Every agent needs a team in tune.", with descriptor) is the control that must miss, and it misses the result, so the read separates. All 32 x4 readers restate that the handoffs set the pace; 4 of them place the handoffs between people and agents, the rest between people, teams or steps.

## The home headline (36 runs)

The live home page in headless Chrome with the H1 replaced, the assessment link with its price hidden. Desktop English and German at 1440 × 900 at full size, English phone at 390 × 844. The question: what the line says, on the criteria of 07.11.; layout scored apart.

| Round                  | Decided headline | d1k / d1k2 | Noise | Lead per cell (Claude r1, r2; Codex r1, r2) | Layout decided / candidate |
| ---------------------- | ---------------- | ---------- | ----- | ------------------------------------------- | -------------------------- |
| 1                      | 70.2             | 76.3       | 2.7   | +3.3, +12.3, +4.3, +4.7                     | 8.3 / 5.8                  |
| 2, German fixed (d1k2) | 71.7             | 75.8       | 1.7   | +2.3, +3.0, +6.3, +5.0                      | 8.2 / 3.4                  |

d1k2's German, "Eure Entwicklerteams schreiben mit KI-Agenten schneller Code. Eure Releases kommen früher, wenn Produkt, QA und Betrieb Schritt halten.", runs ten lines at 1440 px against six. Two shorter German drafts went into a German-only round:

| German H1                                                                                                              | Hero (DE) | Claude / Codex | German path with tpe | Lines at 1440 |
| ---------------------------------------------------------------------------------------------------------------------- | --------- | -------------- | -------------------- | ------------- |
| Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller. (decided)                  | 72.6      | 73.3 / 71.8    | 78.2                 | 6             |
| g2: Mit KI-Agenten programmiert ihr schneller. Releases kommen früher, wenn Produkt, QA und Betrieb mithalten.         | 76.0      | 68.7 / 83.3    | 74.6                 | 7             |
| g1: KI-Agenten machen eure Entwicklung schneller. Eure Releases kommen früher, wenn Produkt, QA und Betrieb mitziehen. | 73.3      | 69.3 / 77.3    | 74.4                 | 7             |
| d1k2 (above)                                                                                                           | 71.2      | 60.7 / 81.8    | 67.4                 | 10            |

Claude puts every German draft behind the decided line in both runs, Codex every one ahead; on the German path all three trail. No German holds, so the headline stays an English-only option in the item. Reviewers read it as casting product, QA and operations as laggards.

## The reader's path (112 runs)

Each sheet shows the steps in order: the founder's LinkedIn profile in the app and on the laptop, the home page at 1440 (and 390 for English) with the H1, the footer. Personas: CTO, VP of Engineering, brand strategist, bilingual copy editor; both models; two runs; English and German apart. Criteria: clear, relevant, credible, distinctive, language, one message, the H1 doing a headline's job, the line doing a claim's job, overall.

| Round                                   | tpe + decided H1 | x4 + decided H1 | u1 + decided H1 | d8 + decided H1 | x4 lead per cell (Claude r1, r2; Codex r1, r2) |
| --------------------------------------- | ---------------- | --------------- | --------------- | --------------- | ---------------------------------------------- |
| With the anchors                        | 68.0             | 80.8            | 66.0            | 73.4            | +17.5, +17.0, +8.2, +8.4                       |
| Same, without "releases come no faster" | 68.8             | 79.8            | 66.9            | 72.2            | +15.4, +11.1, +8.2, +9.0                       |
| With d1k2 as second H1 (no anchors)     | 66.2             | 76.0            |                 |                 | +12.8, +12.8, +6.5, +7.2                       |

Noise is at most 1.3 in every row. x4 leads in English and German in every round (with the anchors: 79.4 / 82.1 against 66.8 / 69.2), mostly on claim (8.3 against 6.2) and distinctive (7.7 against 5.0). The anchors repeat the order of 08.11.: d8 above tpe-tune, u1 below. In the third row's round, tpe with d1k2 as the headline scored 68.6 (English 73.9, German 63.4) against 66.2 with the decided headline (62.2, 70.1): 11.7 up in English, 6.8 down in German. x4 with d1k2 scored 76.6, 0.6 above x4 with the decided headline. The German-only round puts d1k2 10.8 behind (67.4 against 78.2).

The path sits lower than on 08.11. (tpe 68.0 against 78.0), with a different set of pairs and prompts. The anchors keep their order, so I read the gap as the scale of this round rather than a different measurement; its cause is not established.

## Against the rule

| Requirement                             | x4                         | x4t                      | Headline d1k                         |
| --------------------------------------- | -------------------------- | ------------------------ | ------------------------------------ |
| Panel lead outside the noise, all cells | no: Codex run 2 +0.0       | no: Claude -0.8 and +0.1 | yes, both hero rounds                |
| German within its own noise             | misses by 0.1 (0.3 at 0.2) | German ahead             | no: every German draft trails        |
| Cold read core, 24 of 32                | 32                         | 32                       | not measured                         |
| No loss on the path                     | ahead in every cell        | not measured             | English +11.7, German -6.8 and -10.8 |

## Skipped and caveats

- The LinkedIn chrome is the 08.11. screenshot with the new banner pasted at its measured place and the photo laid back over it; the German sheets keep its English profile labels.
- The one-pager header is the documents engine's sample with an invented intro, not a real one-pager.
- The X header, Sessionize cover, closing slide and link preview were not shown; the brief names banner, website and one-pager.
- x4t's path, and x4 with the headline d1k2 in German, were not measured beyond the rounds above.
- Codex read its global `voice` and `blind-review` skill files and global rules at the start of every run. None of the 156 Codex runs read `verbal.json`: no command in their logs touches it, and the text of u1, the claim `verbal.json` still holds, appears only in the path runs whose prompt carried u1 as an anchor.
- Trademarks are not queried for x4.

## Images

- [x4 on the panel surfaces](2026-11-10-claim-amdahl/x4-panel.jpg), [in German](2026-11-10-claim-amdahl/x4-panel-de.jpg), [tpe-tune on the same surfaces](2026-11-10-claim-amdahl/tpe-tune-panel.jpg)
- The reader's path with the decided headline: [x4](2026-11-10-claim-amdahl/x4-path.jpg), [tpe-tune](2026-11-10-claim-amdahl/tpe-tune-path.jpg)
- The headline: [d1k in English at 1440 px](2026-11-10-claim-amdahl/d1k-hero.jpg), [g2 in German](2026-11-10-claim-amdahl/g2-hero-de.jpg)

## A reviewer prompt, verbatim (panel, CTO, Claude, run 1, English)

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. A training company from Hamburg, hackers&wizards, trains and mentors engineering and product teams and their leaders in working with AI coding agents. It is choosing the claim, the short line that stands on its LinkedIn profile banner and its other profile banners, in the header of its training one-pagers and in its website footer. Audience: CTOs, CIOs, VPs of Engineering and senior engineers in German-speaking companies. Each image shows the same set of real surfaces at display size (the LinkedIn profile in the iPhone app and on a laptop, a one-pager header, the website footer at 1440 px), each with a different claim line; language: English. Read every image file.

SZ: /tmp/cr1011/blind/770e3bf46e.jpg  (line: Agents bring the speed. Flow needs teams in tune.)
MF: /tmp/cr1011/blind/f9eae6d844.jpg  (line: Agents speed up code. Your teamwork sets the pace.)
BV: /tmp/cr1011/blind/57a0e47e7a.jpg  (line: Agents speed up code. Your handoffs set the pace.)
KC: /tmp/cr1011/blind/f2e9603db0.jpg  (line: Agents pay off when your people are in tune.)

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
Name for each line the one question it leaves open for you, and what keeps it below the maximum.
Answer with JSON only: {"<label>": {"distinctive":0,"clear":0,"emotional":0,"credible":0,"calm":0,"language":0,"core":0,"people":0,"together":0,"banners":0,"onepager":0,"footer":0,"overall":0,"open_question":"at most 15 words","below_max":"at most 20 words"}, ...} covering every label.
```

Runs: 12 screen, 1 drafter, 40 panel, 112 cold reads, 6 classifier, 36 hero, 112 path: 319.

Review: large, because the claim and the headline leave the company on every banner and the home page.

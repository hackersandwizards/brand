# "Agents bring the speed. Flow needs teams in tune." as claim and as headline, 09.11.2026

The website's 87.7 holds when repeated, but it scores something else. That panel judged only how the headline is laid out on the first screen: its line breaks, stranded words and calm. A rerun with the website's prompt and personas gives 87.4 for the line (q6) and 76.5 for the decided headline. Swap the H1 alone and the layout score moves by 18 points on both the old and the current page. Keep the same screenshots, ask what the line says, and the order reverses: the decided headline leads by 8.1 on the old page and 8.6 on today's, with both models and in both runs.

Judged on what it says, q6 loses in both roles. As the home H1 it scores 70.8 on the reader's path, against 76.8 for the decided headline with the same claim. As the claim it scores 69.9 on banner, footer and link preview, against 79.3 to 79.9 for tpe, tte and u1. Every one of the 32 claim reviews names "flow" as what keeps it below the maximum. Its one lead is distinctive: 6.6, the highest of the five lines.

## Why the two panels disagreed

Three factors differed between the 87.7 and the decided headline's 76.4 on the website: the H1 line, the page around it, and the question. The page part bundles the brand version (v1.28.5 against v1.60.0), the lead sentence and the break rule. Each round below changes one of them. Personas, models and the website's prompt stay as the website used them: CTO of a German mid-sized manufacturer, VP of Engineering at a European e-commerce company, Head of Engineering at a German insurer, Claude (`opus`) and Codex (`gpt-6.1-sol`, high), two runs, 12 runs per round. The pages are local builds of website commits `6777c5d0` (the old page, brand v1.28.5, q6 as H1) and `4f5e8c54` (today's page), shot in headless Chrome; each candidate shows the three images the website's panel showed: English and German at 1440 × 900 (scaled to 1000 px), English at 390 × 844. Swapping the H1 through the DOM gives pixel-identical screenshots to the native page, so the method changes nothing by itself.

| Round                            | Change against the round above                       | q6 as H1 | Decided headline | Lead of q6 | Noise      |
| -------------------------------- | ---------------------------------------------------- | -------- | ---------------- | ---------- | ---------- |
| Website, 09.11. (its report)     | —                                                    | 87.7     | 76.4             | +11.3      | 2          |
| 1 Replication                    | none: the website's five candidates and prompt       | 87.4     | 76.5             | +10.9      | 0.2 to 1.5 |
| 2 H1 swap, old page              | same page around both lines                          | 84.1     | 66.2             | +17.9      | 2.0 to 2.2 |
| 2 H1 swap, today's page          | same page around both lines                          | 87.0     | 68.8             | +18.2      | 1.5 to 1.7 |
| 3 Message question, old page     | same images as round 2, the 07.11. headline criteria | 67.8     | 75.9             | -8.1       | 0.5 to 1.0 |
| 3 Message question, today's page | same images as round 2, the 07.11. headline criteria | 71.2     | 79.8             | -8.6       | 0.1 to 0.3 |

- Round 1 repeats the website's whole table within 2.3 points: no break 71.4 (70.0), break after the comma too 63.8 (62.2), every second word 53.9 (56.2). All 12 reviewers pick q6 as best.
- Round 2: the page around the line moves the score by 2.6 to 2.9, at a noise of 1.5 to 2.2. The line moves it by 18. In the website's criteria q6 scores 9.4 on "no stranded single word" against 5.8; at 1440 px the decided headline wraps "Your teams / have agents." and takes five lines, q6 four.
- Round 3 asks what the round-2 images say: clear, relevant, credible, distinctive, fit with the hero, language, as on 07.11. The decided headline leads in every cell: on today's page Claude +8.0 and +7.3, Codex +9.3 and +9.6; on the old page Claude +7.0 and +6.7, Codex +8.6 and +10.0. q6 is clear 6.5 against 8.5 and relevant 6.8 against 9.0. Reviewers: "'Flow' leaves faster releases implicit; agent speed sounds assumed, and the headline resembles a tagline."

The 07.11. panel's 76.8 for q6 as H1 was a message score, the website's 87.7 a layout score.

The q6 shots keep the old page's break after every second word ("Agents bring / the speed. / Flow needs / teams in tune."). Under today's rule, a break after the first sentence, q6 strands "tune." at 1440 px. Shipping q6 as H1 would need its own break.

## q6 as home headline on the reader's path

Each set showed one path in step order: the founder's LinkedIn banner with the claim, today's home page at 1440 and 390 with the H1, and the footer with the claim and the offer sentence. Four personas (the three above, the VP without the words "pay off", plus a brand strategist for B2B technology services in the German-speaking market), both models, two runs, English and German apart: 32 runs. Criteria fixed before any score: clear, relevant, credible, distinctive, language, one message, the H1 doing a headline's job, the banner and footer line doing a claim's job.

| H1 + claim             | Overall | Noise | Claude / Codex | EN / DE     | Clear | Distinctive | One message | Headline | Claim |
| ---------------------- | ------- | ----- | -------------- | ----------- | ----- | ----------- | ----------- | -------- | ----- |
| Decided headline + tpe | 76.8    | 0.7   | 72.4 / 81.2    | 77.6 / 76.1 | 8.2   | 5.9         | 8.2         | 7.3      | 7.1   |
| Decided headline + u1  | 75.2    | 0.1   | 69.0 / 81.3    | 76.9 / 73.4 | 8.3   | 5.8         | 7.7         | 7.2      | 6.9   |
| Decided headline + q6  | 72.2    | 0.5   | 65.1 / 79.2    | 70.6 / 73.8 | 7.5   | 6.5         | 7.6         | 7.2      | 6.6   |
| q6 + tpe               | 70.8    | 1.6   | 66.5 / 75.1    | 69.8 / 71.8 | 6.9   | 6.0         | 6.7         | 7.6      | 7.3   | 6.9 | 7.1 |
| q6 + u1                | 70.3    | 0.2   | 64.6 / 76.0    | 69.1 / 71.6 | 7.0   | 6.1         | 6.7         | 7.6      | 7.2   | 6.9 | 6.8 |

With the same claim, q6 as H1 trails the decided headline by 6.0 (tpe) and 4.9 (u1), with both models in both runs, outside the noise. The brand strategist alone has it level or ahead: 75.9 against 75.1 with tpe, 74.4 against 72.5 with u1. With tpe, the two lines share "in tune" / "eingespielt", and reviewers call that repetition rather than a link: "'Eingespielt' steht im Claim und in der H1; beide Zeilen sagen dasselbe, keine erledigt eine eigene Aufgabe."

q6 as the claim beside the decided headline scores 72.2, behind tpe by 4.6 and u1 by 3.0, with both models. In German it ties u1 (73.8 against 73.4).

## q6 as the claim on banner, footer and link preview

The method of `2026-11-08-claim-tune.md`, with the surfaces this brief names: the LinkedIn profile banner (render.py's profile banner, 1584 × 396, at full size, no accent word on any line), the website footer at 1440 px (claim plus offer sentence, left part at full size) and the link preview card (the website's template, 1200 × 630). Its prompt and nine criteria are those of claim-tune; banner, footer and preview take the place of its 0 to 100 scores for banners, slide and preview. Same four personas, both models, two runs, English and German apart: 32 runs.

| Claim | Overall | Noise | Claude / Codex | EN / DE     | Distinctive | Clear | Emotional | Calm | Credible | Language | Core | People | Together | Banner | Footer | Preview |
| ----- | ------- | ----- | -------------- | ----------- | ----------- | ----- | --------- | ---- | -------- | -------- | ---- | ------ | -------- | ------ | ------ | ------- |
| tte   | 79.9    | 0.3   | 76.7 / 83.2    | 79.8 / 80.1 | 5.4         | 8.6   | 6.4       | 8.8  | 8.2      | 8.9      | 8.1  | 7.8    | 8.1      | 83.3   | 82.1   | 83.3    |
| tpe   | 79.3    | 0.7   | 77.3 / 81.2    | 79.8 / 78.8 | 5.6         | 8.2   | 6.6       | 8.8  | 8.2      | 8.3      | 8.0  | 9.5    | 7.2      | 82.6   | 81.3   | 82.5    |
| u1    | 79.3    | 0.2   | 78.9 / 79.8    | 81.1 / 77.6 | 5.8         | 8.4   | 6.5       | 8.6  | 7.8      | 7.9      | 7.9  | 9.5    | 8.9      | 81.8   | 80.9   | 81.8    |
| q6    | 69.9    | 1.1   | 66.3 / 73.4    | 71.1 / 68.6 | 6.6         | 6.3   | 6.7       | 7.6  | 6.7      | 6.7      | 7.3  | 7.2    | 7.7      | 74.0   | 72.0   | 72.3    |
| d8    | 68.9    | 0.6   | 59.9 / 77.9    | 70.4 / 67.4 | 5.3         | 7.5   | 6.2       | 6.4  | 7.0      | 7.2      | 7.2  | 7.8    | 5.8      | 70.9   | 73.8   | 66.2    |

q6 trails tpe, tte and u1 by 9.4 to 10.0, with both models, in both runs and both languages. What keeps it below the maximum, in the reviewers' words:

- "flow" in all 32 reviews: "'Flow' is ambiguous jargon", "Flow of what: developer flow state, delivery flow, or value stream?"
- The speed promise, in about half: "'Bring the speed' feels forced; 'flow' needs interpretation, and agent speed sounds guaranteed."
- German: "Teams." alone on the last line of the link preview, in 15 of 16 German reviews, a break of the card's template that this line meets; "Agenten" without "KI" in 6 ("In einem Versicherer denke ich zuerst an Vermittler").

## This round against claim-tune of 08.11.

On this panel tpe, tte and u1 tie (79.3 to 79.9; Claude puts u1 first, Codex tte). On 08.11. tpe led u1 by 6.7 (81.7 against 75.0). The surfaces, the persona set (four here, five there, two of them different), the VP's wording and the banner's accent word differ between the rounds; which of them moves u1 is not yet explained. On the path, tpe leads u1 by 1.6 with the decided headline: Claude +3.4, Codex -0.1. On 08.11. it led by 5.5. Neither round puts u1 ahead of tpe.

## Skipped

- The link preview stands only on the claim panel, not on the path, which enters through the LinkedIn banner.
- X header, Sessionize cover and closing slide of the 08.11. panel are not shown; the brief names banner, footer and preview.
- The German banner keeps render.py's break rule, which strands "Wer" for d8, as on 08.11.
- The price in the assessment link stayed in the reviewers' screenshots, as on the website's panel; the item's images drop it.
- No new candidate: the question was q6 against the lines already measured.

## A reviewer prompt, verbatim (round 3, Head of Engineering, Codex, run 1)

Rounds 1 and 2 used the website's prompt from its run script word for word; round 3 changes only the question.

```text
You are the Head of Engineering at a German insurer. You read skeptically and in German as well as in English.

A company from Hamburg, hackers&wizards, trains and mentors engineering teams, product teams and their leaders in working with AI coding agents (agentic engineering). Its buyers are CTOs, CIOs and VPs of Engineering whose developers have coding agents while releases come no faster. It is choosing the headline of its homepage: the H1 over the hero, the first thing a buyer reads. The brand also has a separate claim, a short tagline that stands in the footer, on decks and on banners; the headline does its own job.

Medium: the first screen of the company's website home page. Audience: engineering and product leaders at European companies who are checking out the company for the first time. Real display size: desktop at 1440 by 900 px (shown scaled to 1000 px wide) and phone at 390 by 844 px, English and German. Each candidate stands as the H1 on the real homepage; beside it a visual of a tuning desk where five role sliders move from "ad hoc" to "team standard" and the delivery waveform plays "in flow".

Candidates, labelled K, H, L, X. Read every image with your image reading tool:
K
  en: Agents bring the speed. Flow needs teams in tune.
  de: Agenten bringen das Tempo. Flow braucht eingespielte Teams.
  images (desktop en, phone en, desktop de): /tmp/claim-flow-0911/blind/33a408d651.png, /tmp/claim-flow-0911/blind/d81942dcd7.png, /tmp/claim-flow-0911/blind/bc2f5c4c93.png
H
  en: Your teams have agents. Once all roles are in tune, your releases speed up.
  de: Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller.
  images (desktop en, phone en, desktop de): /tmp/claim-flow-0911/blind/9a7cac76b8.png, /tmp/claim-flow-0911/blind/d56dcf7f63.png, /tmp/claim-flow-0911/blind/df9a20acec.png
L
  en: Your teams have agents. Once all roles are in tune, your releases speed up.
  de: Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller.
  images (desktop en, phone en, desktop de): /tmp/claim-flow-0911/blind/00df89f707.png, /tmp/claim-flow-0911/blind/15bbefd6b3.png, /tmp/claim-flow-0911/blind/5f0c06e95d.png
X
  en: Agents bring the speed. Flow needs teams in tune.
  de: Agenten bringen das Tempo. Flow braucht eingespielte Teams.
  images (desktop en, phone en, desktop de): /tmp/claim-flow-0911/blind/29bbb668a1.png, /tmp/claim-flow-0911/blind/5fe1ba1895.png, /tmp/claim-flow-0911/blind/b28c8aa45b.png

Criteria, each 0 to 10:
1. clear: within seconds you understand what changes for your company
2. relevant: it names a change you want for your company
3. credible: you believe it; it promises nothing you would distrust
4. distinctive: it could not stand just as well on a competitor's homepage
5. fit_hero: it fits the hero around it, the lead sentence under it and the visual beside it
6. language: idiomatic, natural English and natural spoken German; not a translation, not stilted

Then overall, 0 to 100: how well this works as the homepage headline.

Reply with only one JSON object, no markdown fence: {"scores": {"<label>": {"criteria": [six numbers], "overall": <0-100 number>}}, "best": "<label>", "open_question": "<which question the best candidate leaves open, one sentence>", "keeps_it_below_maximum": "<for each label, what keeps it below the maximum, at most 15 words each>"}
```

Runs: 12 replication, 12 H1 swap, 12 message question, 32 path, 32 claim panel: 100.

Review: large, because the claim and the headline leave the company on every banner and the home page.

# The wording of the home headline: in step, in tune or in flow, 08.11.2026

With u1 as the claim, "every role is in step" and "all roles are in tune" tie for the home H1. In round 3, "all roles are in tune" leads by 1.5 with both models and in both runs (79.4 against 77.9), but the panel noise is 2.3. u1 ("Agents pay off when your people ship together.") repeats neither line, so "in tune" no longer loses the way it did after f6. By the tie rule the unchanged line, step-every, stays recommended. The counter-draft "every role works in concert" also ties (78.8). "Every role is in tune" comes last (76.1), since a single role can't be in tune alone. The German H1 ("Wenn alle Rollen zusammenspielen") fits every option. Benedikt decided for tune-all on 08.11. (item `decide-home-headline-tune`): "„all roles are in tune“ perfect." `headline.en` is now "Your teams have agents. Once all roles are in tune, your releases speed up.", and the "in step" line is in `retired`. It follows `decide-home-headline-wording`, which Benedikt decided for step-every on 08.11. on panels that assumed c3 or f6 as the claim.

## The question

Benedikt, 08.11.: "\"Your teams have agents. Once every role is in step, your releases speed up.\" sehr cool. wie ist \"Your teams have agents. Once every role is in tune, your releases speed up.\" oder \"Your teams have agents. Once every role is in flow, your releases speed up.\" oder \"Your teams have agents. Once all roles are in tune, your releases speed up.\" oder \"Your teams have agents. Once all roles are in flow, your releases speed up.\""

Round 1 found the reviewers asking "in step with what?" of the leading line. Round 2 tests the completed forms against it.

Benedikt asked again on 08.11. after u1 became the claim. Since u1 is on the same page as the H1 and carries neither "tune" nor "step", round 3 tests whether "in tune" now beats "in step".

## Candidates

English only; the German H1 stays "Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller." for every candidate. Lines: the H1's line count at desktop 1440 and phone 390, the same on both.

| Key               | English H1                                                                                  | Round | Lines |
| ----------------- | ------------------------------------------------------------------------------------------- | ----- | ----- |
| step-every        | Your teams have agents. Once every role is in step, your releases speed up.                 | 1-3   | 5     |
| tune-all          | Your teams have agents. Once all roles are in tune, your releases speed up.                 | 1-3   | 5     |
| step-each-all     | Your teams have agents. Once all roles are in step with each other, your releases speed up. | 2     | 6     |
| step-others-every | Your teams have agents. Once every role is in step with the others, your releases speed up. | 2     | 5     |
| tune-every        | Your teams have agents. Once every role is in tune, your releases speed up.                 | 1, 3  | 5     |
| concert-every     | Your teams have agents. Once every role works in concert, your releases speed up.           | 3     | 5     |
| flow-every        | Your teams have agents. Once every role is in flow, your releases speed up.                 | 1     | 5     |
| flow-all          | Your teams have agents. Once all roles are in flow, your releases speed up.                 | 1     | 5     |

## Method

The same in all rounds; round 2 reused round 1's render, panel and tally scripts with only the candidates changed. Round 3's differences are listed in its section.

- Page: the website at commit 5b80fcd4 in a scratch worktree, run with `astro dev`. The H1 was set in the copy file per candidate and balanced by the browser (`text-wrap: balance`); the start page's line-break rule, written for an earlier H1, was removed for every candidate alike. The assessment link's price was removed, since this repository is public. Headless Chrome for Testing, the desk's sliders held lined up with the waveform running, the Astro dev toolbar removed. Desktop 1440 x 900, the first screen; phone 390 px at 2x, from the top to the bottom of the desk. The German H1 breaks to six lines on both. Images scaled to 1000 px on the long side.
- Step before the page: the home link preview, the website's `scripts/og/template.html` filled as `generate.mjs` fills the home card, once with c3 ("Agents in the team. Teams in flow.") and once with f6 ("Every agent needs a team in tune."). Pass c3 and pass f6 are the two panels of each round.
- Personas: CTO of a German Mittelstand manufacturer, VP of Engineering at a Berlin scale-up, brand strategist for DACH B2B technology services, native English copy editor for UK and US B2B technology sites.
- Criteria, fixed before any score, 0 to 10: the 07.11. headline criteria (clear, relevant, credible, distinctive, fit with the hero, language), idiom (the phrase reads as natural English for roles in a company), together (claim on the preview and headline each do their own job, neither repeats the other), German fit (the shared German H1 carries this English candidate). Overall 0 to 100. Each reviewer also named the question a candidate leaves open.
- Reviewers: Claude (`claude -p --model opus`) and Codex (`gpt-6.1-sol`, high), two runs each, a shuffled order per run under labels H1 to H5 (round 1) or H1 to H4 (round 2), file ids that carry no meaning. No prompt says which line is current, whose idea any line is, or that one was asked about. 32 reviewer runs per round.
- Noise: the gap between the two runs' panel means per candidate; the reviewer noise is the mean gap of a single reviewer's two scores.

Scores compare within one round only. A panel scores each candidate against the others in its set, so step-every's 79.9 in round 1 and 78.3 in round 2 are not a drop.

## Round 3: with u1 on the preview and in the footer

Changes against rounds 1 and 2: the website at commit b7e79ae0, the claim u1 in the footer (brand's `verbal.json` patched in the scratch install) and on the home link preview. "Every role is in tune" is back in, because round 1 lost it mainly in the f6 pass, which repeats "in tune" (in the c3 pass it was 1.2 behind step-every, inside the noise of 1.4). concert-every is an independent counter-draft from a fresh Claude drafter. It saw the brief, the hero, the claim and the fixed German H1, but none of the candidates. The H1 was set in the rendered page per candidate. Reviewers also saw the footer at desktop and phone. 16 reviewer runs, each scoring all four lines in a shuffled order under H1 to H4.

Panel noise 0.6 to 2.3 per line, reviewer noise 2.8. Per model, Claude's two runs differ by 1.3 to 4.0 and Codex's by 0 to 1.0.

| Key           | Overall | Run 1 / 2   | Claude / Codex | CTO / VPE / Brand / Editor | Clear | Relevant | Credible | Distinctive | Fit hero | Language | Idiom | Together | German fit |
| ------------- | ------- | ----------- | -------------- | -------------------------- | ----- | -------- | -------- | ----------- | -------- | -------- | ----- | -------- | ---------- |
| tune-all      | 79.4    | 80.5 / 78.2 | 75.8 / 83.0    | 80.8 / 78.5 / 80.2 / 78.0  | 7.9   | 8.9      | 6.8      | 6.5         | 9.2      | 8.0      | 7.2   | 8.2      | 8.4        |
| concert-every | 78.8    | 77.6 / 79.9 | 73.2 / 84.2    | 79.2 / 78.0 / 80.0 / 77.8  | 8.3   | 8.9      | 6.8      | 6.1         | 8.2      | 7.8      | 7.9   | 7.8      | 9.4        |
| step-every    | 77.9    | 78.2 / 77.6 | 73.9 / 82.0    | 76.8 / 78.5 / 78.0 / 78.5  | 8.1   | 8.9      | 6.8      | 5.8         | 8.1      | 8.1      | 7.5   | 8.1      | 7.7        |
| tune-every    | 76.1    | 76.8 / 75.5 | 72.5 / 79.8    | 76.5 / 75.8 / 78.2 / 74.0  | 7.6   | 8.9      | 6.8      | 6.5         | 9.1      | 7.3      | 6.2   | 8.1      | 7.9        |

Leads over step-every (overall; Claude, Codex; run 1, run 2):

| Key           | Lead                          |
| ------------- | ----------------------------- |
| tune-all      | +1.5 (+1.9, +1.0; +2.3, +0.6) |
| concert-every | +0.9 (-0.7, +2.2; -0.6, +2.3) |
| tune-every    | -1.8 (-1.4, -2.2; -1.4, -2.1) |

What the reviewers say, counted over the 16 reviews of each line:

- "In step": 10 of 16 read it as marching or uniformity ("closer to Gleichschritt than to zusammenspielen", editor, Claude), and it fits the tuning desk less well. Only 3 of 16 still ask "in step with whom?". In round 2, with c3 and f6, 24 of 32 asked.
- "All roles are in tune": 16 of 16 call "in tune" a metaphor that needs the visual to read concretely. No review names a repetition of the claim (together 8.2), where after f6 all 16 did.
- "Every role works in concert": 16 of 16 call it formal, worn or corporate, and 7 find it close to the claim's "together". It has the best idiom (7.9) and the best German fit (9.4).
- "Every role is in tune": 14 of 16 say a single role cannot be in tune on its own (idiom 6.2).

## Round 2: the completed forms

Overall is the mean of all reviewers in that pass, 0 to 100.

Pass c3 (panel noise 1.3, reviewer noise 3.8):

| Key               | Overall | Run 1 / 2   | Claude / Codex | CTO / VPE / Brand / Editor | Clear | Relevant | Credible | Distinctive | Fit hero | Language | Idiom | Together | German fit |
| ----------------- | ------- | ----------- | -------------- | -------------------------- | ----- | -------- | -------- | ----------- | -------- | -------- | ----- | -------- | ---------- |
| tune-all          | 79.4    | 78.8 / 80.1 | 76.8 / 82.1    | 77.3 / 81.5 / 80.8 / 78.3  | 7.7   | 8.8      | 6.9      | 6.8         | 9.3      | 7.8      | 6.7   | 8.4      | 8.5        |
| step-every        | 78.4    | 80.0 / 76.9 | 73.3 / 83.6    | 77.0 / 79.3 / 79.0 / 78.5  | 7.7   | 8.8      | 6.9      | 6.0         | 8.3      | 8.1      | 7.2   | 8.3      | 7.9        |
| step-each-all     | 75.4    | 75.6 / 75.3 | 70.0 / 80.9    | 75.3 / 77.8 / 75.8 / 73.0  | 8.4   | 8.8      | 6.9      | 5.9         | 7.1      | 7.4      | 7.5   | 8.0      | 8.9        |
| step-others-every | 74.9    | 75.1 / 74.6 | 68.6 / 81.1    | 74.0 / 76.0 / 78.3 / 71.3  | 8.4   | 8.8      | 6.9      | 5.9         | 7.6      | 6.9      | 7.1   | 8.0      | 8.5        |

Pass f6 (panel noise 1.3, reviewer noise 2.9):

| Key               | Overall | Run 1 / 2   | Claude / Codex | CTO / VPE / Brand / Editor | Clear | Relevant | Credible | Distinctive | Fit hero | Language | Idiom | Together | German fit |
| ----------------- | ------- | ----------- | -------------- | -------------------------- | ----- | -------- | -------- | ----------- | -------- | -------- | ----- | -------- | ---------- |
| step-every        | 78.1    | 79.3 / 77.0 | 72.1 / 84.1    | 76.5 / 80.0 / 78.3 / 77.8  | 7.8   | 8.6      | 7.0      | 6.3         | 8.7      | 8.1      | 7.2   | 8.5      | 7.8        |
| step-each-all     | 77.3    | 77.5 / 77.1 | 72.6 / 82.0    | 73.8 / 77.8 / 80.3 / 77.5  | 8.3   | 8.6      | 7.0      | 6.3         | 7.4      | 7.8      | 7.7   | 8.6      | 9.0        |
| step-others-every | 75.7    | 75.1 / 76.3 | 69.1 / 82.3    | 73.8 / 77.0 / 77.8 / 74.3  | 8.3   | 8.6      | 7.0      | 6.3         | 7.8      | 7.0      | 7.2   | 8.5      | 8.4        |
| tune-all          | 74.6    | 74.0 / 75.3 | 68.5 / 80.8    | 73.8 / 73.5 / 77.5 / 73.8  | 7.6   | 8.6      | 6.9      | 6.9         | 9.4      | 7.6      | 6.4   | 5.8      | 8.4        |

Leads over step-every (overall; Claude, Codex; run 1, run 2):

| Key               | Pass c3                       | Pass f6                       | Both passes |
| ----------------- | ----------------------------- | ----------------------------- | ----------- |
| tune-all          | +1.0 (+3.5, -1.5; -1.3, +3.3) | -3.5 (-3.6, -3.4; -5.3, -1.8) | -1.3        |
| step-each-all     | -3.0 (-3.3, -2.8; -4.4, -1.6) | -0.8 (+0.5, -2.1; -1.8, +0.1) | -1.9        |
| step-others-every | -3.6 (-4.6, -2.5; -4.9, -2.3) | -2.4 (-3.0, -1.9; -4.1, -0.8) | -3.0        |

What the reviewers say, counted over the 32 reviews of each candidate:

- "In step": 24 of 32 name the missing object ("In step with what: each other, the agents, or a process?"). It still scores first, on language (8.1) and fit with the hero (8.5).
- "In step with each other": no reviewer asks "with what?" any more, and it is the clearest (8.3) and the best carrier of "zusammenspielen" (8.9). 28 of 32 name the length: a sixth line on desktop and phone that pushes the buttons down, "padded" or "heavy for an H1". Fit with the hero falls to 7.3.
- "In step with the others": five lines, but 27 of 32 call it clunky, laboured or wordy ("treats job functions like individual people"); language 7.0. Two Claude reviews read it as translated.
- "All roles are in tune": the best fit with the tuning desk (9.3) and a soft image for job functions (idiom 6.6, "natives would say aligned or in sync"). After f6 all 16 reviews name the repeated "in tune" (together 5.8).

## Round 1: in step, in tune or in flow

Context for the options above; these numbers compare only with each other.

| Key        | Overall | Pass c3 | Pass f6 | Claude / Codex | Idiom | Together c3 / f6 | German fit |
| ---------- | ------- | ------- | ------- | -------------- | ----- | ---------------- | ---------- |
| step-every | 79.9    | 79.3    | 80.6    | 76.6 / 83.3    | 7.8   | 8.6 / 8.7        | 8.5        |
| tune-all   | 78.4    | 79.5    | 77.4    | 73.4 / 83.4    | 7.2   | 8.5 / 6.6        | 8.7        |
| tune-every | 76.6    | 78.1    | 75.2    | 73.2 / 80.1    | 6.6   | 8.5 / 6.5        | 8.3        |
| flow-all   | 66.9    | 64.6    | 69.2    | 62.1 / 71.8    | 5.1   | 5.0 / 7.8        | 6.3        |
| flow-every | 65.8    | 63.4    | 68.3    | 62.5 / 69.2    | 4.6   | 5.0 / 7.8        | 6.3        |

Panel noise 1.4 (c3) and 1.6 (f6). Why three wordings dropped out:

- "Every role is in tune" trails "all roles are in tune" in both passes: "a single role in tune" needs a partner (idiom 6.6), and it repeats f6's "in tune" as well.
- "In flow", both forms, trails by 11 to 16 points with both models and in both passes. "People are in flow, roles aren't" (brand strategist, Claude): reviewers read it as one person's focus, the opposite of roles working together (idiom 4.4 to 5.3). With c3 it repeats the claim's "flow" and the desk's "in flow" caption (together 5.0). The German "zusammenspielen" no longer carries it (6.3), so it would need a new German H1.

## German

The shared German H1 fits every wording still in the items. In round 3 it scores 7.7 to 9.4, highest for "in concert", whose meaning "zusammenspielen" spells out, and lowest for "in step". In round 2 it scored 7.9 to 8.9, highest for "in step with each other". Only the dropped "in flow" wordings would need a German change.

## A reviewer prompt, verbatim (round 3, copy editor, Codex, run 1)

Rounds 1 and 2 used the same prompt without the footer, with c3 or f6 on the link preview and their own candidate lists.

```text
You are a native English copy editor who edits B2B technology websites for UK and US audiences. You judge whether a line reads as natural, idiomatic English that a native speaker would write, and you notice every phrase that sounds translated or forced. You read German well enough to judge whether a German line says the same thing.

A company from Hamburg, hackers&wizards, trains and mentors engineering teams, product teams and their leaders in working with AI coding agents (agentic engineering). Its buyers are CTOs, CIOs and VPs of Engineering whose developers have coding agents while releases come no faster. It is choosing the exact wording of the headline of its English homepage: the H1 over the hero, the first thing a buyer reads. The brand also has a separate claim, "Agents pay off when your people ship together.", a short line that stands on the link preview and in the footer of every page, the homepage included; the headline does its own job.

The reader's path: a buyer sees the link preview of the homepage in a chat or a social feed (image: /private/tmp/claude-501/hu1-run/r/preview-u1.png, 1200 x 630, the claim on it), clicks it, and lands on the homepage. Each candidate stands as the H1 on the real homepage, unchanged otherwise: the lead sentence under it, the buttons, a link to an assessment, and beside it (below it on the phone) a visual of a tuning desk where five role sliders (Leadership, Product, Engineering, QA, DevOps) move from "ad hoc" to "team standard"; once they line up, the delivery waveform plays and the caption reads "in flow". Each hero screenshot holds one frame with the sliders lined up. Further down, the same page ends in the footer with the claim under the logo (images: /private/tmp/claude-501/hu1-run/r/footer-desktop.png, /private/tmp/claude-501/hu1-run/r/footer-phone.png).

Real display: a 1440 px desktop browser and a 390 px phone; the images are scaled to 1000 px on the long side. The candidates differ only in a few words of the second sentence. Look at every image (read each file), then score every headline on its own, for English.

Criteria, each 0 to 10:
- clear: within seconds you understand what changes for your company
- relevant: it names a change you want for your company
- credible: you believe it; it promises nothing you would distrust
- distinctive: it could not stand just as well on a competitor's homepage
- fit_hero: it fits the hero around it, the lead sentence under it and the visual beside it
- language: idiomatic, natural English; not a translation, not stilted
- idiom: the phrase it uses for the roles reads as natural English for roles in a company (job functions), as a native speaker would say it of them
- together: the claim (on the link preview and in the footer) and this headline each do their own job, neither repeats the other, and preview, page and footer read as one message
- de_fit: the German homepage uses one H1 for all candidates, "Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller." (image: /private/tmp/claude-501/hu1-run/r/de-desktop.png). How faithfully does it carry this English candidate's meaning, as natural German?
Then overall, 0 to 100: how well this works as the homepage headline, seen after the link preview and with the claim in the footer.
Also name, per candidate, the one question it leaves open for you after the preview and the first screen.

Candidates:
H1
  H1: Your teams have agents. Once every role is in step, your releases speed up.
  images (desktop 1440 px, phone 390 px): /private/tmp/claude-501/hu1-run/r/s-q2-desktop.png, /private/tmp/claude-501/hu1-run/r/s-q2-phone.png
H2
  H1: Your teams have agents. Once every role works in concert, your releases speed up.
  images (desktop 1440 px, phone 390 px): /private/tmp/claude-501/hu1-run/r/s-z9-desktop.png, /private/tmp/claude-501/hu1-run/r/s-z9-phone.png
H3
  H1: Your teams have agents. Once all roles are in tune, your releases speed up.
  images (desktop 1440 px, phone 390 px): /private/tmp/claude-501/hu1-run/r/s-m7-desktop.png, /private/tmp/claude-501/hu1-run/r/s-m7-phone.png
H4
  H1: Your teams have agents. Once every role is in tune, your releases speed up.
  images (desktop 1440 px, phone 390 px): /private/tmp/claude-501/hu1-run/r/s-r4-desktop.png, /private/tmp/claude-501/hu1-run/r/s-r4-phone.png

Answer with JSON only, no prose before or after, in this shape:
{"H1": {"clear": 0, "relevant": 0, "credible": 0, "distinctive": 0, "fit_hero": 0, "language": 0, "idiom": 0, "together": 0, "de_fit": 0, "overall": 0, "open_question": "at most 15 words", "below_max": "what keeps this from full marks, at most 20 words"}, ...}
covering every label from H1 to H4.
```

## Left out

- The open question every wording leaves with every persona, what concretely changes between the roles and how much faster releases get, belongs to the lead and the page below the hero, not to a choice among these lines.
- Rounds 1 and 2 showed the claim on the link preview only. Round 3 adds the footer with u1. Banners and the closing slide were not shown, since the H1 does not stand beside them.
- The link preview was shown as the bare 1200 x 630 card, not inside a chat or feed mock, in all three rounds.
- German was judged through the German fit criterion by personas who read German, not by a German native panel; no German alternative was rendered.

Review: large in all three rounds, because the home H1 is the first line every buyer reads and the briefs asked for four personas, both models and two runs.

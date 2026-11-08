# The wording of the home headline: in step, in tune or in flow, 08.11.2026

The home H1 stays "Your teams have agents. Once every role is in step, your releases speed up." (k3). It is first in both passes, with c3 on the link preview (79.3) and with f6 (80.6), and it repeats neither claim. "Once all roles are in tune" ties it while c3 is the claim (79.5, noise 1.4). With f6 it falls 3.2 behind because it repeats "in tune" (7.0 behind with Claude, 0.6 ahead with Codex). Both "in flow" wordings trail by 11 to 16 points with both models and in both runs. The German H1 ("Wenn alle Rollen zusammenspielen") fits every "step" and "tune" wording; only an "in flow" wording would need a German change. The decision is the item `decide-home-headline-wording`.

## The question

Benedikt, 08.11.: "\"Your teams have agents. Once every role is in step, your releases speed up.\" sehr cool. wie ist \"Your teams have agents. Once every role is in tune, your releases speed up.\" oder \"Your teams have agents. Once every role is in flow, your releases speed up.\" oder \"Your teams have agents. Once all roles are in tune, your releases speed up.\" oder \"Your teams have agents. Once all roles are in flow, your releases speed up.\""

## Candidates

English only; the German H1 stays "Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller." for every candidate.

| Key        | English H1                                                                  | File id |
| ---------- | --------------------------------------------------------------------------- | ------- |
| step-every | Your teams have agents. Once every role is in step, your releases speed up. | m2      |
| tune-every | Your teams have agents. Once every role is in tune, your releases speed up. | z4      |
| flow-every | Your teams have agents. Once every role is in flow, your releases speed up. | r5      |
| tune-all   | Your teams have agents. Once all roles are in tune, your releases speed up. | b9      |
| flow-all   | Your teams have agents. Once all roles are in flow, your releases speed up. | q7      |

## Method

- Page: the website at commit 5b80fcd4 in a scratch worktree, run with `astro dev`. The H1 was set in the copy file per candidate and balanced by the browser (`text-wrap: balance`); the start page's line-break rule, written for an earlier H1, was removed for every candidate alike. The assessment link's price was removed, since this repository is public. Headless Chrome for Testing, the desk's sliders held lined up with the waveform running, the Astro dev toolbar removed. Desktop 1440 x 900, the first screen; phone 390 px at 2x, from the top to the bottom of the desk. Every candidate breaks to five lines on both; the German H1 to six. Images scaled to 1000 px on the long side.
- Step before the page: the home link preview, the website's `scripts/og/template.html` filled as `generate.mjs` fills the home card, once with c3 ("Agents in the team. Teams in flow.") and once with f6 ("Every agent needs a team in tune."). Pass c3 and pass f6 are the two panels.
- Personas: CTO of a German Mittelstand manufacturer, VP of Engineering at a Berlin scale-up, brand strategist for DACH B2B technology services, native English copy editor for UK and US B2B technology sites.
- Criteria, fixed before any score, 0 to 10: the 07.11. headline criteria (clear, relevant, credible, distinctive, fit with the hero, language), idiom (the phrase reads as natural English for roles in a company), together (claim on the preview and headline each do their own job, neither repeats the other), German fit (the shared German H1 carries this English candidate). Overall 0 to 100. Each reviewer also named the question a candidate leaves open.
- Reviewers: Claude (`claude -p --model opus`) and Codex (`gpt-6.1-sol`, high), two runs each, a shuffled order per run under labels H1 to H5, file ids that carry no meaning. No prompt says which line is current, whose idea any line is, or that one was asked about. 32 reviewer runs.
- Noise: the gap between the two runs' panel means per candidate; the reviewer noise is the mean gap of a single reviewer's two scores.

## Scores

Overall is the mean of all reviewers in that pass, 0 to 100.

Pass c3 (panel noise 1.4, reviewer noise 2.7):

| Key        | Overall | Run 1 / 2   | Claude / Codex | CTO / VPE / Brand / Editor | Clear | Relevant | Credible | Distinctive | Fit hero | Language | Idiom | Together | German fit |
| ---------- | ------- | ----------- | -------------- | -------------------------- | ----- | -------- | -------- | ----------- | -------- | -------- | ----- | -------- | ---------- |
| tune-all   | 79.5    | 79.3 / 79.8 | 75.9 / 83.1    | 79.8 / 81.0 / 81.0 / 76.3  | 7.6   | 8.8      | 7.1      | 6.9         | 9.3      | 7.9      | 7.1   | 8.5      | 8.7        |
| step-every | 79.3    | 78.9 / 79.8 | 75.3 / 83.4    | 79.0 / 80.0 / 78.8 / 79.5  | 8.3   | 8.8      | 7.1      | 5.9         | 8.1      | 8.1      | 7.6   | 8.6      | 8.4        |
| tune-every | 78.1    | 77.3 / 78.9 | 76.0 / 80.1    | 77.8 / 80.3 / 78.3 / 76.0  | 7.5   | 8.8      | 7.1      | 6.9         | 9.1      | 7.5      | 6.6   | 8.5      | 8.3        |
| flow-all   | 64.6    | 63.8 / 65.5 | 58.9 / 70.4    | 64.3 / 66.8 / 65.5 / 62.0  | 6.6   | 8.4      | 6.5      | 5.6         | 7.3      | 6.3      | 4.9   | 5.0      | 6.3        |
| flow-every | 63.4    | 62.3 / 64.5 | 58.6 / 68.1    | 61.8 / 66.5 / 63.0 / 62.3  | 6.6   | 8.4      | 6.5      | 5.6         | 7.2      | 6.1      | 4.4   | 5.0      | 6.2        |

Pass f6 (panel noise 1.6, reviewer noise 2.8):

| Key        | Overall | Run 1 / 2   | Claude / Codex | CTO / VPE / Brand / Editor | Clear | Relevant | Credible | Distinctive | Fit hero | Language | Idiom | Together | German fit |
| ---------- | ------- | ----------- | -------------- | -------------------------- | ----- | -------- | -------- | ----------- | -------- | -------- | ----- | -------- | ---------- |
| step-every | 80.6    | 79.6 / 81.5 | 78.0 / 83.1    | 79.8 / 81.0 / 81.0 / 80.5  | 8.4   | 8.8      | 7.2      | 6.3         | 8.2      | 8.3      | 7.9   | 8.7      | 8.6        |
| tune-all   | 77.4    | 77.9 / 76.9 | 71.0 / 83.8    | 76.3 / 78.3 / 80.0 / 75.0  | 7.9   | 8.8      | 6.9      | 6.8         | 8.8      | 7.9      | 7.2   | 6.6      | 8.7        |
| tune-every | 75.2    | 74.3 / 76.1 | 70.4 / 80.0    | 74.3 / 75.8 / 77.5 / 73.3  | 7.6   | 8.8      | 6.9      | 6.8         | 8.8      | 7.6      | 6.5   | 6.5      | 8.3        |
| flow-all   | 69.2    | 70.4 / 68.0 | 65.3 / 73.1    | 66.5 / 72.5 / 71.8 / 66.0  | 6.9   | 8.5      | 6.7      | 5.8         | 7.9      | 6.6      | 5.3   | 7.8      | 6.4        |
| flow-every | 68.3    | 68.8 / 67.9 | 66.4 / 70.3    | 65.8 / 70.5 / 70.8 / 66.3  | 6.8   | 8.5      | 6.7      | 5.8         | 7.8      | 6.4      | 4.8   | 7.8      | 6.3        |

Leads over step-every (overall; Claude, Codex; run 1, run 2):

| Key        | Pass c3                       | Pass f6                       |
| ---------- | ----------------------------- | ----------------------------- |
| tune-all   | +0.2 (+0.6, -0.3; +0.4, 0.0)  | -3.2 (-7.0, +0.6; -1.8, -4.6) |
| tune-every | -1.3 (+0.8, -3.3; -1.6, -0.9) | -5.4 (-7.6, -3.1; -5.4, -5.4) |
| flow-all   | -14.7 (-16.4, -13.0)          | -11.4 (-12.8, -10.0)          |
| flow-every | -15.9 (-16.6, -15.3)          | -12.3 (-11.6, -12.9)          |

## Repetition between claim and headline

The together score measures it, and the reasons name it:

- With c3 the "flow" wordings repeat the claim's "flow" and the desk's "in flow" caption: together 5.0 against 8.5 to 8.6 for "step" and "tune". With f6 they score 7.8.
- With f6 the "tune" wordings repeat "in tune": together 6.5 and 6.6 against 8.5 with c3. Claude reviewers name it in almost every run ("Repeats the preview's 'in tune', so the click adds nothing new"); Codex reviewers name it too but score it less hard, which is why tune-all ties step-every with Codex and trails with Claude.
- "In step" repeats neither claim: together 8.6 and 8.7.

## What the reviewers say

- "In step": the plainest and most natural for roles (idiom 7.6 and 7.9), least distinctive (5.9 and 6.3). Recurring reasons: it lacks "with each other" ("In step with what?"), can suggest marching or conformity, and ties to the tuning desk less than "in tune".
- "In tune": the best fit with the desk (fit hero 8.8 to 9.3), but "a role in tune" needs a partner, and "roles in tune" strains English for job functions (idiom 6.5 to 7.2). Claude reviewers find "all roles are" flatter than "every role is", one copy editor run "translated from 'alle Rollen'"; Codex reviewers find the plural clearer.
- "In flow": "People are in flow, roles aren't" (brand strategist, Claude). Reviewers read it as one person's focus, the opposite of roles working together (idiom 4.4 to 5.3), and the German "zusammenspielen" no longer carries it (German fit 6.3).
- The open question every wording leaves, with every persona: what concretely changes between the roles, and how much faster releases get. That belongs to the lead and the page below the hero, not to a choice among these five.

## German

The shared German H1 fits "in step" (8.4 and 8.6) and both "in tune" wordings (8.3 to 8.7). It carries neither "in flow" wording (6.2 to 6.4): choosing one of those would need a new German H1, which this run did not draft or test.

## A reviewer prompt, verbatim (pass f6, copy editor, Codex, run 1)

```text
You are a native English copy editor who edits B2B technology websites for UK and US audiences. You judge whether a line reads as natural, idiomatic English that a native speaker would write, and you notice every phrase that sounds translated or forced. You read German well enough to judge whether a German line says the same thing.

A company from Hamburg, hackers&wizards, trains and mentors engineering teams, product teams and their leaders in working with AI coding agents (agentic engineering). Its buyers are CTOs, CIOs and VPs of Engineering whose developers have coding agents while releases come no faster. It is choosing the exact wording of the headline of its English homepage: the H1 over the hero, the first thing a buyer reads. The brand also has a separate claim, a short tagline that stands in the footer, on decks, on banners and on the link preview; the headline does its own job.

The reader's path: a buyer sees the link preview of the homepage in a chat or a social feed (image: /private/tmp/claude-501/hl-0811/img/s-og-p2-en.png, 1200 x 630, the claim "Every agent needs a team in tune." on it), clicks it, and lands on the homepage. Each candidate stands as the H1 on the real homepage, unchanged otherwise: the lead sentence under it, the buttons, a link to an assessment, and beside it (below it on the phone) a visual of a tuning desk where five role sliders (Leadership, Product, Engineering, QA, DevOps) move from "ad hoc" to "team standard"; once they line up, the delivery waveform plays and the caption reads "in flow". Each screenshot holds one frame with the sliders lined up.

Real display: a 1440 px desktop browser and a 390 px phone; the images are scaled to 1000 px on the long side. The candidates differ only in a few words of the second sentence. Look at every image (read each file), then score every headline on its own, for English.

Criteria, each 0 to 10:
- clear: within seconds you understand what changes for your company
- relevant: it names a change you want for your company
- credible: you believe it; it promises nothing you would distrust
- distinctive: it could not stand just as well on a competitor's homepage
- fit_hero: it fits the hero around it, the lead sentence under it and the visual beside it
- language: idiomatic, natural English; not a translation, not stilted
- idiom: the phrase it uses for the roles reads as natural English for roles in a company (job functions), as a native speaker would say it of them
- together: the claim on the link preview and this headline each do their own job, neither repeats the other, and the path from preview to page reads as one message
- de_fit: the German homepage uses one H1 for all candidates, "Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller." (image: /private/tmp/claude-501/hl-0811/img/s-de-desktop.png). How faithfully does it carry this English candidate's meaning, as natural German?
Then overall, 0 to 100: how well this works as the homepage headline, seen after the link preview.
Also name, per candidate, the one question it leaves open for you after the preview and the first screen.

Candidates:
H1
  H1: Your teams have agents. Once every role is in flow, your releases speed up.
  images (desktop 1440 px, phone 390 px): /private/tmp/claude-501/hl-0811/img/s-r5-desktop.png, /private/tmp/claude-501/hl-0811/img/s-r5-phone.png
H2
  H1: Your teams have agents. Once all roles are in tune, your releases speed up.
  images (desktop 1440 px, phone 390 px): /private/tmp/claude-501/hl-0811/img/s-b9-desktop.png, /private/tmp/claude-501/hl-0811/img/s-b9-phone.png
H3
  H1: Your teams have agents. Once every role is in step, your releases speed up.
  images (desktop 1440 px, phone 390 px): /private/tmp/claude-501/hl-0811/img/s-m2-desktop.png, /private/tmp/claude-501/hl-0811/img/s-m2-phone.png
H4
  H1: Your teams have agents. Once all roles are in flow, your releases speed up.
  images (desktop 1440 px, phone 390 px): /private/tmp/claude-501/hl-0811/img/s-q7-desktop.png, /private/tmp/claude-501/hl-0811/img/s-q7-phone.png
H5
  H1: Your teams have agents. Once every role is in tune, your releases speed up.
  images (desktop 1440 px, phone 390 px): /private/tmp/claude-501/hl-0811/img/s-z4-desktop.png, /private/tmp/claude-501/hl-0811/img/s-z4-phone.png

Answer with JSON only, no prose before or after, in this shape:
{"H1": {"clear": 0, "relevant": 0, "credible": 0, "distinctive": 0, "fit_hero": 0, "language": 0, "idiom": 0, "together": 0, "de_fit": 0, "overall": 0, "open_question": "at most 15 words", "below_max": "what keeps this from full marks, at most 20 words"}, ...}
covering every label from H1 to H5.
```

## Left out

- No new wording was drafted. Reviewers in every pass ask "in step with what?"; "in step with each other" would answer it and is the next candidate to test if the shorter line ever needs to go.
- The claims' other surfaces (banners, closing slide, footer) were not shown, as the brief named the link preview; the footer still carries the website's pinned claim and lies below the first screen.
- German was judged through the German fit criterion by personas who read German, not by a German native panel; no German alternative was rendered.

Review: large, because the home H1 is the first line every buyer reads and the brief asked for four personas, both models and two runs.

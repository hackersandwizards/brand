# Shared elements the apps and the slide engine asked for, 07.11.2026

Brand v1.32.0 carries the requests from os's and slides' CSS analyses of 06.11., the removal of
`logos/avatar-512.png` and the catalog links decided in `decide-catalog-path`. This file keeps the
three blind reviews and the measurements behind each choice.

## Without a visible change

Measured in headless Chrome against the built os catalog (os origin/main of 07.11.):

- `expert/app-base.css` (export `./app-base.css`), the base layer of os's and the hub's
  `global.css` in plain CSS. Added to an os page, it changes no computed value of html, body, a
  heading, a link or a button, in light and in dark. The one difference between the two apps,
  the scrollbar thumb, resolves in os to the `--muted` fill in light and to
  `--color-night-muted` in dark (`--color-muted` takes a different token per theme there). The
  file writes both values out. In the hub the dark thumb changes from night-2 (about 1.1:1 on the
  night ground) to that grey, and a link's colour fades with `ease` instead of Tailwind's curve,
  both over 150 ms. The hub's `accent-color` stays in the hub: os has none.
- `--hw-row-pad-block` and `--hw-row-pad-inline` replace `--hw-row-pad`, same values.
- `--hw-marker-size` on the stage scale (`--slide-marker`, 0.5625rem) and `--hw-marker-mid:
0.5cap` for `.hw-label > .hw-marker`: slides sets both already, and no other repository draws a
  marker inside a label (grep of every repository under `internal/`, 07.11.).
- `--hw-prose-width` on `hw-prose`, default `--container-3xl` (48rem): os and the hub cap their
  prose at 48rem by hand. admin's catalog home (`prose hw-prose`, no cap) widens from
  Typography's 65ch to 48rem when it raises its pin.
- `brand-colours` lets an entry grow where the list's total for that metric holds, so a value
  moved to a new file moves its entry.
- `generated/cursor.svg` (export `./cursor.svg`), the slide player's pointer, built from
  `--color-teal`.
- `data-tone="danger"` on `hw-icon-button`, os's remove button's hover and focus colours.
- `tokens/text-base.css` (export `./text-base.css`): headings in their level's face at 700,
  balanced; paragraphs and list items pretty. No consumer imports it yet.

The space nav (`SpaceNavTree.astro`) now wraps a long title instead of cutting it, as the hub
asked; os's nav wraps too. No review: the change is the requested behaviour.

## Blind reviews

Review: medium for each of the three, because each changes an element two or more systems show.
Two personas per surface, Claude (opus) and Codex (gpt-6.1-sol, high), Claude's first persona run
twice for noise. Neutral letters, a shuffled order per reviewer, no hint of the current state.
Criteria fixed before scoring, as each prompt lists them. Overall scores out of 10.

### Keycap

On os's sticky search field (the hint inside the field) and a line of help text with four keys,
light and dark, 900 CSS px at 2x. Personas: a founder working the pipeline with shortcuts, a
trainer reading help text once. Outline is os's `.kbd-hint` today.

| Reviewer               | Keycap (edge) | Filled | Outline |
| ---------------------- | ------------: | -----: | ------: |
| Claude, founder, run 1 |             8 |      5 |       7 |
| Claude, founder, run 2 |             8 |      6 |       7 |
| Claude, trainer        |             8 |      7 |       7 |
| Codex, founder         |           9.0 |    8.6 |     8.4 |
| Codex, trainer         |           8.6 |    8.6 |     8.2 |

Noise 0 on keycap and outline, 1 on filled. The keycap leads every reviewer or ties: it ships as
`elements/kbd.css`. What kept it below 10: four keys in two lines read a little busy.

### Stage pill

On two specimen slides with a principle pill (content, lanes) at 1920x1080. Personas: a workshop
participant in the back half of the room, a trainer who builds the decks. Kicker is the slide
engine's size today (1.6875rem), preset brand's stage preset (1.3125rem), between 1.5rem.

| Reviewer                   | Between | Kicker | Preset |
| -------------------------- | ------: | -----: | -----: |
| Claude, participant, run 1 |       8 |      7 |      7 |
| Claude, participant, run 2 |       8 |      6 |      7 |
| Claude, trainer            |       8 |      7 |      7 |
| Codex, participant         |     8.8 |    8.4 |    8.2 |
| Codex, trainer             |     8.8 |    8.4 |    8.2 |

Noise 1 (kicker). Between leads by 1 to 2 with Claude and 0.4 with Codex: inside the noise in one
Claude run and with Codex, so no winner. Brand's preset stays. The kicker size has no lead over the
preset either (0 to 1 with Claude, 0.2 with Codex).

### Selection colour

On the content slide at 1920x1080 and an os page, light and dark, part of the text selected.
Personas: a participant copying a line from shared slides, an operations assistant copying from
records. Solid is slides' rule today, default the browser's (os, the hub), wash the website's
(night purple), light the verifier's (40 % teal).

| Reviewer                   | Light | Solid | Default | Wash |
| -------------------------- | ----: | ----: | ------: | ---: |
| Claude, participant, run 1 |     7 |     7 |       6 |    5 |
| Claude, participant, run 2 |     7 |     6 |       7 |    5 |
| Claude, operations         |     8 |     7 |       6 |    5 |
| Codex, participant         |     8 |     8 |       9 |    7 |
| Codex, operations          |     8 |     8 |       9 |    7 |

Noise 1 (solid, default). Light, solid and default tie. Brand ships no selection colour, the
choice with the fewest rules. The wash trails every reviewer by 1 to 3: reviewers named the night
switch to purple.

Skipped combinations: the website, documents and a night slide in the selection review; documents
and the website in the keycap review (neither shows keyboard hints).

One prompt, verbatim (stage pill, Claude, trainer):

> You are a trainer who builds and presents these decks and wants every slide to read in one
> glance. You are reviewing a small rounded label (a pill) beside the section label at the top of
> a presentation slide, naming the slide's principle. The variants differ only in that pill's size
> and padding.
>
> Medium and display: a 16:9 slide projected at 1920x1080 in a meeting room, read from 3 to 8
> metres away, and also seen in a video call. Each image is the full slide at 1920x1080.
>
> Look at every image of every variant (open each file): Variant C: C-slide1.png, C-slide2.png;
> Variant A: A-slide1.png, A-slide2.png; Variant B: B-slide1.png, B-slide2.png
>
> Score each variant from 1 to 10 on each criterion, then overall: 1. legibility of the pill text
> from the back of the room 2. hierarchy: the pill sits below the headline in weight and beside
> the section label as a peer, neither shouting nor lost 3. visual calm 4. breathing room, not
> cramped 5. fits the slide's type and spacing as one system
>
> Answer in this format, nothing before it: Variant <letter>: c1=<n> c2=<n> c3=<n> c4=<n> c5=<n>
> overall=<n> (one line per variant, in the order given above) Then, per variant, one line naming
> what keeps it below 10.

The image paths in the prompt were absolute paths under a scratch folder.

---
kind: work
status: open
priority: 1
order: 10
owner: each consumer session, against brand v1.1.0
evidence: "brand v1.3.0 (elements/label-box.css, button.css data-hue, label.css data-hue, inline-code.css, tokens.css --gradient-strip and the small-size corner); brand v1.1.0 (tokens/tokens.css radii and palettes, elements/rule.css, elements/code.css, elements/button.css, elements/scales.css, tokens/stage.css, expert/expert.css); blind panels of 06.11. below"
---

# One shape and colour system: what the consumers still adopt

Brand v1.1.0 holds the rule set from Benedikt's review round of 06.11. (points 1, 2, 2b, 9 to 13).
What remains is each consumer taking it. Each brief names the files to change.

## The rule set (brand v1.1.0)

- Two palettes: neutrals (job, day, night) and hues (base, text on day, night, two tints, chart
  series), tables in `tokens/tokens.css`, shown that way on the portal.
- Shapes, one job each: the brand corner on everything that holds content or is pressed with words
  on it (cards, panels, callouts, code blocks, pictures, buttons); the small corner on everything
  one text line tall that is no pill (label box, number or icon tile, inline code, segmented
  control, slide stage strip); round for chips, badges, toggles and icon-only controls; square for
  marks smaller than a line (list marker, swatch).
- Rule lines are teal (`hw-rule`, its hue on a purple part); the gradient stays on the strip.

## Blind panels, 06.11.

Overall of 10, mean of two Claude runs and one Codex run per persona. Personas: a conference
attendee (slides), a head of engineering reading PDFs (documents), a CTO in the browser (website),
an account manager in the app (os), a brand designer across all four. Neutral labels, shuffled per
reviewer, the current state scored alongside.

| Panel                                     | Candidates                                                                            | Scores                | Noise |
| ----------------------------------------- | ------------------------------------------------------------------------------------- | --------------------- | ----- |
| Palettes (developer, designer)            | two tables / one table / six groups (current)                                         | 8.3 / 7.0 / 5.3       | 0     |
| Rule lines (participant, buyer, designer) | teal / gradient everywhere / gradient on titles / current                             | 8.4 / 7.0 / 6.9 / 5.1 | 0.5   |
| Shapes round 1 (5 personas)               | square small marks / small corner, small code / round buttons and selectors / current | 7.5 / 7.5 / 6.9 / 6.7 | 0.75  |
| Shapes round 2 (5 personas)               | small corner, brand-corner code / square small marks / current                        | 7.5 / 7.3 / 7.1       | 0.7   |

Round 2 is a tie inside the noise. It went to the small corner because reviewers named the square
view selector beside brand-corner buttons as the element most out of place, in os and across all
four surfaces. In round 1 the current state's strip slide rendered blank; round 2 re-scored slides,
website and the cross-surface view on corrected boards.

## What remains, per consumer

1. slides: `--slide-radius-sm` is now the small corner, so tiles, label boxes and inline code
   round by themselves on the pin raise. Draw "Read more" (`RegularSlide.tsx`) as `hw-button
data-variant="secondary"` at stage scale; the stage strip (`SectionHeader.tsx`) drops
   `md:rounded-full` for the small corner; the roadmap's part bar (`RoadmapSlide.tsx`) becomes
   `hw-rule` (teal, the second part purple) instead of the gradient.
2. documents: the handout's chapter bar (`handout.css` `section h1::after`) and the readout's cover
   rule (`readout.css` `.rule`) take teal through `hw-rule`; the onepager's CTA (`onepager.css`
   `.contact-footer a.button`) takes the print brand corner (`--print-radius`) instead of the
   screen one; code blocks take the card corner from `scales.css`.
3. website: code blocks (`pre.astro-code`) take the brand corner through `hw-code`; the events
   hero's "Invite us to your stage" reads as evenly rounded in the panels and should be checked
   against `hw-button data-variant="secondary"`.
4. os and trainer-hub: `btn-primary` and `btn-secondary` take the brand corner from `expert.css`
   on the pin raise; a measured before/after on a dense page.
5. talks, certificate-verifier, admin: raise the pin and run `brand-elements`. The scaffolding
   catalog shell follows the shapes since scaffolding v2.4.0 (raised in brand's own catalog).

## Since v1.3.0 (06.11.)

Blind panels, overall of 10, two Claude runs and one Codex run per persona, scores in each file's
comment: the label box (hairline in the label's colour 8.2, hue tint 8.0, double line 7.8, hand-drawn
7.1; slides attendee and presentation designer), the purple button on a purple speaker (8.7 against
teal 6.7), inline code at 0.25em side padding (8.5, 0.375em 7.3), the small corner on buttons under
32 px (8.0 against the brand corner 5.9) and on a picture in a mail (8.1 against 7.3).

6. slides: the frame title (`SlideChrome.tsx`), the roadmap part label (`RoadmapSlide.tsx`, drop
   `badge` in `lib/section-styles.ts`) and the stage strip (`SectionHeader.tsx`) become
   `hw-label hw-label-box` with `data-tone="ink"`, `data-hue="teal"`/`"purple"`, or a plain
   `hw-label-box` around the strip; the second speaker's mail button (`ClosingSlide.tsx`) takes
   `data-hue="purple"`; every `data-hw-exception="label-hue"` becomes `hw-label data-hue` and the
   exception leaves `brand-elements.json`.
7. documents: readout, certificate and page-edge strips take `var(--gradient-strip)` instead of
   `--gradient` (`tokens.css`, `readout.css`, `document.css`, `DocHeader.astro`,
   `DocCertificate.astro`); `--handout-title-bar` is gone (no reader).
8. mail: pictures take `--radius-sm` (`components/theme.ts` `corner`, `test/image.test.tsx`); its
   gate names the `CATALOG_FILE=1` build's pages as files for `brand-markers`, never `--site`.
9. admin, os, trainer-hub: a button under 32 px tall takes `--radius-sm`.

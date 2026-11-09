# Preloads, the measure token and fallback faces without Arial, 10.11.2026

Three consumer findings from 09.11.2026, measured and changed in brand v2.4.0 and v2.4.1.

## Preloads from the rules' source

`./font-faces` exports `preloadFiles` beside `fontFaceRules(base)`, both generated from
`tokens/fonts.css`: the web faces without `unicode-range`, today `inter-latin-wght-normal.woff2`
and `jetbrains-mono-latin-wght-normal.woff2`. A test reads the files out of `fontFaceRules`' output
and out of `fonts.json` and requires both to equal `preloadFiles`, so a release that changes the
faces and not the list fails the gate.

## The measure token

`--container-measure` (33em) and its heading twins sit in an `@theme static` block of their own,
so every Tailwind build writes them to `:root`. Tailwind 4.3.5, built with no utility named: the
measures are written, `--color-teal` stays out; the same build over the previous `tokens.css`
writes no measure; the catalog's own Tailwind build of `tokens.css` carries the measures and no
`--color-teal`. `parseTokens` reads every `@theme` block and throws on one it cannot read. A
plain-CSS reader takes `tokens.root.css`, as the LinkedIn renderer now does.

`hw-prose` ran a 768 px block at 1440 px, which held 98 characters a line (median, maximum 109;
Inter at 16 px). A handbook page in an app frame at 1440 px, three variants, blind:

| Variant                                                      | Claude, 4 runs | Codex, 4 runs | Ships |
| ------------------------------------------------------------ | -------------- | ------------- | ----- |
| Block 48rem, text the block's width (before)                 | 7.09           | 8.21          | 0/8   |
| Block at the measure, 33em, tables and code included         | 6.68           | 7.25          | 0/8   |
| Block 48rem, running text at the measure, the rest the block | 7.50           | 8.42          | 8/8   |

Mean of six criteria (reading comfort, scanning, table and code, breathing room, calm, fit), 1 to 10. Noise, the same reviewer run twice: 0.17 to 0.34 (Claude), 0 to 0.17 (Codex); the winner's
lead over the old state is 0.41 and 0.21. Personas: a consultant reading the internal handbook,
a trainer preparing from the hub's knowledge articles, a UX designer of documentation tools. Two
reviewers asked for the section rules to run as wide as the table; a second round with one
reviewer per model, headings and their hairline at the block's width against at the measure, gave
7.0 against 6.8 and 8.67 against 8.17. That version shipped: a paragraph, list, quote or
definition list anywhere in `hw-prose`, outside `not-prose`, takes
`max-width: var(--container-measure)`, 528 px at 16 px, 67 characters a line (median, maximum
75); a `not-prose` list keeps the block's 768 px. v2.4.1 gives running text that holds an
image, video, code block, table or figure the block's width too: in v2.4.0 an image in a paragraph
shrank from 768 to 528 px and a code block in a numbered step to 502 px, neither of which the
review had scored. A paragraph inside such a step keeps the measure.

Scored on the handbook page alone, at 1440 px and the app scale. Not scored: the hub's knowledge
articles, os notes and posts, which set the element in the same app frame, and the dense scale,
where the measure is 429 px at 13 px, still about 65 characters. A surface that wants running text
wider sets nothing today: `--hw-prose-width: none` widens the block, not the text.

One reviewer's prompt, verbatim (the other personas: a trainer preparing from the trainers' web
app, a UX designer of reading interfaces for internal tools; labels shuffled per reviewer):

> You are a senior software consultant at a small engineering consultancy. Several times a day you open pages of the company's internal handbook in its internal web app on a 14-inch laptop (browser window 1440 CSS px wide) to look up how a process runs, often reading a whole page before acting on it. Below are three versions of the same handbook page in that app, each screenshot at full size as it appears in the browser window (labels: x y z). Medium: internal web app; audience: the staff and trainers who read it; display: a laptop browser window 1440 CSS px wide, images at 1:1. Files: page-x.png page-y.png page-z.png. Criteria, each scored 1 to 10: (1) reading comfort of the running text, (2) how easily you scan for a section or a fact, (3) legibility of the table and the command block, (4) breathing room, not cramped, (5) visual calm, (6) overall fit for this page. Answer with one block per page: the page label, the six scores, a mean, and one sentence per criterion on what keeps it below 10. Then name the page you would ship.

## Fallback faces for a device without Arial

The fonts' own files, advances summed over 31,183 characters of slides' specimen text and
`verbal.json`, Inter's variable files instanced per weight. The same method gives Arial
106.89, 108.00, 101.35 and 102.36 % against the committed 107.14, 108.28, 101.38 and 102.41 %:
the corpus differs by 0.03 to 0.28 %. The Arial values stay.

| Font                               | 400      | 500      | 600      | 700      | Where                         |
| ---------------------------------- | -------- | -------- | -------- | -------- | ----------------------------- |
| Arial, Liberation Sans, Arimo      | 106.89 % | 108.00 % | 101.35 % | 102.36 % | Mac, Windows; Linux; ChromeOS |
| Roboto (Android 12+ variable file) | 107.28 % | 107.41 % | 108.07 % | 108.75 % | Android                       |
| Noto Sans                          | 101.05 % | 100.20 % | 99.18 %  | 97.90 %  | not added                     |
| DejaVu Sans                        | 93.76 %  | 94.73 %  | 84.70 %  | 85.54 %  | not added                     |

Liberation Sans and Arimo have Arial's advances to the unit, and Liberation Mono, Cousine and
Android's monospace font, Droid Sans Mono, have Courier New's 1229/2048 (JetBrains Mono 99.98 % at every weight): they join those faces'
`local()` lists. Roboto takes a family of its own, "Inter Fallback Roboto", after "Inter Fallback"
in `--font-sans`, with its overrides: 400 107.28/90.30/22.48, 500 107.41/90.19/22.46, 600
108.07/89.64/22.32, 700 108.75/89.08/22.18 (size-adjust, ascent, descent; line gap 0).

Android's sources: `fonts.xml` on `main` maps sans-serif to the variable `Roboto-Regular.ttf`
(full name "Roboto", PostScript "Roboto-Regular", wght 100 to 900) and monospace to
`DroidSansMono.ttf`; Android 11 shipped static "Roboto", "Roboto Medium" and "Roboto Bold". Each
band names the static weight first and the variable font last.

Measured in Debian's Chromium 156 in a container (Chrome for Testing has no Linux arm64 build),
with Android's Roboto and Droid Sans Mono files installed and no Arial or Liberation:

- `local("Roboto")` on the variable file draws the weight asked for: 461.2 px at 700, as the same
  file served as a web font; 456.1 px at 400. `local("Roboto Bold")` matches it too, at 700.
- `local("Arial")` does not follow fontconfig's Arial-to-Liberation alias: Liberation needs its own
  names.
- Every text block's height in the fallback (font files withheld) against the web face, 240 sans
  blocks at weights 400 to 700:

| Width | Before          | After         | Roboto face without overrides |
| ----- | --------------- | ------------- | ----------------------------- |
| 412   | 51/240, 1386 px | 5/240, 144 px | 51/240, 1386 px               |
| 1440  | 12/240, 288 px  | 0/240, 0 px   | 12/240, 288 px                |

- CLS of the handbook page, 412 × 823 at 1.75, font files 600 ms late, 30 runs per cell in
  alternating blocks of 10, each a fresh context; CLS is the sum of layout-shift entries once the
  fonts have loaded and 1.2 s have passed: before 30/30 at 0.0060, after 0/30 at 0, the control
  without overrides 30/30 at 0.0060. At 1440 px all three cells 0/30. With DejaVu Sans as the
  system font instead of Roboto, before was 30/30 at 0.0661.

Not measured: Android itself (its name lookup is not Linux's fontconfig, and a Linux result is
evidence for it, not proof); the slides story at 412 px from the slides report, which this run did
not build, so its 0.0323 is not re-measured; a mobile emulation flag (`isMobile`), under which this
setup recorded no layout-shift entry at all, the controls included, so the runs above use the size
and density without it. Noto Sans (Fedora's default) and DejaVu Sans (Debian's without Liberation)
are not added: a Linux desktop at 1440 px shifted nothing above, and a desktop without Liberation is
the rarer case. Their values stand in the table for when one is wanted.

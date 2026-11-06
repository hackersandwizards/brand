---
kind: work
status: open
priority: 1
order: 10
owner: each consumer session named below
evidence: "consumers' origin/main read 2026-11-06 around 12:50 (pins: slides v1.2.0, website v1.2.0, os v1.0.0, trainer-hub v1.2.0, admin v1.2.0; documents v1.3.0; talks, mail, certificate-verifier v1.4.0); brand v1.5.0 (tokens.css --gradient-strip, elements/inline-code.css, elements/prose.css)"
---

# One shape and colour system: what the consumers still owe

The rule set of Benedikt's review round of 06.11. lives in brand (`tokens/tokens.css`, the files
under `elements/`, `expert/expert.css`, their comments carry the panel scores). Done on
`origin/main`: documents (chapter bar and cover rule on `hw-rule`, print corner, `hw-code`, strips
on `--gradient-strip`), talks (theme toggle from `theme-icons.ts` with `data-icon`), mail
(pictures on `--radius-sm`; its gate runs no `brand-markers`), certificate-verifier (pin v1.4.0,
`check:elements`), slides' "Read more" button, stage strip corner and roadmap `hw-rule`, website's
`hw-code` and the events CTA on `hw-button data-variant="secondary"`.

## What remains

1. Every consumer: raise the pin to brand v1.5.0. The strip (`hw-strip`, `hw-header-strip`, any
   `var(--gradient-strip)`) mixes in sRGB again and night inline code takes a night-ink tint that
   shows on a card; no code change.
2. slides (pin v1.2.0): the frame title (`components/slides/SlideChrome.tsx:9`, still `hw-label`
   with its own border) and the roadmap part label (`RoadmapSlide.tsx:69`, `style.badge` from
   `lib/section-styles.ts`) become `hw-label hw-label-box` with `data-tone="ink"` or
   `data-hue="teal"`/`"purple"`; the second speaker's mail button (`ClosingSlide.tsx:143`) takes
   `data-hue="purple"`; the `label-hue` exception (`brand-elements.json:20`) goes and its labels
   become `hw-label data-hue`.
3. website (pin v1.2.0): drop the `inline-code` exception (`brand-elements.json:50`) and both
   `:is(.blog-prose, .knowledge-prose) code` blocks in `src/components/ui/Prose.astro`; mark
   inline code `hw-inline-code` in `src/lib/prose-markdown.ts`, import
   `@hackersandwizards/brand/elements/inline-code.css` in `src/styles/elements.css`, add
   `inline-code` to `uses`. At 320 px `needs-human` on `/blog/2026/feature-planner/` stays inside
   its column.
4. os (pin v1.0.0): `btn-primary` and `btn-secondary` take the brand corner from `expert.css` on
   the raise, measured before and after on a dense page; a button under 32 px tall takes
   `--radius-sm`; the header's figures toggle (`src/components/Header.astro:132`,
   `rounded-full p-2 hover:bg-muted`) becomes `hw-header-link` with `data-icon`.
5. trainer-hub (pin v1.2.0) and admin (pin v1.2.0, admin's own v1.3.0): a button under 32 px tall
   takes `--radius-sm` (brand v1.3.0); trainer-hub's buttons take the brand corner from
   `expert.css` on the raise.

## Panels behind v1.5.0 (2026-11-06)

Overall of 10, Claude and Codex, two runs each, neutral labels in shuffled order.

| Panel                                                                                    | Result                                                   | Noise                                                      |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| Strip, readout at 1440 px (brand designer, head of engineering)                          | sRGB 8.5, oklab 7.25                                     | 0                                                          |
| Strip, website header and app header at 1440 px (CTO, account manager)                   | app sRGB 8.5, oklab 7.5; website sRGB 7.75, oklab 8.0    | app 0; website Claude 0.5 (Claude oklab, Codex sRGB)       |
| Strip, all three surfaces                                                                | sRGB 8.3, oklab 7.5                                      | max 0.5                                                    |
| Night inline code on a night page with a card (platform engineer, editorial typographer) | night-ink 8 % 8.6, 12 % 8.2, the muted fill (v1.4.0) 6.0 | 0.45; the v1.4.0 fill measured 1.00:1 against a night card |

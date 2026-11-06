---
kind: work
status: open
priority: 1
order: 10
owner: each consumer session named below
evidence: "consumers' origin/main read 2026-11-06 in the afternoon (pins: admin, slides, documents, trainer-hub, website, hycle-private v1.5.0; mail, talks, certificate-verifier v1.4.0; os v1.0.0; scaffolding installs no brand). slides: SlideChrome.tsx:8 and RoadmapSlide.tsx:66 on hw-label hw-label-box, ClosingSlide.tsx:134 data-hue, no label-hue exception. website: hw-inline-code in src/lib/prose-markdown.ts:261, inline-code in uses, no Prose.astro code blocks. os: src/components/Header.astro:132 still rounded-full p-2."
---

# One shape and colour system: what the consumers still owe

The rule set of Benedikt's review round of 06.11. lives in brand (`tokens/tokens.css`, the files
under `elements/`, `expert/expert.css`, their comments carry the panel scores). slides and website
have done their steps; the item stays open because os has not adopted v1.4.0 or later.

## What remains

1. os (pin v1.0.0): raise the pin to brand v1.6.0. `btn-primary` and `btn-secondary` take the
   brand corner from `expert.css` on the raise, measured before and after on a dense page; a button
   under 32 px tall takes `--radius-sm`; the header's figures toggle
   (`src/components/Header.astro:132`, `rounded-full p-2 hover:bg-muted`) becomes
   `hw-header-link` with `data-icon`.
2. mail, talks, certificate-verifier (pin v1.4.0): raise the pin to v1.6.0, so the strip mixes in
   sRGB and night inline code takes the night-ink tint; no code change.
3. trainer-hub and admin (pin v1.5.0): a button under 32 px tall takes `--radius-sm` (brand
   v1.3.0); trainer-hub's buttons take the brand corner from `expert.css`. Not verified on
   `origin/main` on 06.11.: the session there checks its buttons and closes this point.

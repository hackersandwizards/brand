---
kind: work
status: open
priority: 3
owner: a brand session
evidence: "ds2 delegate reports of 02.11. (slides, website, admin, documents, os); os docs/tracking/2026-11-02-design-system-rollout.md"
---

# Brand proposals from phase 2 that ds3-brand-follow-ups does not list

1. `--hw-marker-mid: 0.5cap` into `stage.css`: the one literal slides v0.26.0 keeps (`slides.css`).
2. `brand-elements` measures a joined `hw-field-row` against an unjoined reference, so brand's own joined markup fails it; measure the joined row whole (website `search-field` exception names it).
3. `brand-elements` places the reference for an element inside a table after the table: a link in a 14 px cell reads underline offset 2.8 against 3.2. admin leaves its hub and docs stories out of `brand-elements.json` until it is fixed.
4. The `elements/kpi.css` comment's sample `€ 0` trips the documents privacy check once CSS is baked in; documents now strips comments in `inlineCss`. Use a placeholder such as `€ X`.
5. Hero corner-glow values (website PageHero: 21/42 % and 13/26 %, 320x360 and 620x420 px) match the channel-banner glows in `applications/channel-banners/render.py`: candidate tokens.
6. slides still defines `--background`, `--foreground`, `--color-accent`, `--color-warning`, `--color-background`, `--color-foreground`, `--font-heading`, `--radius-brand`, `--code-comment`, names brand's `expert.css`/`tokens.css` also define. Renaming changes deck utility names: a slides release.
7. Once every spoke has switched, teach `brand-elements`' source check the new element names (button, breadcrumb, facts, ...), per the phase-2 report's open point.

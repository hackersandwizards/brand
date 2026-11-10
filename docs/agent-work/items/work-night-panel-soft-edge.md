---
kind: work
status: open
priority: 3
area: brand
order: 2006
owner: a brand session
evidence: "website UX run of 10.11. (its report, brief for brand, U5): a soft edge (a box-shadow) on the flat Night panel beside the home hero, over the corner glow, scored 88/80/77/88 against 58/50/48/76 for today's hard edge, on both models; reverted because brand-colours lets the website's shadow allowlist only shrink. The variant's shadow value is not recorded in the report."
---

# A soft edge for a flat Night panel

Offer a shadow token for a flat Night panel over the corner glow, scored on every surface that
draws such a panel.

The website's reviewed variant cannot ship there, since its shadow is no brand token. Brand's
`--shadow-*` tokens hold no edge for a panel on night.

Next: rebuild the soft edge on the website's live hero (a style injected into a headless render,
the panel and glow as served), two or three shadow values against today's hard edge, and look for
other surfaces with a Night panel (slides' night frame, the portal). Score blind with Claude and
Codex; ship the winner as a `--shadow-*` token. Check: the scores recorded here and the website's
brief to use the token.

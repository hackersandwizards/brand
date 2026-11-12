---
kind: work
status: open
priority: 3
area: brand
order: 1960
owner: a brand session
evidence: "Checked 12.11.: tokens/tokens.css:283-284 hold only --shadow-card and --shadow-overlay, no edge for a night panel; the website's hero feed panel keeps border-white/15 (HeroFeed.astro:43). Not scored. Visible on the home hero."
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

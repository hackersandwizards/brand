---
kind: work
status: open
priority: 3
area: brand
order: 1970
owner: Ada
evidence: "Checked 13.11.: --spacing-card still floors at 20px (tokens/tokens.css:262); the website sets --hw-card-pad by hand in PersonCard.astro:63-64 (0.75rem, 1rem) and DirectorySections.astro:254 (0.5rem, 1rem), practitioners in PersonCard.astro:36 (1rem). Not scored. Internal."
---

# Score a smaller card padding at the narrow end

Brief a brand session to score a 16 px narrow end of `--spacing-card` and a named compact card padding.

Neither changes before its score.

Two surfaces override the card padding to 16 px by hand: the website on narrow screens, the
website's and practitioners' person cards at every width. Each override is an exception to the
shared padding.

Next: render the website's card pages and the practitioners' people page at 375 and 390 px with
`--spacing-card` ending at 16 px against today's 20 px, and the person cards at 16 px against the
card padding, day and night. Score blind with Claude and Codex. Check: the scores recorded here,
and either the token changed with a brief to drop the overrides or the overrides listed as kept.

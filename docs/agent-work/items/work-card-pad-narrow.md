---
kind: work
status: open
priority: 3
area: brand
order: 2007
owner: a brand session
evidence: "website UX run of 10.11. (brief for brand): the website sets --hw-card-pad to 1rem on narrow screens in three places. practitioners catalog run of 10.11. (brief for brand, point 1): its PersonCard and the website's both set --hw-card-pad: 1rem by hand. --spacing-card is 20 px at 375 px (tokens/tokens.css)."
---

# The card padding at the narrow end

Score a smaller narrow end of `--spacing-card`, and a named compact card padding, before either
changes.

Two surfaces override the card padding to 16 px by hand: the website on narrow screens, the
website's and practitioners' person cards at every width. Each override is an exception to the
shared padding.

Next: render the website's card pages and the practitioners' people page at 375 and 390 px with
`--spacing-card` ending at 16 px against today's 20 px, and the person cards at 16 px against the
card padding, day and night. Score blind with Claude and Codex. Check: the scores recorded here,
and either the token changed with a brief to drop the overrides or the overrides listed as kept.

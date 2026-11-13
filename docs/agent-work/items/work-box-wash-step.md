---
kind: work
status: open
priority: 3
area: brand
order: 1985
owner: Ada
evidence: "Checked 13.11.: elements/status.css:21 and card.css:106 still fill at 7 %, the callout at --tint-callout 10 % (tokens/tokens.css:344); not scored yet. Internal: an open scoring question, no defect."
---

# Score the status box and the tinted card at the callout's 10 % wash

Brief a brand session to score blind whether the status box and the tinted card take the callout's 10 % wash.

Since v2.9.0 the callout fills at 10 % (14 % on night) and the status box and the tinted card at
7 %, so the hue table in `tokens/tokens.css` names two wash steps. The callout's shares are the
tokens `--tint-callout` and `--tint-callout-night`, which a box taking the step reads. Whether the other two boxes
take the callout's step is open, and so is the warning box's hue: it mixes the warning text role,
and a ground of amber itself was scored on 12.11. only together with the warning pill's new fill,
so its own effect is unmeasured. They keep their own edge (the status box its border, the tinted
card its hairline), which the callout lost.

Next: render the status box and the tinted card at 7 % and at 10 %/14 % on the surfaces that use
them (os, admin, documents, website), day and night, and score them blind. Change only on a lead
outside the noise with both models. Check: the scores recorded here, and a single wash step in the hue table
or a stated reason for two.

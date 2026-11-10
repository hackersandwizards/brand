---
kind: work
status: open
priority: 3
area: brand
order: 2015
owner: a brand session
evidence: "docs/agent-work/2026-11-10-quote-callout-pills-signature-review.md, section 1: the callout's 7 % fill without its rule almost vanished at night and on a projector, and 10 % (14 % on night) scored better there. elements/status.css and elements/card.css (data-variant=tint) still fill at 7 %."
---

# The status box and the tinted card at the callout's 10 % wash?

Score blind whether the status box and the tinted card take the callout's 10 % wash.

Since v2.9.0 the callout fills at 10 % (14 % on night) and the status box and the tinted card at
7 %, so the hue table in `tokens/tokens.css` names two wash steps. The callout's shares are the
tokens `--tint-callout` and `--tint-callout-night`, which a box taking the step reads. Whether the other two boxes
take the callout's step is open: they keep their own edge (the status box its border, the tinted
card its hairline), which the callout lost.

Next: render the status box and the tinted card at 7 % and at 10 %/14 % on the surfaces that use
them (os, admin, documents, website), day and night, and score them blind. Change only on a lead
outside the noise with both models. Check: the scores recorded here, and a single wash step in the hue table
or a stated reason for two.

---
kind: work
status: open
priority: 3
owner: Ada
area: brand
evidence: "`elements/scales.css`, read 13.11.: `--container-measure: 45em` is set once, at line 136 in the dense block, and no other scale block sets it, while `--hw-avatar-size` and `--hw-item-height` are set by all four. `tokens/tokens.css` line 341 holds the token's own value, 33em. Found by the polish run of 13.11. by reading the stylesheet. No page was measured."
---

# A screen, print or stage block inside a dense one inherits the dense measure

Brief a brand session to reset the measure in the other three scales, and score the result blind first.

The dense scale widens running text to 45em, about 90 characters a line, for a wide work screen.
Every other value a scale sets is set by all four scales, so a container with its own
`data-hw-scale` inside another always gets its own values. The measure is the exception. It is set
at the dense scale only, so a screen, print or stage container nested inside a dense one keeps 45em
where the token says 33em. Every `max-w-measure` under a dense ancestor does the same.

Whether any page nests scales this way today is not measured. The stylesheet's own comment allows
it: `data-hw-scale` goes on the page's root or on any container.

The fix the polish run names: the dense block sets a scale variable the prose reads, and the other
three blocks reset it, so 33em is not typed a second time.

It changes how a shared element renders in a nested context. `CLAUDE.md` asks for a blind review
before a shared element's value is set for one scale, so the change is scored before it ships.

Done when a nested screen, print and stage container each measure 33em in a test that was red
before, and the review's score is in a dated report.

---
kind: work
status: open
priority: 1
owner: Ada
evidence: "Sweep 08.11. over every shared element's sample (scripts/element-demos.ts) in screen, dense, print and stage, day and night: corner kind, ratio and border style per element, measured in Chrome."
---

# One shape on every scale: no print exception for the button

The print scale gave the button the small corner while screen, dense and stage give it the brand
corner. The sweep found two shape differences and one rule behind the first:

1. **Button on print:** the small corner (4 px). Takes the brand corner at paper size (16 px 4 px,
   `--hw-card-corner`), size and padding unchanged.
2. **Field on print and stage:** the website's corner (20 px 5 px) on every scale, so on stage it
   reads flatter beside the 30 px button. Takes the medium's brand corner (`--hw-card-corner`).
3. **"An app's button under 32 px tall takes the small corner"** (`tokens/tokens.css`, the portal):
   set by an agent's blind panel, not a person, and the reason the 28 px print button took the
   small corner. Removed: a button with words keeps the brand corner at every height.

Every other element draws the same corner kind, ratio (4:1 for the brand corner) and border on
every scale and theme. What still differs per scale is size alone: the checkbox keeps 16 px and
5 px on every scale, and the field keeps its screen height on print and stage. The nesting rule
(inside a brand-cornered block the small corner) applies on every scale alike and stays.

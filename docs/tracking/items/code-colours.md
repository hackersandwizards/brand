---
kind: decision
status: assumed
priority: 3
order: 3
area: brand
owner: Benedikt
recommended: a
options:
  - key: a
    label: Shiki everywhere with hw-code as it is (shipped)
    detail: "Purple keywords and constants, teal strings, grey comments, green tags on night. No new colour. 8.61."
  - key: b
    label: "hw-code plus amber constants, teal-light functions, factory-light variables"
    detail: "No new colour, more hues. 8.02; amber reads as the main colour."
  - key: c
    label: Tuned editor colours with six new tokens
    detail: "Brighter cyan, blue, light purple. 7.29; reads like a stock editor theme."
assumption: "hw-code stays the one palette and needs no new brand colour; no surface shows light code, so no light variant ships; os, website, slides and talks switch in their own sessions in that order after the trainer hub."
---

# Which highlighter and which palette colour code and terminals on every surface?

Benedikt, 02.11.: „kann man Shikis nicht so konfigurieren das es unsere brand colors nutzt? also grauer code funktioniert nicht das ist keine option.“ Then, relayed by Ada: Shiki wherever code and terminals render, the combination with the highest score, least distance from the brand colours and fewest new exceptions, our own orange where an orange is needed. Every surface shows github-dark today. Blind panel on the real hub handout (print), a knowledge article, a slide and a terminal image, five personas, Claude and Codex twice each: A, today's hw-code palette with no new colour, 8.61; B with amber and factory-light, no new colour, 8.02; C with six new colours, 7.29; github-dark 6.12; noise up to 0.75. Round 2 with lighter strings and keywords from core colours: all within noise (7.81 to 8.00). Shipped: brand v0.27.9 and v0.27.10 (codeClasses, the 16 ANSI colours), documents v0.3.1. Report: docs/tracking/2026-11-02-code-colours.md.

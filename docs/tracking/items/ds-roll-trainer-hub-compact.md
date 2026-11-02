---
kind: decision
status: decided
priority: 2
order: 7
area: brand
owner: Benedikt
recommended: hub-14
options:
  - key: keep
    label: Keep compact in both
    detail: No change. trainer-hub stays at 13 px with os.
  - key: hub-14
    label: "trainer-hub back to 14 px, os stays compact"
    detail: 'brand adds a density hook (for example data-hw-density="comfortable" restoring --text-ui 14 px and micro 12 px under dense) and trainer-hub sets it on <html>. Cost: brand patch release, trainer-hub one attribute and the pin; os unchanged.'
decision: "Benedikt 02.11.: trainer-hub back to 14 px, os stays compact (hub-14). The ds2 delegate builds it."
by: Benedikt
quote: "os 13, trainer-hub 14"
---

# Does trainer-hub keep the compact tier (UI text 13 px), or go back to 14 px while os keeps 13?

density-tiers (compact) shipped in brand v0.28.0 on data-hw-scale="dense", reaching os and trainer-hub on 02.11. Blind review after the switch, 1440x900, Claude and Codex, two runs each: os (dashboard, deals, deal, people) Benedikt as daily user 7.50 -> 8.38, outside noise (0 to 0.5); COO 7.88 -> 7.50, inside noise (up to 2), a tie. trainer-hub (two personas: a trainer preparing at a laptop, Benedikt reviewing content) prefers 14 px on every app page beyond noise: units 8.06 -> 7.58, unit 8.21 -> 7.75, knowledge 8.04 -> 7.52 (noise 0.12 to 0.29); legibility 8.1-8.3 -> 6.9-7.0. Reviewers name the material sidebar, filter chips, 'On this page' and meta lines; trainer-hub's own rule says trainers read it on projectors and in daylight. Report: os docs/tracking/2026-11-02-design-system-rollout.md.

---
kind: decision
status: open
priority: 3
area: brand
owner: Benedikt
recommended: keep-exception
options:
  - key: keep-exception
    label: Slides keeps its own night line and teal
    detail: "No brand change. slides keeps the `night-line` exception in its brand-elements.json (night-ink 15 % line, teal-dark = teal-night 70 % with white, the day ampersand grey on the subsystem octagon)."
  - key: brand-moves
    label: brand night.css takes the slide values
    detail: "brand patch release; talks (the source of today's night.css) and every data-hw-night surface change their night line and teal-dark; needs a talks before/after and review."
---

# Night defaults: does brand's night.css move to the slide engine's values?

brand v0.29.0 `night.css` follows talks: line white 18 %, teal-dark = teal-night. On slides the team-topology slide scored lower with brand's values in all five blind runs (Claude 7:6 three times, Codex 7.7:7.6 and 8.1:7.9), so slides v0.26.0 keeps its own values as the exception `night-line`. Images: slides `docs/tracking/2026-11-02-design-system-phase2/`. Report: os `docs/tracking/2026-11-02-design-system-rollout.md`.

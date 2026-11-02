---
kind: decision
status: assumed
priority: 2
order: 2
area: brand
owner: Benedikt
assumption: "AstrobookHome hides Astrobook's own sidebar on the home only; each story page keeps it. The rail carries search and groups with counts; the theme toggle goes into the header's nav slot (brand v0.28.4). The website passes previews={false}: its production headers forbid framing (X-Frame-Options DENY, frame-src 'none')."
---

# Assumed: the Astrobook home hides Astrobook's sidebar; the catalogue's rail replaces it there

catalogue-shape decided one shape; Astrobook brings its own sidebar. Report: os docs/tracking/2026-11-02-design-system-rollout.md.

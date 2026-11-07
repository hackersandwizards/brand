---
kind: work
status: open
priority: 3
order: 550
owner: a brand session
evidence: "consumers' origin/main read 2026-11-07: every consumer pins brand v1.19.2; no file in os, trainer-hub, website, talks, slides, documents, admin, certificate-verifier or practitioners uses hue-amber or hue-green (trainer-hub's src/styles/expert.test.ts names it only as a string the palette rule must reject); os src/config.ts keeps hue-rust for the factory category alone and renders company priority as hw-pill data-priority; admin ItemRow, trainer-hub FormatBadge, website and mail switched."
---

# One shape and colour system: remove the hue-amber and hue-green aliases

The rule set lives in brand (`tokens/tokens.css`, the files under `elements/`, `expert/expert.css`):
a category takes teal, purple or ampersand; amber, green and red mean a state; factory is the
Software Factory area alone. Every consumer has switched, so what remains is in brand:

1. Remove `--hue-amber`, `--hue-green`, `--color-hue-amber` and `--color-hue-green` from
   `expert/expert.css` in a major release whose commit names the removal.
2. Verify on trainer-hub's `origin/main` that its buttons under 32 px take `--radius-sm` (brand
   v1.3.0); not yet checked.

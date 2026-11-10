---
kind: work
status: open
priority: 3
area: brand
order: 1990
owner: a brand session
evidence: "consumers' origin/main read 2026-11-07 (afternoon): os, trainer-hub, website, talks, slides, documents, admin, certificate-verifier and practitioners pin brand v1.28.2 (admin >=1.28.2); a grep of each for hue-amber or hue-green outside docs finds only trainer-hub's src/styles/expert.test.ts, which names it as a string the palette rule must reject; control: the same grep in brand finds expert/expert.css (3 lines). os src/config.ts keeps hue-rust for the factory category alone and renders company priority as hw-pill data-priority; admin ItemRow, trainer-hub FormatBadge, website and mail switched."
---

# One shape and colour system: remove the hue-amber and hue-green aliases

Remove the hue-amber and hue-green aliases from `expert/expert.css` in a major brand release.

The rule set lives in brand (`tokens/tokens.css`, the files under `elements/`, `expert/expert.css`):
a category takes teal, purple or ampersand; amber, green and red mean a state; factory is the
Software Factory area alone. Every consumer has switched, so what remains is in brand:

1. Remove `--hue-amber`, `--hue-green`, `--color-hue-amber` and `--color-hue-green` from
   `expert/expert.css` in a major release whose commit names the removal.

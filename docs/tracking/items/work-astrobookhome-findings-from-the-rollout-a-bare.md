---
kind: work
status: open
priority: 3
owner: a brand session
evidence: "os `docs/tracking/2026-11-02-design-system-rollout.md`; brand v0.29.0 fixed the bare count, the preview size, the moon and lightOnly"
---

# AstrobookHome finding left from the rollout: `astro dev --root <dir>` under an agent

`astro dev --root <dir>` started by an agent restarts in the background with the root applied twice, finds no config and serves on 4321 (verifier, seconds; slides' `design-system` script has that form). The other four findings (bare count, small previews, the moon reading as a C, night tokens demanded on a light-only site) shipped in v0.29.0.

---
kind: decision
status: open
priority: 2
order: 8
area: brand
owner: Benedikt
recommended: push
options:
  - key: push
    label: Push now
    detail: Production redeploys with identical pages.
  - key: hold
    label: Hold until the next verifier change
    detail: The commit waits in the local checkout.
---

# Push the certificate verifier's design-system commit? A push to main deploys production.

certificate-verifier 09ec51c (brand v0.27.5 -> v0.28.4, Astrobook at /design-system/ with brand's AstrobookHome, a story per page and part) is committed locally, gate green, not pushed: Cloudflare Workers Builds deploys every push to main. The live pages compare pixel-identical at 1440x900 (home, verify, not found); the worker's /design-system page changes only its tile version label. Report: os docs/tracking/2026-11-02-design-system-rollout.md.

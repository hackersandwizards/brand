---
kind: work
status: open
priority: 3
order: 1961
owner: Ada
area: brand
evidence: "Website run web-cues, 12.11.: d5af6720 sets data-hw-night beside every data-theme dark element and loads night.css; report docs/agent-work/2026-11-12-person-marks-avatar.md in the website (c3c408fb). Eight blind runs, two personas, Claude and Codex."
---

# Night tokens need a second attribute beside data-theme dark

Ada briefs a brand session on three points from the website's night-band round.

1. `night.css` applies only under `data-hw-night`, so a consumer marking dark bands with
   `data-theme="dark"` must carry both attributes on every element, and the website now has a
   content check that fails any element missing the pair. The session decides whether brand applies
   its night tokens under `data-theme="dark"` as well, and releases it if so. Check: a consumer
   setting only `data-theme="dark"` gets the night form.
2. Several reviewers called the night button colour a generic tech cyan.
3. Two reviewers found the night glow (`--color-purple` at night) washed out.

Points 2 and 3 are reviewer remarks from runs that scored brand's night form ahead of the site's
old one; they need their own blind round before any token changes.

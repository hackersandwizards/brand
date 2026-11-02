---
kind: work
status: open
priority: 2
owner: Ada
evidence: "ds2 delegate reports of 02.11. (brand catalogue, documents, verifier, trainer-hub, personal site and hycle)"
---

# Design system phase 3: the brand proposals the phase 2 spokes left, each decided by blind review

Start once ds2-os and ds2-talks have landed, so no spoke raises its pin while brand moves. Each proposal is a brand sub-value, decided by blind review, not by Benedikt:

1. `catalogue.css` right margin is narrow (brand catalogue review); a change reaches every spoke at its next pin.
2. `header.css` cuts the nav at 390 px ("Dokum…").
3. `brand-elements` compares the zero-width border of an unruled `hw-facts` (10 false findings in trainer-hub, fixed there with `.hw-facts > div { border-top: 0 none }`): fix in `facts.css` or the scan.
4. Tokens proposed by spokes: `--spacing-tight: 0.25rem` and `--container-text: 40rem` (verifier), night tokens `--color-night-line` and the soft accent and result tones (documents, which keeps `color-mix` copies until then), `--slide-corner-lockup` (named in a `stage.css` comment, defined nowhere; documents computes it), a projector dim floor such as `data-hw-dim="projector"` (trainer-hub only so far).
5. A `--hw-field-family` setting on the field, turning the verifier's field exception into a setting; a filled secondary button for tinted grounds.
6. The verifier footer arrow: Claude preferred the old look 5:1; decide with a larger panel whether it becomes a fourth exception.
7. `hw-prose` list indent sits about 10 px further in than trainer-hub had it (reviewers: level, optional).

Not yet explained: hycle-private's story pages and its app slides differ by 12k to 248k pixels per slide. The verifier has no `.dev.vars`, so `wrangler dev` cannot show a valid certificate; its screenshots came from a Bun harness with a made-up certificate (simulated, not the real sheet).

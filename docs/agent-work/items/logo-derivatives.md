---
kind: work
status: open
priority: 3
order: 580
area: brand
owner: a brand session
evidence: "not established; 03.11. logos/ still holds type-logo-long.svg, emoji-logo-long.png and its TIF, and avatar-512.png"
---

# Clean up the logo derivatives and split the Logos page into masters and delivery files

Benedikt, 01.11.: „ist das die aufgabe vom brand repo hier render derivate zu halten? das muss doch eigentlich dort passieren wo man sie braucht. die logo seite sollte doch nur die logos definieren hier geht es ja nicht um die auslieferung. oder ist das fürs press kit?“ lockup-screen.svg is not for the press kit: brand's own internal header (AppHeader.astro, header.css) uses it on seven internal surfaces, and the website's own header takes it too: seven repos besides brand. The press kit takes 16 files: lockup, compact lockup and wordmark in day and night plus wordmark-white and -black, each SVG and PNG. Seven files in logos/ have no consumer (the four rasters of the outline cuts and the former type-logo, type-logo-long.svg, emoji-logo-long.png and its CMYK TIF), and avatar-512.png is pixel-identical to icon-maskable-512.png. Counts per file and costs: docs/agent-work/2026-11-01-logo-derivatives.md.

Assumed 02.11. (Ada, recorded in `docs/agent-work/2026-11-03-items-tidy.md`): remove the seven files
without a consumer and the duplicate avatar, and split the Logos page into masters and delivery files
(option a of the former decision, internal file structure). Removing a file from the package is a
release whose commit names it.

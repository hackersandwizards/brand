---
kind: work
status: open
priority: 3
order: 580
area: brand
owner: a brand session
evidence: "07.11.: avatar-512.png and icon-maskable-512.png compared pixel by pixel (1,048,576 bytes RGBA, 0 differ); mail switched in 05b16b6, os in 9ece10a35 (brand v1.30.0 pin, survey test and full gate green); grep of every repo under ~/dev/hackersandwizards/internal without node_modules: outside brand only scaffolding's README and catalog/index.ts name avatar-512.png, as an example path, and os's dated reports of 01.11. and 02.11."
---

# Retire logos/avatar-512.png

`logos/avatar-512.png` is pixel for pixel `logos/icon-maskable-512.png`, and no repo reads it any
more: mail reads `icon-maskable-512.png` since 05b16b6, os since 9ece10a35.

Brand deletes `avatar-512.png`, its line in `applications/avatars/generate.ts` (and the comment
naming it there), `"logos/avatar-*.png"` in `package.json` `files`, its `manifest.json` entry and
the avatar row of the portal's delivery files, in a release whose commit names the removed file.
The file goes in the same commit as its manifest entry: `test/manifest.test.ts` hashes every listed
file.

scaffolding's README (lines 241 and 244) and `catalog/index.ts` (line 74) use
`@hackersandwizards/brand/logos/avatar-512.png` as an example package path; a scaffolding session
swaps it for `icon-maskable-512.png` when the file is gone.

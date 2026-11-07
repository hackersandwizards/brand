---
kind: work
status: open
priority: 3
order: 580
area: brand
owner: a scaffolding session
evidence: "07.11.: brand v1.32.0 deleted logos/avatar-512.png (the file, its line and comment in applications/avatars/generate.ts, the package.json files glob, the manifest entry, the portal row). Read 07.11. on scaffolding origin/main: README.md lines 241 and 244 and catalog/index.ts line 74 name @hackersandwizards/brand/logos/avatar-512.png as an example package path."
---

# scaffolding's example path names the retired avatar-512.png

Brand no longer ships `logos/avatar-512.png` (v1.32.0). scaffolding's README (lines 241 and 244)
and `catalog/index.ts` (line 74) use `@hackersandwizards/brand/logos/avatar-512.png` as an example
package path; a scaffolding session swaps it for `icon-maskable-512.png`. The item closes when that
commit lands.

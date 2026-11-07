---
kind: work
status: open
priority: 3
order: 580
area: brand
owner: an os session, then a brand session
evidence: "07.11.: git grep on origin/main of every repo under ~/dev/hackersandwizards; avatar-512.png and icon-maskable-512.png compared pixel by pixel (1,048,576 bytes RGBA, 0 differ); mail switched in 05b16b6 (brand v1.30.0 pin, catalog built and rendered with icon-maskable-512.png)"
---

# Retire logos/avatar-512.png once os takes icon-maskable-512.png

`logos/avatar-512.png` is pixel for pixel `logos/icon-maskable-512.png`. mail reads
`icon-maskable-512.png` since its commit 05b16b6. One repo still reads `avatar-512.png` from the
package, per `git grep` on its origin/main on 07.11.:

- os: `src/lib/tally-attendee-survey.ts` (`LOGO`, the uploaded name `avatar-512.png`) and its test
  `src/lib/__tests__/tally-attendee-survey.test.ts`.

Once os reads `icon-maskable-512.png`, brand deletes `avatar-512.png`, its line in
`applications/avatars/generate.ts`, `"logos/avatar-*.png"` in `package.json` `files`, its manifest
entry and the avatar row of the portal's delivery files, in a release whose commit names the removed
file.

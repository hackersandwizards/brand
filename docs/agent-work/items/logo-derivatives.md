---
kind: work
status: open
priority: 3
order: 580
area: brand
owner: os and mail sessions, then a brand session
evidence: "07.11.: git grep on origin/main of every repo under ~/dev/hackersandwizards; avatar-512.png and icon-maskable-512.png compared pixel by pixel (1,048,576 bytes RGBA, 0 differ)"
---

# Retire logos/avatar-512.png once os and mail take icon-maskable-512.png

`logos/avatar-512.png` is pixel for pixel `logos/icon-maskable-512.png`. Two repos still read it
from the package:

- os: `src/lib/tally-attendee-survey.ts` (`LOGO`, the uploaded name `avatar-512.png`) and its test
  `src/lib/__tests__/tally-attendee-survey.test.ts`.
- mail: `catalog/astro.config.ts` (`copy`), `catalog/mails/brief-bild.json` and
  `catalog/stories/Parts/Image.stories.tsx`.

Once both read `icon-maskable-512.png`, brand deletes `avatar-512.png`, its line in
`applications/avatars/generate.ts`, `"logos/avatar-*.png"` in `package.json` `files`, its manifest
entry and the avatar row of the portal's delivery files, in a release whose commit names the removed
file.

---
kind: work
status: open
priority: 2
order: 350
owner: each consumer session named below
evidence: "consumers' origin/main read 2026-11-06 17:00: os config.ts colours categories with hue-amber and hue-green and company P1 with hue-rust; admin ItemRow colours P1 red, P2 amber; trainer-hub FormatBadge discussion amber, practice green; website TrainingList special amber-dark. Pins: documents v1.11.1; the rest as on 06.11. 14:40 (slides, mail, admin v1.6.0; os, trainer-hub, website v1.5.0; talks, certificate-verifier v1.4.0)."
---

# One shape and colour system: what the consumers still owe

The rule set lives in brand (`tokens/tokens.css`, the files under `elements/`, `expert/expert.css`;
their comments carry the panel scores). brand v1.13.0 adds the hue rule (a category takes teal,
purple or ampersand; amber, green and red mean a state; factory is the Software Factory area alone)
and the priority pill (`hw-pill data-priority`). What stays open is in the consumers.

## What remains

1. Every consumer raises its pin to v1.15.0 (v1.6.0's sRGB strip and night inline code come with
   it; v1.15.0 draws P3 and P4 on a fading fill, never the outline).
2. os: no category takes `hue-amber` or `hue-green` (company type, standing, pipeline, trainer
   type, training mode and the rest of `src/config.ts`); a set takes teal, purple, slate and leaves
   the rest neutral; `hue-rust` only for the Software Factory area. Company priority renders
   `hw-pill data-priority="0"`-`"4"`.
3. admin: ItemRow's priority pill takes `data-priority` instead of its inline hue.
4. trainer-hub: FormatBadge takes teal, purple, ampersand and neutral, not green or amber; its
   buttons under 32 px take `--radius-sm` (brand v1.3.0), unverified on `origin/main`.
5. website: TrainingList's third group takes ampersand, not amber-dark.
6. mail: reads `--color-label` and `--color-label-night` from `tokens` instead of parsing
   `elements/label.css`.
7. brand: once os, trainer-hub and website no longer use `hue-amber` or `hue-green`, remove the two
   aliases from `expert/expert.css` in a major release; until then nothing fails a category that
   still uses them.

---
kind: review
status: assumed
priority: 3
owner: Benedikt
area: brand
evidence: "catalog/portal.ts, the words view; blind review 07.11., two rounds"
recommended: columns
options:
  - key: columns
    label: "One column per language: Element | English | Deutsch"
    detail: "Shipped. On a phone each element stacks EN over DE with a language tag."
    score: 8.67
    noise: 0.6
  - key: rows
    label: "One row per language, element named once"
    score: 7.86
    noise: 0.6
  - key: cards
    label: "A card per element, EN and DE stacked and labelled"
    score: 7.8
    noise: 0.2
  - key: current
    label: "The table as it was: EN and DE in one cell"
    score: 3.29
    noise: 0.6
images:
  columns:
    - { src: columns-1440.jpg, caption: "1440 px" }
    - { src: columns-375.jpg, caption: "375 px" }
  rows: rows-1440.jpg
  cards: cards-1440.jpg
  current: current-1440.jpg
---

# The words view: English and German in their own columns

The portal's words view now gives each language its own column. The meta (since when a line
holds, the highlight word) sits on its own short lines under the element's name. The retired lines
fold into "Retired lines 9". Look at the view and veto it if it reads wrong.

A German vision is missing from `verbal/verbal.json` (`vision.de` has been `null` since the file was
written), so the view marks the gap with "No German text yet". It never dropped a German line.
Writing a German vision means new wording, so it waits for you.

## Review

Personas: a copywriter who copies lines out of the view, the designer of the portal, a founder
checking the wording. Each persona ran on Claude and Codex, blind, under neutral labels in a
shuffled order, with the current table as an unmarked candidate. Criteria, fixed before scoring:
find a line in one language fast, copy it cleanly, scan the set, calm, meta kept apart. Noise
is the spread between two Claude runs of the copywriter.

Round 1, mean of 7 runs (1 to 10):

| Layout  | find | copy | scan | calm | meta | mean |
| ------- | ---- | ---- | ---- | ---- | ---- | ---- |
| columns | 8.86 | 8.57 | 9.00 | 7.14 | 7.71 | 8.26 |
| rows    | 8.00 | 8.71 | 7.43 | 7.29 | 7.86 | 7.86 |
| cards   | 7.57 | 9.00 | 6.00 | 8.14 | 8.29 | 7.80 |
| current | 3.57 | 2.71 | 4.43 | 3.71 | 2.00 | 3.29 |

Columns led with both models (Claude 7.95 against cards 7.85, Codex 8.67 against rows 8.40). That
lead is inside the noise, and none of the three needs an exception, so the first-placed layout
shipped. The retired lines folded scored 8.43, open 6.43, removed 4.29.

Fixed before round 2: the claim's meta wrapped over three lines, and the missing German vision read
like grey copy. Round 2, mean of 6 runs: columns fixed 8.67, columns before the fix 8.13, current
3.63. The fixed version won in every run, and no reviewer named a must-fix. Points left to the
author: on a phone the label column of "Name, values, terms" stays narrow, and those three have
no German line to compare.

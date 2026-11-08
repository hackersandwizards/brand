---
kind: decision
status: open
priority: 3
area: brand
owner: Benedikt
evidence: "Research 08.11.: Bootstrap 3 and 5, Tailwind Plus (third-party listing), GOV.UK, Primer, Carbon; comparison table in docs/agent-work/2026-11-08-element-library-structure.md, section 1. No consumer repo uses any of the elements below on origin/main of 08.11. (section 2)."
recommended:
  - on-first-use
options:
  - key: on-first-use
    label: "Prepare none ahead; build each element in brand when its first surface needs it"
    detail: "Nothing to keep up that nobody renders. The form field, its states and the scales are in place, so a switch or a file input is one file and one scale entry when it comes. Risk: the first surface waits a release for it."
  - key: common-four
    label: "Prepare the four that most of the six systems ship: switch, read-only field, file input, warning state"
    detail: "Switch: Tailwind Plus, Primer, Carbon. Read-only: Bootstrap 3, Carbon. File input: Bootstrap 3 and 5, GOV.UK, Carbon. Warning: Bootstrap 3, Carbon (success too: Bootstrap 5, Primer). About one file each, untested by any real page until a surface uses it."
  - key: all-listed
    label: "Prepare every element in the table that brand lacks"
    detail: "Adds also range, date input, combobox, error summary, character count, password input, floating label and sizes. Most of these need JavaScript or a component, not plain CSS, so they would land in the engines or the apps rather than in elements/."
---

# Which form elements to prepare ahead

Brand now has the form elements its consumers use: text field, textarea, select, checkbox and
radio, fieldset, label, hint, error message and error state, optional mark, disabled, and the
field with its button. Mature systems ship more. Decide which of the rest brand prepares before
any surface asks for one.

Core in most of the six systems and missing in brand: switch, read-only, file input, warning
state. Rare (one or two systems): error summary (GOV.UK alone), range, date input, combobox,
character count, password input, floating label.

Recommended: `on-first-use`. No consumer renders any of them today, and each is about one file
now that the form field and its scale settings exist. Two triggers worth naming: the first form
with more than a handful of questions gets the error summary, and the first on/off setting gets
the switch.

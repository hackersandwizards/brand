---
kind: decision
status: decided
decision: all
by: Benedikt
quote: "bitte unbedingt alle und dann auch prüfen ob wir davon elemente schon in den spokes lokal haben und dann hiermit ins brand repo also den hub ziehen können aus dem spoke raus. zB toasts fallen mir ein aber da sind bestimmt noch andere weitere elemente die wir schon irgendwo nutzen und mir grad nicht einfallen. aber bitte daran denken, dass wir unterschiedliche nutzergruppen haben und daher die elemente ggf etwas unterschiedlich sind. interne experten systene, öffentliche nicht experten systeme und öffentliche experten systeme und das die auch unterschiedliche primäre medien/endgeräte/screen-sizes haben"
priority: 2
owner: Benedikt
area: brand
evidence: "Component indexes of Bootstrap 5.3, shadcn/ui, Radix Primitives, Primer and Carbon fetched on 08.11.; consumer use read on origin/main of os, website, trainer-hub and talks the same day. Table in docs/agent-work/2026-11-08-element-library-structure.md, section 8."
recommended: shared-core
options:
  - key: shared-core
    label: "Design the eight that four or five of the systems ship: dialog, dropdown menu, popover, tabs, progress bar, pagination, spinner, toast, plus an accordion round the disclosure"
    detail: "os already draws dialog, context menu, popover, spinner and toast in its own CSS, so it gets the brand look when it moves onto them. Dialog, popover and toast sit on native HTML and land as CSS; dropdown menu, tabs and accordion need a small script each. Each element gets a blind review like the form elements. Tooltip stays with each system, as the portal says today."
  - key: all
    label: "Design every element in the table that brand lacks"
    detail: "Adds skeleton, avatar, drawer, empty state, carousel, tree view, stepper and command palette to the eight. Most of these show in one system's index or one consumer at most; the website's portraits are the only avatar in use."
  - key: two-surfaces
    label: "Design an element once two consumers build it, as CLAUDE.md sets for the core"
    detail: "Today that is the dialog alone (os and website). The rest waits until a second system draws it, and each consumer keeps its own version meanwhile."
---

# Which common elements does brand design ahead?

Beyond forms, the mature systems ship overlays, menus, tabs, progress and loading states. Brand
has the badge, card, alert, breadcrumb, table, list row, segmented control and separator already,
and the disclosure in the expert layer. The question is which of the rest brand designs before a
second surface needs it.

Shared by four or five of the five systems and missing in brand: dialog, dropdown menu, popover,
tabs, progress bar, pagination, spinner, toast, and an accordion. os builds five of them itself
today; the website builds a dialog.

Recommended: `shared-core`. These are the elements every system ships, and five of them already
exist in os in a look of their own, which brand would replace with one rule. Designing ahead
departs from the core's staging rule in `CLAUDE.md` (an element moves in once two surfaces share
it); choosing this option sets that rule aside for these nine. The choice is about scope, not
looks, so no blind review ran on it; each element built gets its own.

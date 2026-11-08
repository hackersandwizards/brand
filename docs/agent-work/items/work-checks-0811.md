---
kind: work
status: open
priority: 1
owner: Ada
---

# The checks miss removed classes; brand-markers is slow; the portal has no published address

1. brand-elements fails on a page using a class brand once defined, or an hw-* class, that no
   loaded stylesheet defines (admin, 08.11.: `.btn-primary` and `.btn-secondary`, removed in
   v1.43.0, left three buttons unstyled under a green gate).
2. brand-markers finds the pages with a marker in one load per page at 1x instead of two at 2x.
3. The portal root and its anchor forms get a published address.

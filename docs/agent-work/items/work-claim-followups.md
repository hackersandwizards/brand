---
kind: work
status: open
priority: 3
area: brand
order: 2003
owner: Ada
evidence: "Checked 13.11.: render.py still sizes marks by hand (PROFILE_LOGOS, FEATURED_LOGOS, lines 295-296) and claim_block still takes size, step and track (line 74). Internal."
---

# Claim follow-ups in brand: the banner marks, claim_block

Brief a brand session on the two points below; the first waits until a client mark's box next changes.

1. **Client marks on the banners.** render.py sizes each client mark by a hand-set height
   (PROFILE_LOGOS, FEATURED_LOGOS), while the testimonials package's marks.json records each mark's
   size and scale. Reading it from there moves pixels on two shipped banners, so it needs a render
   diff and a blind review: do it when a mark's box next changes.
2. **claim_block in render.py** takes size, step and grid height per surface, where one size would
   derive the others. A refactor with no visible change: the committed banners must render
   byte-identical.

Check: both points done, or the first still waiting on its condition.

---
kind: work
status: open
priority: 3
area: brand
order: 2003
owner: a brand session
evidence: "Checked 12.11.: point 1 reached the website (src/copy/ui.ts:1 imports descriptor); render.py still sizes marks by hand (PROFILE_LOGOS, FEATURED_LOGOS, lines 295-296) and claim_block still takes size, step and track (line 74), both waiting on their condition. Internal."
---

# Claim follow-ups in brand: the banner marks, claim_block

Both remaining points wait for a change nearby.

1. **The descriptor.** Done in v2.20.0: `verbal.json`'s `descriptor`, English and German, without
   a closing full stop; render.py and booth/generate.ts read it. The website's footer imports it
   once its session raises the pin.
2. **Client marks on the banners.** render.py sizes each client mark by a hand-set height
   (PROFILE_LOGOS, FEATURED_LOGOS), while the testimonials package's marks.json records each mark's
   size and scale. Reading it from there moves pixels on two shipped banners, so it needs a render
   diff and a blind review: do it when a mark's box next changes.
3. **claim_block in render.py** takes size, step and grid height per surface, where one size would
   derive the others. A refactor with no visible change: the committed banners must render
   byte-identical.

Check: points 2 and 3 done or still waiting on their condition.

---
kind: work
status: open
priority: 3
area: brand
order: 2003
owner: a brand session
evidence: "docs/agent-work/2026-11-11-claim-and-headline.md, section Open; point 1 done in v2.20.0 (docs/agent-work/2026-11-11-booth-texts.md): verbal.json's descriptor, read by applications/channel-banners/render.py and applications/booth/generate.ts; the website's src/copy/ui.ts (footerSlogan) still types it, a brief for the website session."
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

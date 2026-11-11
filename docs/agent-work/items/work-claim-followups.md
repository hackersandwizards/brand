---
kind: work
status: open
priority: 3
area: brand
order: 2003
owner: a brand session
evidence: "docs/agent-work/2026-11-11-claim-and-headline.md, section Open; read against HEAD on 11.11.: the descriptor stands in applications/channel-banners/render.py (DESCRIPTOR), applications/booth/generate.ts and the website's src/copy/ui.ts (footerSlogan)."
---

# Claim follow-ups in brand: the descriptor, the banner marks, claim_block

Move the banners' descriptor into verbal.json in the next brand release; the other two wait for a change nearby.

1. **The descriptor.** "Training and mentoring in agentic engineering" is typed in three places:
   render.py, the booth generator (with a full stop) and the website's footer, which has its own
   German. The rollout of 08.11. left it in code until a third surface showed it, and the website's
   footer is that third surface. Add it to verbal.json with English and German, read it in
   render.py and booth/generate.ts, and brief the website to import it. A new field is a release
   whose commit names it.
2. **Client marks on the banners.** render.py sizes each client mark by a hand-set height
   (PROFILE_LOGOS, FEATURED_LOGOS), while the testimonials package's marks.json records each mark's
   size and scale. Reading it from there moves pixels on two shipped banners, so it needs a render
   diff and a blind review: do it when a mark's box next changes.
3. **claim_block in render.py** takes size, step and grid height per surface, where one size would
   derive the others. A refactor with no visible change: the committed banners must render
   byte-identical.

Check: the descriptor read from verbal.json everywhere brand draws it, and points 2 and 3 done or
still waiting on their condition.

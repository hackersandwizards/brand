---
kind: work
status: open
priority: 3
order: 2101
area: brand
owner: a brand session
evidence: "Checked 12.11. at v2.23.0: carousel.css:76-77 still sizes the controls 44px, enhanceCarousel in behaviour.ts sets no track tabIndex and scrolls nothing on focusin; none of the four has shipped. Internal: the website keeps its own rows until it does."
---

# The carousel closes four gaps the website's rows already close

A brand session ships four changes to `elements/carousel.css` and `enhanceCarousel` in
`elements/behaviour.ts`, so the website can move its swipe rows to `hw-carousel`.

1. The track is a tab stop while it scrolls (`tabIndex` 0): WebKit makes no scroll container one.
2. On `focusin` inside the track, the focused element's item scrolls to its snap position: a
   peeking item's link showed as little as 42 of 303 px.
3. Dot targets 24 px wide, 8 px apart, with a 40 px current pill: 44 px targets wrap five dots onto
   two lines at 390 px.
4. The pause button as a filled circle in the tray's fill, at the tray's height, beside the tray.

Points 3 and 4 won all 16 runs of the website's panel; the website's report has the images and
scores. Done when a brand release ships the four, each with a test, and the website item names it.

---
kind: work
status: open
priority: 3
order: 2101
area: brand
owner: a brand session
evidence: "website 036894f7 and 330c4cbd (12.11.): hw-carousel v2.22.0 lost a blind panel against the website's swipe rows in all 16 runs; measured at 390 px in Chromium and WebKit; report docs/agent-work/2026-11-12-brand-carousel.md and the item work-take-brand-carousel.md in the website."
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

---
kind: work
status: open
priority: 2
order: 430
area: brand
owner: a brand session
evidence: "Claim round 7, 08.11.: every candidate banner pasted into the real LinkedIn screenshot of 31.10. (os docs/agent-work/2026-10-31-channel-banners-live/live-linkedin-benedikt.jpg) and into the live XING page on a 390 px phone. Image: docs/agent-work/items/claim-round-3/r7-set-linkedin.jpg. Report: docs/agent-work/2026-11-08-claim-round-7.md, 'Seen in place'."
---

# The profile photo covers the start of the claim on LinkedIn's narrow layout

On LinkedIn's narrow logged-out layout (807 px wide in the 31.10. screenshot) the profile photo
covers the first two or three letters of every claim line on `profile-1`: "ery agent needs a team
in tune.", and in that screenshot the shipped banner too ("our whole company unstoppable,").
`applications/channel-banners/render.py` starts the group at x 480 of 1584; the photo there
reaches about x 540 at the claim's rows.

With the descriptor line under the claim, as `claim-round-3` recommends, the XING cover on a
phone shows the same: the photo covers the descriptor's first letters.

Done when `profile-1` and `xing-profile` keep every line clear of the photo in both layouts,
checked on a fresh screenshot of each page, and the change has its blind review against the
shipped banner. Do it in the release that changes the claim, or before it if the claim stays.

# Device backgrounds against real screens, 11.11.2026

Two device backgrounds changed after a check against Benedikt's screenshots of 11.11.: the iPad Pro
home screen in landscape (14:26) and the iPhone 17 Pro Max lock screen in the wallpaper editor
(14:24). The files are in `applications/backgrounds/`. The earlier placement is in os
`docs/agent-work/2026-10-30-lock-screen-position.md`. What he does next is in the item
`work-device-backgrounds-real-states`.

## iPhone lock screen

The lock screen in the screenshot carries `iphone-home-background.png`, not the lock file. Its
lockup sits at the same pixels as in that file, behind the widget row at the bottom. The lock file
shipped until 11.11. (`logo-bottom`) sits there too: its ink is at y 744-785 pt in the editor,
inside the widget row (714-806).

The new `iphone-lock-background.png` (`logo-high`, brand v2.17.1) puts the one-line lockup under the
clock, ink at y 349-390 in the editor and 330-376 under the 1.1525 enlargement measured on 30.10. It
stays clear of the clock (to 245), of the widget row at the bottom or under the clock (to 291 on
screen), and of two notifications above the bottom row (from 474). A third notification in the list
reaches it. It is one-line, as family B of 01.11. asks, but high rather than low: the eight files
were not scored again as a family.

Blind review, Benedikt as the owner, Claude and Codex, two runs each: 7.50 and 9.10 against 2.00 and
2.30 for the old lock file, noise 0.35 and 0.40.

## iPad home screen in landscape

The screenshot shows the landscape file 1:1. The new `ipad-home-landscape-background.png`
(`logo-br-out`, brand v2.19.1) sets the lockup at 44 pt instead of 36, centred between the last app
labels and the Dock (46 and 45 pt from each), 50 pt from the right edge. In portrait iPadOS crops
this same file; the lockup lies outside that crop, so no cut-off wizard shows at the edge (crop
assumed centred, not measured).

Blind review: 7.90 and 8.90 against 6.30 and 7.70 for the file before, noise 0.33 and 0.13. The same
lockup 31 pt further left (v2.17.1) scored 6.70 and 7.60, as its wizard showed cut off in portrait.

## Not checked

For want of screenshots:

- Now Playing and Live Activities on the lock screen. With the widgets at the bottom, where they sit
  is not measured.
- More than two notifications.
- The iPhone home screen, whose file did not change.
- The iPad home in portrait: the crop of the landscape file, and the square file, not checked on the
  device.
- Whether iOS enlarges the photo 1.1525 times on the lock screen after Done, or shows it 1:1 as the
  editor does.

---
kind: work
status: open
priority: 2
order: 214
area: brand
owner: Benedikt
evidence: "Your screenshots of 11.11. (iPad Pro home screen in landscape, 14:26; iPhone 17 Pro Max lock screen in the wallpaper editor, 14:24), measured against the files 11.11. Screenshots of 08.11. (18:52, 19:13, 19:14): Now Playing panel, a Live Activity (flight) and widgets, in the chat only. Earlier placement: os docs/agent-work/2026-10-30-lock-screen-position.md."
---

# Check the device backgrounds against the lock screen's real states

Save your three iPhone lock-screen screenshots of 08.11. to ~/Downloads, so a brand session can check the backgrounds against Now Playing and a Live Activity.

Checked against your screens of 11.11.:

- iPhone lock: your lock screen carries `iphone-home-background.png`, not the lock file. Its lockup sits at the same pixels as in that file, behind your widget row at the bottom. The lock file shipped until today (`logo-bottom`) sits there too: its ink is at y 744-785 pt in the editor, inside the widget row (714-806). The new `iphone-lock-background.png` (`logo-high`, brand v2.17.1) puts the one-line lockup under the clock, ink at y 349-390 in the editor and 330-376 under the 1.1525 enlargement measured on 30.10. It stays clear of the clock (to 245), of the widget row at the bottom or under the clock (to 291 on screen), and of two notifications above the bottom row (from 474). A third notification in the list reaches it. It is one-line, as family B of 01.11. asks, but high rather than low: the eight files were not scored again as a family. Blind review, you as the owner, Claude and Codex, two runs each: 7.50 and 9.10 against 2.00 and 2.30 for the old lock file, noise 0.35 and 0.40.
- iPad home in landscape: the screenshot shows the landscape file 1:1. The new `ipad-home-landscape-background.png` (`logo-br-out`, brand v2.19.1) sets the lockup at 44 pt instead of 36, centred between the last app labels and the Dock (46 and 45 pt from each), 50 pt from the right edge. In portrait iPadOS crops this same file; the lockup lies outside that crop, so no cut-off wizard shows at the edge (crop assumed centred, not measured). Blind review: 7.90 and 8.90 against 6.30 and 7.70 for today's file, noise 0.33 and 0.13; the same lockup 31 pt further left (v2.17.1) scored 6.70 and 7.60, as its wizard showed cut off in portrait.

Still unchecked, for want of screenshots: Now Playing and Live Activities on the lock screen (with the widgets at the bottom, where they sit is not measured), more than two notifications, the iPhone home screen (file unchanged) and the iPad home in portrait (the crop of the landscape file, and the square file, not checked on the device).

Next: install the files of brand v2.19.1 (work-install-final-backgrounds): on the iPhone `iphone-lock-background.png` on the lock screen and `iphone-home-background.png` on the home screen, on the iPad `ipad-home-landscape-background.png` on the home screen. Then send a screenshot of the lock screen after Done: it shows whether iOS enlarges the photo 1.1525 times there or shows it 1:1 as the editor does.

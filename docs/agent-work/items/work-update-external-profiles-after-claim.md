---
kind: work
status: open
priority: 1
order: 6
area: brand
owner: Benedikt
evidence: "Files: brand v1.56.0, applications/channel-banners/ (rendered 08.11. from the u1 claim). Request: Benedikt, 08.11.: „Gleiches gilt ja für die externen Profile, ne? Wir müssen, sobald wir den Claim und die ja, müssen wir auch nochmal alle externen Profile, auch OMR, nochmal aktualisieren. Das sollten wir auch auf die Liste für später tun. p1“"
---

# Upload the new banners and replace the old claim on every external profile

The claim changed to "Agents pay off when your people ship together." / "KI-Agenten lohnen sich,
wenn eure Leute gemeinsam liefern." (brand v1.56.0). The files are in
`applications/channel-banners/` in this repository; only your logins reach the profiles. Done when
every row below is uploaded or changed and no profile shows "Agents in the team. Teams in flow." or
"Agenten im Team. Teams im Flow.".

| Profile                | Upload                                                                                                                      | Text field: old → new                                                                                                                                                                                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LinkedIn, your profile | Banner slide 1: `profile-banner-1-claim-1584x396.png`. Slide 2 (`profile-banner-2-clients-1584x396.png`) stays as it is.    | Headline: replace the opening "Agents in the team. Teams in flow." with "Agents pay off when your people ship together." and keep the rest after the first `\|`. Featured link, title: "Agents pay off when your people ship together." (47 characters); its image carries no claim and stays. |
| LinkedIn, company page | Nothing: the cover carries no claim.                                                                                        | Tagline (English): "Agents pay off when your people ship together." (47 of 120). Tagline (German, Languages tab): "KI-Agenten lohnen sich, wenn eure Leute gemeinsam liefern." (59 of 120).                                                                                                    |
| XING                   | `xing-profile-cover-1312x639.png`: the lockup and claim now sit right of your photo, clear of it on a phone and on desktop. | Not read (the logged-out page shows no text field with the claim): replace the old claim wherever it stands.                                                                                                                                                                                   |
| X                      | `x-profile-header-1500x500.png`                                                                                             | Bio not read (x.com needs a login): replace the old claim if it stands there.                                                                                                                                                                                                                  |
| YouTube                | `youtube-channel-banner-2560x1440.png`                                                                                      | Channel description not read: replace the old claim if it stands there.                                                                                                                                                                                                                        |
| Sessionize             | `sessionize-profile-cover-2000x500.png`                                                                                     | None: the tagline carries no claim (read 08.11.).                                                                                                                                                                                                                                              |
| Brella                 | `brella-profile-cover-2000x800.png`                                                                                         | Not read.                                                                                                                                                                                                                                                                                      |
| Facebook               | `facebook-profile-cover-2000x740.png`                                                                                       | Not read.                                                                                                                                                                                                                                                                                      |
| OMR Reviews            | Nothing: `omr-reviews-cover-1920x1080.png` carries no claim and did not change.                                             | Not read: replace the old claim if the profile text holds it.                                                                                                                                                                                                                                  |

The descriptor under the claim on every banner reads "Training and mentoring in agentic
engineering". Stefan's LinkedIn banner: if it shows slide 1, it takes the same file.

The banners can go up now. The text rows replace only the claim line; the profile texts around it (LinkedIn About, Sessionize, OMR, the practitioners bios) are rewritten and reviewed in context under `work-claim-rollout-holistic` first, so change the text fields once that item is done.

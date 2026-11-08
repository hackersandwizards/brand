---
kind: decision
status: open
priority: 1
order: 10
area: brand
owner: Benedikt
evidence: "Round 9, 08.11.: seven rounds, 954 reviewer runs, 53 lines and short/long pairs against six requirements fixed before any score; report docs/agent-work/2026-11-08-claim-round-9.md. Round 8: docs/agent-work/2026-11-08-claim-round-8.md."
recommended: s4p
options:
  - key: s4p
    label: "Switch to the pair s4p. Banners: Agents pay off when your people ship as a team. / KI-Agenten lohnen sich, wenn eure Leute als Team liefern. Slide, link preview, one-pager, About and bios: the same plus Your customers notice. / Eure Kunden merken es. (German H1 'zusammenspielen' stays)"
    detail: "Alone on the LinkedIn banner, photo over it: people 32 of 32, core thought 31 of 32. Rendered panel overall 12.0 ahead of f6 in both runs and with both models; per surface: banners a tie (-0.5; Codex 2.7 behind), slide +2.2, link preview +3.0. Whole set with site and profiles: 78.6 against f6's 79.0, a tie. Together 7.3 (f6 6.5). Misses German in part: German 3.0 below its English, German banners 3.3 below f6's, 'als Team liefern' slightly translated; still the best of four German wordings. Reviewers' open question: what exactly do customers notice?"
    score: 77.1
    noise: 0.8
  - key: u1p
    label: "Switch to the pair u1p: Agents pay off when your people ship together. / KI-Agenten lohnen sich, wenn eure Leute gemeinsam liefern. Long line adds: Your customers see it in your releases. / Eure Kunden merken es an euren Releases."
    detail: "Ties s4p on the panel (75.9, 10.8 ahead of f6) and passes the banner cold read (people 32, core 31 of 32). Banners 3.5 behind f6, outside the noise ('ship together' reads as jargon); as a whole set 1.9 behind f6, a tie; least calm (6.2)."
    score: 75.9
    noise: 1.7
  - key: f6
    label: "Keep f6: Every agent needs a team in tune. / Jeder KI-Agent braucht ein eingespieltes Team."
    detail: "Your decision of 08.11. Best as a whole set (79.0, together 9.1) and in German (language 9.3). Alone on a banner 14 of 32 readers read its team as people, 12 of 32 the core thought; rendered panel overall 12.0 behind s4p, level on the banners."
    score: 65.1
    noise: 1.9
  - key: m3
    label: "Switch to m3: Agents write code. Your team ships products. / KI-Agenten schreiben Code. Euer Team liefert Produkte."
    detail: "Strongest on the banners (73.4) and calmest; alone people 32 of 32, core 25 of 32. Loses the working together in every round (together 3.1); as a whole set 6.9 behind f6 with Claude: 'My team already ships products, so what does your training change?'"
    score: 70.7
    noise: 0.1
images:
  s4p:
    - src: r9-linkedin.jpg
      caption: "LinkedIn's narrow layout, the real photo over the banner: f6, m3, u1p, s4p from the top, English left, German right"
    - src: r9-s4p-en.jpg
      caption: "s4p in place, English: LinkedIn narrow layout, X header, Sessionize cover, closing slide, link preview"
    - src: r9-s4p-de.jpg
      caption: "s4p in place, German"
  u1p:
    - src: r9-linkedin.jpg
      caption: "LinkedIn's narrow layout: f6, m3, u1p, s4p from the top, English left, German right"
  f6:
    - src: r9-linkedin.jpg
      caption: "LinkedIn's narrow layout: f6, m3, u1p, s4p from the top, English left, German right"
  m3:
    - src: r9-linkedin.jpg
      caption: "LinkedIn's narrow layout: f6, m3, u1p, s4p from the top, English left, German right"
---

# Switch to a short/long pair that carries the core thought?

You asked whether one combination meets every requirement. The pair s4p comes closest. On the banners: "Agents pay off when your people ship as a team." Everywhere else it adds: "Your customers notice."

Alone on a banner, readers name people and the core thought; for f6, 14 and 12 of 32 did. Reviewers score it 12.0 above f6 overall with the banners, slide and link preview in view; on the banners alone the two are level, though one of the two reviewer models puts it 2.7 behind. With the site and your profile texts it ties f6. Its weak spot is German: "als Team liefern" scores 3.0 below the English, and three other German wordings scored lower still. "Im Einklang" lost in all ten lines it was tested in.

Overall is the panel mean, 0 to 100, over English and German, from round 6 (round 9's last rendered round with both languages); scores compare within one round only. Noise is the gap between the two runs' means.

The rollout (banners, closing slide, link preview, one-pager header, profiles) waits on this answer. With s4p, `verbal.json` gains a long form of the claim beside the short one, released as a new exported field.

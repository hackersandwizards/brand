# Teal labels on the Software Factory page

The Software Factory area takes teal labels like every other area. The factory hue (rust,
`--color-factory`) stays in the tokens as chart series 5 and as the expert systems' rust category,
and colours no label and no area. `tokens/tokens.css` states the rule; `elements/label.css` no
longer has `data-hue="factory"`.

## Result

Rust scored 6.87, teal 7.82: a lead of 0.96 at a noise of 0.37. Teal led in every one of the nine
runs, with both models. All six Claude runs named the rust eyebrows unprompted as an accent the
home page never uses, each at high severity.

| Reviewer (model, run)      | Rust | Teal |
| -------------------------- | ---- | ---- |
| CTO (Claude, 1)            | 6.6  | 7.4  |
| CTO (Claude, 2)            | 6.4  | 7.8  |
| CTO (Codex)                | 7.8  | 8.4  |
| Co-founder (Claude, 1)     | 6.4  | 7.4  |
| Co-founder (Claude, 2)     | 5.6  | 7.2  |
| Co-founder (Codex)         | 8.0  | 8.6  |
| Brand designer (Claude, 1) | 6.4  | 7.4  |
| Brand designer (Claude, 2) | 6.8  | 7.6  |
| Brand designer (Codex)     | 7.8  | 8.6  |
| Mean                       | 6.87 | 7.82 |

By criterion (means over nine runs), rust against teal: recognition 7.1 / 8.1, system consistency
5.6 / 7.8, fit for medium and audience 7.3 / 7.6, breathing room 7.9 / 7.9, visual calm 6.4 / 7.8.

Noise: the mean difference between a Claude reviewer's two runs, per version: 0.37 (largest 0.8).

## Method

- Medium: the public website, German. Audience: German CTOs and founders who buy training and
  consulting. Real display: desktop at 1440 px and phone at 390 px.
- Both versions from the website's built `dist/` of 07.11. 20:51 (commit b5a75159), served
  locally. Rust is the page as it ships. Teal sets the factory area's three colour roles to the
  values every other area uses (`teal`, `teal-dark`, `teal-night`), in the home page too. One
  label inside the first card stayed rust in the teal version, since the site sets it through
  `data-hue="factory"`; the reviewers noticed it.
- Per version five screenshots at 1000 px on the long side: the home page top, the factory page
  top, middle and lower part, and its phone top.
- Personas from the panel that first raised the finding (CTO buyer, co-founder, brand designer);
  the freelance trainer of that panel is left out, since trainers do not read this page to buy.
  Three Claude Opus runs per persona in two shuffled orders, one Codex run each. Neutral labels K
  and M, criteria fixed before scoring.

Reviewer prompt, verbatim (CTO, Claude run 1; paths shortened to the file name):

```text
You are the CTO of a 400-person software company in Germany. You are deciding whether to buy agentic-engineering training and a software-factory engagement from this consultancy. You judge a supplier partly by how coherent and professional everything they show you looks.

Task: two versions of the same German website are shown, K and M. Each version is five screenshots: the home page and the Software Factory service page, which a buyer reaches from the home page. Medium: a public company website. Audience: German CTOs and founders who buy training and consulting. Real display: desktop browser at 1440 px and phone at 390 px; screenshots are downscaled to 1000 px on the long side and were taken headless, so ignore browser chrome. Open every image with the Read tool before scoring.

Version K: (1) home page, desktop 1440 px, top: rust-1-home.jpg; (2) Software Factory page, desktop, top: rust-2-factory-top.jpg; (3) same page, middle: rust-3-factory-mid.jpg; (4) same page, lower: rust-4-factory-lower.jpg; (5) same page on a phone, 390 px, top: rust-5-factory-phone.jpg
Version M: (1) home page, desktop 1440 px, top: teal-1-home.jpg; (2) Software Factory page, desktop, top: teal-2-factory-top.jpg; (3) same page, middle: teal-3-factory-mid.jpg; (4) same page, lower: teal-4-factory-lower.jpg; (5) same page on a phone, 390 px, top: teal-5-factory-phone.jpg

Criteria, each scored 1 to 10 per version, judging the Software Factory page as part of this website:
C1 Recognition: at a glance the Software Factory page is recognisably the same company as the home page (logo, colours, type).
C2 System consistency: the page uses the shared elements the same way the home page does (label style, colours, heading typeface, corners, how the teal-purple gradient is used).
C3 Fit for medium and audience: it serves a German buyer on desktop and phone.
C4 Breathing room: not cramped.
C5 Visual calm: no clutter, no competing accents.

Answer in English. First, for each version, two sentences on what you see. Then list every deviation you see, with the version, what differs and a severity (high, medium, low). Then name for each criterion what keeps it below 10.
End your answer with exactly one fenced json block and nothing after it, of this shape: {"K": {...}, "M": {...}}
```

The file names in the prompt name the variant (`rust-`, `teal-`). No reviewer text refers to a
file name as a hint; they describe the colours they see. Codex ran with the brand repository as
its working folder, read-only, and was not pointed at any file there.

Review: medium, because a customer page re-tests a rule that already ships.

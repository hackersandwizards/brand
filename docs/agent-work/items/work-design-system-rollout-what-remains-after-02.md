---
kind: work
status: open
priority: 3
order: 2000
owner: a brand session (points 1, 2, 4); slides (point 3)
evidence: "07.11.: brand gained --color-teal-soft (documents' --accent-soft, teal 7 % on white) and brand-elements' source check learned button, breadcrumb and fact, read 0 findings on slides, documents and talks origin/main (the control, website, reads 10); measurements below from tokens/tokens.css and applications/channel-banners/render.py"
---

# Design system: the brand proposals that remain

1. **Night lines.** `facts.css`, `table.css` and `card.css` draw night lines as white at 15 %
   (transparent), `row.css` and `frame.css` as white at 18 % over night;
   `--color-night-line` is night ink at 15 % over night, opaque. Measured ΔE76 against
   `--color-night-line`: white 15 % on night 1.3, white 18 % on night 4.6, white 15 % on night-2 5.0,
   white 15 % on a night card (white 7 % over night) 7.7. Switching is a visible change on raised
   grounds: render the elements' night stories both ways and run a blind review before switching.
2. **Hero corner glows.** The banners' glow deltas in `render.py` (`TEAL_GLOW` (7, 41, 46),
   `PURPLE_GLOW` (35, 9, 54)) are teal at 42 % and purple at 26 % over night within one RGB level,
   the website PageHero's xl strengths, which it retypes from `render.py`. Tokens for the two
   strengths make `render.py` derive its deltas from them, which moves one channel by one level, so
   every channel banner is re-rendered (`uv run`) in the same commit; the website then reads the
   tokens.
3. **slides' shared names.** slides' `styles/tokens.css` still defines `--background`,
   `--foreground`, `--color-accent`, `--font-heading` and other names `expert.css` and `tokens.css`
   define. Renaming changes deck utility names: a slides release, done in slides.
4. **From the spoke switches**, not yet measured: a setting naming an undefined token falls back
   silently; night pills lose hue distinction; a hue setting for card, label and callout; a
   line-height setting on the pill.
5. **Left from the 07./08.11. runs.** `--slide-measure-overview` in `tokens/stage.css` can go: talks and
   hycle-private pin slides v2.12.0 and trainer-hub v2.11.0 (09.11.), all past v1.22.0. A ring setting
   beside `--hw-focus-width` would remove four off-token shadows in os (`ListRow.css`,
   `PipelineCard.css`, `StageHero.css`, `StageDots.astro`). A compact `hw-row` variant a header row
   can read would remove os's two copies of the compact values (`ListRow.css`, `DetailPane.css`).
   The channel banners' client band still shows the client marks from before v1.36.0: re-render.

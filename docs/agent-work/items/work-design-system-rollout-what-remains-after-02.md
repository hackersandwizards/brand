---
kind: work
status: open
priority: 3
order: 2
owner: a brand session, then each spoke drops the exception a shipped proposal makes moot
evidence: "brand v0.29.0 to v0.34.0; os `docs/agent-work/2026-11-02-design-system-rollout.md`, `docs/agent-work/2026-11-02-design-system-phase3.md`, `docs/agent-work/2026-11-01-shared-elements.md`; checked 03.11.: os draws its list rows with brand's `hw-row`, trainer-hub pins slides v0.30.0 and documents v0.7.1"
---

# Design system: the brand proposals and follow-ups that remain

Done since phase 2: os draws its list rows with brand's `hw-row` (os `src/styles/global.css`), and
trainer-hub's pins are raised (slides v0.30.0, documents v0.7.1). What remains:

1. documents' soft accent (`tokens.css` `--accent-soft`, teal at 7 % on white, drawn in
   `document.css`, `handout.css` and `onepager.css`) has no brand token yet. Its own night line and
   `--result-soft` went in documents 99b73f5 (no reader).
2. The elements' own night rules (`row.css`, `facts.css`, `card.css` and others) still mix white at
   15 or 18 %; whether they take `--color-night-line` needs a review on os and trainer-hub night.
3. Hero corner-glow values (website PageHero: 21/42 % and 13/26 %, 320x360 and 620x420 px) match the
   channel-banner glows in `applications/channel-banners/render.py`: candidate tokens.
4. slides still defines names brand's `expert.css`/`tokens.css` also define (`--background`,
   `--foreground`, `--color-accent`, `--font-heading` and others, `styles/tokens.css`). Renaming
   changes deck utility names: a slides release.
5. Teach `brand-elements`' source check the new element names (button, breadcrumb, facts, ...) once
   every spoke has switched.
6. From the spoke switches: a setting naming an undefined token falls back silently; night pills
   lose hue distinction; a hue setting for card, label and callout; a line-height setting on the pill.

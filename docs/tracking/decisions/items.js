// eslint-disable-next-line no-undef
window.DECISION_REPOS = window.DECISION_REPOS || {};
// eslint-disable-next-line no-undef
window.DECISION_AREAS = { brand: "Brand" };
// eslint-disable-next-line no-undef
window.DECISION_REPOS["brand"] = [
  {
    id: "logo-derivatives",
    title:
      "Which logo derivatives stay in brand, and how does the Logos page split masters from delivery files?",
    area: "brand",
    priority: 3,
    order: 1,
    status: "open",
    context:
      "Benedikt, 01.11.: „ist das die aufgabe vom brand repo hier render derivate zu halten? das muss doch eigentlich dort passieren wo man sie braucht. die logo seite sollte doch nur die logos definieren hier geht es ja nicht um die auslieferung. oder ist das fürs press kit?“ lockup-screen.svg is not for the press kit: brand's own internal header (AppHeader.astro, header.css) uses it on seven internal surfaces, and the website's own header takes it too: seven repos besides brand. The press kit takes 16 files: lockup, compact lockup and wordmark in day and night plus wordmark-white and -black, each SVG and PNG. Seven files in logos/ have no consumer (the four rasters of the outline cuts and the former type-logo, type-logo-long.svg, emoji-logo-long.png and its CMYK TIF), and avatar-512.png is pixel-identical to icon-maskable-512.png. Counts per file and costs: docs/tracking/2026-11-01-logo-derivatives.md.",
    options: [
      {
        key: "a",
        label: "Clean up and split the page",
        detail:
          "Delete type-logo-long.svg/.png, type-logo-short.png, wordmark-outline.png, lockup-compact-outline.png, emoji-logo-long.png and its CMYK TIF, and avatar-512.png (os uploads icon-maskable-512.png to Tally). Keep the SVG masters, the screen cut, the favicon set and the PNGs of the press-kit logos plus lockup-outline.png. The Logos page shows the three masters only; a new Delivery files section lists screen cut, favicon set and PNGs. Cost: brand about 12 files and a minor release, os 2 files and the pin. Package 365 KB lighter.",
      },
      {
        key: "b",
        label: "Strict: every PNG moves to its consumer",
        detail:
          "a, plus the remaining nine PNGs leave brand: the website renders its press-kit PNGs at build with sharp, talks renders three before the PPTX export, documents swaps a test fixture, channel-banners renders from SVG. Cost on top: brand about 6 files, website 2, talks 2, documents 1, four pin bumps. Package 755 KB lighter; the catalogue offers SVG only.",
      },
      {
        key: "c",
        label: "Split the page only",
        detail: "Every file stays; catalogue.ts, catalogue.html and its test change.",
      },
    ],
    recommended: "a",
  },
  {
    id: "code-colours",
    title: "Which highlighter and which palette colour code and terminals on every surface?",
    area: "brand",
    priority: 3,
    order: 3,
    status: "assumed",
    context:
      "Benedikt, 02.11.: „kann man Shikis nicht so konfigurieren das es unsere brand colors nutzt? also grauer code funktioniert nicht das ist keine option.“ Then, relayed by Ada: Shiki wherever code and terminals render, the combination with the highest score, least distance from the brand colours and fewest new exceptions, our own orange where an orange is needed. Every surface shows github-dark today. Blind panel on the real hub handout (print), a knowledge article, a slide and a terminal image, five personas, Claude and Codex twice each: A, today's hw-code palette with no new colour, 8.61; B with amber and factory-light, no new colour, 8.02; C with six new colours, 7.29; github-dark 6.12; noise up to 0.75. Round 2 with lighter strings and keywords from core colours: all within noise (7.81 to 8.00). Shipped: brand v0.27.9 and v0.27.10 (codeClasses, the 16 ANSI colours), documents v0.3.1. Report: docs/tracking/2026-11-02-code-colours.md.",
    options: [
      {
        key: "a",
        label: "Shiki everywhere with hw-code as it is (shipped)",
        detail:
          "Purple keywords and constants, teal strings, grey comments, green tags on night. No new colour. 8.61.",
      },
      {
        key: "b",
        label: "hw-code plus amber constants, teal-light functions, factory-light variables",
        detail: "No new colour, more hues. 8.02; amber reads as the main colour.",
      },
      {
        key: "c",
        label: "Tuned editor colours with six new tokens",
        detail: "Brighter cyan, blue, light purple. 7.29; reads like a stock editor theme.",
      },
    ],
    recommended: "a",
    assumption:
      "hw-code stays the one palette and needs no new brand colour; no surface shows light code, so no light variant ships; os, website, slides and talks switch in their own sessions in that order after the trainer hub.",
  },
  {
    id: "density-tiers",
    title:
      "Density: do os and trainer-hub get a compact tier of the same brand elements (UI text 13 px, as on macOS)?",
    area: "brand",
    priority: 2,
    order: 3,
    status: "decided",
    decision:
      "Benedikt 02.11.: compact (Recommended): the compact density token for internal expert tools (os, trainer-hub).",
    context:
      "Benedikt, 02.11.: „Die Elemente werden im Company OS gerade relativ groß seit den letzten Änderungen. […] Am schönsten ist natürlich meiner Meinung nach, wenn wir dieselben Elemente verwenden, aber vielleicht etwas weniger Abstände und etwas kleiner, damit wir mehr auf den Screen bekommen“. Measured 1440x900, os origin/main 26.10. vs today: every 10-13 px text is now 14 px, rows and paddings unchanged; dashboard attention rows on the first screen 11 -> 7, deals 9 -> 7, hub units 12 -> 10. One third from Benedikt's 28.10. scale (os 4235c4556, „ui 14, meta 13, micro 12“), two thirds from brand v0.8.0 (92613b1), where an agent assumption merged meta 13 px into 14 px. Apple HIG: macOS 13 pt text and 28 pt controls, iOS 17 pt and 44 pt; Spectrum ships the same components at 32 px desktop, 40 px mobile. Prototype in live os, dashboard and deals, blind panel of three personas (Benedikt daily on a 14-inch MacBook, an operations lead, a UX designer for expert tools), Claude and Codex, Benedikt twice: compact 8.25, today 7.26, tight 7.40; noise up to 1.0; 7 of 8 runs pick compact. Report: docs/tracking/2026-11-02-design-system-shape.md.",
    options: [
      {
        key: "compact",
        label: "Compact tier: UI text 13 px, micro 11 px (dense carries type and heights)",
        detail:
          "brand's dense scale also sets --text-ui 13 px at 1.45 and the heights components read (row padding, control height, tile); os and trainer-hub move list rows and filters onto them; the website stays screen, mobile first. Measured: dashboard 7 -> 8 rows, deals 7 -> 7 until the components read the tokens.",
      },
      {
        key: "tight",
        label: "Tight: compact plus body 15 px, spacing 3.5 px, rows 5 px padding",
        detail:
          "Dashboard 10 rows, deals 8; reviewers score legibility 6.7 against 8.1 and calm 6.2 against 7.9.",
      },
      {
        key: "keep",
        label: "Keep today's 14 px",
        detail: "Most legible (8.9), fewest rows on screen (6.2 for information per screen).",
      },
    ],
    recommended: "compact",
  },
  {
    id: "design-system-tool",
    title: "One design-system tool in every repo: Astrobook, our own page or Storybook?",
    area: "brand",
    priority: 2,
    order: 4,
    status: "decided",
    decision: "Benedikt 02.11.: Astrobook (Recommended), in every repo.",
    context:
      "Benedikt, 02.11.: „Mal nutzen wir Storybook vielleicht, mal nutzen wir Astrobook, mal haben wir uns das selber gebaut. Ich hätte gerne, dass das jetzt überall identisch ist, dass ich nicht in jedem Repo wieder neu mich in das Design System reindenken muss.“ Today: Astrobook in website, os, trainer-hub (each with its own home page), own pages in brand, slides, documents, talks, verifier and the personal site, none in hycle. Prototype: the same label, pill, card, callout (plus a React pill) from brand v0.27.9 in each candidate, same story files, screen and dense, light and night. Blind panel (Benedikt as founder reviewing ten repos, a frontend engineer, a brand designer; Claude and Codex; Benedikt twice): Astrobook 8.43, own page 8.10, Storybook 5.75; noise 0 for the first two; all Claude runs pick own, all Codex runs Astrobook, a tie. Cost: node_modules 183 / 180 / 286 MB, build 1.2 / 2.4 / 4.6 s, page transfer 0.2 / 0.2 / 5.1 MB; Storybook's Astro support is a community framework, telemetry on by default, no controls for Astro components in a static build.",
    options: [
      {
        key: "astrobook",
        label: "Astrobook everywhere, with one brand shell",
        detail:
          "brand exports the shell (home page, CSS, scale-and-theme decorator); every repo serves /design-system with it. Already running in three repos, renders React components, stories stay valid for Storybook. slides, talks, documents and the verifier add Astro as a dev dependency (slides +41 MB measured 01.11.).",
      },
      {
        key: "own",
        label: "Our own page, generated from the same stories",
        detail:
          "About 40 lines per repo or one shared page from brand; best brand fit (8.9) and every scale at once, weakest findability (7.5) until variants get anchors. We maintain it.",
      },
      {
        key: "storybook",
        label: "Storybook 10 with the Astro framework",
        detail:
          "Largest ecosystem (a11y, visual and interaction tests); one scale and theme at a time via the toolbar (3.0 for seeing all scales), generic chrome (3.4 brand fit), 5 MB per page.",
      },
    ],
    recommended: "astrobook",
    images: {
      astrobook: "docs/tracking/2026-11-02-design-system-shape/tool-astrobook.jpg",
      own: "docs/tracking/2026-11-02-design-system-shape/tool-own.jpg",
      storybook: "docs/tracking/2026-11-02-design-system-shape/tool-storybook.jpg",
    },
  },
  {
    id: "design-system-hub-spoke",
    title: "Hub and spokes: what may a spoke still hold (tokens, atoms, molecules, organisms)?",
    area: "brand",
    priority: 2,
    order: 5,
    status: "decided",
    decision: "Benedikt 02.11.: strict: no tokens in spokes; every value comes from brand.",
    context:
      "Benedikt, 02.11.: „im Brand Guide dann der ganze Core […] die meisten Tokens, Atome und vielleicht Moleküle […] in den einzelnen Spokes dürften eigentlich fast gar keine Atome sein und gar keine Tokens, wenige Moleküle, dafür aber […] mehr Organismen“. Inventory (origin/main 02.11., levels per Brad Frost, counts partly judgement): the seven h&w spokes hold 81 atoms, 130 molecules, 147 organisms and 81 primitive tokens; brand about 12 atoms and 7 molecules. 17 candidates found in two or more systems (customer button, arrow link, caps tag, segmented control, field with button, facts list, list row, prose block, code panel, KPI tile, dashed frame, status callout, breadcrumb, motion tokens, night remap, app width and screen fonts, stage values). Best practice holds his model (Brad Frost: core vs product-owned recipes that can graduate) with two corrections: Material assigns component tokens to components, so a spoke's own organisms keep theirs; Frost calls atomic design a mental model, so level names make no gate rule.",
    options: [
      {
        key: "tiered",
        label: "No primitive tokens or atoms in spokes; component tokens for own organisms",
        detail:
          "A spoke holds no primitive tokens, semantic ones only as theme and density hooks, component tokens only for its own organisms, atoms only as reasoned exceptions in brand-elements.json, molecules as recipes until a second system shows them. Brand takes the 17 candidates: atoms about 12 -> 20, molecules about 7 -> 25.",
      },
      {
        key: "strict",
        label: "Strict: no tokens at all in spokes",
        detail:
          "Every component token of a spoke organism moves to brand too; brand then holds tokens for slide types, document types and app views it does not render.",
      },
      {
        key: "loose",
        label: "Loose: only today's shared elements",
        detail:
          "Spokes keep their atoms and molecules; brand stays at the 11 shared elements plus the expert set.",
      },
    ],
    recommended: "tiered",
  },
  {
    id: "catalogue-shape",
    title: "One page shape for the brand catalogue, the slide specimen and the document specimen?",
    area: "brand",
    priority: 3,
    order: 6,
    status: "decided",
    decision: "Benedikt 02.11.: shared shape (Recommended) for every repo's catalogue.",
    context:
      "Benedikt, 02.11.: „die Brand-Katalog-Seite, die Slide-Übersichtsseite, die Docs-Übersichtsseite, das ist ja eigentlich auch im Prinzip überall dasselbe, oder?“ Prototype: one generator, header (AppHeader), left rail with search and groups with counts (like SpaceNav), title and lead (PageHeader), a provenance line, a grid of hw-card tiles with preview per group, fed with the real slide types, document types and brand sections. Blind panel (same three personas, Claude and Codex, Benedikt twice): one shape 8.31, today's three pages 4.71; noise 1.0 / 0.3; all 8 runs pick it. The decision page is a work queue, not a catalogue: it keeps its list form, built from os's list row, filter and pill. Independent of os row catalogue-sites-astro (whether the pages are built with Astro).",
    options: [
      {
        key: "shared",
        label: "One shape for all three, decision page as an os-style list",
        detail:
          "brand ships the shape (header, rail, tiles from its elements); brand, slides and documents render their pages in it. Open from the review: rail lists types too, larger previews.",
      },
      {
        key: "keep",
        label: "Keep three page forms, shared header only",
        detail: "Today's state since 01.11.",
      },
    ],
    recommended: "shared",
    images: {
      shared: "docs/tracking/2026-11-02-design-system-shape/catalogue-shape-slides.jpg",
      keep: "docs/tracking/2026-11-02-design-system-shape/catalogue-today-slides.jpg",
    },
  },
];

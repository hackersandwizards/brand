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
    id: "ds-roll-trainer-hub-compact",
    title:
      "Does trainer-hub keep the compact tier (UI text 13 px), or go back to 14 px while os keeps 13?",
    area: "brand",
    priority: 2,
    order: 7,
    status: "open",
    context:
      "density-tiers (compact) shipped in brand v0.28.0 on data-hw-scale=\"dense\", reaching os and trainer-hub on 02.11. Blind review after the switch, 1440x900, Claude and Codex, two runs each: os (dashboard, deals, deal, people) Benedikt as daily user 7.50 -> 8.38, outside noise (0 to 0.5); COO 7.88 -> 7.50, inside noise (up to 2), a tie. trainer-hub (two personas: a trainer preparing at a laptop, Benedikt reviewing content) prefers 14 px on every app page beyond noise: units 8.06 -> 7.58, unit 8.21 -> 7.75, knowledge 8.04 -> 7.52 (noise 0.12 to 0.29); legibility 8.1-8.3 -> 6.9-7.0. Reviewers name the material sidebar, filter chips, 'On this page' and meta lines; trainer-hub's own rule says trainers read it on projectors and in daylight. Report: os docs/tracking/2026-11-02-design-system-rollout.md.",
    options: [
      {
        key: "keep",
        label: "Keep compact in both",
        detail: "No change. trainer-hub stays at 13 px with os.",
      },
      {
        key: "hub-14",
        label: "trainer-hub back to 14 px, os stays compact",
        detail:
          'brand adds a density hook (for example data-hw-density="comfortable" restoring --text-ui 14 px and micro 12 px under dense) and trainer-hub sets it on <html>. Cost: brand patch release, trainer-hub one attribute and the pin; os unchanged.',
      },
    ],
    recommended: "hub-14",
  },
  {
    id: "ds-roll-verifier-push",
    title:
      "Push the certificate verifier's design-system commit? A push to main deploys production.",
    area: "brand",
    priority: 2,
    order: 8,
    status: "open",
    context:
      "certificate-verifier 09ec51c (brand v0.27.5 -> v0.28.4, Astrobook at /design-system/ with brand's AstrobookHome, a story per page and part) is committed locally, gate green, not pushed: Cloudflare Workers Builds deploys every push to main. The live pages compare pixel-identical at 1440x900 (home, verify, not found); the worker's /design-system page changes only its tile version label. Report: os docs/tracking/2026-11-02-design-system-rollout.md.",
    options: [
      {
        key: "push",
        label: "Push now",
        detail: "Production redeploys with identical pages.",
      },
      {
        key: "hold",
        label: "Hold until the next verifier change",
        detail: "The commit waits in the local checkout.",
      },
    ],
    recommended: "push",
  },
  {
    id: "ds-roll-heights-today",
    title: "Assumed: the compact tier's height tokens carry today's values",
    area: "brand",
    priority: 3,
    order: 9,
    status: "assumed",
    assumption:
      "dense sets --hw-row-pad 0.5rem 0.75rem and --hw-control-height 2.5rem, today's measured values; os and trainer-hub list rows and filters read them unchanged. Only the type change (13 / 11 px) was blind-reviewed, so lower heights wait for their own review.",
    context:
      "density-tiers named heights components read without values. Report: os docs/tracking/2026-11-02-design-system-rollout.md.",
  },
  {
    id: "ds-roll-dense-talks",
    title: "Assumed: the compact tier rides on dense, so talks gets it too",
    area: "brand",
    priority: 3,
    order: 10,
    status: "assumed",
    assumption:
      'The tier lives on data-hw-scale="dense", which os, trainer-hub and talks set. On talks it changed no pixel: the deck list takes the slide engine\'s sizes, not --text-ui.',
    context:
      "density-tiers named os and trainer-hub. Report: os docs/tracking/2026-11-02-design-system-rollout.md.",
  },
  {
    id: "ds-roll-home-sidebar",
    title:
      "Assumed: the Astrobook home hides Astrobook's sidebar; the catalogue's rail replaces it there",
    area: "brand",
    priority: 3,
    order: 11,
    status: "assumed",
    assumption:
      "AstrobookHome hides Astrobook's own sidebar on the home only; each story page keeps it. The rail carries search and groups with counts; the theme toggle goes into the header's nav slot (brand v0.28.4). The website passes previews={false}: its production headers forbid framing (X-Frame-Options DENY, frame-src 'none').",
    context:
      "catalogue-shape decided one shape; Astrobook brings its own sidebar. Report: os docs/tracking/2026-11-02-design-system-rollout.md.",
  },
  {
    id: "ds-roll-specimen-fixtures",
    title:
      "Assumed: slides, documents and the verifier keep their own pages as gate fixtures beside Astrobook",
    area: "brand",
    priority: 3,
    order: 12,
    status: "assumed",
    assumption:
      "Astrobook at /design-system/ is the catalogue in every repo that has one now. The slides and documents specimen pages and the verifier's /design-system route stay, because brand-elements, brand-markers and specimen --check read them as files without a server; documents' specimen index is also its public GitHub Pages site. talks removed its own Next route instead.",
    context:
      "design-system-tool: Astrobook in every repo. Report: os docs/tracking/2026-11-02-design-system-rollout.md.",
  },
  {
    id: "ds-roll-personal-hycle",
    title: "Assumed: the personal site and hycle-private get no Astrobook in this run",
    area: "brand",
    priority: 3,
    order: 13,
    status: "assumed",
    assumption:
      "Neither wears the h&w brand. The personal site publishes its repository root without a build; hycle-private's site is a claude-free plain-HTML submodule. Adding Astro to either changes how it publishes, which waits for a session of its own.",
    context:
      "design-system-tool says every repo. Report: os docs/tracking/2026-11-02-design-system-rollout.md.",
  },
];

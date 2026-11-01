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
    id: "shared-elements",
    title:
      "Lift the elements every surface shares into brand as CSS, or only show what brand already shares?",
    area: "brand",
    priority: 2,
    order: 2,
    status: "open",
    context:
      "Benedikt, 01.11.: „warum gibt es im brand kit nur ein einziges element. müssten da nicht viel mehr elemente sein? theoretisch müssten wir doch viel viel mehr gleiche elemente zwischen den einzelnen systemen haben und nur sehr einzelne ausnahmen. als abgesehen von kunde vs internes system“. Inventory of 23 element types over website, verifier, os, trainer-hub, talks, documents and slides (origin/main): 14 are the same rule at their medium's scale in two or more systems, 8 of them identical today, 6 with measured drift (focus ring 3/2/0 px and four slide forms, round icon control, code block, gradient strip, client button and field W vs V). 9 only look alike and stay per system (total band, section band, stage/status, tooltip, KPI tile, chart bars, slide table, header bars, ghost button). Shared as code today: list marker, dropdown chevron, the expert set and, from today, the os disclosure (precedent). The Elements page shows only the dropdown. documents and slides copy website elements by comment („Card.astro“, „TrainingList.astro .tl-chip“) and drift: chip tint 40 % in documents vs 15 % on website and slides. Prototype (scratch): label, pill and card as one marker.css-style file with px default and print/stage presets, applied to documents and slides: slides unchanged, documents move to the website's pill and card tint. Medium blind review (brand designer, client, internal user; Claude and Codex): today 7.86, prototype 8.26, consistency 7.94 vs 8.50, noise 0.2 to 0.5, 5 votes prototype, 3 tie, 0 today. Needs a ruling first: tokens.css gives buttons and fields radius-sm, website, verifier and documents use the brand corner. Report docs/tracking/2026-11-01-shared-elements.md, crops ~/Downloads/stand-entscheidungen/shared-elements/index.html.",
    options: [
      {
        key: "a",
        label: "Lift 11 elements into brand, exceptions listed",
        detail:
          "Label, pill, card, callout, quote, ruled table, prose link, focus ring, round icon control, gradient strip, code block as elements/<name>.css with --hw-* scale settings (website px default, print pt, slide stage, expert dense); apps keep Inter labels and the expert button and field. A brand-elements gate measures each consumer's rendered elements, the Elements page shows every one live in light and night at all four scales. First label, pill, card, callout, so slides builds its planned Kicker, Chip, SlideCard and Quote on them. Stays per system: total band, section band, stage/status, tooltip, KPI tile, chart bars, slide table, header bars, ghost button.",
      },
      {
        key: "b",
        label: "Only show what brand already shares",
        detail:
          "The Elements page adds the list marker, the internal header, the nine expert components and the disclosure. No new element; documents, slides and the website keep their copies and their drift.",
      },
      {
        key: "c",
        label: "Keep everything per system",
        detail:
          "Nothing changes; each system shows its components on its own design-system page, as today.",
      },
    ],
    recommended: "a",
  },
];

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
];

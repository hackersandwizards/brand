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
      "Hub-spoke design system: lift the shared elements into brand, and what do the spoke pages show? Plus: button and field corner",
    area: "brand",
    priority: 2,
    order: 2,
    status: "open",
    context:
      "Benedikt, 01.11.: „warum gibt es im brand kit nur ein einziges element. müssten da nicht viel mehr elemente sein? […] als abgesehen von kunde vs internes system“ and (relayed by Ada) „im hub (brand) soll ja der großteil liegen und in den spokes nur die ausnahmen für die jeweiligen spokes. das müssen wir ganzheitlich noch mal sauber aufziehen so das wir ein gutes dezentrales hub-spoke design system über alle repos haben“. Inventory of 23 element types over website, verifier, os, trainer-hub, talks, documents and slides (origin/main): 14 are the same rule at their medium's scale in two or more systems (8 identical today, 6 with measured drift); 9 only look alike and stay per system. Shared as code today: list marker, dropdown chevron, the expert set and, from today, the os disclosure (precedent). documents and slides copy website elements by comment and drift (chip tint 40 % vs 15 %). Prototype (scratch): label, pill and card as one marker.css-style file with screen, dense, print and stage presets; slides unchanged, documents move to the website's pill and card. Medium blind review (brand designer, client, internal user; Claude and Codex, 8 per version): today 7.86, prototype 8.26, consistency 7.94 vs 8.50, noise 0.2 to 0.5, votes 5 prototype, 3 tie, 0 today. Hub: the Elements page shows every hub element live, light and night, at four scales. Spoke page options: s1 exceptions only plus a link per hub element; s2 hub elements as tiles with origin and link, exceptions in full (the tiles are where the brand-elements gate measures); s3 everything in full with origin. Gate brand-elements: rendered comparison against a brand reference element at the same scale, a source check on element-named selectors, coverage of brand-elements.json. Order: brand, documents, slides, website, verifier, trainer-hub, os, talks (about 4 to 5 agent days, estimate). Answer one of a/a-s1/b/c plus one of r1/r2/r3. Report docs/tracking/2026-11-01-shared-elements.md, mocks and crops ~/Downloads/stand-entscheidungen/shared-elements/index.html.",
    options: [
      {
        key: "a",
        label: "Lift 11 elements; spokes show hub tiles plus their exceptions (s2)",
        detail:
          "Label, pill, card, callout, quote, ruled table, prose link, focus ring, round icon control, gradient strip, code block as elements/<name>.css with --hw-* scales. brand's Elements page is the component library (four scales, light and night, plus the expert group). Each spoke page renders the hub elements it uses as tiles marked 'aus brand vX' with a catalogue link, and its exceptions in full with a reason; brand-elements measures the tiles. Stays per system: total band, section band, stage/status, tooltip, KPI tile, chart bars, slide table, header bars, ghost button.",
      },
      {
        key: "a-s1",
        label: "Lift 11 elements; spokes show only exceptions plus links (s1)",
        detail:
          "As a, but spoke pages drop the hub tiles: shorter pages, no view of a hub element in the spoke's medium, and the gate has to find real pages containing each element.",
      },
      {
        key: "b",
        label: "Only show what brand already shares",
        detail:
          "The Elements page adds the list marker, the internal header, the nine expert components and the disclosure. No new element; copies and drift stay.",
      },
      {
        key: "c",
        label: "Keep everything per system",
        detail: "Nothing changes.",
      },
      {
        key: "r1",
        label: "Corner: by audience (brand corner on client buttons and fields, 5 px in the apps)",
        detail:
          "Only the tokens.css comment changes; every client surface and every app already agrees. Recommended.",
      },
      {
        key: "r2",
        label: "Corner: brand corner everywhere",
        detail: "expert.css changes; os and trainer-hub buttons and fields change, two pin raises.",
      },
      {
        key: "r3",
        label: "Corner: 5 px everywhere",
        detail: "website, verifier and documents lose the brand corner on buttons and fields.",
      },
    ],
    recommended: "a",
  },
];

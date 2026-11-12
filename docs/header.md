# The internal header and the catalog

Every internal system and page wears one header: the 3 px strip, a 3.5rem bar under a hairline,
the lockup at 2rem with the product name beside it, and a 96rem content width with 1rem sides.
`header.css` holds it as plain CSS with its markup in the opening comment, so a static or generated
page links or inlines it; an Astro app renders `expert/components/AppHeader.astro` with its nav in
the slot; a React app writes the same markup. Each product keeps its own nav items; page content
takes the same width with the class `hw-container`. A control holding only an icon (theme, menu,
search) is `hw-header-link` with `data-icon`: round, 36 px. `ThemeToggle.astro` is one; an app
that renders no `.astro` takes its two icons from `expert/components/theme-icons.ts`.

`header.css` sits in no cascade layer, so it wins over every layered rule, Tailwind's utilities
included: to hide or restyle a header link, write an unlayered rule of your own or an important
utility (`max-md:hidden!`). It stays out of a layer because on a plain page the unlayered
`tokens.root.css` would then win over the header's own `--spacing-app-header`.

Past those two, the area marks and the disclosure chevron, brand exports no icons. An app that
draws other Lucide icons pins Lucide's own package and imports from it.

Every catalog's header links every catalog: `catalogs.json` lists them, name and address, and each
catalog renders its nav from it (`import catalogs from "@hackersandwizards/brand/catalogs.json"`),
the current one with `aria-current="page"` on its home and `aria-current="true"` on a page below
it, in an element with `data-hw-catalogs`. Below 30rem that header puts the nav on a row of its own under
the lockup, so no catalog sits off-screen, and `--spacing-app-header` grows by the row. A new
catalog is one line in `catalogs.json`, a release, and a pin bump in every catalog. The Brand entry's `anchors` give the
portal's address forms: `element` (`#elements/hw-card`), `colour` (`#colours/color-teal`) and
`palette` (`#colours/neutrals`, `#colours/hues`). The products'
own design systems stay in the portal's Systems group.

## The catalog

Every h&w repository with a surface shows its components in a catalog, at `/catalog/` or at its
site's root (`catalogs.json` holds each address), built on
`@hackersandwizards/scaffolding/catalog` (its README says how). Give the preset's `css` the tokens
and `elements.css`; its default header is this package's `AppHeader.astro` with `header.css` and `night.css`.

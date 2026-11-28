export const pageStyles = `<style>
  /* Controls take the website's own roles: a field is white with the small corner, a choice is a
     pill that fills teal-dark when checked, focus is the 3 px purple ring. */
  html { accent-color: var(--color-teal); }
  body { margin: 0; min-height: 100vh; background: var(--color-bg); color: var(--color-ink); font: var(--type-body-weight) var(--text-small)/1.5 var(--type-body-family); }
  :root { --header-h: var(--spacing-app-header); }
  input[type=search]::-webkit-search-cancel-button { cursor: pointer; }
  .hw-catalog:not([data-mode="overview"]) .quick,
  .hw-catalog:not([data-mode="search"]) #results,
  .hw-catalog:not([data-mode="view"]) .portal-views,
  .hw-catalog[data-mode="view"] .hw-catalog-main > :not(.portal) { display: none; }
  .pv-colours { display: grid; grid-template-columns: repeat(8, 1fr); height: 100%; }
  .pv-type { display: block; padding: 1rem; zoom: 0.5; }
  .pv-type p { margin: 0 0 0.75rem; white-space: nowrap; }
  .pv-tokens { display: flex; gap: 1.25rem; align-items: center; justify-content: center; height: 100%; }
  .pv-tokens span { width: 4.5rem; height: 4.5rem; background: var(--color-white); border: 1px solid var(--color-border); }
  .hw-catalog-preview > svg { display: block; width: 100%; height: 100%; }
  html:not([data-theme="dark"]) .hw-catalog-preview > .tile-night,
  html[data-theme="dark"] .hw-catalog-preview > img:has(+ .tile-night) { display: none; }
  /* The portal's own parts, the views included; the catalog shape and its tiles are catalog.css's. */
  /* The portal's own raised surfaces and hover fill: white and the tint by day, night-2 and the white
     wash by night. A ground that shows a file or a day form (a logo on light, a mockup, a file's
     preview, a day cell) is a data-theme="light" island and keeps the day. */
  .portal {
    --raised: var(--color-white);
    --wash: var(--color-tint);
  }
  html[data-theme="dark"] .portal {
    --raised: var(--color-night-2);
    --wash: var(--white-wash);
  }
  .portal {
    --hw-markers: on;
    .quick { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 2rem; margin-top: 2rem; }
    .quick h2 { margin: 0 0 0.5rem; letter-spacing: var(--type-label-tracking); }
    .quick ul { margin: 0; padding-left: 1.25rem; }
    .quick li + li { margin-top: 0.25rem; }
    #results { margin-top: 2rem; }
    .label, th:not(.el-cell *, .hw-table *) { font-family: var(--type-label-family); font-size: var(--type-label-size); letter-spacing: var(--type-label-tracking); text-transform: uppercase; color: var(--color-muted); font-weight: 500; }
    .input { box-sizing: border-box; min-height: 2.5rem; width: 100%; padding: 0 0.875rem; border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); background: var(--raised); color: var(--color-ink); font: inherit; }
    .input:hover { border-color: var(--color-muted); }
    .input:focus-visible { border-color: var(--color-teal); }
    section[data-page] { max-width: var(--container-wide); }
    .portal-views :is(h2, h3, h4):not(.el-cell *) { font-family: var(--font-mono); letter-spacing: -0.02em; }
    .portal-views h2:not(.el-cell *) { font-size: var(--text-h2); margin: 0 0 1rem; }
    .portal-views :is(h3, h4):not(.el-cell *) { font-size: var(--text-h4); margin: 2rem 0 0.75rem; scroll-margin-top: calc(var(--header-h) + 1rem); }
    .portal-views h3[id^="el-"] { font-size: var(--text-h3); margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--color-border); }
    .meta { color: var(--color-muted); }
    .portal-views .hw-table { width: 100%; }
    .portal-views .hw-table p { margin: 0; }
    .portal-views .hw-table p + p { margin-top: 0.25rem; }
    .words { --words-el: 11rem; }
    .words td:first-child { width: var(--words-el); min-width: var(--words-el); }
    .words-cols td[data-lang] { width: calc(50% - var(--words-el) / 2); }
    .words-tag { display: none; }
    .words-cols .meta { display: block; margin-top: 0.125rem; font: 400 0.75rem var(--font-code); white-space: nowrap; }
    .words-fold { margin-top: 2rem; }
    .words-fold > summary { font-family: var(--font-mono); font-size: var(--text-h4); padding: 0.25rem 0; }
    code:not(.el-cell *) { font-family: var(--font-code); font-size: 0.9em; }
    a:not(.el-cell *) { color: var(--color-teal-dark); }
    table:not(.el-cell *, .hw-table) { border-collapse: collapse; width: 100%; background: var(--raised); }
    :is(th, td):not(.el-cell *, .hw-table *) { text-align: left; vertical-align: top; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--color-border); }
    .swatch { all: unset; cursor: copy; display: inline-grid; grid-template-columns: 1.5rem auto; column-gap: 0.5rem; align-items: center; }
    .swatch:focus-visible { outline: 3px solid var(--color-purple); outline-offset: 2px; }
    .swatch span { grid-row: span 2; width: 1.5rem; height: 1.5rem; border-radius: 0; border: 1px solid var(--color-border); }
    .swatch small { grid-column: 2; color: var(--color-muted); font-size: 0.7rem; }
    .swatch.copied small::after { content: " copied"; color: var(--color-teal); }
    .logos { display: grid; gap: 1rem; margin-top: 1.5rem; }
    .logo { background: var(--raised); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 1rem; }
    .logo h3 { margin: 0.75rem 0 0.25rem; }
    .logo p { margin: 0.25rem 0; }
    .pair { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 0.5rem; }
    .pair figure { margin: 0; border-radius: var(--radius-sm); }
    .pair img { display: block; width: 100%; height: 7.5rem; object-fit: contain; padding: 1rem 1.25rem 0.5rem; box-sizing: border-box; }
    .pair figcaption { padding: 0 0.75rem 0.5rem; font: 0.7rem var(--font-code); color: var(--color-muted); }
    .pair .on-dark figcaption, .pair .on-gradient figcaption { color: rgb(255 255 255 / 0.8); }
    .on-light { background: var(--color-bg); border: 1px solid var(--color-border); }
    .on-dark { background: var(--color-night); }
    .on-gradient { background: var(--gradient-magic); }
    .dl a { display: inline-block; margin: 0.25rem 0.4rem 0 0; padding: 0.15rem 0.5rem; border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); color: var(--color-ink); text-decoration: none; font-family: var(--font-code); font-size: 0.75rem; }
    .dl a::before { content: "↓ "; }
    .dl a:hover { background: var(--wash); }
    .pv { width: 4rem; height: 2rem; background: var(--raised); border: 1px solid var(--color-border); }
    .pv.bar { height: 0.5rem; max-width: 100%; background: var(--color-teal); border: 0; }
    .rules { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); margin-bottom: 1rem; }
    .rules > div { background: var(--raised); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 1rem; }
    .rules p { margin: 0.5rem 0 0; }
    .corner-demo { height: 3rem; background: var(--wash); border: 1px solid var(--color-border); border-radius: var(--radius-brand); }
    .square-demo, .icon-demo, .shape-demo { display: flex; align-items: center; gap: 0.5rem; height: 3rem; margin: 0 !important; }
    .square-demo .sw { width: 1.25rem; height: 1.25rem; background: var(--color-teal); }
    .icon-demo { color: var(--color-teal-dark); font-weight: 500; }
    .role { border-bottom: 1px solid var(--color-border); padding: 0.75rem 0; }
    .role p { margin: 0.25rem 0 0; }
    #results a { display: flex; gap: 0.75rem; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--color-border); color: var(--color-ink); text-decoration: none; background: var(--raised); }
    #results a:hover { background: var(--wash); }
    #results a .label { min-width: 7rem; }
    .night-cell { display: inline-block; padding: 0.25rem 0.5rem; background: var(--color-night); color: var(--color-night-ink); border-radius: 0; }
    .night-cell small { color: var(--color-night-muted); }
    .night-cell code { color: inherit; }
    .sw { display: inline-block; width: 1rem; height: 1rem; border-radius: 0; border: 1px solid var(--color-border); vertical-align: -0.2rem; margin-right: 0.3rem; }
    .assets { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); }
    .products { display: grid; gap: 1rem; }
    .product { background: var(--raised); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 1rem; scroll-margin-top: 1rem; }
    .product h4 { font-family: var(--font-mono); font-size: var(--text-h4); margin: 0.75rem 0 0.25rem; }
    .product p { margin: 0.25rem 0; }
    .mock { display: grid; gap: 0.5rem; grid-template-columns: repeat(auto-fill, 15.5rem); }
    .mock figure.wide { grid-column: span 2; }
    .mock figure { margin: 0; padding: 0.75rem 0.75rem 0.5rem; background: #e4e6ea; border-radius: var(--radius-sm); }
    .mock svg { display: block; height: 15rem; }
    .devices { display: grid; grid-template-columns: repeat(3, auto); justify-content: start; column-gap: 2rem; }
    /* The device drawings are drawn on day paper: by night they keep a day ground of their own. */
    html[data-theme="dark"] & .devices { padding: 1rem; background: var(--color-bg); border-radius: var(--radius-brand); color: var(--color-ink); }
    .devices figure { margin: 0; display: grid; grid-row: span 2; grid-template-rows: subgrid; row-gap: 0.75rem; }
    .devices svg { display: block; align-self: end; max-width: 100%; height: auto; }
    .devices figcaption { display: grid; align-content: start; gap: 0.25rem; contain: inline-size; min-width: 13rem; }
    .devices figcaption strong { font-family: var(--font-mono); font-size: var(--text-h4); }
    .mock figcaption { margin-top: 0.4rem; font: 0.75rem var(--font-code); color: var(--color-muted); }
    .asset { margin: 0; }
    .asset .views { display: grid; grid-auto-columns: 1fr; grid-auto-flow: column; gap: 0.25rem; }
    .asset .dl { display: block; }
    .asset img, .asset .pdf { display: grid; place-items: center; width: 100%; height: 8rem; object-fit: contain; background: var(--color-tint); border: 1px solid var(--color-border); border-radius: var(--radius-sm); box-sizing: border-box; }
    .asset img[src$=".png"] { object-fit: scale-down; }
    .assets:has(iframe) { grid-template-columns: repeat(auto-fill, minmax(36rem, 1fr)); }
    /* A scale per row, day beside night, so a wide sample shows whole; each row stands apart from
       the next by the grid spacing, and a sample wider still scrolls inside its cell. */
    .el-matrix { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
    .el-head { grid-column: 1 / -1; }
    .el-head ~ .el-head { margin-top: calc(var(--spacing-grid) - 0.5rem); }
    .el-cell { min-height: 7rem; overflow: auto; padding: 1rem; border: 1px solid var(--color-border); background: var(--color-white); color: var(--color-ink); font-size: var(--text-body); line-height: var(--text-body--line-height); }
    .el-cell[data-theme="dark"] { border-color: var(--color-night); background: var(--color-night); color: var(--color-night-ink); }
    html[data-theme="dark"] & .el-cell[data-theme="dark"] { border-color: var(--color-night-line); }
    /* A day cell draws its element without the apps' roles, as a day page here does: the light
       island of night.css gives it expert.css's day roles, which turn a dialog's white ground to bg. */
    .el-cell[data-theme="light"] { --background: initial; --foreground: initial; --accent: initial; --muted: initial; --border: initial; }
    .el-cell[data-hw-scale="dense"] { font-size: 0.875rem; line-height: 1.5; }
    .el-cell[data-hw-scale="print"] { font-size: var(--type-body-size); line-height: var(--type-body-line-height); }
    .el-cell[data-hw-scale="stage"] > .el-inner { zoom: 0.5; --hw-zoom: 0.5; font-size: 1.5rem; line-height: 1.4; }
    .el-inner > * + *:where(:not(.hw-check-target)) { margin-top: 0.5em; }
    .asset iframe { display: block; width: 100%; height: 11.5rem; background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-sm); box-sizing: border-box; }
    .asset figcaption { padding-top: 0.25rem; overflow-wrap: anywhere; font-size: 0.75rem; }
  }
  @media (max-width: 47.98rem) {
    html { scroll-padding-top: calc(var(--header-h) + 1rem); }
    .portal .el-matrix { grid-template-columns: minmax(0, 1fr); }
    .portal .el-row { display: none; }
    .portal .quick { grid-template-columns: minmax(0, 1fr); }
    .portal #results a { flex-wrap: wrap; gap: 0.25rem 0.75rem; }
    .portal #results a .label { min-width: 0; flex-basis: 100%; }
    .portal .words { --words-el: 5.5rem; }
    .portal .words-cols thead { display: none; }
    .portal .words-cols :is(tr, td) { display: block; }
    .portal .words-cols :is(td, td:first-child) { width: auto; min-width: 0; border-bottom: 0; padding-bottom: 0.25rem; }
    .portal .words-cols td[data-lang] { display: grid; grid-template-columns: 2.5rem minmax(0, 1fr); }
    .portal .words-cols .words-tag { display: block; padding-top: 0.15em; }
    .portal .words-cols tr { border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 0.5rem; }
  }
  /* A sample's paragraphs lose the browser's margins below the elements' layer, so an element's own
     margin, such as a nav group caption's, holds. */
  @layer base {
    .el-inner :is(p, blockquote, pre) { margin-block: 0; }
  }
</style>`;

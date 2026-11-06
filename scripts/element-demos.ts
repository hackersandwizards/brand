// One sample of each shared element (elements/*.css), as the catalogue shows it in every scale and
// theme and the tests measure it. Words are the website's and a document's own kind of text.
const play = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3v18l15-9z"/></svg>`;
const moon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6.5 6.5 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

export const DEMOS: Record<string, string> = {
  label: `<span class="hw-label">Training für ein Team</span><br><span class="hw-label" data-tone="muted">Kurz gesagt</span><br><span class="hw-label" data-hue="purple">Teil zwei</span>`,
  "label-box": `<span class="hw-label hw-label-box" data-hue="teal">Teil eins</span> <span class="hw-label hw-label-box" data-hue="purple">Teil zwei</span> <span class="hw-label hw-label-box" data-tone="ink">Die Fabrik</span><br><span class="hw-label-box"><span class="hw-label" data-tone="muted">Stage</span> <span class="hw-label" data-tone="ink">Review</span></span>`,
  pill: `<span class="hw-pill">Software Engineers</span> <span class="hw-pill" data-tone="neutral">QA</span> <span class="hw-pill" data-variant="outline">Remote</span> <span class="hw-pill" data-caps>Angebot</span><br><span class="hw-pill" data-editable>Foundations<span class="hw-pill-chevron"></span></span> <span class="hw-pill" data-tone="neutral">agentic<button type="button" class="hw-pill-remove" aria-label="Entfernen"></button></span> <span class="hw-pill" data-variant="add">+ Tag</span>`,
  card: `<div class="hw-card"><strong>Plan</strong><br>Vor dem Code geschrieben</div><div class="hw-card" data-variant="tint"><strong>Betont</strong><br>Erstellt für Musterwerk AG</div>`,
  callout: `<div class="hw-callout"><span class="hw-label" data-tone="muted">Kurz gesagt</span><br>Ein Satz, der die Seite zusammenfasst.</div><div class="hw-callout" data-hue="purple">Ergebnis: ein Team, das Agenten steuert.</div>`,
  quote: `<blockquote class="hw-quote">„Der Plan stand, bevor die erste Zeile Code lief.“</blockquote><blockquote class="hw-quote" data-tone="muted">Ein Auszug aus der Quelle.</blockquote>`,
  table: `<table class="hw-table"><thead><tr><th>Leistung</th><th>Basis</th></tr></thead><tbody><tr><td>Training</td><td>2 Tage</td></tr><tr><td>Mentoring</td><td>8 Std.</td></tr></tbody></table>`,
  link: `<p>Dann öffnet ihr <a class="hw-link" href="#elements">localhost:3000</a>.</p>`,
  "focus-ring": `<button type="button" class="hw-pill" data-variant="outline">Tab hierher</button>`,
  "icon-button": `<button type="button" class="hw-icon-button" aria-label="Abspielen">${play}</button> <button type="button" class="hw-icon-button" aria-label="Thema">${moon}</button> <button type="button" class="hw-icon-button" data-on="picture" aria-label="Abspielen">${play}</button>`,
  strip: `<div class="hw-strip"></div>`,
  rule: `<h3 style="margin:0">Wie ein Agent arbeitet</h3><hr class="hw-rule" data-variant="bar" aria-hidden="true"><p>Ein Block, über dem die Linie in voller Breite steht:</p><hr class="hw-rule"><hr class="hw-rule" data-hue="purple">`,
  code: `<pre class="hw-code"><code>$ bun run check\n<span class="hw-code-comment"># 0 findings</span></code></pre> <pre class="hw-code" data-variant="panel"><code>$ claude --continue</code></pre>`,
  "inline-code": `<p>Vor dem Commit läuft <code class="hw-inline-code">bun run check</code>, die Ausnahmen stehen in <code class="hw-inline-code">brand-elements.json</code>.</p>`,
  button: `<a class="hw-button" href="#elements">Training anfragen</a> <a class="hw-button" data-variant="secondary" href="#elements">Agenda ansehen</a><br><a class="hw-button" data-hue="purple" href="#elements">Training anfragen</a> <a class="hw-button" data-hue="purple" data-variant="secondary" href="#elements">Agenda ansehen</a>`,
  "arrow-link": `<a class="hw-arrow-link" href="#elements">Alle Trainings<span class="hw-arrow" aria-hidden="true">&nbsp;<span>→</span></span></a><br><a class="hw-arrow-link" data-tone="muted" href="#elements">Impressum<span class="hw-arrow" data-external aria-hidden="true">&nbsp;<span>→</span></span></a>`,
  field: `<div class="hw-field-row"><input class="hw-field" aria-label="ID" placeholder="ID oder Link"><button type="button" class="hw-button">Prüfen</button></div>`,
  facts: `<dl class="hw-facts" data-variant="ruled"><div><dt class="hw-label" data-tone="muted">Dauer</dt><dd>2 Tage</dd></div><div><dt class="hw-label" data-tone="muted">Format</dt><dd>Remote</dd></div></dl>`,
  segmented: `<div class="hw-segmented" role="group" aria-label="Ansicht"><span class="hw-label" data-tone="muted">Ansicht</span><button type="button" aria-pressed="true">Liste</button><button type="button" aria-pressed="false">Gruppen</button></div>`,
  row: `<div class="hw-row"><span class="hw-row-stripe" style="background: var(--color-teal)"></span><div>Musterwerk AG</div><div>2 Tage</div></div>`,
  breadcrumb: `<nav class="hw-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#elements">Trainings</a></li><li><span aria-current="page">Foundations</span></li></ol></nav>`,
  status: `<div class="hw-status"><strong>2 Lücken</strong><br>Trainer fehlt</div><div class="hw-status" data-tone="success">Bestätigt</div>`,
  frame: `<div class="hw-frame" style="padding: 1rem">Noch kein Eintrag</div>`,
  kpi: `<div class="hw-kpi"><span class="hw-label" data-tone="muted">Pipeline</span><span class="hw-kpi-value">12</span></div>`,
  prose: `<div class="hw-prose"><h2>Ablauf</h2><p>Erst der Plan, dann <code>bun run check</code>.</p><h3>Tag 1</h3></div>`,
};

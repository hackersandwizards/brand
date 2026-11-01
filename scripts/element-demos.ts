// One sample of each shared element (elements/*.css), as the catalogue shows it in every scale and
// theme and the tests measure it. Words are the website's and a document's own kind of text.
const play = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3v18l15-9z"/></svg>`;
const moon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

export const DEMOS: Record<string, string> = {
  label: `<span class="hw-label">Training für ein Team</span><br><span class="hw-label" data-tone="muted">Kurz gesagt</span>`,
  pill: `<span class="hw-pill">Software Engineers</span> <span class="hw-pill" data-tone="neutral">QA</span> <span class="hw-pill" data-variant="outline">Remote</span> <span class="hw-pill" data-caps>Angebot</span><br><span class="hw-pill" data-editable>Foundations<span class="hw-pill-chevron"></span></span> <span class="hw-pill" data-tone="neutral">agentic<button type="button" class="hw-pill-remove" aria-label="Entfernen"></button></span> <span class="hw-pill" data-variant="add">+ Tag</span>`,
  card: `<div class="hw-card"><strong>Plan</strong><br>Vor dem Code geschrieben</div><div class="hw-card" data-variant="tint"><strong>Betont</strong><br>Erstellt für Musterwerk AG</div>`,
  callout: `<div class="hw-callout"><span class="hw-label" data-tone="muted">Kurz gesagt</span><br>Ein Satz, der die Seite zusammenfasst.</div><div class="hw-callout" data-hue="purple">Ergebnis: ein Team, das Agenten steuert.</div>`,
  quote: `<blockquote class="hw-quote">„Der Plan stand, bevor die erste Zeile Code lief.“</blockquote><blockquote class="hw-quote" data-tone="muted">Ein Auszug aus der Quelle.</blockquote>`,
  table: `<table class="hw-table"><thead><tr><th>Leistung</th><th>Basis</th></tr></thead><tbody><tr><td>Training</td><td>2 Tage</td></tr><tr><td>Mentoring</td><td>8 Std.</td></tr></tbody></table>`,
  link: `<p>Dann öffnet ihr <a class="hw-link" href="#elements">localhost:3000</a>.</p>`,
  "focus-ring": `<button type="button" class="hw-pill" data-variant="outline">Tab hierher</button>`,
  "icon-button": `<button type="button" class="hw-icon-button" aria-label="Abspielen">${play}</button> <button type="button" class="hw-icon-button" aria-label="Thema">${moon}</button> <button type="button" class="hw-icon-button" data-on="picture" aria-label="Abspielen">${play}</button>`,
  strip: `<div class="hw-strip"></div>`,
  code: `<pre class="hw-code"><code>$ bun run check\n<span style="color:var(--code-comment)"># 0 findings</span></code></pre>`,
};

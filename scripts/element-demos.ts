// One sample of each shared element (elements/*.css), as the catalogue shows it in every scale and
// theme and the tests measure it. Words are the website's and a document's own kind of text.
import { MOON } from "../expert/components/theme-icons";
const play = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3v18l15-9z"/></svg>`;
const remove = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 18 18 6M6 6l12 12"/></svg>`;
const list = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`;
const board = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/></svg>`;
const moon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${MOON}"/></svg>`;

export const DEMOS: Record<string, string> = {
  label: `<span class="hw-label">Training für ein Team</span><br><span class="hw-label" data-tone="muted">Kurz gesagt</span><br><span class="hw-label" data-hue="purple">Teil zwei</span><br><span class="hw-label" data-tone="muted"><button type="button">Name ↑</button></span>`,
  "label-box": `<span class="hw-label hw-label-box" data-hue="teal">Teil eins</span> <span class="hw-label hw-label-box" data-hue="purple">Teil zwei</span> <span class="hw-label hw-label-box" data-tone="ink">Die Fabrik</span><br><span class="hw-label-box"><span class="hw-label" data-tone="muted">Stage</span> <span class="hw-label" data-tone="ink">Review</span></span>`,
  pill: `<span class="hw-pill">Software Engineers</span> <span class="hw-pill" data-tone="neutral">QA</span> <span class="hw-pill" data-variant="outline">Remote</span> <span class="hw-pill" data-caps>Angebot</span><br><span class="hw-pill" data-editable>Foundations<span class="hw-pill-chevron"></span></span> <span class="hw-pill" data-tone="neutral">agentic<button type="button" class="hw-pill-remove" aria-label="Entfernen"></button></span> <span class="hw-pill" data-variant="add">+ Tag</span> <span class="hw-pill" data-state="draft">Entwurf</span><br><span class="hw-pill" data-priority="0">P0</span> <span class="hw-pill" data-priority="1">P1</span> <span class="hw-pill" data-priority="2">P2</span> <span class="hw-pill" data-priority="3">P3</span> <span class="hw-pill" data-priority="4">P4</span> <span class="hw-pill" data-variant="outline">P–</span>`,
  card: `<div class="hw-card"><strong>Plan</strong><br>Vor dem Code geschrieben</div><div class="hw-card" data-variant="tint"><strong>Betont</strong><br>Erstellt für Musterwerk AG</div><div class="hw-card"><a class="hw-card-link" href="#elements"><strong>Ada Muster</strong><span class="hw-arrow" aria-hidden="true">&nbsp;<span>→</span></span></a><br>Software Architect</div>`,
  callout: `<div class="hw-callout"><span class="hw-label" data-tone="muted">Kurz gesagt</span><br>Ein Satz, der die Seite zusammenfasst.</div><div class="hw-callout" data-hue="purple">Ergebnis: ein Team, das Agenten steuert.</div>`,
  quote: `<blockquote class="hw-quote">„Der Plan stand, bevor die erste Zeile Code lief.“</blockquote><blockquote class="hw-quote" data-tone="muted">Ein Auszug aus der Quelle.</blockquote>`,
  table: `<table class="hw-table"><thead><tr><th aria-sort="ascending"><button type="button">Leistung ↑</button></th><th>Basis</th></tr></thead><tbody><tr><td>Training</td><td>2 Tage</td></tr><tr><td>Mentoring</td><td>8 Std.</td></tr></tbody></table>`,
  link: `<p>Dann öffnet ihr <a class="hw-link" href="#elements">localhost:3000</a>.</p>`,
  "focus-ring": `<button type="button" class="hw-pill" data-variant="outline">Tab hierher</button>`,
  "icon-button": `<button type="button" class="hw-icon-button" aria-label="Abspielen">${play}</button> <button type="button" class="hw-icon-button" aria-label="Thema">${moon}</button> <button type="button" class="hw-icon-button" data-on="picture" aria-label="Abspielen">${play}</button> <button type="button" class="hw-icon-button" data-tone="danger" aria-label="Entfernen">${remove}</button> <button type="button" class="hw-icon-button" aria-pressed="true" aria-label="Als Liste">${list}</button> <button type="button" class="hw-icon-button" aria-pressed="false" aria-label="Als Tafel">${board}</button> <button type="button" class="hw-icon-button" data-variant="quiet" aria-label="Entfernen">${remove}</button>`,
  strip: `<div class="hw-strip"></div>`,
  rule: `<h3 style="margin:0">Wie ein Agent arbeitet</h3><hr class="hw-rule" data-variant="bar" aria-hidden="true"><p>Ein Block, über dem die Linie in voller Breite steht:</p><hr class="hw-rule"><hr class="hw-rule" data-hue="purple">`,
  code: `<pre class="hw-code"><code>$ bun run check\n<span class="hw-code-comment"># 0 findings</span></code></pre> <pre class="hw-code" data-variant="panel"><code>$ claude --continue</code></pre>`,
  "inline-code": `<p>Vor dem Commit läuft <code class="hw-inline-code">bun run check</code>, die Ausnahmen stehen in <code class="hw-inline-code">brand-elements.json</code>.</p>`,
  button: `<a class="hw-button" href="#elements">Training anfragen</a> <a class="hw-button" data-variant="secondary" href="#elements">Agenda ansehen</a><br><a class="hw-button" data-hue="purple" href="#elements">Training anfragen</a> <a class="hw-button" data-hue="purple" data-variant="secondary" href="#elements">Agenda ansehen</a>`,
  "arrow-link": `<a class="hw-arrow-link" href="#elements">Alle Trainings<span class="hw-arrow" aria-hidden="true">&nbsp;<span>→</span></span></a><br><a class="hw-arrow-link" data-tone="muted" href="#elements">Impressum<span class="hw-arrow" data-external aria-hidden="true">&nbsp;<span>→</span></span></a>`,
  field: `<div class="hw-field-row"><input class="hw-field" aria-label="ID" placeholder="ID oder Link"><button type="button" class="hw-button">Prüfen</button></div><select class="hw-field hw-select" aria-label="Thema"><option>Alle Themen</option><option>Testing</option></select><textarea class="hw-field" rows="2" aria-label="Notiz">Erst der Plan, dann der Code.</textarea><input class="hw-field" aria-label="Kundennummer" value="K-1042" disabled><input class="hw-field" aria-label="Zertifikats-ID" value="HW-2026-0412" readonly><input class="hw-field hw-select" list="fd-topics" aria-label="Thema" placeholder="Thema suchen"><datalist id="fd-topics"><option value="Context Engineering"></option><option value="Testing"></option></datalist><input class="hw-field" type="date" aria-label="Starttermin" value="2026-11-24"><input class="hw-field" type="file" aria-label="Lebenslauf"><input class="hw-field" data-size="small" aria-label="Suche klein" placeholder="Klein"><input class="hw-field" data-size="large" aria-label="Suche groß" placeholder="Groß">`,
  "form-field": `<div class="hw-form-field"><label class="hw-form-label" for="ff-id">Zertifikats-ID</label><div class="hw-field-row"><input class="hw-field" id="ff-id" aria-invalid="true" aria-describedby="ff-id-error"><button type="button" class="hw-button">Prüfen</button></div><p class="hw-form-error" id="ff-id-error">Gebt eine ID ein, um sie zu prüfen.</p></div><div class="hw-form-field"><label class="hw-form-label" for="ff-mail">E-Mail</label><p class="hw-form-hint" id="ff-mail-hint">An diese Adresse geht die Bestätigung.</p><input class="hw-field" id="ff-mail" value="ada@musterwerk" aria-invalid="true" aria-describedby="ff-mail-hint ff-mail-error"><p class="hw-form-error" id="ff-mail-error">Gebt eine Adresse mit Domain an, etwa ada@musterwerk.de.</p></div><div class="hw-form-field"><label class="hw-form-label" for="ff-format">Format</label><select class="hw-field hw-select" id="ff-format" aria-invalid="true" aria-describedby="ff-format-error"><option>Bitte wählen</option><option>Remote</option></select><p class="hw-form-error" id="ff-format-error">Wählt ein Format.</p></div><fieldset class="hw-form-field" aria-describedby="ff-topics-error"><legend class="hw-form-label">Themen</legend><label><input type="checkbox" class="hw-check"> Context Engineering</label><label><input type="checkbox" class="hw-check"> Testing</label><p class="hw-form-error" id="ff-topics-error">Wählt mindestens ein Thema.</p></fieldset><div class="hw-form-field"><label class="hw-form-label" for="ff-phone">Telefon <span class="hw-form-mark">(optional)</span></label><input class="hw-field" id="ff-phone" type="tel"></div><div class="hw-form-field"><label class="hw-form-label" for="ff-team">Teamgröße</label><input class="hw-field" id="ff-team" value="40" data-state="warning" aria-describedby="ff-team-warning"><p class="hw-form-warning" id="ff-team-warning">Ab 16 Personen teilen wir in zwei Gruppen.</p></div><div class="hw-form-field"><label class="hw-form-label" for="ff-code">Gutscheincode</label><input class="hw-field" id="ff-code" value="HW-START" data-state="success" aria-describedby="ff-code-success"><p class="hw-form-success" id="ff-code-success">Code gilt bis 31.12.</p></div><div class="hw-form-field"><label class="hw-form-label" for="ff-note">Worum geht es?</label><textarea class="hw-field" id="ff-note" rows="2" aria-describedby="ff-note-count">Wir wollen Agenten im Team einführen.</textarea><p class="hw-form-count" id="ff-note-count" data-for="ff-note" data-max="200" data-left="Noch {n} Zeichen" data-over="{n} Zeichen zu viel">Noch 163 Zeichen</p></div><div class="hw-form-field"><label class="hw-form-label" for="ff-pw">Passwort</label><div class="hw-field-row" data-joined><input class="hw-field" id="ff-pw" type="password" value="erst-der-plan"><button type="button" class="hw-field-toggle" aria-controls="ff-pw" aria-pressed="false" aria-label="Passwort zeigen"></button></div></div><div class="hw-form-field"><div class="hw-form-float"><input class="hw-field" id="ff-city" placeholder=" " value="Hamburg"><label class="hw-form-label" for="ff-city">Stadt</label></div></div><div class="hw-form-field"><div class="hw-form-float"><input class="hw-field" id="ff-zip" placeholder=" "><label class="hw-form-label" for="ff-zip">Postleitzahl</label></div></div>`,
  switch: `<fieldset class="hw-form-field"><legend class="hw-form-label">Benachrichtigungen</legend><label><input type="checkbox" role="switch" class="hw-switch" checked> Neue Anfrage</label><label><input type="checkbox" role="switch" class="hw-switch"> Wöchentliche Zusammenfassung</label><label><input type="checkbox" role="switch" class="hw-switch" checked disabled> Rechnung (immer an)</label></fieldset>`,
  range: `<div class="hw-form-field"><label class="hw-form-label" for="rg-days">Tage <output for="rg-days">4</output></label><input type="range" class="hw-range" id="rg-days" min="0" max="10" value="4" style="--hw-range-fill: 40%"></div><input type="range" class="hw-range" aria-label="Gesperrt" value="70" style="--hw-range-fill: 70%" disabled>`,
  "error-summary": `<div class="hw-error-summary" tabindex="-1" aria-labelledby="es-title"><p class="hw-error-summary-title" id="es-title">Bitte prüft 2 Angaben</p><ul><li><a href="#elements">E-Mail: gebt eine Adresse mit Domain an, etwa ada@musterwerk.de.</a></li><li><a href="#elements">Format: wählt eines aus.</a></li></ul></div>`,
  check: `<label><input type="checkbox" class="hw-check" checked> Bericht geschrieben</label><br><label><input type="checkbox" class="hw-check"> Termin bestätigt</label><br><label><input type="radio" class="hw-check" checked> Remote</label><br><label><input type="radio" class="hw-check"> Vor Ort</label><br><label><input type="checkbox" class="hw-check" checked disabled> Gesperrt</label><br><label><input type="checkbox" class="hw-check" checked disabled data-readonly> Erledigt</label><br><label><input type="checkbox" class="hw-check" disabled data-readonly> Offen</label><br><label class="hw-check-target"><input type="checkbox" class="hw-check" aria-label="Erledigt: Begrüßung"></label>`,
  facts: `<dl class="hw-facts" data-variant="ruled"><div><dt class="hw-label" data-tone="muted">Dauer</dt><dd>2 Tage</dd></div><div><dt class="hw-label" data-tone="muted">Format</dt><dd>Remote</dd></div></dl>`,
  "dot-list": `<p class="hw-dot-list"><span>3 Deals</span><span><strong style="font-variant-numeric: tabular-nums">€ 0,00</strong> offen</span><span>überfällig 4d</span><span class="hw-dot-list"><span>2 Trainings</span><span>1 Angebot</span></span></p>`,
  segmented: `<div class="hw-segmented" role="group" aria-label="Ansicht"><span class="hw-label" data-tone="muted">Ansicht</span><button type="button" aria-pressed="true">Liste</button><button type="button" aria-pressed="false">Gruppen</button></div> <div class="hw-segmented" role="group" aria-label="Darstellung"><button type="button" aria-pressed="true" aria-label="Als Liste">${list}</button><button type="button" aria-pressed="false" aria-label="Als Tafel">${board}</button></div>`,
  kbd: `<p>Mit <kbd class="hw-kbd">/</kbd> springt ihr in die Suche, <kbd class="hw-kbd">⌘</kbd> + <kbd class="hw-kbd">K</kbd> öffnet die Befehle, <kbd class="hw-kbd">Esc</kbd> schließt sie.</p>`,
  row: `<div class="hw-row"><span class="hw-row-stripe" style="background: var(--color-teal)"></span><div class="hw-row-lead">Musterwerk AG <span class="hw-pill" data-tone="neutral">Remote</span></div><div class="hw-row-trail">2 Tage</div></div><div class="hw-row" aria-current="true"><span class="hw-row-stripe" style="background: var(--color-purple)"></span><div class="hw-row-lead">Beispiel GmbH</div><div class="hw-row-trail">12.11.</div></div>`,
  nav: `<nav class="hw-nav" aria-label="Handbuch"><p class="hw-label hw-nav-group" data-tone="muted">Handbuch</p><ul><li><a href="#elements">Start</a></li><li><a href="#elements" aria-current="page">Vertrieb<span class="hw-nav-count">12</span></a></li><li><details class="hw-disclosure" open><summary>Lieferung</summary><ul><li><a href="#elements">Überblick</a></li><li><a href="#elements">Vorbereitung<span class="hw-nav-count">4</span></a></li></ul></details></li></ul></nav>`,
  choice: `<div class="hw-choices" role="radiogroup" aria-label="Thema"><label class="hw-choice"><input type="radio" name="demo-topic" value="" checked>Alle<span class="hw-choice-count">24</span></label><label class="hw-choice"><input type="radio" name="demo-topic" value="tools">Werkzeuge<span class="hw-choice-count">9</span></label><label class="hw-choice"><input type="radio" name="demo-topic" value="evidence">Belege<span class="hw-choice-count">6</span></label></div><div class="hw-choices"><a class="hw-choice" href="#elements" aria-current="true">Remote<span class="hw-choice-count">4</span></a><button type="button" class="hw-choice" aria-pressed="false">Vor Ort<span class="hw-choice-count">2</span></button></div>`,
  search: `<div class="hw-search"><input class="hw-field" type="search" aria-label="Suchen" placeholder="Einheiten suchen"></div><div class="hw-field-row"><div class="hw-search"><input class="hw-field" type="search" aria-label="Trainings suchen" value="context"></div><button type="submit" class="hw-button" data-variant="secondary">Suchen</button></div>`,
  breadcrumb: `<nav class="hw-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#elements">Trainings</a></li><li><span aria-current="page">Foundations</span></li></ol></nav>`,
  status: `<div class="hw-status"><strong>2 Lücken</strong><br>Trainer fehlt</div><div class="hw-status" data-tone="success">Bestätigt</div><div class="hw-status" data-tone="error"><span class="hw-label" data-hue="red">Schlecht</span><br>Ohne Plan losgelegt</div><div class="hw-status" data-tone="success"><span class="hw-label" data-hue="green">Gut</span><br>Erst der Plan</div><div class="hw-status" data-tone="info"><span class="hw-label" data-hue="amber">Offen</span> <span class="hw-label" data-hue="purple">Teil zwei</span></div>`,
  frame: `<div class="hw-frame" style="padding: 1rem">Noch kein Eintrag</div>`,
  kpi: `<div class="hw-kpi"><span class="hw-label" data-tone="muted">Pipeline</span><span class="hw-kpi-value">12</span></div>`,
  prose: `<div class="hw-prose"><h2>Ablauf</h2><p>Erst der Plan, dann <code>bun run check</code>, wie im <a href="#elements">Runbook</a>.</p><h3>Tag 1</h3><ul><li>Gate einrichten</li><li>Cache behalten</li></ul><ol><li>Holen</li><li>Prüfen</li></ol><ul class="contains-task-list"><li class="task-list-item"><input type="checkbox" checked disabled> Bericht</li><li class="task-list-item"><input type="checkbox" disabled> Review</li></ul></div>`,
};

// The elements in sections, as mature UI libraries group theirs: forms, actions, navigation,
// feedback, data display, typography, containers, and the utilities every element shares. Each is
// [name, title, file]; the portal draws the sections, and the catalog's story folders and their
// order follow them.
export const SECTIONS: [string, [string, string, string][]][] = [
  [
    "Forms",
    [
      ["field", "Field", "field"],
      ["check", "Checkbox and radio", "check"],
      ["form-field", "Form field", "form-field"],
      ["switch", "Switch", "switch"],
      ["range", "Range", "range"],
      ["error-summary", "Error summary", "error-summary"],
      ["search", "Search field", "search"],
      ["choice", "Filter value", "choice"],
    ],
  ],
  [
    "Actions",
    [
      ["button", "Button", "button"],
      ["arrow-link", "Arrow link", "arrow-link"],
      ["icon-button", "Round icon control", "icon-button"],
      ["segmented", "Segmented control", "segmented"],
    ],
  ],
  [
    "Navigation",
    [
      ["link", "Link in text", "link"],
      ["breadcrumb", "Breadcrumb", "breadcrumb"],
      ["nav", "Navigation list", "nav"],
    ],
  ],
  [
    "Feedback",
    [
      ["status", "Status box", "status"],
      ["callout", "Callout", "callout"],
    ],
  ],
  [
    "Data display",
    [
      ["table", "Ruled table", "table"],
      ["facts", "Facts list", "facts"],
      ["row", "List row", "row"],
      ["kpi", "Key figure", "kpi"],
      ["dot-list", "Dot list", "dot-list"],
      ["pill", "Pill", "pill"],
      ["label-box", "Label box", "label-box"],
    ],
  ],
  [
    "Typography",
    [
      ["label", "Label", "label"],
      ["quote", "Quote", "quote"],
      ["code", "Code block", "code"],
      ["inline-code", "Inline code", "inline-code"],
      ["kbd", "Keycap", "kbd"],
      ["prose", "Prose block", "prose"],
    ],
  ],
  [
    "Containers",
    [
      ["card", "Card", "card"],
      ["frame", "Dashed frame", "frame"],
    ],
  ],
  [
    "Utilities",
    [
      ["focus-ring", "Focus ring", "focus"],
      ["rule", "Accent rule", "rule"],
      ["strip", "Gradient strip", "strip"],
    ],
  ],
];

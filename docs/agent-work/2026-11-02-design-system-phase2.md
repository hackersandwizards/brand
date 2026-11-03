# Design-System Phase 2: brand v0.29.0, die Hub-Kandidaten und die Werte der Engines

Stand 02.11.2026. brand v0.29.0 liefert jeden Kandidaten aus dem Inventar von Phase 1
(`2026-11-02-design-system-shape.md`), den zwei oder mehr Systeme teilen, als Export. Dazu die
Werte von slides und documents als Tokens, wie die Entscheidung `design-system-hub-spoke` («strict:
no tokens in spokes; every value comes from brand») es verlangt. Kein Spoke ist geändert: das
machen die Spoke-Sessions, mit den Deltas unten als Liste für ihre Vorher-nachher-Bilder.

## Inventar

Gelesen auf `origin/main` jedes Spokes am 02.11. Spalte «Abweichungen» nennt, worin sich die Kopien
unterscheiden; die gewählte Seite ist die, die mehr Spokes pixelgleich lässt, bei Gleichstand die
des meistgenutzten Systems.

| Kandidat                        | Kopien                                                                                                                   | Abweichungen                                                                                                                                                      | brand v0.29.0                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Button (Kunde)                  | website `ui/Cta.astro`; verifier `.button` in `src/worker.ts`                                                            | Sekundär: website ohne Fläche, verifier weiß; Übergang 200 gegen 150 ms; Nacht nur website                                                                        | `hw-button`, `data-variant="secondary"`, nach website                                |
| Pfeil-Link mit Extern-Zeichen   | website `ui/LinkRow.astro`, `ui/arrow.ts`; verifier `arrowLink()`, `.link`; talks hat keinen mehr                        | website block, Gewicht 400, 180 ms, gedrehter Pfeil mit 0.25em Rand; verifier inline-block, Gewicht 500, 150 ms, ohne Rand                                        | `hw-arrow-link` und `hw-arrow`, nach website; Anzeige und Gewicht bleiben beim Spoke |
| Großbuchstaben-Tag              | os `WarningBanner.astro` (Chip); trainer-hub `FormatBadge.astro` nutzt schon `hw-pill data-caps`                         | os: rund, 600, eigene Tönung                                                                                                                                      | schon da: `hw-pill data-caps` mit `--hw-pill-hue`                                    |
| Segment-Schalter                | os `FilterRow.astro`, `ViewToggle.astro`; trainer-hub `deliver/[...slug].astro` `.segmented`                             | Rahmen os `--input`, trainer-hub `--border`; Polster os 0 0.5rem, trainer-hub 0.25rem 0.75rem; Hover os mit Fläche                                                | `hw-segmented`, nach os                                                              |
| Eingabe mit Button              | website `ui/SearchField.astro` (ein Rahmen); verifier `.lookup-row` (getrennt)                                           | zwei Formen                                                                                                                                                       | `hw-field`, `hw-field-row`, `data-joined` für die website-Form                       |
| Faktenliste                     | website `ui/Facts.astro`, `ui/Fact.astro`; verifier `.facts`; trainer-hub `FactList.astro`                               | Gewicht des Werts 400, 600, 500; Fluss Raster, drei Spalten, Zeile                                                                                                | `hw-facts`, `data-variant="ruled"`; Fluss und Gewicht bleiben beim Spoke             |
| Listenzeile mit Streifen        | os `global.css` `.list-row`; trainer-hub `primitives.css` `.list-row`                                                    | os zusätzlich `content-visibility`, Telefon-Layout, kompakt, Fokus                                                                                                | `hw-row`, `hw-row-stripe`; das Übrige bleibt in os                                   |
| Prosa-Block                     | os `global.css` `.prose-content`; trainer-hub `primitives.css` `.prose-content`                                          | Zeilenhöhen h1 2rem gegen 1.875rem, h2 1.75 gegen 1.625rem, h3 1.5rem gegen 1.35; h3 600 gegen 700; Checkbox links -1em gegen -0.375em, Rand `--input` gegen 70 % | `hw-prose`, nach os                                                                  |
| Code-Panel                      | slides `CodePanel` (trainer-hub und os zeigen es nur im Katalog)                                                         | eine Kopie                                                                                                                                                        | `hw-code data-variant="panel"`                                                       |
| KPI-Kachel                      | os `.kpi-segment`; documents `readout.css` `.metabig`; slides `NumberTile` ist eine Stufen-Nummer, keine Kennzahl        | os Label über Zahl, readout Zahl über Beschriftung, Zeilenhöhe 1.1 gegen 1                                                                                        | `hw-kpi`, `hw-kpi-value`                                                             |
| Gestrichelter Rahmen            | os (`border-dashed border-foreground/15`, mehrere Dateien); trainer-hub `Card.astro` `card-dashed`; slides `DashedFrame` | Ecke os klein, sonst Markenecke; Linie os 15 % Vordergrund, sonst Rahmenfarbe; slides 2px                                                                         | `hw-frame`, Markenecke und Rahmenfarbe                                               |
| Status- und Warnhinweis         | os `lib/severity-style.ts`; trainer-hub `Card.astro` `card-warn`; slides `CARD_TONES`; verifier `.notice`                | Linie 40 % und Grund 7 % in os und trainer-hub, slides voll oder 25 %, verifier 60 und 12 %; Ecke os klein                                                        | `hw-status`, `data-tone`, 40 und 7 %, Markenecke, Kartenpolster                      |
| Breadcrumb                      | os `DetailHeader.astro` `.breadcrumb-nav`; trainer-hub `Breadcrumb.astro`                                                | os Spans mit Trenner 30 %, abgeschnitten statt umbrochen; trainer-hub `ol`, Trenner in Textfarbe                                                                  | `hw-breadcrumb`, nach trainer-hub                                                    |
| Bewegungs-Tokens                | website `global.css` (draw, tune, line, ease-brand); verifier `--motion-fast`                                            | verschiedene Namen                                                                                                                                                | alle fünf in `tokens.css`                                                            |
| Label-Regel unter 48rem         | website `global.css`, verifier `src/worker.ts`                                                                           | gleich                                                                                                                                                            | in `elements/label.css`                                                              |
| Nacht-Umschlüsselung            | talks `app/theme.css`; slides `.theme-brand-dark`; os und trainer-hub haben keine mehr                                   | Rahmen talks Weiß 18 %, slides night-ink 15 %; teal-dark talks teal-night, slides heller                                                                          | `night.css`, `data-hw-night`, nach talks                                             |
| App-Breite, Nav-Offset, Schrift | os `global.css`; trainer-hub `primitives.css`, `tokens.css`                                                              | gleich                                                                                                                                                            | `--container-app`, `--nav-offset` in `expert.css`; `fonts.css`                       |
| Bühnenwerte                     | slides `styles/tokens.css`; documents `tokens.css` Readout                                                               | sechs `--deck-*` gleich `--slide-*`                                                                                                                               | `stage.css`; `document.css` liest die sechs aus `stage.css`                          |

## Exporte von v0.29.0 und die Deltas je Spoke

Neue Pfade in `exports`: `./fonts.css`, `./night.css`, `./stage.css`, `./document.css`. Die neuen
Elemente liegen unter `./elements/*` und in `./elements.css`. Ein Delta ist das, was sich im Spoke
sichtbar ändert, wenn er seine Kopie durch den Export ersetzt.

| Export                                         | ersetzt                                                                                       | Deltas                                                                                                                                                               |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `elements/button.css`                          | website `Cta.astro` primary, secondary; verifier `.button`                                    | website: Übergang 150 statt 200 ms, `ghost` bleibt Ausnahme. verifier: Sekundär ohne weiße Fläche (auf `.share` sichtbar), Seitenpolster `min(1.5rem, 24px)`         |
| `elements/arrow-link.css`                      | website `.link-row`-Pfeil; verifier `.link`, `.link-arrow`                                    | verifier: Gewicht 500 bleibt als eigene Regel oder geht auf 400; Pfeil 150 ms; Extern-Pfeil mit 0.25em Rand. website: Pfeil 150 statt 180 ms                         |
| `elements/field.css`                           | verifier `.input`, `.lookup-row`; website `SearchField.astro`                                 | website: Rahmen und Button wie bisher, Fokusring am Rahmen. verifier: Nacht neu                                                                                      |
| `elements/facts.css`                           | website `Facts`, `Fact`; verifier `.facts dt/dd`; trainer-hub `FactList`                      | website Nacht: Zeilenpolster 0.625rem statt 0.75rem. verifier: `dt`-Abstand 0.25rem über `gap` statt `margin`                                                        |
| `elements/segmented.css`                       | os `FilterRow` Segmente, `ViewToggle`; trainer-hub `.segmented`                               | trainer-hub: Rahmen `--input` statt `--border`, Polster 0.25rem 0.5rem statt 0.25rem 0.75rem, Hover mit Fläche. os: Segmenthöhe bleibt `min-h-(--hw-control-height)` |
| `elements/row.css`                             | os und trainer-hub `.list-row`, `.list-stripe`                                                | keine; os behält `content-visibility`, Telefon, kompakt, Fokus, Marken. os `--row-pad/--row-stripe/--row-gap` werden `--hw-row-*`                                    |
| `elements/prose.css`                           | os und trainer-hub `.prose-content`                                                           | trainer-hub: h1 +2px, h2 +2px, h3 Zeilenhöhe 24 statt 21.6px und 600 statt 700, Checkbox-Lage und -Rand; trainer-hub behält eigenes `pre`, `img`, `.prose-nested`    |
| `elements/code.css` `data-variant="panel"`     | slides `CodePanel`                                                                            | keine                                                                                                                                                                |
| `elements/kpi.css`                             | os `.kpi-segment .kpi-label/.kpi-value`; documents `.metabig b`                               | os: Label wird `hw-label` (500, 0.06em, statt 600, 0.08em). documents: Zeilenhöhe 1.1 statt 1, Reihenfolge bleibt                                                    |
| `elements/frame.css`                           | os gestrichelte Boxen; trainer-hub `card-dashed`; slides `DashedFrame`                        | os: Markenecke statt klein, Linie `#d0d2d8` statt 15 % Tinte (`#d6dadd` auf bg). slides: 2px bei 1440, bei 1920 2.67px statt 2px; Tönungen bleiben slides            |
| `elements/status.css`                          | os `SEVERITY_BOX`; trainer-hub `card-warn`; slides `CARD_TONES` soft/tint; verifier `.notice` | os: Markenecke und 1rem Polster statt klein und 0.75rem. slides: 40 % statt voller oder 25 % Linie. verifier: 40/7 statt 60/12 %, Kartenpolster statt 1rem           |
| `elements/breadcrumb.css`                      | os `.breadcrumb-nav`; trainer-hub `Breadcrumb.astro`                                          | os: Trenner in 70 % statt 30 %, Markup `ol/li`; das Abschneiden bleibt os                                                                                            |
| `elements/label.css` Regel unter 48rem         | website und verifier `:root { --text-label }` unter 48rem                                     | keine dort. Neu auf dem Telefon: slides und talks, deren Label-Stufe aus `--type-label-size` rechnet, wachsen von 12 auf 14px Basis                                  |
| `tokens.css` `--motion-*`                      | website `--motion-duration-*`, `--motion-ease-brand`; verifier `--motion-fast`                | keine                                                                                                                                                                |
| `expert.css` `--container-app`, `--nav-offset` | os `@theme --container-app`, `--nav-offset`; trainer-hub `@utility max-w-app`                 | keine; `max-w-app` kommt aus dem Token                                                                                                                               |
| `fonts.css`                                    | os `global.css` und trainer-hub `tokens.css` `@font-face`                                     | keine                                                                                                                                                                |
| `night.css`                                    | talks `app/theme.css`; slides `.theme-brand-dark`                                             | slides: Rahmen Weiß 18 % statt night-ink 15 %, teal-dark gleich teal-night; slides setzt abgeleitete Tokens weiter selbst                                            |
| `stage.css`                                    | slides `styles/tokens.css` (jedes Literal, gleiche Namen)                                     | keine; slides löscht seine Literale und importiert `stage.css` mit `theme(static)`. `--hw-marker-mid: 0.5cap` aus `slides.css` ist nicht dabei                       |
| `document.css`                                 | documents `tokens.css` (jedes Literal, gleiche Namen)                                         | keine; documents löscht seine Literale. Die sechs `--deck-*` lesen jetzt `--slide-*`                                                                                 |

## Vier P3-Befunde

- Die nackte Zahl neben dem Katalogtitel ist weg: die Herkunftszeile nennt die Zahl schon in
  Worten («26 components»). Die Zählungen in Leiste und Gruppenköpfen bleiben.
- Die Kacheln sind breiter (mindestens 20rem statt 15rem), die Vorschau ohne feste Größe 13.5rem
  statt 10rem hoch. Bei 1440px stehen drei Kacheln je Reihe statt vier.
- Der Mond im `ThemeToggle` ist eine eigene Sichel unter der brand-Lizenz, in Lucides Form, aber
  nicht deren Pfad: ein Kreis mit tiefem Biss oben rechts.
- `brand-elements` nimmt `"lightOnly": true` in `brand-elements.json`: dann fehlen Tokens, die
  nur die Nachtregeln eines Elements lesen, ohne Befund. Ein Test hält beides.

Blind bewertet, mittel: zwei Personas (Mitgründer am 14-Zoll-MacBook, Entwickler am 27-Zoll),
Claude und Codex, Persona A mit Claude zweimal. Vorher und nachher als X und Y, je Reviewer anders
verteilt. Gesamt nachher gegen vorher: Claude A 7:5 und 7:6, Claude B 7:6, Codex A 8:7, Codex B
8:7. Rauschen (Claude A, zwei Läufe): 0 auf nachher, 1 auf vorher. Der Mond allein ist ein
Gleichstand: Claude A zweimal 7:8 für den alten, Claude B 8:7 und Codex A 9:8 für den neuen,
Codex B 9:9. Er bleibt, weil der talks-Review laut Auftrag in allen vier Läufen die Sichel vorzog und der alte
Mond bei Claude B als «C» gelesen wurde. Bilder: `2026-11-02-design-system-phase2/p3/`.

## Das Brand-Portal in der Katalogform (v0.29.2)

`catalogue.html` trägt jetzt die gemeinsame Form: internen Header, Leiste mit Suche und einer
Gruppe pro Ansicht samt Zahl, Titel, Lead, Herkunftszeile und eine `hw-card`-Kachel pro Teil
(Farbfamilien, Typ, Tokens, Logos, die 24 Elemente als Probe, Familien, Pressefotos, Systeme).
`scripts/catalogue.ts` ruft `renderCatalogue`. Die sieben Ansichten behalten ihr eigenes Markup
innerhalb der Form, da Farbraster, Elementmatrix, Merch-Ansichten und Tabellen nicht in Kacheln
passen. Ein Klick in der Leiste öffnet die Ansicht, die Suche filtert die Kacheln und listet
darüber jedes Token, jede Farbe, jedes Logo, jede Datei und jedes Foto, zu dem keine Kachel führt.

Blind bewertet, zwei Runden: zwei Personas (Mitgründer am 14-Zoll-MacBook, Entwickler eines
Spokes am 27-Zoll), Claude und Codex, je zwei Läufe, vorher und nachher als X und Y gemischt.
Runde 1, die Leiste mit vier Sammelgruppen: nachher 7,0 gegen vorher 8,5, verworfen, weil jeder
Ansichtswechsel zwei Klicks brauchte. Runde 2, eine Gruppe pro Ansicht: nachher 8,0 gegen vorher
7,6 (Claude 8,0 gegen 6,5, Codex 8,0 gegen 8,75). Rauschen: höchstens 1 Punkt zwischen zwei Läufen
desselben Reviewers, der Codex-Vorsprung für vorher liegt darin. Was die Reviewer nachher noch
bemängeln: die lange Übersicht, den schmalen rechten Rand der Form und die blasse Markierung der
offenen Ansicht. Bilder, nur hell (die Seite hat keine Nacht): `2026-11-02-design-system-phase2/catalogue/`.

## Offen

- os `--fin-*`, `--board-gap`, `--breadcrumb-top` und die Komponentenwerte der website (Radar,
  Tuning-Desk, PageHero) sind keine Kandidaten und noch nicht in brand. Ob sie Tokens hier werden
  oder Ausnahmen im Spoke bleiben, entscheidet die nächste Runde.
- Die Quellprüfung von `brand-elements` kennt die neuen Elemente noch nicht als Namen (button,
  breadcrumb, facts): sonst wären alle Spokes beim Pin-Wechsel rot, bevor sie ihre Kopien ersetzen.
  Nachziehen, sobald die Spokes umgestellt sind.

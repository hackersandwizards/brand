# Gemeinsame Elemente: warum das Brand Kit nur eines zeigt

Stand 01.11.2026. Benedikt am 01.11.: «warum gibt es im brand kit nur ein einziges element. müssten
da nicht viel mehr elemente sein? theoretisch müssten wir doch viel viel mehr gleiche elemente
zwischen den einzelnen systemen haben und nur sehr einzelne ausnahmen. als abgesehen von kunde vs
internes system»

Gelesen auf `origin/main` von brand, website, os, trainer-hub, talks, slides, documents und
certificate-verifier nach `git fetch`, nichts davon geändert. Prototyp und Renderings liegen nur im
Scratchpad; die Seite mit den Ausschnitten: `~/Downloads/stand-entscheidungen/shared-elements/`.

## Antwort

Du hast recht: 14 der 23 Elementtypen sind in mindestens zwei Systemen dieselbe Regel im Maß ihres
Mediums. Geteilt als Code sind davon heute drei.

Die Seite «Elements» zeigt nur den Dropdown-Pfeil (`expert/select.css`). Das ist weniger, als brand
schon teilt: der Listenmarker (`tokens/marker.css`, von documents, slides und dem Verifier genutzt),
die interne Kopfleiste (`expert/header.css`) und die neun Expert-Komponenten fehlen dort, weil
`catalogue.ts` jedes System auf seine eigene Design-System-Seite verweist. Seit heute kommt die
Disclosure aus os (`.details-chevron`, die Zeilen «> Meetings 1») als erstes geteiltes
Expert-Element dazu; ein anderer Lauf liefert sie gerade nach brand, der trainer-hub übernimmt sie,
os folgt mit dem Pin. Das ist der Präzedenzfall für alles unten.

Warum der Rest nicht in brand liegt:

- **Kopiert als Kommentar, nicht als Code.** documents und slides bauen die Website-Elemente nach und
  nennen die Quelle im Kommentar: `.card` «Card.astro», `.chip` «TrainingList.astro .tl-chip»,
  `.callout` «InShort.astro», `SlideCard` «The website's card». Eine Abschrift driftet: slides
  tönt den Chip wie die Website mit 15 %, documents mit 40 % (`teal-light`), beide mit derselben
  Quellangabe.
- **brand nimmt ein Element erst auf, wenn es jemand hebt.** brand `CLAUDE.md`: Komponenten wandern
  in den Kern, «once two surfaces share them». Das Kriterium ist für 14 Elemente erfüllt, gehoben hat
  sie niemand.
- **Vier Techniken.** Tailwind (Website, Apps, slides), reines CSS (documents), Inline-CSS im Worker
  (Verifier), Astro neben React. Ein geteiltes Element muss framework-freies CSS sein. `marker.css`
  (v0.24, 01.11.) ist der erste Beweis, dass das in jedem Medium trägt.
- **Die Regeln stehen als Worte in den Tokens.** `tokens.css` schreibt Radius-Rollen, Label-Rolle,
  Code-Palette und Chart-Reihenfolge als Kommentar. Kein Gate prüft, ob ein Element sie einhält.

## Inventar

System-Kürzel: W Website, V Verifier, O os, H trainer-hub, T talks (nur Startseite), D documents, S
slides. «Token» heißt eigenes CSS auf Brand-Tokens, «Brand» eine Brand-Datei oder -Komponente,
«eigen» eigene Literalwerte. Die Zahl ist die Anzahl Kopien im Repo.

| Element                         | W       | V                  | O                  | H         | T     | D       | S        | Urteil                                                       |
| ------------------------------- | ------- | ------------------ | ------------------ | --------- | ----- | ------- | -------- | ------------------------------------------------------------ |
| Button primär/sekundär          | Token 1 | Token 1            | Brand              | Brand     | –     | Token 2 | eigen 5  | Kunde gleich (W=V), intern Expert: Publikum                  |
| Button ghost                    | Token 2 | –                  | Token 2            | –         | –     | –       | eigen 1  | je System                                                    |
| Rundes Icon-Bedienelement       | Token 4 | –                  | Brand (alt, eckig) | Brand     | eigen | –       | eigen 4  | gleich laut Design-Guide, Drift                              |
| Pill/Chip/Tag                   | Token 3 | –                  | Brand + 6          | Brand + 5 | eigen | Token 5 | eigen 7  | Kunde gleich, D driftet; intern Brand-Pill: Publikum         |
| Karte                           | Token 1 | Token 1            | Token 4            | Token 3   | Token | Token 9 | eigen 47 | gleich in 6 von 7, V und O driften                           |
| Label/Eyebrow/Kicker            | Token 1 | Token 1            | Token 4            | Token 3   | Token | Token 6 | Token 1  | Kunde gleich (Mono, Versalien); Apps Inter: Publikum         |
| Listenmarker                    | eigen   | Brand              | eigen «•»          | eigen «•» | –     | Brand   | Brand    | schon geteilt, W/O/H nicht übernommen                        |
| Tabelle mit Linien              | Token 2 | –                  | Token 2            | Token 2   | –     | Token 2 | eigen 1  | W=D gleich; S gerahmt mit Zebra, nicht erklärt; O≠H          |
| Hinweis/Callout                 | Token 1 | Token 1            | Token 2            | Token 1   | –     | Token 4 | eigen 5  | W=D gleich; V und S driften                                  |
| Summenband                      | –       | –                  | Token 2            | –         | –     | Token 3 | –        | je System                                                    |
| Feld/Eingabe/Dropdown           | Brand 2 | Token 1            | Brand 3            | Brand 1   | –     | –       | eigen 1  | Kunde W≠V Drift; intern Expert; Pfeil schon geteilt          |
| Fokusring                       | Token 1 | Token 1            | eigen 1            | eigen 1   | keins | –       | eigen 4  | gleich auf jedem Bildschirm, Drift                           |
| Link                            | Token 3 | Token 1            | Token 1            | Token 2   | Token | Token 1 | eigen 3  | Fließtext W=D gleich; Apps: Publikum                         |
| Kopfleiste mit Verlaufsstreifen | Token 2 | Streifen auf Karte | Brand              | Brand     | Brand | Token 2 | eigen 1  | Streifen gleich im Medium-Maß; Leiste: Medium und Publikum   |
| Section-Band                    | Token 1 | –                  | –                  | –         | –     | Token 3 | Token    | je Medium (Layout)                                           |
| Avatar/Porträtrahmen            | Token 2 | –                  | Token 2            | –         | –     | –       | eigen 5  | rund überall, wenige Kopien: später                          |
| Tooltip                         | Token 1 | –                  | Token 1            | –         | –     | –       | eigen 1  | je System                                                    |
| Tabs/Segment                    | –       | –                  | Token 2            | Token 1   | –     | –       | –        | intern, Kandidat für Expert                                  |
| Stage/Status-Marker             | Token   | –                  | Token 3            | Token 2   | –     | Token 3 | eigen 4  | je Aufgabe verschieden; Statusrollen als Token geteilt       |
| Codeblock                       | Token 2 | –                  | eigen 1            | eigen 1   | –     | Token 2 | eigen 2  | gleich (Palette `code-palette` entschieden), Übernahme fehlt |
| Zitat/Testimonial               | Token 2 | –                  | Prosa              | Prosa     | –     | Token 3 | eigen 4  | W=D gleich; S driftet                                        |
| KPI-Kachel                      | Token 2 | –                  | Token 4            | –         | –     | Token 3 | eigen 2  | Typrolle geteilt, Kachel je Medium                           |
| Balken im Chart                 | Token 1 | –                  | eigen 2 (7 Hex)    | –         | –     | Token 4 | eigen 2  | Reihenfolge geteilt, Balken je System; O-Hex ist Drift       |
| Disclosure                      | –       | –                  | eigen              | eigen     | –     | –       | –        | wird gerade Expert-Element (Präzedenzfall)                   |

Pins heute: W v0.21.7, O v0.21.6, V v0.24.0, H v0.24.3, T v0.24.5, D v0.25.1, S v0.24.4. W und O
können `marker.css` und die Code-Palette erst nach einem Pin-Sprung nutzen.

## Gleich oder nur ähnlich

Gezählt nach der Kopplungsregel («Where two repositories only look alike, each keeps its own code»):

| Gruppe                               | Elemente                                                                                                                                    | Anzahl |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -----: |
| Dieselbe Regel, heute deckungsgleich | Karte (W, S, H, T), Label (W, V, D, S), Pill (W, S), Callout, Fließtext-Tabelle, Fließtext-Link und Zitat (je W, D), Listenmarker (D, S, V) |      8 |
| Dieselbe Regel, mit messbarer Drift  | Fokusring, rundes Icon-Bedienelement, Codeblock, Verlaufsstreifen, Kunden-Button (W, V), Kunden-Feld (W, V)                                 |      6 |
| Schon als Code geteilt               | Listenmarker, Dropdown-Pfeil, Expert-Satz der Apps (Button, Feld, Pill, Kopfleiste, Theme-Toggle, Filter, Space-Nav), Disclosure ab heute   |      4 |
| Nur ähnlich, bleibt je System        | Summenband, Section-Band, Stage/Status, Tooltip, KPI-Kachel, Chart-Balken, Folientabelle, Kopfleisten selbst, Ghost-Button                  |      9 |
| Später                               | Avatar (rund überall, drei Systeme, wenige Kopien), Tabs (nur Apps, als Expert-Element)                                                     |      2 |

Die Drift ist gemessen, kein Geschmack: Verifier-Karte mit Schatten und dauerhaftem Verlaufsstreifen
oben (Website ohne beides), slides-Callout lila mit Rahmen rundum (Website und Dokumente teal mit
linkem Balken), Fokusring 3 px in W, V und H, 2 px in O, keiner in T, vier Formen in S. Eckige
Badges in trainer-hub und talks, obwohl `tokens.css` Pills für Chips und Badges festlegt. Die
os-Pipeline-Karte trägt `rounded-sm` statt der Markenecke.

Legitime Unterschiede sind zwei:

- **Publikum** (deine eine Trennung): Die Apps setzen Labels in Inter, so steht es im Design-Guide;
  der Expert-Button ist dicht (5 px Ecke, 8:16 px) gegenüber dem Kunden-Button (Markenecke, 8:24 px).
- **Medium**: Druck braucht `border-strong` statt `border` für die Kartenlinie, weil 1 pt sonst bei
  70 % Zoom verschwindet (documents, 28.10.). Folien ziehen alles mit Faktor 2 auf.

Ein Widerspruch braucht deine Entscheidung vor dem Heben: `tokens.css` gibt Buttons und Feldern
`--radius-sm`, Website, Verifier und Dokumente nutzen dort die Markenecke.

## Vorschlag

**Elf Elemente kommen nach brand** als framework-freies CSS je Datei, im Muster von `marker.css`:
Label, Pill, Karte, Callout, Zitat, Tabelle mit Linien, Fließtext-Link, Fokusring, rundes
Icon-Bedienelement, Verlaufsstreifen, Codeblock. Dazu bleiben Listenmarker und Dropdown-Pfeil.

| Frage                | Antwort                                                                                                                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form                 | `elements/<name>.css`, Klassen `hw-*`, Werte aus `tokens.css`, kein Literal. Varianten als `data-*` (Pill `outline`, Karte `tint`). Nacht über `html[data-theme=dark]`.                                                                  |
| Maß je Medium        | Jedes Element liest `--hw-*` (Größe, Polsterung, Ecke, Linienstärke, Linienfarbe). Website-px sind der Default; `print.css` setzt pt, `slides.css` die Bühnen-rem, `expert.css` die dichte Stufe. Das Medium setzt nur Maße, nie Farben. |
| Publikum             | Die Apps setzen `--hw-label-family` auf Inter und behalten Expert-Button und Expert-Feld. Sonst nichts.                                                                                                                                  |
| Wrapper              | Erst keine: eine Klasse reicht in Astro, React und HTML. Ein dünner Astro- oder TSX-Wrapper erst, wenn ein Element Markup braucht (Icon-Bedienelement).                                                                                  |
| Übernahme            | Jeder Nutzer pinnt brand, ersetzt seine Regel durch die Klasse und löscht seine Kopie. Ein Gate `brand-elements` misst wie `brand-markers` die gerenderten Elemente der Seiten, die der Nutzer nennt: Ecke, Farben, Linie, Polsterung.   |
| Reihenfolge          | Label, Pill, Karte, Callout zuerst. slides plant gerade eigene Bausteine `Kicker`, `Chip`, `SlideCard`, `Quote` (os `docs/tracking/2026-11-01-slide-system.md`); bauen die auf den brand-Elementen auf, entsteht keine dritte Kopie.     |
| Elements-Seite       | Jedes geteilte Element live, hell und Nacht, in den vier Maßen Website, dicht, Druck, Bühne nebeneinander, mit «genutzt von». Dazu die neun Expert-Komponenten und die Disclosure.                                                       |
| Was je System bleibt | Summenband (nur Dokumente), Section-Band und Kopfleisten (Layout je Medium), Stage/Status (verschiedene Aufgaben), Tooltip, KPI-Kachel, Chart-Balken, Folientabelle, Ghost-Button.                                                       |

Zur brand-Regel «The two engines … never enter this one, not even a primitive»: Sie verbietet, dass
Engine-Code nach brand wandert. Die Richtung hier ist umgekehrt, brand liefert, die Engines nehmen,
wie bei `marker.css`.

## Prototyp

Drei Elemente (Label, Pill, Karte) als eine CSS-Datei mit Website-Werten als Default und je einem
Maß-Preset für Druck und Bühne. Eingespielt in Scratch-Kopien von documents (Angebot, Vorbereitung,
Onepager) und slides (Content- und Cards-Folie): die eigene Regel des Systems nimmt die Regel des
Elements, das Layout bleibt.

- **slides:** keine sichtbare Änderung. Die Datei bildet Kicker, Prinzip-Pill und Karte der Folie im
  Bühnenmaß nach. Das ist der Beleg, dass ein Element alle Medien tragen kann.
- **documents:** zwei sichtbare Änderungen, beide hin zur Website. Die Typ-Pill im Kopf («ANGEBOT»)
  geht von 40 % auf 15 % Tönung mit Text aus Teal und Ink, die betonte Karte («Erstellt für») von
  voller Teal-Linie auf 40 %. Die Pill wächst von 8,5 auf 9,5 pt, weil der Prototyp eine Label-Größe
  je Medium kennt und documents zwei hat; das Eyebrow bei 9,5 pt ist eine os-Entscheidung
  (`br-label-style`), die der Prototyp hält.

## Blinde Bewertung

Mittel: drei Personas (Markendesignerin, Head of Engineering eines Kunden, der in einer Woche
Website, Angebots-PDF und Workshop-Folien sieht, interne Person, die täglich in os arbeitet), Claude
und Codex, je ein Lauf, die Markendesignerin zweimal für das Rauschen. Medium und Anzeigegröße im
Prompt: Website auf 1440 px, A4 bei 70 % Zoom, Folie projiziert, alle Bilder bei 1000 px. Neutrale
Buchstaben, Reihenfolge je Reviewer getauscht. Kriterien vor jeder Bewertung festgelegt: Konsistenz
über die Oberflächen, Passung je Medium, Ruhe, Lesbarkeit, je 0 bis 10, dazu gesamt.

| Version  | Gesamt | Konsistenz | Passung | Ruhe | Lesbarkeit | Claude gesamt | Codex gesamt |
| -------- | -----: | ---------: | ------: | ---: | ---------: | ------------: | -----------: |
| Heute    |   7,86 |       7,94 |    8,00 | 8,19 |       7,94 |          7,13 |         8,60 |
| Prototyp |   8,26 |       8,50 |    8,00 | 8,50 |       8,06 |          7,88 |         8,65 |

Rauschen (Markendesignerin, zwei Läufe): 0,5 bei Claude, 0,2 bis 0,4 bei Codex. Der Vorsprung von
0,4 gesamt liegt im Rauschen, bei der Konsistenz (0,56) knapp darüber. Urteile: 5 für den
Prototyp, 3 unentschieden, 0 für heute. Alle Claude-Läufe nennen dieselben Gründe: die dunklere
Pill und die kräftige Kartenlinie des PDFs fallen aus der Familie von Website und Folie. Codex
nennt die Unterschiede meist zu klein, um das Gesamtbild zu ändern.

Gelesen: Der Prototyp sieht aus wie heute, nur ohne die Abweichung der Dokumente. Der Gewinn des
Hebens liegt darin, dass die nächste Abschrift nicht mehr driften kann, nicht in einem neuen Look.

Ein Prompt wörtlich (Markendesignerin, Claude, Lauf 1; Dateiliste gekürzt):

> You are a senior brand designer who has to keep one visual system consistent across a website,
> printed documents and slide decks. Medium: three surfaces from hackers&wizards, a consultancy for
> agentic software engineering, seen by one person within one week: a section of the website on a
> 1440 px laptop screen (file \*-1-website.png), the first page of an A4 proposal PDF viewed at about
> 70 % zoom on a laptop (\*-2-pdf.png), and two 16:9 slides projected in a training room or shared
> in a video call (\*-3-slide.png, \*-4-slide.png). Images are shown at 1000 px on the long side.
> Audience: the brand's own design team. There are two sets, K and M, each with the same four
> surfaces; files are named <set>-<surface>.png: […]. Look at every file. Criteria fixed before any
> score (2026-11-01): consistency (the labels, tags/pills and cards read as one family across
> website, PDF and slide), fit per medium (each surface looks right for how it is seen: laptop
> screen, A4 PDF at about 70 % zoom, projected 16:9 slide), calm (nothing competes, no clutter,
> breathing room), legibility (every label, tag and card text readable at its display size). Each
> 0-10, plus overall. Judge each set as a whole. […]

Alle Reviewer nennen unabhängig vom Prototyp: rot-grüne Streichpreise im Angebot ziehen den Blick,
Website-Labels und -Tags sind bei 1440 px klein, die zweite Listenebene auf Folien ist zu blass für
den Beamer.

## Was offen bleibt

- Übersprungen: os und der Verifier als Prototyp-Nutzer, die Nachtansicht, die Apps in der
  Bewertung. Die interne Persona hat Kunden-Oberflächen bewertet, nicht os.
- Nicht gemessen: die Elemente 4 bis 11 im Prototyp, das Gate `brand-elements`.
- Ungeklärt, ohne Ursache: warum slides seine Tabelle rahmt und zebrastreift. Das kann Medium sein
  oder Drift.
- Ein Fund nebenbei, nur im Quelltext gelesen, nicht gerendert: slides `ActivitySlide.tsx:58` und
  `ComparisonSlide.tsx:36` nutzen die Klasse `slide-marker`, die kein CSS mehr definiert.

Review: mittel, weil eine Markenentscheidung über alle Oberflächen ansteht und der Prototyp nichts
ausliefert.

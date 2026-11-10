# Review-Befunde B-01 bis B-39: was geändert ist und was gemessen wurde

Ein Review las brand bei v2.11.0 ganz und schrieb 39 Befunde. Dieser Bericht hält fest, was
v2.12.0 und v2.13.0 davon beheben, was gemessen wurde und was offen bleibt. Gemessen ist alles in
Chrome for Testing 156, headless.

## Release 2.12.0

### B-01: das leise Grau unter sieben Elementen

Command, Menu, Carousel, Stepper, Pagination, Tabs und Empty lasen ihren leisen Text aus
`--muted-foreground`, das brand nirgends definiert. Unter `expert.css` fiel das auf
`--color-muted`, dort die Fläche bei 7 %. Jetzt lesen sie `--hw-muted` wie Label, Table und Field,
auf Nacht `--color-night-muted`. `--accent-foreground` heißt jetzt `--on-accent` wie in
`expert.css`. `--border-strong` fällt weg, weil nur der Token-Wert gemeint war.

Gemessen ist der berechnete Farbwert, Kontrast gegen den Seitengrund:

| Fläche                                        | vorher Tag        | vorher Nacht               | nachher Tag      | nachher Nacht       |
| --------------------------------------------- | ----------------- | -------------------------- | ---------------- | ------------------- |
| ohne `expert.css`                             | `#545861`, 6,7:1  | night-muted, 12,2:1        | gleich           | gleich              |
| `expert.css` ohne eigene Variable             | Fläche, 1,13:1    | night-muted, 12,2:1        | `#545861`, 6,7:1 | night-muted, 12,2:1 |
| `expert.css` mit dem Wert aus os              | Tinte 70 %, 5,5:1 | Nachttinte 70 %, 8,2:1     | `#545861`, 6,7:1 | night-muted, 12,2:1 |
| `expert.css` mit dem Wert aus dem Trainer-Hub | Tinte 70 %, 5,5:1 | Nachttinte bei 51 %, 4,8:1 | `#545861`, 6,7:1 | night-muted, 12,2:1 |

Der Hub-Wert auf Nacht ist mit dem Nacht-Boden aus `expert.css` gemessen. Ob der Hub auf Nacht einen
eigenen Boden setzt, ist nicht geprüft. Bilder: `2026-11-10-review-fixes/quiet-expert-day-*.jpg`.
Auf Nacht ohne eigene Variable ändert sich nichts.

### B-03: Fokusring am Schließen-Knopf des Toasts

Das Kreuz war eine Maske auf dem Knopf selbst und schnitt seinen Fokusring weg. Der Browser
berechnete einen Rahmen von 3 px, sichtbar war keiner. Jetzt zeichnet `::after` das Kreuz, der
Knopf bleibt ungemaskt. Bilder: `toast-focus-day-before.jpg`, `toast-focus-day-after.jpg`,
`toast-focus-night-after.jpg`.

### Strengere Prüfungen

Jede neue Regel hat einen Test, der mit dem alten Scanner scheitert und mit dem neuen besteht.

- B-02, `brand-colours`: zählt jetzt `oklch()`, `oklab()`, `lab()`, `lch()`, `hwb()`, `color()`,
  CSS-Farbnamen in Farbkontexten, `white` und `black` als `tokenHex`, die `font`-Kurzform, das
  SVG-Attribut `font-family`, `font-serif`, Seiten- und Offset-Klassen der Tailwind-Palette,
  `-webkit-box-shadow` und kurze Hex-Werte aus Buchstaben dort, wo ein Wert steht. `Interstate` gilt
  nicht mehr als Inter.
- B-04: Ein Eintrag, der mehr erlaubt, als die Datei hält, ist ein Befund, in `brand-colours`
  wie in `brand-markers`.
- B-05: In Markup schützt ein String seinen Inhalt vor dem Kommentarschnitt. `//` gilt nur im
  Frontmatter und in `<script>` als Kommentar.
- B-08: `brand-copies` nimmt in einem Engine-Dokument nur das Lockup heraus, als `<svg>` oder
  `data:`-URI, erkannt an seiner `viewBox`. Jede andere Zeichnung zählt weiter.
- B-09: `brand-scan` liest jede Komponentendatei in jedem Ordner, `.vue` und `.svelte` eingeschlossen.
- B-10: Eine Markierung in einer nicht deklarierten `data-hw-exception` wird gemessen. Ein Lauf,
  der nur einen Katalog misst und nichts findet, scheitert. `brand-elements` scheitert, wenn keine
  Seite ein Element zeigt.
- B-18: Eine nach einem Element benannte Komponente muss dessen eigene Klasse rendern. `<style>` in
  `.html` wird gelesen, die Blöcke der Engine ausgenommen.
- `--tighten` schreibt keine Nullen mehr und legt keine leere Liste an, wo keine war.

### Was die Konsumenten beim Anheben sehen

Gemessen auf `origin/main` jedes lokalen Checkouts (Stand 10.11.), in einer Kopie außerhalb des
Repos: Pin auf v2.12.0 gesetzt, Prüfung, `--tighten`, Prüfung. Nach `--tighten` bleiben nur leere
Begründungen übrig.

| Konsument                                                                    | `brand-colours` vorher | leere Begründungen danach | `brand-copies`                   | neue Quellbefunde `brand-elements` |
| ---------------------------------------------------------------------------- | ---------------------- | ------------------------- | -------------------------------- | ---------------------------------- |
| os (pinnt v2.7.0)                                                            | 323 Befunde            | 3                         | 2 Dokumente einer älteren Engine | läuft dort nicht                   |
| website                                                                      | 23                     | 21                        | 0                                | 1                                  |
| documents                                                                    | 1                      | 1                         | 0                                | 0                                  |
| slides                                                                       | 1                      | 1                         | 0                                | 1                                  |
| talks                                                                        | 1                      | 1                         | 0                                | 0                                  |
| admin, certificate-verifier, hycle-private, mail, practitioners, trainer-hub | 0                      | 0                         | 0                                | 0                                  |

Gegen den Scanner von v2.11.1 steigen die Zählungen so: os `tokenHex` +995, `font` +330 in 280
Dateien, fast alles in komponierten Dokumenten (`color: white`, Helvetica in SVG-Diagrammen).
website `tokenHex` +57, `font` +1. Keine Zählung sinkt. `brand-markers` und die messenden Teile
von `brand-elements` brauchen eine gebaute Seite und liefen in keinem Konsumenten.

## Release 2.13.0

### B-07: Elemente in einem Nachtband auf einer hellen Seite

`expert.css` stellt die Rollen nur für `html[data-theme="dark"]` auf Nacht. Die Nacht-Scopes der
Elemente lasen trotzdem `--accent`, `--foreground` und `--background`. In einem
`data-theme="dark"`-Band auf einer hellen Seite standen deshalb Tabs, Pagination und Stepper in
Tagestinte auf Nacht, und Menü, Dialog, Popover und Command Palette erschienen als helle Kästen.
Jetzt lesen die Nacht-Scopes in 19 Elementen `--hw-night-*`. `expert.css` setzt alle sieben auf
einer dunklen `html` aus seinen Nachtrollen, `night.css` unter `data-hw-night` fünf davon aus
seinen Werten. Wo keine gesetzt ist, gelten die Nacht-Tokens von brand. Die berechneten Farben
aller Knoten:

| Fall                                     | geänderte Werte |
| ---------------------------------------- | --------------- |
| Nachtband ohne `expert.css`              | 0 von 815       |
| `expert.css`, Nacht auf `html`           | 0 von 812       |
| `expert.css`, Nachtband auf heller Seite | 269 von 815     |

Bilder: `night-band-expert-before.jpg`, `night-band-expert-after.jpg`. slides und documents setzen
`--background` und `--accent` auf `:root` mit Tageswerten. Ein Nachbau dieses `:root` zeigte vorher
Tagestinte und ein helles Menü im Nachtband, nachher Nacht. In slides und documents selbst ist das
nicht gerendert. Ein Test hält jede Leserolle aus den Nacht-Scopes heraus.

### B-13: der UI-Schritt der Apps in einem Papier- oder Bühnenblock

Nur die dichte Skala setzt `--text-ui`, `expert.css` setzt es auf `:root`. Ein Block mit
`data-hw-scale="print"` oder `"stage"` innerhalb einer App erbte deshalb 13 px für Inline-Code,
Navigation, Segmented Control und Choice. Inline-Code in einer Überschrift blieb so 13 px statt
0,875 em. Jetzt setzen Print und Stage `--text-ui: initial`, und jedes Element nimmt dort seine
eigene Größe wie auf einer Seite ohne App drumherum.

Gemessen mit `expert.css` und einem dichten Elternteil: Inline-Code im Fließtext 13 → 14 px, in
einer Überschrift von 32 px 13 → 28 px, Navigation und Segmented Control 13 → 14 px, in Print wie
in Stage. Ohne dichten Vorfahren ändert sich nichts. Der Trainer-Hub zeigt Folien in seiner App:
dort nimmt Inline-Code jetzt dieselbe Größe wie in slides selbst.

Nicht geändert: ein eigener Textwert für Choice und Segmented Control auf der Bühne. Keine Folie
zeigt sie heute (slides' `components/` und `catalog/` enthalten keines). Die Prämisse zum
verbundenen Feld trifft nicht zu: Auf Stage ist es vorher und nachher 72 px hoch, weil der Knopf die
Zeile streckt. Mit einem festen `--text-ui` je Skala hätte slides' Inline-Code
(`ContentSlide.tsx`, `lib/markdown.tsx`) eine feste Größe statt 0,875 em bekommen. Deshalb gibt es
keinen Wert je Skala.

### B-15: `.form-input` und `select.css` in der Komponenten-Ebene

Beide lagen außerhalb jeder Ebene und schlugen deshalb jede Utility. Jetzt liegen sie in
`@layer components`. Innerhalb von `hw-focus-ring` zeichnet `focus.css` den Brand-Ring auch um
`.form-input`, wie um `hw-field` daneben. Außerhalb bleibt der eigene Ring. Gemessen mit kompiliertem
Tailwind, `expert.css` vor und nach `elements.css` geladen, beide Reihenfolgen gleich:

| Fall                                                       | vorher                 | nachher                   |
| ---------------------------------------------------------- | ---------------------- | ------------------------- |
| `select.form-input`                                        | rechts 32 px           | 32 px                     |
| `select.form-input pr-10`                                  | 32 px                  | 40 px                     |
| `textarea.form-input min-h-24` (os, `EntityDetailScripts`) | 56 px hoch             | 96 px                     |
| `.form-input` fokussiert in `hw-focus-ring` (Trainer-Hub)  | kein Umriss            | 3 px Lila, wie `hw-field` |
| `.form-input` fokussiert außerhalb                         | eigener Ring           | gleich                    |
| `hw-field hw-select`, drei Größen                          | 28 / 28 / 30 px rechts | gleich                    |

Unter erzwungenen Farben zeigt `.form-input` einen Fokusrahmen (vorher keinen).

### B-16: Textfarbe auf Füllung und die Listenmarke auf Nacht

Primärer Button, Bild-Icon-Button, Avatar und der Knopf des verbundenen Felds schreiben unter
`night.css` in Nachttinte (`--hw-on-fill`): 7,4:1 statt 2,6:1 beim Button, beim Avatar etwa 10:1
statt 1,9:1. Ein Avatar mit eigener dunkler Farbe (`--hw-avatar-hue`) setzt `--hw-on-fill` selbst
auf Weiß. slides setzt die Avatarfarbe auf Nachtfolien auf das helle Teal, dort gilt die Nachttinte.

Die Listenmarke und `.hw-marker` nehmen auf Nacht jetzt Teal-Nacht, wie `.hw-mark` und alles unter
`night.css` schon vorher. Vorher waren sie mit `tokens.root.css` oder `expert.css` Tages-Teal.

Blind-Review, zwei Personas (CTO liest die Website abends am Laptop; Beraterin arbeitet den ganzen
Tag in einer App im Dunkelmodus), Claude (claude-opus-5-5, effort medium) und Codex (gpt-6.1-sol,
effort high), je zwei Läufe, X und Y je Reviewer neu gemischt. Gezeigt wurden ein Nachtband der
Website und eine App-Karte im Dunkelmodus, jeweils das ganze Fenster mit 1280 px, verkleinert auf
1000 px, und ein Ausschnitt in voller Auflösung. Alle acht nannten die Farbe der Marke als einzigen
Unterschied.

| Fläche  | Persona   | Modell | vorher | nachher | Vorsprung | Rauschen |
| ------- | --------- | ------ | ------ | ------- | --------- | -------- |
| Website | CTO       | Claude | 8,00   | 8,00    | 0,00      | 0,00     |
| Website | CTO       | Codex  | 8,75   | 9,10    | +0,35     | 0,10     |
| Website | Beraterin | Claude | 8,20   | 8,30    | +0,10     | 0,20     |
| Website | Beraterin | Codex  | 8,60   | 8,85    | +0,25     | 0,50     |
| App     | CTO       | Claude | 7,80   | 7,90    | +0,10     | 0,40     |
| App     | CTO       | Codex  | 8,85   | 9,00    | +0,15     | 0,30     |
| App     | Beraterin | Claude | 7,90   | 8,20    | +0,30     | 1,00     |
| App     | Beraterin | Codex  | 8,75   | 8,60    | −0,15     | 0,80     |

Je Kriterium, alle Bewertungen gemittelt: auffindbar 7,66 → 8,88, passt zu den anderen Akzenten
7,78 → 8,84, Text zuerst 9,19 → 8,00, ruhig 9,00 → 8,31, insgesamt 8,16 → 8,44. Nur ein Vorsprung
liegt über dem Rauschen des Reviewers, ein anderer ist negativ. Das Ergebnis ist ein Gleichstand.
Nach der Regel des Blind-Reviews gewinnt bei Gleichstand die Variante mit weniger Ausnahmen. Das ist
Teal-Nacht: eine Regel auf jedem Stack statt zwei Farben je nach Stylesheet. Bilder:
`marker-night-site-before.jpg`, `marker-night-site-after.jpg`.

Ein Reviewer-Prompt im Wortlaut (CTO, Claude, Lauf 1; Dateipfade gekürzt):

> You are the CTO of a 300-person software company. In the evening you read a consultancy's
> website on your MacBook (Retina screen, browser window 1280 px wide) and decide whether to book
> a call with them.
>
> You compare two versions, X and Y, of the same screens. They differ in one detail only. Two
> places are shown, each as the whole browser window (downscaled to 1000 px wide) and as a detail
> at full resolution: "site": a dark band on a company website, seen in a laptop browser window
> 1280 px wide. "app": an internal web app in dark mode, seen in a laptop browser window 1280 px
> wide. [eight image paths] Open every image with the Read tool before you score.
>
> Criteria, each scored 0 to 10 for each variant: 1. findable: each list item's start is found at
> a glance. 2. text-first: the square in front of each item does not pull the eye away from the
> words. 3. belongs: the square's colour sits well with the other accents on this dark ground (the
> icon before the heading, the link, the label). 4. calm: the dark area reads calm, with breathing
> room, not busy. 5. overall: how good the whole dark area looks for its reader.
>
> Answer with JSON only […]

Nicht kombiniert: slides' Nachtfolien (dort war die Marke unter `night.css` schon Teal-Nacht) und
documents (keine Nachtflächen).

### Weitere Befunde

- B-11: Die Schutzmarken gegen doppeltes Verdrahten sind registrierte Symbole am Knoten
  (`Symbol.for`), die jedes Bundle auf der Seite sieht und `cloneNode` nicht mitkopiert. Mit zwei
  Bundles auf einer Seite schrieb ein Klick vorher dreimal in die Zwischenablage, jetzt einmal.
- B-12: `check:tokens` scheitert an einer Datei in `generated/`, die kein Generator schreibt. Ein
  Test prüft jedes `exports`-Ziel gegen die gepackte Liste.
- B-14: `hw-nav`, `hw-error-summary` und `hw-dot-list` schalten die Listenmarker aus. In `hw-prose`
  bekamen sie vorher teal Quadrate, und die Punktliste verlor ihren Mittelpunkt.
- B-17: Der README sagt, dass `data-theme` auf einen Container gehört.
- B-19: `brand-elements` endet mit Exit 2 und einem Satz, wenn eine Seitenpfad-Angabe keinen
  Server hat (vorher ein unbehandelter Fehler). Die Reihenfolge der Seitenvorbereitung bleibt, wie
  sie war. Was sie an einer Messung ändert, ist nicht geklärt.
- B-20: `initListFilter` verdrahtet eine Wurzel nur einmal.
- B-21: README und `CLAUDE.md` nennen `sharp` für die beiden LinkedIn-Befehle.
- B-22: Tests halten die Füllfarben der Nachtschnitte an ihren Tagesdateien und die getippten
  Größen des Header-Logos an den `viewBox`-Werten.
- B-23 (Formular-Skript im Portal), B-24 (`checkVisibility` mit Rückfall), B-25 (`data-theme="auto"`
  aus `header.css` entfernt, kein Konsument setzt es), B-26 (keine Ansage beim Laden), B-27 (Menü
  ohne aktive Einträge), B-30 (Code-Theme scheitert laut, auskommentierte Schriften zählen nicht),
  B-32 (Signatur mit leerem Namen; der Terminal-Befehl prüft seine Spezifikation und löscht nichts
  vor dem Rendern; der Rahmen liest die Größe wie angezeigt, nach der EXIF-Drehung), B-34 (ein Test
  hält jede Farbe der Mail-Vorlage an den Tokens), B-35 (Pfad mit Leerzeichen), B-38 (README,
  Kommentare, `captures/` ignoriert).
- Neu: `data-hw-hover` zeigt den Hover-Zustand ohne Zeiger, wie `data-hw-focus` den Fokus.
  `--tint-callout` (10 %) und `--tint-callout-night` (14 %) sind Tokens. Die Callout-Farben sind
  gemessen gleich geblieben.

### Gelassen, mit Grund

- B-28: Kein Konsument zeigt zwei Kacheln desselben Elements. Eindeutige IDs je Kachel würden die
  IDs der gebauten Stories ändern, auf die die Katalogtests zugreifen.
- B-29: Ein offen aus dem DOM entfernter Dialog löst kein `close` aus. Der Fix bräuchte einen
  Beobachter am Body für einen Fall, den kein Konsument zeigt.
- B-30, dritter Punkt: Eine andere bun-Version erzeugt vielleicht ein anderes `copy.js`. Das ist
  nicht nachgestellt, und eine Versionsprüfung würde jede Sitzung mit anderem bun rot machen.
- B-31: Die Prüfung gegen `HEAD` hält, weil die Agenten vor dem Commit prüfen. Ein Vergleich mit der
  Merge-Basis bräuchte `origin/main` im CI-Klon.
- B-33: Ein eigener Chrome-Build über `@puppeteer/browsers` wäre eine zweite ausgelieferte
  Abhängigkeit. Dass die Messung zwischen Builds abweicht, ist nicht gemessen.
- B-34, Rest: Die Layout-Box des Lockups und die Hex-Werte in den Generatoren liegen in nicht
  ausgelieferten Generatoren. Ein `brand-colours.json` für brand selbst bleibt eine Idee.
- B-35, Rest: Inter 500 im Hintergrund-Generator, Fehler im CDP-Client und die Merch-Dateien ändern
  gerenderte Bilder. Jeder Fix braucht ein neues Rendern und ein Review dieser Bilder.
- B-36: Vereinfachungen ohne Fehlerbild. `/simplify` lief über den eigenen Diff.
- B-37: Keine Schwachstelle. Der statische Server liefert nur den eigenen Build auf 127.0.0.1, und
  `data-source` setzt der Autor. Ob der Hub `voice/negotiation.md` in öffentliche Repositories
  spiegelt, entscheidet Benedikt.
- B-38, `goal.md`: Das Ziel nennt, was gelten soll, nicht den Stand. `verbal.source` gehört dem Hub.
- B-39: Die Pressefotos gehören laut `CLAUDE.md` ins Paket. Der Portal-Build läuft zweimal, kostet
  aber unter 4 s.
- B-10, Rest: Eine Ausnahme, die auf keine Seite des Laufs passt, heißt nicht veraltet, weil ein Lauf
  nur einen Teil der Seiten messen kann. `data-hw-shell` bleibt Sache des Katalog-Shells.
- Adresszeile in `imprint.json`: Sie würde Straße, Postleitzahl und Ort ein zweites Mal halten. Ein
  Konsument fügt sie in einer Zeile zusammen.

### Was die Konsumenten beim Anheben auf 2.13.0 sehen

Keine Prüfung wird für einen Konsumenten strenger: Der neue Exit 2 von `brand-elements` trifft
niemanden, denn admin setzt `site`, und os und der Trainer-Hub führen die Prüfung nicht aus.
`brand-colours` zählt weniger als 2.12.0. Das Code-Review fand Fehlzählungen, die jetzt entfallen:
`Inter !important`, `font-family: 'Inter'` in einem `style`-Attribut, `url(#fade)`, Selektoren wie
`#feed`, Buchstaben-Hex in Fließtext, Komponenten-Props (`color="purple"`), Typ-Unionen, eine
Variable nach `color=` in Python, ein Apostroph in HTML vor einem Kommentar in `<style>` und
Frontmatter mit CRLF. Die Zahl der Abweichungen vom eigenen `brand-colours.json`, gemessen auf
`origin/main` vom 10.11. ohne Pin-Änderung, mit dem Scanner von 2.12.0 und dem von 2.13.0:

| Konsument                                                                    | 2.12.0 | 2.13.0 |
| ---------------------------------------------------------------------------- | ------ | ------ |
| os                                                                           | 283    | 282    |
| website                                                                      | 23     | 23     |
| documents, slides                                                            | je 1   | je 1   |
| talks                                                                        | 1      | 0      |
| admin, certificate-verifier, hycle-private, mail, practitioners, trainer-hub | 0      | 0      |

`brand-markers` meldet weniger `off`-Lesungen als erlaubt nicht mehr als Fehler: Wie viele ein
Lauf liest, hängt an seinen Skalen und Seiten.
Sichtbar ändert sich:

- os: Utilities auf `.form-input` greifen (`min-h-24` macht das mehrzeilige Feld 96 px hoch);
  Elemente in einem Nachtband einer hellen Seite sind Nacht; die Listenmarke im Dunkelmodus ist
  Teal-Nacht.
- Trainer-Hub: `.form-input` zeigt im Layout mit `hw-focus-ring` den Brand-Ring; Inline-Code auf
  Folien in der App ist 0,875 em; die Listenmarke im Dunkelmodus ist Teal-Nacht.
- website: Die Listenmarke in Nachtbändern ist Teal-Nacht.
- slides und documents: Elemente in einem Nachtband nehmen Nacht statt der Tagesrollen von `:root`.

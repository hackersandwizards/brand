# Review-Befunde B-01 bis B-39: was geändert ist und was gemessen wurde

Ein Review las brand bei v2.11.0 ganz und schrieb 39 Befunde. Dieser Bericht hält fest, was
v2.12.0 davon behebt, was gemessen wurde und was offen bleibt. Gemessen ist alles in
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

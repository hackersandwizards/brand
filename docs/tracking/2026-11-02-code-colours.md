# Code colours: one highlighter and one palette for every code block and terminal

Benedikt, 02.11.: „kann man Shikis nicht so konfigurieren das es unsere brand colors nutzt? also
grauer code funktioniert nicht das ist keine option." Later the same day, as Ada relayed it: „Wir
sollten überall dort, wo wir Code und Terminals rendern, dann wahrscheinlich Shiki verwenden [...]
aber trotzdem überprüfen, welche Kombinatorik da dann die maximale Punktzahl erzeugt und minimal
weit entfernt ist von unseren Brand Colors und minimale weitere neue Ausnahmen erzeugt [...] wenn
es da ein Orange braucht, dann sollten wir das Orange nutzen, was wir haben."

## Ergebnis

- **Highlighter: Shiki überall.** Astro bringt Shiki für Markdown mit, slides rendert damit
  synchron, und Shikis `ansi`-Sprache färbt ein Terminal aus demselben Theme. Starry Night hat keine
  synchrone API und fällt für die Folien aus. Prism, highlight.js und Sugar High arbeiten mit Regex
  oder einem eigenen Lexer statt TextMate-Grammatiken.
- **Palette: die vorhandene `hw-code` (A) bleibt.** Sie braucht keine neue Farbe und gewann Runde 1
  mit 8,61 vor B mit 8,02, der Palette mit Amber und Factory-Light. C mit sechs neuen Farben
  erreichte 7,29, github-dark 6,12. In Runde 2 lagen A und zwei hellere Varianten aus vorhandenen
  Tokens im Rauschen (7,81 bis 8,00 bei Rauschen bis 0,5). Gleichstand geht an den Standard.
- **Ausgeliefert in v0.27.9 und v0.27.10:** `elements/code.ts` exportiert `codeClasses`, einen
  Shiki-Transformer. Er setzt jede Farbe aus `code-theme.json` als Klasse `hw-code-<rolle>`, die
  `elements/code.css` aus `--code-*` färbt, statt als Inline-Style. So überlebt die Farbe die
  Style-Regel von documents. Eine Farbe außerhalb der Palette bricht den Build ab, statt grau zu
  werden. `code-theme.json` trägt seit v0.27.10 die 16 ANSI-Farben des Terminals, jede eine
  Kernfarbe.
- **Keine neue Markenfarbe nötig**, deshalb keine offene Frage an Benedikt.

## Bestand

Jede Codefläche nutzt heute Shikis github-dark, jede mit ihrer eigenen Anhebung der Kommentarfarbe.
Prism, highlight.js oder eine ANSI-Tabelle gibt es nirgends.

| Fläche                         | Datei                                             | Highlighter                                    | Farben                                              |
| ------------------------------ | ------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| Website, Markdown              | website `astro.config.mjs`                        | Shiki github-dark, Build                       | github-dark, Kommentar `#959da5`                    |
| Trainer Hub, Markdown, Handout | trainer-hub `astro.config.ts`                     | Shiki github-dark, SSR                         | github-dark, Kommentar night-subtle                 |
| os, Markdown                   | os `src/lib/markdown.ts`                          | Shiki github-dark, SSR                         | wie Trainer Hub                                     |
| os, PDF aus Markdown           | os `src/lib/render-pdf.ts` (pandoc)               | keiner                                         | `hw-code` einfarbig night-ink auf night             |
| Folien, Codeblock              | slides `lib/code-highlight.tsx`                   | Shiki core github-dark, im Browser nachgeladen | github-dark, Grund `#24292e`, im Dark-Theme night-2 |
| Folien, Terminal-Block         | slides `ContentSlide.tsx`                         | handgesetzt                                    | Prompt `#85e89d`, Pfeil Amber                       |
| Folien, PPTX                   | slides `scripts/render-pptx.ts`                   | keiner                                         | `#24292e`, `#e1e4e8`, Prompt `#85e89d`              |
| talks                          | über die slides-Engine                            | wie Folien                                     | wie Folien                                          |
| LinkedIn-Terminal              | brand `applications/linkedin-visuals/terminal.ts` | handgesetzte Tags                              | `--code-*`                                          |
| documents                      | documents `document.css`, `elements.ts`           | keiner, Klassen aus dem Aufrufer               | `hw-code`, Prompt green                             |

Der Shell-Prompt hat drei Farben: `#85e89d` in den Folien und der PPTX, green in documents und in
`--code-inserted`.

## Kandidaten

Alle mit den Scopes von github-dark, nur die Farben getauscht. Gezählt sind die Farben im Code und
im Terminal. Abstand ist CIEDE2000 zur nächsten Kernfarbe, unter 0,5 gilt als Kernfarbe.

| Kandidat          | Schlüsselwort | Konstante    | Funktion, Typ | String     | Variable      | Kommentar    | Neue Farben | Größter Abstand | Kleinster Kontrast auf night |
| ----------------- | ------------- | ------------ | ------------- | ---------- | ------------- | ------------ | ----------- | --------------- | ---------------------------- |
| **A** (`hw-code`) | purple-night  | purple-night | night-ink     | teal-night | night-ink     | night-subtle | 0           | 0               | 6,32                         |
| B                 | purple-night  | amber        | teal-light    | teal-night | factory-light | night-subtle | 0           | 0               | 6,32                         |
| C                 | `#c89bff`     | amber        | `#82aaff`     | `#5fd0e0`  | factory-light | `#8b95a7`    | 6           | 17,0 (Blau)     | 6,28                         |
| D (github-dark)   | `#f97583`     | `#79b8ff`    | `#b392f0`     | `#9ecbff`  | `#ffab70`     | night-subtle | 20          | 22,8 (Gelb)     | 2,30 (ANSI-Schwarz)          |

Terminal in A und B: Schwarz night-subtle, Rot red-night, Grün green, Gelb amber, Blau teal-night,
Magenta purple-night, Cyan teal-light, Weiß night-muted. Die hellen Stufen nehmen factory-light,
teal-light, purple-light und night-ink, sonst dieselbe Farbe.

Eine helle Variante aus Kernfarben (purple, teal, muted, green-dark, red, amber-dark, factory) hält
4,5:1 nur auf Weiß, auf tint fallen green-dark, amber-dark und red auf 4,26 bis 4,43. Keine Fläche
zeigt heute hellen Code. Sie ist deshalb nicht gebaut und nicht bewertet.

## Panel

Gerendert auf den echten Seiten des Trainer Hubs (eigener Build, documents v0.3.1, brand v0.27.9):
das gedruckte Handout des AE-FACTORY-Standards als PDF bei 150 dpi, ein Wissensartikel mit JSON und
Python auf 1440 px, die Folie „Hooks in practice" aus `workshop-factory-dev` und ein Terminalbild
im Fenster des LinkedIn-Terminals. Im Handout und im Artikel kam jeder Codeblock aus Shiki mit dem
Kandidaten-Theme. Auf der Folie wurde jede github-dark-Farbe auf die Rolle des Kandidaten umgefärbt.
Das Terminal ist eine Gate-Ausgabe in ANSI, gefärbt von Shikis `ansi`-Sprache.

Fünf Personas als ein Panel: Senior-Entwickler, Teilnehmer mit dem gedruckten Handout, Trainer im
Meet, Engineering-Lead auf dem Handy, Brand-Designer. Claude Opus und Codex gpt-6.1-sol je zweimal,
Etiketten und Reihenfolge je Lauf gemischt.

| Runde 1         | Lesbarkeit | Brand | Ruhe | Gesamt | Mittel   | Platz je Lauf (Claude, Claude, Codex, Codex) |
| --------------- | ---------- | ----- | ---- | ------ | -------- | -------------------------------------------- |
| **A**           | 7,70       | 9,12  | 9,05 | 8,55   | **8,61** | 1, 1, 1, 3                                   |
| B               | 8,05       | 8,12  | 8,07 | 7,83   | 8,02     | 2, 2, 2, 1                                   |
| C               | 8,45       | 6,62  | 7,00 | 7,10   | 7,29     | 3, 3, 3, 2                                   |
| D (github-dark) | 7,90       | 4,12  | 7,08 | 5,40   | 6,12     | 4, 4, 4, 4                                   |

Rauschen, Abstand der Mittel zweier Läufe desselben Modells: Claude 0 bis 0,75, Codex 0,18 bis
0,33. A führt vor B um 0,59.

Was unter 10 hält: bei A die Teal-Strings und das Purple, die auf Papier eine Stufe dunkler wirken
als der Text. Bei B das Amber, das als Akzent die Hauptfarbe wird. Bei C Cyan und Periwinkle wie in
einem Standard-Editor. Bei D der graue Grund und GitHubs Blau.

Runde 2 prüfte den häufigsten Einwand gegen A: Strings in teal-light (A2) und zusätzlich
Schlüsselwörter in purple-light (A3), beides Kernfarben.

| Runde 2 | Lesbarkeit | Brand | Ruhe | Gesamt | Mittel |
| ------- | ---------- | ----- | ---- | ------ | ------ |
| A       | 7,50       | 8,50  | 7,75 | 7,50   | 7,81   |
| A2      | 8,00       | 7,75  | 8,50 | 7,75   | 8,00   |
| A3      | 8,50       | 7,00  | 8,50 | 7,75   | 7,94   |

Rauschen: Claude 0,25 bis 0,5, Codex 0 bis 0,25. Alle drei liegen im Rauschen, A bleibt. Die
helleren Töne gewinnen Lesbarkeit und verlieren Marke: „almost white strings barely differ from
plain text".

Ein Reviewer-Prompt, wörtlich bis zur Dateiliste (Runde 1, Claude):

> You review syntax-highlighting colour palettes for hackers&wizards (h&w), a Hamburg consultancy
> for agentic engineering. Its brand: a teal (#1a7285) and a purple (#9333ea) on a light
> grey-white page, dark grounds in a deep night blue (#0b1118, #111a24), an amber (#f59e0b) and a
> brick orange (#a3402a) as accents, JetBrains Mono for code.
>
> Four palettes, labelled R, M, T, K, are each shown on the same real surfaces. Within one surface
> only the code colours differ. [...] Personas, score as a panel of all five: a senior developer
> reading the article and copying from the handout; a training participant reading the printed
> handout; a trainer projecting the slide in a remote training; an engineering leader scrolling
> LinkedIn on a phone; the brand designer responsible for h&w's visual consistency. Criteria, each
> 1 to 10 (10 best), judged across all surfaces: legibility, brand, calm, overall.

Nicht bewertet: Website und os (gleicher Astro-Weg wie der Hub), die PPTX-Ausgabe, die Folie im
Dark-Theme, die helle Variante und der Terminal-Block der Folien.

## Umstellung der Flächen

| Repo        | Stand                                                     | Umstellung                                                                                                                                                          |
| ----------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| documents   | v0.3.1                                                    | `DocElements` gibt einer Seite, die ein Aufrufer selbst rendert, die Brand-Elemente; das Handout nutzt es. Codefarben kommen als Klassen aus dem Aufrufer.          |
| trainer-hub | wartet auf den Push der laufenden Shared-Elements-Sitzung | `shikiConfig`: `theme` aus `code-theme.json`, `transformers: [codeClasses]`, Transformer `comment-contrast` und github-dark-Import entfallen; documents auf v0.3.1. |
| os          | offen                                                     | `src/lib/markdown.ts` wie der Hub; pandoc-PDFs bleiben einfarbig, bis os Code über Shiki statt pandoc färbt.                                                        |
| website     | offen                                                     | `astro.config.mjs` wie der Hub, `comment-contrast` entfällt. Push nur mit `[skip ci]`.                                                                              |
| slides      | offen                                                     | `lib/code-highlight.tsx` lädt `code-theme.json` und setzt die Klassen statt `style`; Terminal-Block und PPTX auf `--code-*`; Release, dann talks und Hub.           |
| brand       | v0.27.10                                                  | `terminal.ts` kann die Ausgabe über Shikis `ansi`-Sprache färben statt über handgesetzte Tags, sobald ein Post mehr als vier Farben braucht.                        |

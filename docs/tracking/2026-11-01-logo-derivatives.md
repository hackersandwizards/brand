# Logo-Derivate in `logos/`

Stand 01.11.2026, brand `5103287` (v0.25.3). Gelesen auf `origin/main` von website, os, trainer-hub, talks, slides,
documents, certificate-verifier und dem agent-config-Hub (`parallel-session/hub.ts`), ohne
`node_modules`, `dist`, gespiegelte `.claude/skills` und Lockfiles.

Anlass, Benedikt am 01.11.: „ist das die aufgabe vom brand repo hier render derivate zu halten? das
muss doch eigentlich dort passieren wo man sie braucht. die logo seite sollte doch nur die logos
definieren hier geht es ja nicht um die auslieferung. oder ist das fürs press kit?“

## Kurz

`lockup-screen.svg` ist nicht fürs Pressekit da. Gebraucht wird die Datei vom internen Header, den
brand selbst ausliefert (`expert/components/AppHeader.astro`, `expert/header.css`). Den Header tragen
sieben interne Flächen: OS, Trainer Hub, talks, Folien- und Dokument-Specimen, Entscheidungsseite
und der Brand-Katalog. Die website nimmt die Datei für ihren eigenen Header. Der Ort, an dem man die Datei braucht, ist also brand. Der Einwand stimmt aber
für die Logo-Seite: Sie zeigt den Screen-Schnitt als vierte Logo-Karte, obwohl er kein eigenes Logo
ist. Und sieben Dateien in `logos/` nutzt niemand, eine achte ist ein Duplikat.

## Was das Pressekit nimmt

Die Pressekit-ZIP der website (`src/copy/press.ts`, `PRESS_KIT_FILES`) liest aus dem Paket 16
Dateien: Lockup, kompaktes Lockup und Wortmarke, jeweils Tag und Night, dazu `wordmark-white` und
`wordmark-black`, jedes als SVG und PNG. Die website liefert sie unter `/logos/hw-<datei>` aus.
`structured-data.ts` nennt zusätzlich `hw-lockup.png` als Organisations-Logo.

Nicht im Pressekit: der Screen-Schnitt, die Outline-Schnitte, das Favicon-Set, `avatar-512`,
`type-logo-*`, `emoji-logo-*`. brand `press/` enthält nur die drei Fotos und `press.json`, kein Logo.

## Master und Derivat

Master: ein Logo-Schnitt, den jemand gestaltet. Derivat: eine Ausgabe eines Masters für einen
Liefer-Zweck (Rastergröße, Dateigewicht, Format, Icon-Set). Alle Dateien in `logos/`, sonst liefert
brand keine Logo-Derivate aus.

| Datei                                                                                             | Art                                                              | Im Paket |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| `lockup.svg`, `-night.svg`, `-outline.svg`                                                        | Master                                                           | ja       |
| `lockup-compact.svg`, `-night.svg`, `-outline.svg`                                                | Master                                                           | ja       |
| `wordmark.svg`, `-night`, `-outline`, `-white`, `-black` (SVG)                                    | Master                                                           | ja       |
| `type-logo-short.svg`                                                                             | Master des hw-Zeichens, Quelle für Favicons und Avatare          | ja       |
| `emoji-logo-short.png` (4096 px, LFS)                                                             | Master: Wizard mit hw, Quelle für Hintergründe und Merch         | nein     |
| `type-logo-long.svg`                                                                              | Master, ehemalige zweizeilige Wortmarke                          | ja       |
| `emoji-logo-long.png` (4096 px, LFS)                                                              | Master, Wizard mit der ehemaligen zweizeiligen Wortmarke         | nein     |
| `lockup-screen.svg`, `lockup-screen-night.svg`                                                    | Derivat: Dateigewicht (Wizard-Raster 128 statt 512 px, 15/22 KB) | ja       |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192/512.png`, `icon-maskable-512.png` | Derivat: Icon-Set aus `type-logo-short.svg`                      | ja       |
| `avatar-512.png`                                                                                  | Derivat: quadratischer Avatar                                    | ja       |
| `lockup*.png`, `wordmark*.png` (11 Dateien)                                                       | Derivat: Raster der SVG-Master für Werkzeuge ohne SVG            | ja       |
| `type-logo-long.png`, `type-logo-short.png`                                                       | Derivat: Raster der ehemaligen Wortmarke und des hw              | ja       |
| `emoji-logo-short-cmyk.tif`, `emoji-logo-long-cmyk.tif` (85 MB, LFS)                              | Derivat: CMYK-Druckformat                                        | nein     |

Erzeugt werden die Derivate von drei Skripten: `scripts/outline.ts` (Schnitte, ihre PNGs, der
Screen-Schnitt), `scripts/ampersand.ts` (PNGs der einzeiligen Logos) und
`applications/avatars/generate.ts` (Favicon-Set, `avatar-512`). Die TIFs hat kein Skript erzeugt.

## Wer welches Derivat nutzt

Gezählt sind Repos, die die Datei im Code oder Build verwenden. Erwähnungen in `docs/tracking` und
Memory zählen nicht.

| Derivat                                                          | Nutzer                                                                | Wie                                                                                                                                                                                                       | Anzahl |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `lockup-screen.svg`                                              | website, talks, slides, documents, os, trainer-hub, Hub; brand selbst | website Import (`Brand.astro`); talks `postinstall`-Kopie; slides und documents Pfad in `node_modules` (Specimen); os und trainer-hub über brands `AppHeader.astro`; Hub `Bun.resolveSync`; brand Katalog | 7      |
| `lockup-screen-night.svg`                                        | talks, slides, documents, os, trainer-hub, Hub; brand selbst          | wie oben, website hat kein Dark Theme                                                                                                                                                                     | 6      |
| `favicon.svg`, `favicon.ico`                                     | website, os, trainer-hub, talks, slides, documents; brand selbst      | website Route; os, trainer-hub Import; talks Kopie; slides, documents Pfad und Pages-Kopie; brand Katalog                                                                                                 | 6      |
| `apple-touch-icon.png`                                           | website, os, trainer-hub, talks                                       | Route, Import, Kopie                                                                                                                                                                                      | 4      |
| `lockup.png`                                                     | website, talks, documents                                             | Pressekit und Structured Data; `export-pptx.py`; Test-Fixture in `render-pdf.test.ts`                                                                                                                     | 3      |
| `wordmark.png`                                                   | website, talks                                                        | Pressekit; `export-pptx.py`                                                                                                                                                                               | 2      |
| `lockup-night.png`                                               | website; brand `channel-banners/render.py`                            | Pressekit; brand intern über den Repo-Pfad                                                                                                                                                                | 1      |
| `lockup-compact.png`, `lockup-compact-night.png`                 | website                                                               | Pressekit                                                                                                                                                                                                 | 1      |
| `wordmark-night.png`, `wordmark-white.png`, `wordmark-black.png` | website                                                               | Pressekit                                                                                                                                                                                                 | 1      |
| `lockup-outline.png`                                             | talks                                                                 | `export-pptx.py`, Titelfolie                                                                                                                                                                              | 1      |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`          | website                                                               | Route für `manifest.webmanifest`                                                                                                                                                                          | 1      |
| `avatar-512.png`                                                 | os                                                                    | Tally-Upload (`tally-attendee-survey.ts`)                                                                                                                                                                 | 1      |
| `lockup-compact-outline.png`, `wordmark-outline.png`             | niemand                                                               | –                                                                                                                                                                                                         | 0      |
| `type-logo-long.png`, `type-logo-short.png`                      | niemand                                                               | –                                                                                                                                                                                                         | 0      |
| `emoji-logo-short-cmyk.tif`, `emoji-logo-long-cmyk.tif`          | kein Code                                                             | Druckdateien von Hand; ob eine Druckerei sie gerade braucht, steht nirgends                                                                                                                               | 0      |

Ohne Nutzer sind auch die Master `type-logo-long.svg` und `emoji-logo-long.png`: Sie zeigen die
ehemalige zweizeilige Wortmarke.

Drei Funde nebenbei:

- `avatar-512.png` und `icon-maskable-512.png` sind Pixel für Pixel gleich (1.048.576 Bytes RGBA,
  0 Abweichungen), nur anders komprimiert.
- Der Katalog sagt über seine Tabelle „Which logo where“, sie gebe die Logo-Tabelle des Design Guides
  wieder. Die Zeile „A screen header up to 40 px tall … lockup-screen“ steht im Design Guide nicht.
- certificate-verifier nutzt kein Logo-Derivat aus dem Paket: Sein `favicon-32.png` und
  `apple-touch-icon.png` sind eigene Dateien (anderer Hash als brands), sein Lockup kopiert
  `postinstall` aus `lockup.svg`.

## Vorschlag

Empfohlen ist **A, aufräumen und auf der Seite trennen**.

1. **Bleiben als Master** in `logos/`: die elf SVG-Schnitte, `type-logo-short.svg`,
   `emoji-logo-short.png` und `emoji-logo-short-cmyk.tif` als Druckdatei.
2. **Bleiben als Lieferdatei in brand**, mit Grund:
   - `lockup-screen(-night).svg`: brands eigener Header braucht sie, sieben Repos nutzen sie. Beim
     Nutzer erzeugt, liefe dieselbe Umkodierung (20 Zeilen in `outline.ts`) in sieben Builds, und
     `AppHeader.astro` könnte die Datei gar nicht importieren.
   - Favicon-Set: sechs Nutzer, README legt fest „never a file of its own“. `icon-192/512` und
     `icon-maskable-512` hat nur die website. Sie entstehen aber mit derselben Geometrie wie
     `apple-touch-icon` (hw auf 62,5 %, Ecke). Rendert die website sie selbst, kopiert sie diese
     Geometrie, und eine kopierte Brand-Tatsache verbietet `coupling.md`.
   - Die neun PNGs der Pressekit-Logos und `lockup-outline.png`: drei Nutzer (website, talks,
     documents) plus die PNG-Downloads im Katalog. README verspricht sie für Werkzeuge ohne SVG.
3. **Gehen**, kein Nutzer: `type-logo-long.svg`, `type-logo-long.png`, `type-logo-short.png`,
   `wordmark-outline.png`, `lockup-compact-outline.png`, `emoji-logo-long.png`,
   `emoji-logo-long-cmyk.tif`. Dazu `avatar-512.png` als Duplikat: os lädt für Tally
   `icon-maskable-512.png` hoch.
4. **Logo-Seite:** Der Abschnitt „Logos“ zeigt nur die drei Master (Lockup, kompaktes Lockup,
   Wortmarke) mit ihren SVG-Schnitten und die Tabelle des Design Guides ohne die Screen-Zeile. Ein
   eigener Abschnitt „Lieferdateien“ listet Screen-Schnitt, Favicon-Set und PNGs: Datei, Zweck,
   welches Werkzeug sie braucht. Die PNG-Links wandern von den Logo-Karten dorthin.

Kosten A:

| Repo   | Dateien                                                                                                                                                                                                                                                                                                                                                       | Gate                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| brand  | 8 Dateien gelöscht; `manifest.json`, `package.json` (`files`), `README.md`, `CLAUDE.md` (Druckmaster), `.gitattributes`, `.lfsconfig`, `scripts/outline.ts` (keine PNGs der zwei Outline-Schnitte), `applications/avatars/generate.ts`, `scripts/catalogue.ts`, `catalogue.html`, `test/catalogue.test.ts` (Zählung „Three logos“): rund 12 geänderte Dateien | `bun run check`: Manifest-, Paket- und Katalog-Test. Release als Minor, der Commit nennt das entfernte Export-Ziel `logos/avatar-512.png` |
| os     | `src/lib/tally-attendee-survey.ts`, sein Test, Pin in `package.json` und `bun.lock`                                                                                                                                                                                                                                                                           | Tally-Test                                                                                                                                |
| übrige | nichts                                                                                                                                                                                                                                                                                                                                                        | keins                                                                                                                                     |

Das Paket wird 365 KB leichter (die fünf Raster ohne Nutzer und `avatar-512`), das LFS-Repo um 95 MB.

**B, strikt: alle PNGs gehen zum Nutzer.** Zusätzlich zu A verlassen die übrigen neun PNGs brand. Die
website rendert ihre acht Pressekit-PNGs beim Build mit sharp (schon Abhängigkeit, 0.35.5 wie in
brand), talks rendert vor dem PPTX-Export drei PNGs, documents tauscht sein Test-Fixture, brands
`channel-banners/render.py` rendert aus dem SVG. Kosten zusätzlich: brand rund 6 Dateien
(`outline.ts`, `ampersand.ts` ohne PNG-Ausgabe, `render.py`, README, Manifest, Katalog), website 2
(`src/lib/brand-file.ts`, Pressekit-Test), talks 2 (`export-pptx.py`, ein Render-Schritt mit eigener
Abhängigkeit), documents 1. Vier Repos ziehen den Pin nach. Das Paket wird weitere 755 KB leichter.
Der Katalog bietet dann nur SVG an; wer ein PNG braucht, nimmt die Pressekit-ZIP. Dagegen spricht:
Zwei Repos bauen dieselbe Rasterung nach, und die PNG-Größen (`png: 2416` usw. in `press.ts`)
pflegt dann die website statt brand.

**C, nur die Seite trennen.** Punkt 4 allein, alle Dateien bleiben. Kosten: `catalogue.ts`,
`catalogue.html`, `catalogue.test.ts`.

Warum A und nicht B: B setzt Benedikts Regel wörtlich um, kostet aber vier Repos für 755 KB, die
nur Installationen tragen. Die PNG ist für Werkzeuge ohne SVG das Lieferformat des Logos selbst, und
sie hat mehr als einen Nutzer. A entfernt, was niemand nutzt, und macht auf der Seite sichtbar, was
Definition und was Lieferung ist.

## Annahmen

- Die CMYK-TIF des kurzen Emoji-Logos bleibt, weil kein Repo belegt, dass sie keine Druckerei mehr
  braucht. Sie liegt in LFS und kostet keine Installation.
- Menschen laden PNGs aus dem Katalog; das ist nicht messbar und zählt in der Tabelle nicht mit.
- Der Pfad `logos/lockup-screen.svg` bleibt. Ein Umzug nach `expert/` passte zum Header, bräche aber
  sechs Repos und den Hub für eine Ordnerfrage.

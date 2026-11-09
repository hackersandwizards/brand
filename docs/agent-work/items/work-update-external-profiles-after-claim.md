---
kind: work
status: open
priority: 1
order: 40
area: brand
owner: Benedikt
evidence: "Files: applications/channel-banners/ (rendered 08.11. from the u1 claim in brand v1.57.0; the images are unchanged through v2.1.0, whose 81d1717 touched only render.py). Texts blind-reviewed in context: docs/agent-work/2026-11-08-claim-rollout-holistic.md. Request: Benedikt, 08.11.: „Gleiches gilt ja für die externen Profile, ne? Wir müssen, sobald wir den Claim und die ja, müssen wir auch nochmal alle externen Profile, auch OMR, nochmal aktualisieren. Das sollten wir auch auf die Liste für später tun. p1“"
---

# Upload the new banners and replace the old claim on every external profile

Hold until `decide-claim-tune` is decided: it may change the claim, which re-renders the banners and redoes these texts with the same review. On `u1-tune` (keep), the upload and the texts below go ahead as written.

The claim changed to "Agents pay off when your people ship together." / "KI-Agenten lohnen sich,
wenn eure Leute gemeinsam liefern." (brand v1.56.0). The files are in
`applications/channel-banners/` in this repository; only your logins reach the profiles. Done when
every row below is uploaded or changed and no profile shows "Agents in the team. Teams in flow." or
"Agenten im Team. Teams im Flow.".

The texts around the claim were rewritten and scored blind on the page a visitor sees, against the
current text and against the current text with the claim pasted on top
([report](../2026-11-08-claim-rollout-holistic.md)). Pasting the claim scored lowest or near lowest
everywhere, so do not paste it: enter the texts below.

| Profile                | Upload                                                                                                                      | Text fields                                                                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| LinkedIn, your profile | Banner slide 1: `profile-banner-1-claim-1584x396.png`. Slide 2 (`profile-banner-2-clients-1584x396.png`) stays as it is.    | Headline and About below. Featured link title: "Agents pay off when your people ship together." (47 characters); its image carries no claim and stays. |
| LinkedIn, company page | Nothing: the cover carries no claim.                                                                                        | Tagline and About below, English and German.                                                                                                           |
| XING                   | `xing-profile-cover-1312x639.png`: the lockup and claim now sit right of your photo, clear of it on a phone and on desktop. | Not read (the logged-out page shows no text field with the claim): replace the old claim wherever it stands.                                           |
| X                      | `x-profile-header-1500x500.png`                                                                                             | Bio not read (x.com needs a login): replace the old claim if it stands there.                                                                          |
| YouTube                | `youtube-channel-banner-2560x1440.png`                                                                                      | Channel description not read: replace the old claim if it stands there.                                                                                |
| Sessionize             | `sessionize-profile-cover-2000x500.png`                                                                                     | Tagline and bio below, English and German (the German fields stood empty on the live page on 08.11.).                                                  |
| Brella                 | `brella-profile-cover-2000x800.png`                                                                                         | Not read.                                                                                                                                              |
| Facebook               | `facebook-profile-cover-2000x740.png`                                                                                       | Not read.                                                                                                                                              |
| OMR Reviews            | Nothing: `omr-reviews-cover-1920x1080.png` carries no claim and did not change.                                             | Not read: replace the old claim if the profile text holds it.                                                                                          |

The descriptor under the claim on every banner reads "Training and mentoring in agentic
engineering". Stefan's LinkedIn banner: if it shows slide 1, it takes the same file. The practitioners
bio changes in that repository, from the report's brief, not here.

## LinkedIn, your profile

Seen in place: [English](../2026-11-08-claim-rollout-holistic/profile-en-new.jpg),
[German](../2026-11-08-claim-rollout-holistic/profile-de-new.jpg).

Headline: the offer stays first; the banner above it already says the claim, and repeating it scored
lower. English and German profile, each language's field, unchanged if it already reads like this.
The English headline could not be read live (LinkedIn blocks the read; the 31.10. record says only
you could save it), so overwrite whatever stands there.

```text
Founder & Co-CEO, hackers&wizards | AI training and mentoring in agentic engineering for engineering and product teams | Co-author, Building the Agentic Software Factory (Packt) | Program chair, code.talks
```

```text
Founder & Co-CEO, hackers&wizards | KI-Schulungen und Mentoring in Agentic Engineering für Engineering- und Produktteams | Co-Autor, Building the Agentic Software Factory (Packt) | Programmleitung code.talks
```

About: only the third paragraph changes, in both languages. The first paragraph stays the offer.

**About, English, third paragraph**

Old:

```text
In flow, a customer's request reaches production without waiting on handoffs, reviews and approvals that kept their old pace. You see it in less time from request to production and a lower cost per shipped change, measured against a baseline we take with you at the start.
```

New:

```text
Shipping together means a customer's request reaches production without waiting on handoffs, reviews and approvals that kept their old pace. Then every role is in tune with the others and the whole team is in flow. You see it in less time from request to production and a lower cost per shipped change, measured against a baseline we take with you at the start.
```

**About, German, third paragraph**

Old:

```text
Im Flow kommt eine Kundenanfrage bis in Produktion, ohne an Übergaben, Reviews und Freigaben hängen zu bleiben, die noch im alten Tempo laufen. Das zeigt sich in kürzerer Durchlaufzeit und niedrigeren Kosten pro ausgelieferter Änderung, gemessen an einer Baseline, die wir zu Beginn mit euch erheben.
```

New:

```text
Gemeinsam liefern heißt: Eine Kundenanfrage kommt bis in Produktion, ohne an Übergaben, Reviews und Freigaben hängen zu bleiben, die noch im alten Tempo laufen. Dann sind alle Rollen aufeinander eingespielt und das ganze Team ist im Flow. Das zeigt sich in kürzerer Durchlaufzeit und niedrigeren Kosten pro ausgelieferter Änderung, gemessen an einer Baseline, die wir zu Beginn mit euch erheben.
```

## LinkedIn, company page

Seen in place: [English](../2026-11-08-claim-rollout-holistic/company-en-new.jpg),
[German](../2026-11-08-claim-rollout-holistic/company-de-new.jpg).

**Tagline, English**

Old:

```text
AI training and mentoring in agentic engineering for engineering and product teams. Remote or on site.
```

New:

```text
AI training and mentoring in agentic engineering, so engineering and product teams ship together.
```

**Tagline, German (Languages tab)**

Old:

```text
KI-Schulungen und Mentoring in Agentic Engineering für Engineering- und Produktteams. Remote oder vor Ort.
```

New:

```text
KI-Schulungen und Mentoring in Agentic Engineering, damit Engineering- und Produktteams gemeinsam liefern.
```

**About, English**

Old:

```text
We run AI training and mentoring in agentic engineering for engineering and product teams, their leaders, and everyone who works around them, so the speed agents bring to the code reaches the customer.

Most companies we meet have rolled out coding agents. The releases come no faster: the gains stay with a few people, the token bill grows, and product, review and approvals do not speed up with them.

A team in flow takes a customer's request to production without waiting on handoffs that kept their old pace. You see it in less time from request to production and a lower cost per shipped change, measured against a baseline we take with you at the start. Afterwards your own people carry on by themselves and keep their craft.

The way there:

- Seven team trainings of one or two days, designed to work together, on your own code and in the coding agent your team already uses.
- Mentoring on call after every two-day training, inside your refinement, planning, review and retro.
- An assessment first where you need a verdict before you spend.

Our trainers come from a network of 70+ practitioners. We have built large software systems for more than 20 years and have worked with agents since the first agentic coding tools at the end of 2022.

Founded in Hamburg by Benedikt Stemmildt and Stefan Munz, both Founder & Co-CEO. Benedikt chairs the program of code.talks and co-wrote Building the Agentic Software Factory with Alex Merced (Packt, November 2026).
```

New:

```text
Most companies we meet have rolled out coding agents, and the releases come no faster. Agents pay off when your people ship together, so we run AI training and mentoring in agentic engineering for engineering and product teams, their leaders, and everyone who works around them.

Today the gains stay with a few people, the token bill grows, and product, review and approvals do not speed up with them. Shipping together means a customer's request reaches production without waiting on handoffs that kept their old pace: every role in tune with the others, the whole team in flow. You see it in less time from request to production and a lower cost per shipped change, measured against a baseline we take with you at the start. Afterwards your own people carry on by themselves and keep their craft.

The way there:

- Seven team trainings of one or two days, designed to work together, on your own code and in the coding agent your team already uses.
- Mentoring on call after every two-day training, inside your refinement, planning, review and retro.
- An assessment first where you need a verdict before you spend.

Our trainers come from a network of 70+ practitioners. We have built large software systems for more than 20 years and have worked with agents since the first agentic coding tools at the end of 2022.

Founded in Hamburg by Benedikt Stemmildt and Stefan Munz, both Founder & Co-CEO. Benedikt chairs the program of code.talks and co-wrote Building the Agentic Software Factory with Alex Merced (Packt, November 2026).

Book a call: https://haw.dev/call
```

**About, German (Languages tab)**

Old:

```text
Wir geben KI-Schulungen und Mentoring in Agentic Engineering für Engineering- und Produktteams, ihre Führungskräfte und alle, die um sie herum arbeiten, damit das Tempo, das Agenten in den Code bringen, bei euren Kunden ankommt.

Die meisten Unternehmen, die wir treffen, haben Coding Agents eingeführt. Die Releases kommen trotzdem nicht schneller: Der Tempogewinn bleibt bei wenigen Leuten, die Token-Kosten steigen, und Produkt, Reviews und Freigaben bleiben so langsam wie vorher.

Ein Team im Flow bringt eine Kundenanfrage in Produktion, ohne an Übergaben hängen zu bleiben, die noch im alten Tempo laufen. Das zeigt sich in kürzerer Durchlaufzeit von der Kundenanfrage bis in Produktion und niedrigeren Kosten pro ausgelieferter Änderung, gemessen an einer Baseline, die wir zu Beginn mit euch erheben. Danach arbeiten eure eigenen Leute selbst so weiter und behalten ihr Handwerk.

So sieht der Weg aus:

- Sieben Teamschulungen von ein oder zwei Tagen, aufeinander abgestimmt, am eigenen Code und in dem Agenten, den euer Team schon nutzt.
- Mentoring auf Abruf nach jeder zweitägigen Schulung, mitten in Refinement, Planning, Review und Retro.
- Zuerst ein Assessment, wo ihr eine Einschätzung braucht, bevor ihr Geld ausgebt.

Unsere Trainer:innen kommen aus einem Netzwerk von mehr als 70 Praktiker:innen. Wir bauen seit mehr als 20 Jahren große Softwaresysteme und arbeiten mit Agenten seit den ersten Agentic-Coding-Tools Ende 2022.

Gegründet in Hamburg von Benedikt Stemmildt und Stefan Munz, beide Founder & Co-CEO. Benedikt leitet das Programm der code.talks und hat mit Alex Merced das Buch "Building the Agentic Software Factory" geschrieben (Packt, November 2026).
```

New:

```text
Die meisten Unternehmen, die wir treffen, haben Coding Agents eingeführt, und die Releases kommen nicht schneller. KI-Agenten lohnen sich, wenn eure Leute gemeinsam liefern. Darum geben wir KI-Schulungen und Mentoring in Agentic Engineering für Engineering- und Produktteams, ihre Führungskräfte und alle, die um sie herum arbeiten.

Heute bleibt der Tempogewinn bei wenigen Leuten, die Token-Kosten steigen, und Produkt, Reviews und Freigaben bleiben so langsam wie vorher. Gemeinsam liefern heißt: Eine Kundenanfrage kommt in Produktion, ohne an Übergaben hängen zu bleiben, die noch im alten Tempo laufen. Alle Rollen sind aufeinander eingespielt, das ganze Team ist im Flow. Das zeigt sich in kürzerer Durchlaufzeit von der Kundenanfrage bis in Produktion und niedrigeren Kosten pro ausgelieferter Änderung, gemessen an einer Baseline, die wir zu Beginn mit euch erheben. Danach arbeiten eure eigenen Leute selbst so weiter und behalten ihr Handwerk.

So sieht der Weg aus:

- Sieben Teamschulungen von ein oder zwei Tagen, aufeinander abgestimmt, am eigenen Code und in dem Agenten, den euer Team schon nutzt.
- Mentoring auf Abruf nach jeder zweitägigen Schulung, mitten in Refinement, Planning, Review und Retro.
- Zuerst ein Assessment, wo ihr eine Einschätzung braucht, bevor ihr Geld ausgebt.

Unsere Trainer:innen kommen aus einem Netzwerk von mehr als 70 Praktiker:innen. Wir bauen seit mehr als 20 Jahren große Softwaresysteme und arbeiten mit Agenten seit den ersten Agentic-Coding-Tools Ende 2022.

Gegründet in Hamburg von Benedikt Stemmildt und Stefan Munz, beide Founder & Co-CEO. Benedikt leitet das Programm der code.talks und hat mit Alex Merced das Buch "Building the Agentic Software Factory" geschrieben (Packt, November 2026).

Gespräch buchen: https://haw.dev/call
```

## Sessionize

Seen in place: [English](../2026-11-08-claim-rollout-holistic/sessionize-en-new.jpg),
[German](../2026-11-08-claim-rollout-holistic/sessionize-de-new.jpg).

**Tagline, English**

Old:

```text
Founder & Co-CEO, hackers&wizards | Agentic engineering | Co-author, Building the Agentic Software Factory (Packt) | Program chair code.talks
```

New:

```text
Gets whole teams shipping together with agents. Founder & Co-CEO of hackers&wizards, co-author of Building the Agentic Software Factory.
```

**Bio, English**

Old:

```text
Benedikt Stemmildt is Founder & Co-CEO of hackers&wizards in Hamburg, which brings engineering teams into flow with agentic engineering. He co-wrote Building the Agentic Software Factory with Alex Merced (Packt), hosts the Rethink Engineering podcast and chairs the program of code.talks. Before that he worked as engineer, architect and CIO at OTTO, Breuninger and BLUME2000. On stage he talks about moving teams from vibe coding to agentic engineering, architecture when AI writes more code, and developer experience as strategy.
```

New:

```text
Benedikt Stemmildt is Founder & Co-CEO of hackers&wizards in Hamburg, which trains and mentors engineering and product teams in agentic engineering. He co-wrote Building the Agentic Software Factory with Alex Merced (Packt), hosts the Rethink Engineering podcast and chairs the program of code.talks. Before that he worked as engineer, architect and CIO at OTTO, Breuninger and BLUME2000. On stage he talks about moving teams from vibe coding to agentic engineering, architecture when AI writes more code, and developer experience as strategy.
```

**Tagline, German** (empty on the live page today)

```text
Bringt ganze Teams dazu, mit KI-Agenten gemeinsam zu liefern. Founder & Co-CEO von hackers&wizards, Co-Autor von Building the Agentic Software Factory.
```

**Bio, German** (empty on the live page today)

```text
Benedikt Stemmildt ist Founder & Co-CEO von hackers&wizards in Hamburg, das Engineering- und Produktteams in Agentic Engineering schult und mit Mentoring begleitet. Mit Alex Merced schrieb er Building the Agentic Software Factory (Packt), er moderiert den Podcast Rethink Engineering und leitet das Programm der code.talks. Davor arbeitete er als Engineer, Architekt und CIO bei OTTO, Breuninger und BLUME2000. Auf der Bühne spricht er darüber, wie Teams von Vibe Coding zu Agentic Engineering kommen, über Architektur, wenn AI mehr Code schreibt, und über Developer Experience als Strategie.
```

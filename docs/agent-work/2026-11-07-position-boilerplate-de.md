# German position and boilerplate, EN position, 07.11.2026

Brand v1.18.0 carries `position.de`, `boilerplate.de` and a new `position.en`. `boilerplate.en`
stays. Every text renders the English facts of v1.17.0. None adds a fact, and the German texts
follow the voice skill: `Coding Agents`, `Lead Time` and `Agentic Engineering` stay English.

| Field            | Text                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `position.en`    | We help CIOs and CTOs whose developers have coding agents and whose releases come no faster. We train their engineering and product teams in agentic engineering until every role works in tune with the others. That way the speed their teams gain reaches their customers, shows in lead time and in the cost of every shipped change, and stays with their own people.                                   |
| `position.de`    | Wir helfen CIOs und CTOs, deren Entwicklerteams mit Coding Agents arbeiten, ohne dass die Releases schneller kommen. Wir schulen ihre Engineering- und Produktteams in Agentic Engineering, bis alle Rollen eingespielt zusammenarbeiten. So kommt das gewonnene Tempo bei ihren Kunden an, zeigt sich in der Lead Time und in den Kosten jeder ausgelieferten Änderung und bleibt bei ihren eigenen Leuten. |
| `boilerplate.de` | hackers&wizards trainiert Engineering- und Produktteams in Agentic Engineering, bis alle Rollen eingespielt zusammenarbeiten. So kommt das Tempo, das die Teams gewinnen, bei ihren Kunden an.                                                                                                                                                                                                               |

## Method

- Medium: plain text on a screen. The position opens a proposal's "about us" section and a
  company profile on a conference or partner page. The boilerplate opens the press page's company
  paragraph, with the paragraph's next sentence shown after it, and is the line journalists and
  programmes copy.
- Personas: the CTO of a German Mittelstand manufacturer whose board asks why releases are not
  faster, a German technology journalist writing about AI in software engineering, and the
  programme editor of a German-language software engineering conference.
- Criteria, fixed before the first score: accuracy against the English text (for EN: against a
  list of the facts), clarity on one read, voice (plain, specific, idiomatic), each 0 to 10, and an
  overall score from 0 to 100.
- Reviewers: Claude (`claude -p --model opus`) and Codex (`gpt-6.1-sol`, high), each persona run
  twice per model, 12 scorings per text and round. Every prompt had its own shuffled order under
  neutral labels. No prompt said which text was current, which came from the website or who wrote
  any of them.
- Noise: the mean difference between two runs of the same reviewer, 3.2 per reviewer and 1.0 on
  the panel mean in round 1, 3.1 and 1.1 in round 2. The tables compare panel means.
- Round 2 tested fixes for the reasons the reviewers gave in round 1, with round 1's leaders as
  controls. Their most frequent reasons: "bei den Kunden" leaves open whose customers, with the
  next sentence using "Kunden" for h&w's own clients; "das gewonnene Tempo" drops who gains it; a
  sentence opening on "Then" or "Dann" reads as a step in time.

One prompt verbatim (Claude, run 1, the CTO, German, round 1), label order as that reviewer saw it:

```text
You are the CTO of a German Mittelstand manufacturer (about 1,800 staff, 120 people in software). Your developers use coding agents; your board asks why releases are not faster. You read company texts from training and consulting firms when choosing whom to talk to.

You are given German renderings of an English company text from hackers&wizards, a company that trains software teams. The brand's claim is "Agents bring the speed. Flow needs teams in tune." (German: "Agenten bringen das Tempo. Flow braucht eingespielte Teams."). Judge each version on its own merits.

Part 1, the German company position. English reference:
<position.en of v1.17.0>

It opens the "about us" section of a proposal and the company profile on a conference or partner page, read as plain body text on a screen. German versions:
A: <pa>
B: <pc>
C: <pw>

Part 2, the German company boilerplate. English reference:
<boilerplate.en>

It opens the company paragraph on the press page, where this sentence follows it: "Das Hamburger Unternehmen bietet sieben Trainings, meist Praxistage am eigenen Code der Kunden, remote oder vor Ort in Deutschland, Österreich und der Schweiz, auf Deutsch oder Englisch, und begleitet Teams und ihre Führungskräfte." Journalists and conference programmes copy it as the company line. German versions:
D: <bc>
E: <bw>
F: <bb>

Criteria, each 0 to 10: accuracy (says exactly what the reference says, adds nothing, drops nothing), clarity (a reader understands it on one read), voice (plain, specific, peer language, no marketing phrasing; idiomatic German). Then an overall score from 0 to 100 for use in the places named.

Answer in JSON only: {"scores": {"<label>": {"accuracy": n, "clarity": n, "voice": n, "overall": n, "keeps_below_max": "one short sentence"}}}, one entry per label A to F.
```

The placeholders stand for the full texts in the tables below; the prompt carried them in full.

## German boilerplate

| Key | Text                                                                                                                                                                                                     | Origin                 | R1 overall | R2 overall | R2 Claude / Codex | R2 accuracy | R2 clarity | R2 voice |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------- | ---------- | ----------------- | ----------- | ---------- | -------- |
| bc  | hackers&wizards trainiert Engineering- und Produktteams in Agentic Engineering, bis alle Rollen eingespielt zusammenarbeiten. So kommt das Tempo, das die Teams gewinnen, bei ihren Kunden an.           | draft, **chosen**      | 85.4       | 87.5       | 82.5 / 92.5       | 9.5         | 8.9        | 8.5      |
| bw  | hackers&wizards schult Engineering- und Produktteams in Agentic Engineering, bis alle Rollen eingespielt zusammenarbeiten, damit das gewonnene Tempo bei den Kunden ankommt.                             | website, press page    | 86.4       | 82.9       | 76.8 / 89.0       | 8.1         | 8.3        | 8.6      |
| b2b | hackers&wizards trainiert Engineering- und Produktteams in Agentic Engineering, bis alle Rollen eingespielt zusammenarbeiten, damit das Tempo, das die Teams gewinnen, bei deren Kunden ankommt.         | draft, round 2         |            | 82.9       | 80.7 / 85.2       | 9.6         | 7.5        | 7.8      |
| b2a | hackers&wizards schult Engineering- und Produktteams in Agentic Engineering, bis alle Rollen eingespielt zusammenarbeiten, damit das Tempo, das die Teams gewinnen, bei deren Kunden ankommt.            | website fixed, round 2 |            | 82.8       | 80.5 / 85.2       | 9.5         | 7.6        | 7.8      |
| bb  | hackers&wizards trainiert Engineering- und Produktteams in Agentic Engineering, bis jede Rolle mit den anderen eingespielt arbeitet, damit das Tempo, das ihre Teams gewinnen, bei ihren Kunden ankommt. | draft, round 1         | 70.6       |            |                   |             |            |          |

Round 1 was a tie between bw and bc (1.0 at panel noise 1.0, the two models split). In round 2, bc
leads bw by 4.6 at noise 1.1, with both models and in both runs.

## German position

| Key | Text                                                                                                                                                                                                                                                                                                                                                                                                                                         | Origin                                     | R1 overall | R2 overall | R2 Claude / Codex |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------- | ---------- | ----------------- |
| pw  | Wir helfen CIOs und CTOs, deren Entwicklerteams mit Coding Agents arbeiten, ohne dass die Releases schneller kommen. Wir schulen ihre Engineering- und Produktteams in Agentic Engineering, bis alle Rollen eingespielt zusammenarbeiten. So kommt das gewonnene Tempo bei ihren Kunden an, zeigt sich in der Lead Time und in den Kosten jeder ausgelieferten Änderung und bleibt bei ihren eigenen Leuten.                                 | draft in the website's wording, **chosen** | 87.3       | 86.8       | 84.3 / 89.3       |
| p2a | Wir helfen CIOs und CTOs, deren Entwickler:innen Coding Agents haben und deren Releases trotzdem nicht schneller kommen. Wir trainieren ihre Engineering- und Produktteams in Agentic Engineering, bis alle Rollen eingespielt zusammenarbeiten. Damit kommt das Tempo, das die Teams gewinnen, bei ihren Kunden an, zeigt sich in der Lead Time und in den Kosten jeder ausgelieferten Änderung und bleibt bei ihren eigenen Leuten.        | draft, round 2                             |            | 83.5       | 79.7 / 87.3       |
| p2b | Wir helfen CIOs und CTOs, deren Entwicklerteams Coding Agents haben und trotzdem nicht schneller releasen. Wir trainieren ihre Engineering- und Produktteams in Agentic Engineering, bis alle Rollen eingespielt zusammenarbeiten. Damit kommt das Tempo, das die Teams gewinnen, bei ihren Kunden an, zeigt sich in der Lead Time und in den Kosten jeder ausgelieferten Änderung und bleibt bei ihren eigenen Leuten.                      | draft, round 2                             |            | 83.2       | 81.0 / 85.5       |
| pa  | Wir helfen CIOs und CTOs, deren Entwickler:innen Coding Agents haben und deren Releases trotzdem nicht schneller kommen. Wir trainieren ihre Engineering- und Produktteams in Agentic Engineering, bis jede Rolle mit den anderen eingespielt arbeitet, damit das Tempo, das ihre Teams gewinnen, bei ihren Kunden ankommt, sich in der Lead Time und in den Kosten jeder ausgelieferten Änderung zeigt und bei ihren eigenen Leuten bleibt. | draft, round 1                             | 72.8       |            |                   |
| pc  | Wir helfen CIOs und CTOs, deren Entwickler:innen Coding Agents nutzen, während die Releases nicht schneller kommen. Wir trainieren ihre Engineering- und Produktteams in Agentic Engineering, bis jede Rolle mit den anderen im Einklang arbeitet. Dann erreicht das Tempo, das die Teams gewinnen, ihre Kunden, es zeigt sich in der Lead Time und in den Kosten jeder ausgelieferten Änderung, und es bleibt im eigenen Haus.              | draft, round 1                             | 70.5       |            |                   |

pw leads in both rounds, in round 2 by 3.3 at noise 1.1, with both models and in both runs.

## English position and boilerplate

| Key  | Text (second and third sentence; the first is the same in all three)                                                                                                                            | Origin            | R1 overall | R2 overall | R2 Claude / Codex |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------- | ---------- | ----------------- |
| e2   | We train ... in tune with the others. That way the speed their teams gain reaches their customers, shows in lead time and in the cost of every shipped change, and stays with their own people. | draft, **chosen** |            | 89.2       | 87.2 / 91.3       |
| ealt | We train ... in tune with the others. Then the speed their teams gain reaches their customers, ...                                                                                              | draft             | 85.3       | 85.1       | 81.8 / 88.3       |
| ecur | We train ... in tune with the others, so the speed their teams gain reaches their customers, ...                                                                                                | v1.17.0           | 82.2       | 81.5       | 79.8 / 83.2       |

e2 leads the v1.17.0 text by 7.7 at noise 1.1, with both models and in both runs.

| Key  | Boilerplate                                                                                                                                                                          | Origin             | R1 overall | Claude / Codex |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ---------- | -------------- |
| fcur | hackers&wizards trains engineering and product teams in agentic engineering until every role works in tune with the others, so the speed their teams gain reaches their customers.   | v1.17.0, **stays** | 83.2       | 81.2 / 85.2    |
| falt | hackers&wizards trains engineering and product teams in agentic engineering until every role works in tune with the others. Then the speed their teams gain reaches their customers. | draft              | 79.8       | 72.5 / 87.0    |

The v1.17.0 boilerplate wins by 3.4 at noise 1.0 and stays.

Not tested: an English boilerplate split on "That way", the shape that won the English position.
The English boilerplate is one sentence while the German one has two. Each language's text won its
own panel.

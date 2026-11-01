# Goal

Benedikt, 01.11.2026 (relayed by Ada): „im hub (brand) soll ja der großteil liegen und in den spokes
nur die ausnahmen für die jeweiligen spokes. das müssen wir ganzheitlich noch mal sauber aufziehen so
das wir ein gutes dezentrales hub-spoke design system über alle repos haben“. Decided as
`shared-elements` "a + r1" (`docs/tracking/decisions/items.js`).

Limits: each spoke switches in its own repository, measured before and after in pixels; a visible
change gets a blind review, and a spoke keeps a local exception only where it scores clearly better
or the decision keeps the element per system. Done: every spoke in the order below runs
`brand-elements` green in its own gate, and the `shared-elements` row leaves `items.js`.

| Work                                                                                                                                                                                                                                                                                                       | Owner                                    | Evidence                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `shared-elements`: switch slides to the shared elements at the stage scale (SlideCard, labels, quote, code, table parts), its specimen page with tiles and exceptions, `brand-elements` in its gate, pixel before/after, blind review, release; then website, certificate-verifier, trainer-hub, os, talks | P2, a session in each spoke, slides next | brand v0.27.3 (elements, gate), documents v0.3.0 (first spoke); os `docs/tracking/2026-11-01-shared-elements.md` |
| `shared-elements`: documents' onepager still draws its own labels and notes (exception `onepager`): switch with pixel comparison and blind review                                                                                                                                                          | P3, a documents session                  | documents `brand-elements.json`                                                                                  |

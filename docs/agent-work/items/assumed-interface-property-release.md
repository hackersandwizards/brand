---
kind: decision
status: assumed
priority: 3
order: 1030
area: brand
owner: Benedikt
recommended: keep
assumption: "Renaming or removing an interface custom property of brand's stylesheets is a release whose commit names it, as docs/exports.md says since 97272f7."
evidence: "brand 97272f7 (12.11., run brand-next2): docs/exports.md, section Custom properties, names the interface (tokens/*.css, expert.css, elements/scales.css and each setting an element file lists) and the internal properties, and adds the release sentence. test/tokens.test.ts fails on any property in neither class. brand-next2 counted 58 brand properties os reads through var(), 53 of them named in no brand doc before this section."
options:
  - key: keep
    label: The sentence stays
    detail: Every rename or removal of an interface property ships as a release whose commit names the property, so a consumer's raise shows what to change. A brand session spends one release note per such change.
  - key: drop
    label: The sentence goes
    detail: An interface property may change in any tag without its commit naming it. A consumer finds the change only when its page draws differently after a raise.
---

# Veto if a renamed brand property should not need a named release

Veto the new sentence in brand's docs/exports.md if renaming a custom property should not need a named release.

Run brand-next2 documented which custom properties of brand's stylesheets are interface and which
are internal. It also added one policy sentence that no one had decided: renaming or removing an
interface property is a release whose commit names it. It extends the rule that already holds for
commands and exported files to these properties: a consumer reads them with `var()`, so a silent
rename breaks its page with no error. The sentence stays unless you veto it.

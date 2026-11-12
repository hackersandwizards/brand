---
kind: work
status: open
priority: 3
area: brand
order: 2010
owner: a brand session
evidence: "Checked 12.11.: brand expert/expert.css:102-103 and 178-179 still define the four aliases; os src/config.ts:648-649 on origin/main still uses --color-hue-green and bg-hue-green/15. Internal."
---

# One shape and colour system: remove the hue-amber and hue-green aliases

Brief an os session to drop hue-green from its config, then remove both aliases from brand in a major release.

The rule set lives in brand (tokens/tokens.css, the files under elements/, expert/expert.css): a category takes teal, purple or ampersand; amber, green and red mean a state; factory is the Software Factory area alone. expert/expert.css still defines --hue-amber, --hue-green, --color-hue-amber and --color-hue-green as aliases of the state roles.

1. os: src/config.ts (lines 648 and 649 on origin/main of 11.11.) colours one category with --color-hue-green and bg-hue-green/15 text-hue-green. A brief for an os session moves it to a category hue or names the state it means.
2. brand: once no consumer's source names the aliases, remove the four from expert/expert.css in a major release whose commit names the removal. trainer-hub's src/styles/expert.test.ts names hue-amber only as a string its palette rule rejects, which stays valid.

Check: a grep for hue-amber and hue-green outside docs and node_modules in every consumer's origin/main finds only that test.

---
kind: decision
status: open
priority: 1
order: 100
area: brand
owner: Benedikt
multiple: true
evidence: "Blind review 07.11., home hero in two passes (8 then 5 candidates), the claim on 11 surfaces, the 35 page headlines with c3 and k3, then alternatives for 4 pages: 6 personas, Claude and Codex, two runs each, 120 reviewer runs. Report: docs/agent-work/2026-11-07-claim-and-headline.md"
recommended:
  - eyebrow-cto
  - de-zusammenspielen
options:
  - key: eyebrow-cto
    label: "Above the H1: For CTOs and their teams / Für CTOs und ihre Teams"
    detail: "Ties with the empty slot (lead 1.0 at noise 1.4). Names the buyer in one short line and repeats nothing. Reviewers: an audience line any provider could carry."
    score: 77.6
    noise: 1.4
  - key: none
    label: "Nothing above the H1 (what ships with v1.29.0 as planned)"
    detail: "First in both passes (79.1, then 78.6), inside the noise. Codex reviewers miss no line; Claude reviewers miss a buyer cue or a brand anchor."
    score: 78.6
    noise: 1.0
  - key: eyebrow-audience
    label: "Above the H1: For CTOs, CIOs and engineering leaders / Für CTOs, CIOs und Engineering-Leitungen"
    detail: "Pass 1 78.6, pass 2 76.5. 'Engineering-Leitungen' reads as officialese (German language 6.2); two lines on the phone."
    score: 76.5
    noise: 0.7
  - key: eyebrow-offer
    label: "Above the H1: Agentic engineering training and mentoring / Schulung und Mentoring in Agentic Engineering"
    detail: "Pass 1 only. Clearest (8.9), but it repeats the lead sentence word for word."
    score: 77.5
    noise: 0.8
  - key: desk-c3
    label: "c3 as a line under the tuning desk"
    detail: "Pass 1 only. Best place for c3, still 6.9 below the empty slot: c3 and the H1 both say teams and agents (together 6.6)."
    score: 72.2
    noise: 1.5
  - key: eyebrow-c3
    label: "c3 above the H1"
    detail: "Pass 1 only. Together 5.6: the small line and the H1 repeat each other."
    score: 71.8
    noise: 2.1
  - key: footer-c3
    label: "c3 at the foot of the hero copy"
    detail: "Pass 1 only. Together 5.6."
    score: 69.0
    noise: 0.5
  - key: under-c3
    label: "c3 directly under the H1"
    detail: "Pass 1 only. Lowest: together 5.0, calm 6.5."
    score: 67.5
    noise: 1.3
  - key: de-zusammenspielen
    label: "German H1: Eure Teams haben Agenten. Wenn alle Rollen zusammenspielen, werden eure Releases schneller."
    detail: "German language 8.5 and 8.3 against 7.2 and 7.5 for 'eingespielt', with both models in both passes. Six lines on the desktop instead of five. Changes verbal.json headline.de."
    score: 78.5
    noise: 0.0
  - key: de-eingespielt
    label: "German H1 as in v1.29.0: Wenn alle Rollen eingespielt sind, ..."
    detail: "Every Codex reviewer and several Claude reviewers again: roles are not 'eingespielt', teams are."
    score: 78.6
    noise: 1.0
  - key: de-spielen
    label: "German H1: Eure Teams haben Agenten. Spielen alle Rollen zusammen, werden eure Releases schneller."
    detail: "Tested to avoid the sixth line; it still breaks into six and scores lowest of the three."
    score: 77.4
    noise: 0.3
images:
  eyebrow-cto:
    - src: eyebrow-cto-desktop.jpg
      caption: "For CTOs and their teams, above the H1: desktop 1440 px, English above German"
    - src: eyebrow-cto-phone.jpg
      caption: "For CTOs and their teams, above the H1: phone 375 px, English beside German"
  none:
    - src: none-desktop.jpg
      caption: "Nothing above the H1: desktop 1440 px, English above German"
    - src: none-phone.jpg
      caption: "Nothing above the H1: phone 375 px, English beside German"
  eyebrow-audience:
    - src: eyebrow-audience-desktop.jpg
      caption: "Audience line above the H1: desktop 1440 px, English above German"
    - src: eyebrow-audience-phone.jpg
      caption: "Audience line above the H1: phone 375 px, English beside German"
  eyebrow-offer:
    - src: eyebrow-offer-desktop.jpg
      caption: "Offer line above the H1: desktop 1440 px, English above German"
    - src: eyebrow-offer-phone.jpg
      caption: "Offer line above the H1: phone 375 px, English beside German"
  desk-c3:
    - src: desk-c3-desktop.jpg
      caption: "c3 under the tuning desk: desktop 1440 px, English above German"
    - src: desk-c3-phone.jpg
      caption: "c3 under the tuning desk: phone 375 px, English beside German"
  eyebrow-c3:
    - src: eyebrow-c3-desktop.jpg
      caption: "c3 above the H1: desktop 1440 px, English above German"
    - src: eyebrow-c3-phone.jpg
      caption: "c3 above the H1: phone 375 px, English beside German"
  footer-c3:
    - src: footer-c3-desktop.jpg
      caption: "c3 at the foot of the hero copy: desktop 1440 px, English above German"
    - src: footer-c3-phone.jpg
      caption: "c3 at the foot of the hero copy: phone 375 px, English beside German"
  under-c3:
    - src: under-c3-desktop.jpg
      caption: "c3 under the H1: desktop 1440 px, English above German"
    - src: under-c3-phone.jpg
      caption: "c3 under the H1: phone 375 px, English beside German"
  de-zusammenspielen:
    - src: none-z-desktop.jpg
      caption: "German H1 with zusammenspielen: desktop 1440 px, English above German"
    - src: none-z-phone.jpg
      caption: "German H1 with zusammenspielen: phone 375 px, English beside German"
  de-spielen:
    - src: none-s-desktop.jpg
      caption: "German H1 with Spielen alle Rollen zusammen: desktop 1440 px, English above German"
    - src: none-s-phone.jpg
      caption: "German H1 with Spielen alle Rollen zusammen: phone 375 px, English beside German"
---

# What stands above the home H1?

You asked for something above the H1 again, tested together with the headline and on every surface the claim reaches. Pick one home option and one German H1.

The claim c3 does not work in the home hero, wherever it stands: 67.5 to 72.2 against 78.6 for the empty slot, because c3 and k3 both say agents and teams ("together" 5.0 to 6.6). A short line that is not the claim does work: "For CTOs and their teams" ties with the empty slot. I recommend it because it fills the slot you want filled and repeats nothing; by the scores alone, nothing above the H1 is just as good.

Overall is the panel mean, 0 to 100, over English and German. Noise is the difference between the panel means of the two runs. A lead inside the noise is a tie.

## The home hero

Pass 1, eight heroes (H1 k3 in each):

| Option                                            | Overall | EN / DE     | Claude / Codex | Together | Clear | Distinctive | Calm | Language |
| ------------------------------------------------- | ------- | ----------- | -------------- | -------- | ----- | ----------- | ---- | -------- |
| Nothing above the H1, German with zusammenspielen | 79.5    | 80.1 / 79.0 | 74.4 / 84.7    | 8.1      | 8.0   | 6.6         | 8.2  | 8.3      |
| Nothing above the H1                              | 79.1    | 80.2 / 78.0 | 75.0 / 83.3    | 8.1      | 7.9   | 6.6         | 9.0  | 7.6      |
| Audience line above                               | 78.6    | 80.4 / 76.8 | 77.6 / 79.6    | 8.4      | 8.8   | 6.1         | 7.9  | 7.2      |
| Offer line above                                  | 77.5    | 78.8 / 76.2 | 70.2 / 84.8    | 7.4      | 8.9   | 5.9         | 7.9  | 7.5      |
| c3 under the tuning desk                          | 72.2    | 73.4 / 71.1 | 63.6 / 80.9    | 6.6      | 7.8   | 7.2         | 7.6  | 7.4      |
| c3 above the H1                                   | 71.8    | 73.0 / 70.6 | 68.0 / 75.6    | 5.6      | 7.6   | 7.2         | 7.8  | 7.4      |
| c3 at the foot of the hero copy                   | 69.0    | 70.1 / 67.8 | 60.8 / 77.2    | 5.6      | 7.8   | 6.8         | 7.0  | 7.4      |
| c3 under the H1                                   | 67.5    | 68.6 / 66.4 | 61.7 / 73.3    | 5.0      | 7.5   | 7.0         | 6.5  | 7.4      |

Pass 2 fixed the two causes of pass 1: the audience line's stiff German and two phone lines ("For CTOs and their teams"), and "eingespielt" (two German alternatives). Five heroes:

| Option                                          | Overall | EN / DE     | Claude / Codex | Together | Clear | Distinctive | Calm | Language |
| ----------------------------------------------- | ------- | ----------- | -------------- | -------- | ----- | ----------- | ---- | -------- |
| Nothing above the H1                            | 78.6    | 79.2 / 77.9 | 73.9 / 83.3    | 8.0      | 7.6   | 6.9         | 8.5  | 7.8      |
| Nothing above, German with zusammenspielen      | 78.5    | 79.2 / 77.8 | 72.8 / 84.3    | 8.0      | 7.6   | 6.9         | 7.9  | 8.2      |
| For CTOs and their teams above                  | 77.6    | 78.5 / 76.7 | 74.3 / 81.0    | 7.7      | 8.1   | 6.7         | 8.0  | 7.7      |
| Nothing above, German with Spielen ... zusammen | 77.4    | 79.2 / 75.6 | 72.5 / 82.4    | 8.0      | 7.6   | 6.9         | 7.8  | 7.9      |
| Audience line above                             | 76.5    | 78.4 / 74.5 | 72.3 / 80.7    | 7.9      | 8.6   | 6.7         | 7.0  | 7.0      |

Pass 2 found no hero above pass 1's leader: a plateau, so no third pass. The two models split on the question you asked. Claude reviewers miss a line that names the buyer ("nothing tells me I am the addressee"); Codex reviewers write "no short line feels missing".

## The claim on every other surface

c3 against q6 on the same surface, unmarked, each version identical but for the claim. Images in `docs/agent-work/2026-11-07-claim-and-headline/`.

| Surface                 | c3   | q6   | Lead of q6 | Claude lead | Codex lead |
| ----------------------- | ---- | ---- | ---------- | ----------- | ---------- |
| LinkedIn profile banner | 70.6 | 74.2 | 3.6        | 5.8         | 1.2        |
| X header                | 70.1 | 72.3 | 2.2        | 5.4         | -1.0       |
| XING cover              | 70.2 | 73.9 | 3.7        | 6.1         | 1.3        |
| Sessionize cover        | 68.8 | 70.3 | 1.5        | 6.4         | -3.3       |
| Brella cover            | 69.6 | 72.3 | 2.7        | 6.6         | -1.1       |
| Facebook cover          | 69.9 | 72.8 | 2.9        | 6.0         | -0.3       |
| YouTube banner          | 70.6 | 71.5 | 0.9        | 3.9         | -2.0       |
| Deck closing slide      | 73.1 | 75.0 | 1.9        | 4.9         | -1.0       |
| One-pager header        | 73.9 | 75.0 | 1.1        | -1.2        | 3.6        |
| Website footer          | 73.2 | 75.0 | 1.8        | 3.2         | 0.4        |
| Link preview (OG card)  | 73.1 | 76.7 | 3.6        | 6.3         | 0.7        |
| All eleven              | 71.2 | 73.5 | 2.3        |             |            |

Panel noise per surface 0.0 to 1.8. q6 is ahead on every surface on the panel mean, but only Claude carries the lead; Codex ties and prefers c3 on six of eleven. By the review rule that is a tie, so c3 stays as decided. The reasons are the same everywhere: c3 is calmer (9.0 against 7.5), reads better on the banners (language 8.1 against 6.9) and says less (clear 5.6 to 6.9 against 6.9 to 8.1, distinctive 4.7 against 6.2): "could sit beside any AI consultancy". c3 does best where a descriptor stands beside it, such as "Agentic Engineering Training" on the link preview.

## The page headlines with c3 and k3

The 35 page headlines of the website item `decide-page-headlines` (its recommended set, the pages that keep theirs, Events and the second case page as they are), read with c3 and k3 as one voice. The website reads as one company: 7.6 of 10 (noise 0.1). Four headlines should change; three of them repeat the home H1 for nearly every reviewer.

| Page               | Recommended in the website item (score there)                                                   | Repeats k3 (of 24) | Better with c3 and k3                                                                                                                                                                                                                                                      | Its score | Item's line here |
| ------------------ | ----------------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------- |
| Trainings overview | Your teams already have agents. Seven trainings get every role working with them. (83.0)        | 24                 | Find the training for each role on your team, from developers to leaders. / Findet die Schulung für jede Rolle in eurem Team, von Entwicklung bis Führung. (new draft)                                                                                                     | 81.6      | 62.5             |
| Training: Leaders  | Your teams work with agents. Your leaders learn what to change around them. (78.3)              | 24                 | Your leaders learn what changes in roles and rituals once agents write the code. / Eure Führungskräfte lernen, was sich an Rollen und Ritualen ändert, wenn Agenten den Code schreiben. (new draft); i1 of the website item scores 77.8, the lead of 1.7 comes from Claude | 79.5      | 64.0             |
| Software Factory   | Your developers code faster with agents. A Software Factory gets that code released. (r1, 81.9) | 22 to 23           | r2 of the website item: Your team builds a Software Factory that gets agent code into releases. / Euer Team baut eine Software Factory, die Code von KI-Agenten bis ins Release bringt. Ahead with Codex, a tie with Claude                                                | 76.8      | 72.5             |
| Enablement         | Your teams keep working with AI agents long after the training ends. (kept, 71.8)               | 11                 | Mentoring keeps your teams improving after the training, release by release. / Mit Mentoring werden eure Teams nach der Schulung weiter besser, Release für Release. (new draft)                                                                                           | 80.4      | 59.3             |

The scores in the last two columns come from one test with fit to c3 and k3 as a criterion (fit, clear, credible, language), so they compare with each other and not with the website item's scores. Each lead stands outside the panel noise (0.1 to 1.1 for these lines, 5.1 for the Enablement line as it is) and holds with both models, except Software Factory and Leaders as noted.

Also raised, not changed here:

- German pages say "KI-Agenten", the claim and k3 say "Agenten". Several reviewers named the switch.
- The second case page's quote headline: 16 of 24 reviewers would change it ("proves adoption, not better delivery"); the website item's candidate was not recommended for a reason of voice, and no new candidate was tested.
- Procurement and legal reads as a label, not a voice, for the Claude reviewers (fit 6.3 Claude, 8.7 Codex).
- Factory operating model: Codex reviewers find "agents do the work" pushes people into the approver's role (fit 6.0 Codex, 8.9 Claude).

Every page, fit to c3 and k3 per language (0 to 10), how many of 24 reviewers found it repeats the claim or k3, how many would change it, and the page's score in the website item:

| Page                               | Headline (EN)                                                                        | Fit EN / DE | Repeats EN / DE | Change votes | Website item score |
| ---------------------------------- | ------------------------------------------------------------------------------------ | ----------- | --------------- | ------------ | ------------------ |
| Trainings overview                 | Your teams already have agents. Seven trainings get every role working with them.    | 6.6 / 6.6   | 24 / 24         | 24           | 83.0               |
| Training: Leaders                  | Your teams work with agents. Your leaders learn what to change around them.          | 7 / 6.8     | 24 / 24         | 24           | 78.3               |
| Case: a mid-sized client           | "Since the workshop, everyone here develops agentically."                            | 7 / 7       | 0 / 0           | 16           | 70.0               |
| Enablement                         | Your teams keep working with AI agents long after the training ends.                 | 7.3 / 7.3   | 11 / 11         | 17           | 71.8               |
| Case: DIY retailer                 | Four trainings in, the retailer booked three more and set up its own trainers.       | 7.4 / 7.4   | 0 / 0           | 12           | 80.2               |
| Procurement and legal              | Procurement, legal and security at a glance.                                         | 7.5 / 7.5   | 0 / 0           | 10           | 81.9               |
| Factory operating model            | Agents do the work, and your people decide what ships.                               | 7.5 / 7.5   | 0 / 0           | 12           | 81.3               |
| Tool: Gemini CLI                   | Your team sees what Gemini CLI sends the model, and runs risky work sandboxed.       | 7.7 / 7.6   | 3 / 3           | 8            | 75.1               |
| Training: Agentic Software Factory | Your team builds its first agent pipeline and runs its backlog through it.           | 7.7 / 7.6   | 3 / 3           | 9            | 80.6               |
| Podcast                            | Conversations with the people building software factories today.                     | 7.7 / 7.7   | 0 / 0           | 4            | 78.8               |
| Contact                            | Get an offer for your team.                                                          | 7.8 / 7.8   | 0 / 0           | 4            | 80.3               |
| Training: DevOps and Platform      | Agents take on your platform team's routine work. Every apply stays with your team.  | 7.8 / 7.8   | 0 / 0           | 8            | 81.0               |
| Software Factory                   | Your developers code faster with agents. A Software Factory gets that code released. | 8 / 7.9     | 22 / 23         | 15           | 81.9               |
| Tool: Cursor                       | Your team runs Cursor's agent in a mode your security team allows.                   | 8.0 / 7.9   | 3 / 3           | 3            | 74.8               |
| Press                              | Everything you need to introduce hackers&wizards.                                    | 8.0 / 8.0   | 0 / 0           | 5            | 83.8               |
| Knowledge base                     | What our trainers teach, open to read.                                               | 7.8 / 8.2   | 0 / 0           | 9            | 77.3               |
| Tool: GitHub Copilot               | Your team gets agentic engineering out of the Copilot licences it already has.       | 7.8 / 8.2   | 3 / 3           | 9            | 77.1               |
| About                              | 20 years of large systems, agents since 2022. Your teams learn from both.            | 8.1 / 8     | 1 / 1           | 5            | 81.2               |
| Tool: Codex                        | Your team builds with Codex and decides what each task may touch.                    | 8.1 / 8.1   | 3 / 3           | 1            | 75.3               |
| Tool: Claude Code                  | Your team hands Claude Code whole features, and sets the rules it works by.          | 8.1 / 8.1   | 3 / 3           | 3            | 80.8               |
| Team                               | Your team learns from practitioners who know your stack.                             | 8.1 / 8.1   | 3 / 3           | 2            | 80.2               |
| Training: Business Teams           | Your teams hand recurring tasks to AI agents and check every result.                 | 8.1 / 8.2   | 3 / 0           | 1            | 79.0               |
| Training: Security                 | Your AI agents hunt vulnerabilities in your own code, within limits you set.         | 7.8 / 8.5   | 0 / 3           | 6            | 81.4               |
| Events                             | Bring your hardest question about AI agents to the founders, face to face.           | 8.2 / 8.2   | 0 / 0           | 0            | 72.2               |
| Enablement at scale                | Your releases keep going out while every team learns to work with AI agents.         | 8.2 / 8.2   | 6 / 6           | 4            | 81.7               |
| Blog                               | What faster code generation does to your delivery, with sources.                     | 8.3 / 8.2   | 0 / 3           | 4            | 84.1               |
| Factory Pilot                      | Decide on rollout with evidence from your own delivery.                              | 8.7 / 8     | 0 / 0           | 6            | 83.9               |
| Factory Readiness Assessment       | Go to your board with evidence: what limits you first, and what comes next.          | 8.5 / 8.2   | 0 / 0           | 5            | 84.0               |
| Trainings by tool                  | Your team learns agentic engineering in the coding agent it already uses.            | 8.4 / 8.3   | 3 / 3           | 2            | 77.2               |
| Community                          | After the training, your team's questions still get answers from practitioners.      | 8.5 / 8.5   | 0 / 0           | 0            | 83.1               |
| Legacy modernisation               | Replace your old system. Capture its special cases as tests first.                   | 8.5 / 8.5   | 0 / 0           | 0            | 85.2               |
| Self-check                         | Where is your team stuck with AI agents? Start with twelve questions.                | 8.6 / 8.6   | 0 / 0           | 0            | 82.5               |
| Client work                        | Judge us by what changed for our clients.                                            | 8.6 / 8.6   | 0 / 0           | 1            | 82.0               |
| Training: Developers and QA        | Your team shares one way of working with agents, from setup to review.               | 8.6 / 8.6   | 3 / 4           | 1            | 84.1               |
| Training: Product Managers         | Your product team tests ideas on prototypes before engineering starts.               | 8.7 / 8.7   | 1 / 1           | 0            | 81.5               |

## What choosing changes

- eyebrow-cto or another line: the website's home hero passes the line to its eyebrow (`src/components/templates/StartPage.astro`, `src/copy/start.en.ts`, `start.de.ts`). The line belongs to the website's copy, not to brand.
- de-zusammenspielen: brand changes `headline.de` in `verbal.json` and releases; the website takes it with its next brand pin.
- The page headlines change in the website's copy; that decision stays in the website item, which this one informs.

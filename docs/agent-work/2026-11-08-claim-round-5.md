# Claim round 5: whose team, and could a tool vendor say it? 08.11.2026

Round 4 recommended m08k, "Every agent needs a team." / "Jeder KI-Agent braucht ein Team.", with
the line "Training and mentoring in agentic engineering" under it on the banners (item
`claim-round-3`). It did not test whether readers take the team for people or for more agents,
or whether the line sounds like an AI tool vendor. This round tests the hypothesis that readers
take the team for AI agents and that a tool vendor could say the line. The rule for the decision,
set before any read: m08k loses its recommendation if most readers take its team for agents, or
if more readers place it with an AI tool vendor than with a training company.

The hypothesis holds in English. Shown alone, the English m08k makes 16 of 16 cold readers guess an AI tool
vendor, across all four personas and both models. The German makes 7 of 16 guess one. With the
descriptor line, all 32 reads in both languages name training. The line stands alone on the closing slide and in the link
preview, so m08k loses its recommendation.

The recommendation now is n02, "Every agent needs your people." / "Jeder KI-Agent braucht eure
Leute.": 32 of 32 readers take its "people" for humans, and among the buyer personas none guesses
a tool vendor. On the panel it comes second (75.2, noise 0.6), 1.4 behind m08k.

## What the vendors say

Fetched 08.11.:

- Paperclip, the open-source app for running companies of AI agents, heads its site with "A team
  of agents for every person." and says "Everything you need to run a team of agents." and "Hire
  a team of agents in one command." (paperclip.ing). Its GitHub README: "Open-source orchestration
  for teams of AI agents." (github.com/paperclipai/paperclip).
- Relevance AI: "Deploy your first team of agents" and "Using Invent, build your first team of
  highly customized agents." (relevanceai.com).
- Taskade: its page "AI Teams" says "Train multiple AI Agents to form specialized AI teams that
  tackle tasks efficiently." (taskade.com/ai/teams); its team builder says "Build a team of AI
  agents that hand work off to each other, from research to draft to review to publish."
  (taskade.com/agents/teams/ai-agent-team-builder).
- Anthropic's Claude Code ships "agent teams": "Orchestrate teams of Claude Code sessions" and
  "Agent teams let you coordinate multiple Claude Code instances working together."
  (code.claude.com/docs/en/agent-teams).
- Agno: "Build customer-facing and internal agents, teams and workflows in pure Python"
  (agno.com). CrewAI's homepage speaks of business and platform teams that build agents
  (crewai.com); Devin calls itself "your team's autonomous software engineer" (devin.ai).
- The consultancy Cirrius Solutions titles a post "Why Your AI Agent Needs a Team, Not a
  Promotion"; its team means "teams of specialized agents that collaborate, hand off work, and
  keep each other honest." (cirriussolutions.com).

A web search for each exact phrase, "Every agent needs a team" and "Jeder KI-Agent braucht" /
"Jeder Agent braucht ein Team", found no company using it. But "team of agents" is the category
term of multi-agent vendors, and Paperclip's headline turns m08k around. Next to "agent", "team"
first means more agents.

Trademark: a web search found no mark on "agent team" or the claim, only AI agent marks on other
words in class 9 (AGENTOS, FAFO). That search went through aggregators. It did not query DPMA,
EUIPO or USPTO, so a clearance in those registers is still owed before the claim goes out.

## Candidates

- Controls, unmarked for the reviewers: m08k and m08 as they stand, a6 (round 3's lead), d01k
  (round 4's best descriptive claim), e01 (round 4's best emotional claim), and c3, the current
  claim, on the panel only.
- New: ten lines that keep m08k's idea and make the team people, positive, short, with no
  negation. Five came from this run and six from a fresh Claude model (`claude -p --model opus`)
  given a neutral brief: the offer, what h&w stands behind, the idea "Every agent needs a team.",
  the weakness to fix, and the rules (positive, 2 to 7 words, no figures, no hype, no dash, German
  in the ihr-form, "KI-Agent" over "Agent"). One line was in both sets, so ten new lines in all.
- Prefilter: the ten lines plus m08k as text, as round 4 ran it (CTO, conference organiser, brand
  strategist; Claude and Codex; one run each; round 4's six criteria and overall). The six best
  went on: n02, n04, n10, n08, n03 and n09 (62.5). The next, n05 at 62.2, sits 0.3 below
  n09; the prefilter ran once per reviewer, so that gap is not measured against noise. m08k scored 71.4, ahead of every new line.

| Key | EN                                | DE                                               | Origin      | Prefilter |
| --- | --------------------------------- | ------------------------------------------------ | ----------- | --------- |
| n02 | Every agent needs your people.    | Jeder KI-Agent braucht eure Leute.               | fresh model | 66.2      |
| n04 | Behind every agent, your people.  | Hinter jedem KI-Agenten stehen eure Leute.       | fresh model | 64.6      |
| n10 | Your people lead. Agents follow.  | Eure Leute führen. KI-Agenten folgen.            | this run    | 64.5      |
| n08 | Every agent needs people in tune. | Jeder KI-Agent braucht eingespielte Leute.       | fresh model | 62.8      |
| n03 | Every agent needs its people.     | Jeder KI-Agent braucht seine Leute.              | this run    | 62.8      |
| n09 | Every agent needs colleagues.     | Jeder KI-Agent braucht Kolleginnen und Kollegen. | fresh model | 62.5      |
| n05 | Agents need people who lead them. | KI-Agenten brauchen Menschen, die sie führen.    | this run    | 62.2      |
| n01 | Every agent needs a human team.   | Jeder KI-Agent braucht ein Team aus Menschen.    | both        | 60.0      |
| n06 | Good agents need good people.     | Gute KI-Agenten brauchen gute Leute.             | this run    | 56.7      |
| n07 | Your people make agents fast.     | Eure Leute machen KI-Agenten schnell.            | fresh model | 56.2      |

The most literal fix, n01 "human team", reads "clinical and defensive" to the prefilter
reviewers, and "Team aus Menschen" reads "umständlich" in German.

## Method

- Surfaces, rendered from the shipped sources with the claim swapped in. The banners come from
  `applications/channel-banners/render.py`, loaded by a scratch script: the LinkedIn profile
  banner, the X header and the Sessionize cover. Each is drawn alone and with the descriptor at
  0.62 of the claim size, as in round 4, with grey circles where the profile photo covers it.
  The closing slide is the slides catalog's story `Types/closing-slide/contact`, with the claim
  replaced in headless Chrome; its "Thank you." stays English for the German lines too. The link
  preview is the website's `scripts/og/template.html`, filled the way `generate.mjs` fills the
  home card.
- Cold reads, one run each, never a list: a fresh reviewer saw one LinkedIn profile banner and
  was told it knows nothing else about the company. Four personas: CTO, VP of Engineering,
  engineering lead, and a LinkedIn reader from outside tech. Claude (`claude -p --model opus`)
  and Codex (`gpt-6.1-sol`, high), two runs each, so 16 reads per line, language and version.
  - Reading, banner alone, its own run: "What is the 'team' in this line: other AI agents, people,
    or both?" Lines without the word "team" got "Who does this line say the agents need or work
    with: other AI agents, people, or both?" The reviewer answered freely first and then classified
    its answer itself (agents, people, both, unclear), with the class order reversed in run 2. a6 and
    e01 name no agents and skipped this question.
  - Attribution, banner alone and with the descriptor, separate runs: "Which kind of company would
    say this?" (AI tool vendor, training or consulting company, other; the first two in reversed
    order in run 2), what the company does, and how sure, 0 to 10.
  - m08's English is m08k's, so m08 was read in German only: 944 cold runs in all.
- Panel, the same as round 4's for comparison: CTO, VP of Engineering, conference organiser, senior
  engineer looking for a job, brand strategist. Claude and Codex, two runs each, so 20 runs, each
  with its own shuffled order under neutral labels. The six criteria of round 4 and three surfaces,
  0 to 100: banners (with the descriptor; d01k alone, as round 4 preferred it), the closing slide
  and the link preview. Then overall, the reviewer's own score for the claim across all surfaces,
  not the mean of the three.
- Noise: for the cold reads, the gap in a share between run 1 and run 2; for the panel, the gap
  between the two runs' panel means. A lead counts only where it stands outside the noise and holds
  in both runs with both models; otherwise it is a tie.
- 971 reviewer runs: 1 drafting run, 6 prefilter runs, 944 cold reads and 20 panel runs.

## Result

### Attribution: which kind of company would say this? (16 reads per cell)

| Key  | EN alone: vendor / training / other | Sure | DE alone: vendor / training / other | Sure | With the line: training |
| ---- | ----------------------------------- | ---- | ----------------------------------- | ---- | ----------------------- |
| m08k | 16 / 0 / 0                          | 5.3  | 7 / 9 / 0                           | 5.1  | 32 of 32                |
| m08  | (EN as m08k)                        |      | 9 / 7 / 0                           | 5.1  | 16 of 16                |
| a6   | 0 / 14 / 2                          | 5.4  | 0 / 15 / 1                          | 5.8  | 32 of 32                |
| d01k | 0 / 16 / 0                          | 8.5  | 0 / 16 / 0                          | 8.0  | 32 of 32                |
| e01  | 0 / 0 / 16                          | 4.6  | 0 / 2 / 14                          | 4.9  | 32 of 32                |
| n02  | 4 / 12 / 0                          | 5.7  | 0 / 16 / 0                          | 6.0  | 32 of 32                |
| n04  | 4 / 12 / 0                          | 5.6  | 0 / 16 / 0                          | 6.2  | 32 of 32                |
| n08  | 3 / 13 / 0                          | 5.8  | 0 / 16 / 0                          | 6.6  | 32 of 32                |
| n03  | 4 / 12 / 0                          | 5.4  | 2 / 14 / 0                          | 5.8  | 32 of 32                |
| n10  | 7 / 9 / 0                           | 5.4  | 10 / 6 / 0                          | 5.7  | 32 of 32                |
| n09  | 15 / 1 / 0                          | 5.2  | 4 / 12 / 0                          | 5.1  | 32 of 32                |

Noise is 0.00 or 0.12 (one read of eight) in every cell. For m08k in English, every persona
guessed a vendor in all four of its runs, for example: "I think they sell software that lets
multiple AI coding agents work together as a team." The vendor guesses on n02, n04, n03 and n08 in
English all come from the LinkedIn reader from outside tech; the buyer personas named training in
every run. In German, the reader from outside tech guesses a vendor for m08k in all four runs.

### Reading: what is the team? (banner alone, 16 reads per cell)

| Key  | EN: agents / both / people / unclear | DE: agents / both / people / unclear |
| ---- | ------------------------------------ | ------------------------------------ |
| m08k | 5 / 0 / 3 / 8                        | 0 / 0 / 15 / 1                       |
| m08  | (EN as m08k)                         | 0 / 0 / 10 / 6                       |
| d01k | 0 / 0 / 16 / 0                       | 0 / 0 / 16 / 0                       |
| n02  | 0 / 0 / 16 / 0                       | 0 / 0 / 16 / 0                       |
| n04  | 0 / 0 / 16 / 0                       | 0 / 0 / 16 / 0                       |
| n10  | 0 / 0 / 16 / 0                       | 0 / 0 / 16 / 0                       |
| n08  | 0 / 0 / 16 / 0                       | 0 / 0 / 16 / 0                       |
| n03  | 0 / 0 / 16 / 0                       | 0 / 0 / 16 / 0                       |
| n09  | 5 / 0 / 7 / 4                        | 0 / 0 / 16 / 0                       |

Noise: 0.12 for m08k in both languages, 0.25 for m08, 0.12 for n09 in English, 0 for the rest.
For m08k in English, Codex read agents in 5 of 8 runs ("I read 'team' as other AI agents working
alongside the coding agent"). Claude answered unclear in all 8 and named the multi-agent reading
each time: "in today's coding-agent talk, 'agent teams' also means several". The English m08k is
not read as agents by most, but only 3 of 16 read people. The German reads as people.

Reading and attribution part ways for n10 and n09. Readers know the people are humans, yet "Your
people lead. Agents follow." still reads like software sold to staff, and "colleagues" in English
reads like agent teammates.

### Panel (20 runs, round 4's criteria)

| Key  | Overall | Noise | Banners | Slide | Link preview | EN / DE     | Claude / Codex | Run 1 / 2   | Dist. | Clear | Emot. | Cred. | Calm | Lang. |
| ---- | ------- | ----- | ------- | ----- | ------------ | ----------- | -------------- | ----------- | ----- | ----- | ----- | ----- | ---- | ----- |
| m08k | 76.6    | 0.9   | 80.2    | 75.3  | 76.1         | 76.3 / 76.9 | 74.5 / 78.7    | 77.0 / 76.2 | 6.1   | 7.4   | 6.9   | 8.4   | 8.8  | 9.2   |
| n02  | 75.2    | 0.6   | 78.2    | 74.4  | 75.2         | 74.4 / 75.9 | 73.6 / 76.7    | 74.8 / 75.5 | 6.3   | 7.0   | 7.3   | 7.8   | 8.4  | 8.5   |
| m08  | 74.6    | 0.2   | 79.2    | 73.5  | 73.5         | 76.3 / 72.8 | 73.4 / 75.8    | 74.7 / 74.5 | 6.0   | 6.5   | 6.8   | 8.4   | 8.9  | 9.3   |
| a6   | 74.4    | 0.1   | 78.4    | 73.1  | 77.1         | 75.8 / 72.9 | 71.3 / 77.4    | 74.4 / 74.3 | 7.5   | 7.4   | 7.0   | 9.0   | 7.4  | 7.8   |
| n10  | 73.2    | 1.8   | 77.4    | 74.9  | 77.7         | 74.5 / 71.8 | 69.3 / 77.0    | 74.0 / 72.3 | 6.2   | 7.7   | 6.7   | 6.8   | 7.3  | 8.4   |
| n04  | 71.1    | 1.5   | 74.3    | 71.7  | 72.2         | 70.5 / 71.7 | 71.0 / 71.2    | 71.8 / 70.3 | 5.7   | 6.5   | 6.9   | 8.1   | 7.9  | 8.0   |
| d01k | 70.7    | 1.6   | 76.6    | 70.0  | 72.5         | 74.5 / 67.0 | 61.4 / 80.0    | 69.9 / 71.5 | 4.8   | 8.6   | 5.0   | 8.1   | 8.0  | 8.4   |
| n03  | 70.2    | 1.0   | 74.4    | 71.3  | 71.3         | 67.8 / 72.5 | 67.1 / 73.2    | 69.7 / 70.7 | 6.4   | 6.2   | 6.6   | 7.8   | 8.4  | 7.8   |
| e01  | 68.0    | 1.9   | 74.6    | 75.0  | 67.7         | 68.7 / 67.3 | 69.7 / 66.3    | 67.0 / 68.9 | 5.5   | 4.5   | 8.1   | 7.0   | 8.9  | 9.1   |
| n08  | 65.8    | 0.8   | 69.7    | 66.2  | 67.3         | 60.5 / 71.0 | 64.5 / 67.2    | 66.2 / 65.4 | 6.4   | 5.8   | 6.0   | 7.8   | 7.8  | 6.6   |
| n09  | 65.8    | 0.5   | 69.7    | 67.2  | 68.0         | 70.9 / 60.6 | 61.1 / 70.3    | 66.0 / 65.5 | 6.3   | 6.2   | 6.2   | 7.3   | 7.3  | 7.5   |
| c3   | 65.0    | 3.8   | 71.5    | 69.3  | 71.0         | 66.0 / 64.0 | 61.5 / 68.5    | 66.9 / 63.1 | 3.8   | 6.6   | 5.9   | 6.6   | 7.3  | 7.2   |

The order of round 4 holds: m08k first, then m08, a6, d01k, e01 and c3. m08k, m08, d01k, e01 and
c3 score 1.8 to 4.2 lower than in round 4 and a6 1.4 higher, on a panel that saw twelve claims
rather than six and three surfaces rather than five.

On the panel m08k leads n02 by 1.4, in both runs and with both models. The panel scored the
banners with the descriptor, where every reader names training. It scored slide and link preview
on looks and words, not on who the reader takes the sender to be. The cold reads measure that.

n02 against a6: n02 leads with Claude (73.6 to 71.3) and in both runs (74.8 to 74.4, 75.5 to
74.3), a6 leads with Codex (77.4 to 76.7). The lead stands outside the noise but does not hold
with both models, so it is a tie. The cold reads do not split them either: no buyer persona guesses a vendor for a6 or for
n02. n02 wins the tie on form: a6 is a negation, the form this round set out to avoid.

What keeps n02 below the maximum, in the reviewers' words: the training offer stays with the
descriptor ("training still depends on small banner text"); "your people" reads to some as
flattery or "faintly like agents making demands of the buyer", and to two as a staffing line; the
link preview breaks "Every agent needs your" / "people.", leaving "people." alone on its line
(named 4 times).

## Decision

By the rule set before the reads, m08k loses its recommendation: alone, the English line goes to a tool
vendor 16 to 0. Its readings are not mostly "agents" (5 of 16), but 13 of 16 do not read people.

n02 takes it: second on the panel, 1.4 behind m08k (2.2 and 0.7 per run, 0.9 with Claude and 2.0
with Codex); read as people by 32 of 32; named as training
by every buyer persona in both languages. It keeps m08k's sentence and its German fix, "KI-Agent",
and swaps the open "a team" for the reader's own people. The descriptor line stays on the banners:
alone, readers name training for n02 at 5.7 and 6.0 of 10 for how sure they are, with the line at
9.2, and the reader from outside tech guesses a vendor in all four English runs.

Stopped after one pass. Fixing n02's causes would mean a new wording or a fix outside this repo,
and the brief asks for a decision by these scores.

## Skipped and owed

- No second panel pass fixing n02's causes. The orphaned "people." in the link preview is the
  website template's wrap (no `text-wrap: balance`), which round 4 also noted for the website.
- Surfaces not drawn this round: the one-pager, the footer, the home hero, and the XING, YouTube
  and company page banners. n02 above the home H1 is untested; round 3 measured m08 there at 72.0
  against 79.8 for the empty slot.
- c3 got no cold read, only the panel.
- Trademark: the registers themselves (DPMA, EUIPO, USPTO) are not queried.
- LinkedIn's photo position is an estimate, as in round 4.

## Prompts, verbatim

Attribution, Claude, CTO, m08k in English, banner alone, run 1:

```text
You are the CTO of a German Mittelstand manufacturer with 120 developers. You bought coding agents for every team and are under board pressure to show what they changed. You have seen every consulting deck.

You opened this company's LinkedIn page from a comment under a post about coding agents. The image /private/tmp/claim5-0811/img/m08k-en-alone-linkedin.png is the banner at the top of the page (1584 x 396 px, shown about 800 px wide on a desktop and about 375 px wide on a phone; the grey circle is where the profile photo covers it). You know nothing else about the company.

Look at the image (read the file). Answer from the banner alone:
1. Which kind of company would say this? Choose one:
- "ai_tool_vendor": a company that sells AI agent software or an AI platform
- "training_consulting": a company that trains, coaches or consults people and teams
- "other": something else
2. In one sentence: what do you think this company does?
3. How sure are you of 1, 0 to 10?

Answer with JSON only: {"kind": "", "does": "", "sure": 0}
```

Reading, engineering lead, m08k in English, run 1:

```text
You lead an engineering team of nine at a German insurer. Your team got coding agents half a year ago. You scroll LinkedIn on your phone between meetings.

You opened this company's LinkedIn page from a post a former colleague shared. The image /private/tmp/claim5-0811/img/m08k-en-alone-linkedin.png is the banner at the top of the page (1584 x 396 px, shown about 800 px wide on a desktop and about 375 px wide on a phone; the grey circle is where the profile photo covers it). You know nothing else about the company.

Look at the image (read the file) and read the line under the logo. What is the 'team' in this line: other AI agents, people, or both?
First answer freely in one or two sentences, as you read it. Then classify your answer as one of "agents", "people", "both", "unclear".

Answer with JSON only: {"free": "", "class": ""}
```

The panel prompt is round 4's pass-2 prompt with the surfaces cut to banners, slide and link
preview, twelve candidates, and the per-surface keys `banners`, `slide`, `og`.

Review: large, because the claim leaves the company.

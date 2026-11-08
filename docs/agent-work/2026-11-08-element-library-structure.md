# Element library structure and form states, 08.11.

Brand's catalog now groups its elements in eight sections, Forms first. Forms gained an error
state on the field, the select and the checkbox, plus a new element `hw-form-field` with label,
hint, error message, optional mark and fieldset. Both were chosen in a blind review against the
current state. Elements no consumer uses yet are listed in the decision
`decide-form-elements-ahead`.

## 1. How mature systems group and what they ship

Sources fetched on 08.11.: Bootstrap 3.4 CSS page, Bootstrap 5.3 validation page and sidebar,
GOV.UK components, error message and question pages, Primer components and FormControl, Carbon
components overview and text input usage. Tailwind Plus asks for a login, so its row comes from
two third-party listings of its Application UI (hyperui.dev, a skill catalog), not from the
official site.

**Grouping.** Bootstrap 5 splits its docs into Layout, Content, Forms, Components, Helpers and
Utilities. Bootstrap 3 has Grid, Typography, Code, Tables, Forms, Buttons, Images and Helper
classes. Tailwind Plus files its Application UI under categories, one of them Forms. GOV.UK
(37 components), Primer (62) and Carbon (41) list their components alphabetically, without
sections. Primer's intro names actions, containment, communication, navigation, selection and
text input as its themes.

**Form elements and states.** ✓ shipped, – not found on the pages read, (n) not read this run.

| Element or state          | Bootstrap 3          | Bootstrap 5                | Tailwind Plus  | GOV.UK                  | Primer              | Carbon                    | brand now                  |
| ------------------------- | -------------------- | -------------------------- | -------------- | ----------------------- | ------------------- | ------------------------- | -------------------------- |
| Text field                | ✓ 14 types           | ✓                          | ✓ input groups | ✓                       | ✓ TextInput         | ✓                         | ✓ `hw-field`               |
| Textarea                  | ✓                    | ✓                          | ✓              | ✓                       | ✓                   | (n)                       | ✓ `textarea.hw-field`      |
| Select                    | ✓ incl. multiple     | ✓                          | ✓ select menus | ✓                       | ✓                   | ✓ select, dropdown        | ✓ `hw-field hw-select`     |
| Checkbox, radio           | ✓ stacked, inline    | ✓                          | ✓              | ✓                       | ✓ plus groups       | ✓                         | ✓ `hw-check`               |
| Switch, toggle            | –                    | (n)                        | ✓ toggles      | –                       | ✓ ToggleSwitch      | ✓ toggle                  | –                          |
| Fieldset, legend          | ✓ disabled fieldset  | (n)                        | (n)            | ✓                       | ✓ groups            | –                         | ✓ `fieldset.hw-form-field` |
| Label                     | ✓                    | ✓                          | (n)            | ✓                       | ✓ FormControl.Label | ✓                         | ✓ `hw-form-label`          |
| Hint, help text           | ✓ help-block         | (n)                        | (n)            | ✓                       | ✓ Caption           | ✓ helper text             | ✓ `hw-form-hint`           |
| Error message             | ✓ has-error on group | ✓ invalid-feedback         | (n)            | ✓                       | ✓ Validation        | ✓ red line, icon, message | ✓ `hw-form-error`          |
| Error state on control    | ✓                    | ✓ is-invalid, all controls | (n)            | ✓                       | ✓                   | ✓                         | ✓ `aria-invalid`           |
| Error summary             | –                    | –                          | –              | ✓                       | –                   | –                         | –                          |
| Warning, success state    | ✓                    | ✓ valid                    | –              | –                       | ✓ success           | ✓ warning                 | –                          |
| Required or optional mark | –                    | –                          | –              | "(optional)", never `*` | `*`                 | mark the rarer kind       | ✓ `hw-form-mark`           |
| Disabled                  | ✓                    | (n)                        | (n)            | –                       | ✓ prop              | ✓                         | ✓                          |
| Read-only                 | ✓                    | (n)                        | –              | –                       | –                   | ✓                         | –                          |
| Input group               | ✓ add-ons            | ✓                          | ✓              | –                       | –                   | –                         | ✓ joined `hw-field-row`    |
| File input                | ✓ plain              | ✓                          | –              | ✓ file upload           | –                   | ✓ uploader                | –                          |
| Range, slider             | –                    | ✓                          | –              | –                       | –                   | ✓                         | –                          |
| Date input                | –                    | –                          | –              | ✓                       | –                   | ✓ picker                  | –                          |
| Combobox, autocomplete    | –                    | –                          | ✓              | –                       | ✓                   | ✓ multiselect             | –                          |
| Character count, password | –                    | –                          | –              | ✓ both                  | –                   | –                         | –                          |
| Floating label, sizes     | ✓ sizes              | ✓ floating                 | –              | –                       | –                   | (n)                       | –                          |

Every system that ships forms ships text field, select, checkbox and radio, a label, an error
message tied to its control, and disabled. Most ship a hint and a switch. Only GOV.UK ships an
error summary.

## 2. Inventory

Brand had 28 element files in one flat "Elements" group, plus the dropdown chevron
(`expert/select.css`) and the disclosure (`expert/disclosure.css`) below them. Forms meant
`hw-field` (the field with its button), `hw-check` and the chevron. The field's error state drew
amber, which tokens.css reserves for warning. No hint, error message, label or optional mark
existed.

Form CSS outside brand, read on `origin/main` of each repo on 08.11.:

| Repo                           | Where                                                                                                                                   | What                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| certificate-verifier           | `src/worker.ts:781`, `:784`, CSS `:1203-1218`                                                                                           | own `.field-hint` and `.form-message` (amber, icon) round `hw-field`       |
| website                        | `src/components/ui/Select.astro:14-21`                                                                                                  | the select's frame in Tailwind classes, beside `hw-select`                 |
| website                        | `src/components/templates/SelfCheckPage.astro:229-293`                                                                                  | fieldset, legend, native radios with `accent-white`                        |
| os                             | `src/components/DealDialog.astro:28`, `:40`, `:52`; `AssignmentDialog.astro`; `pages/people/index.astro`; `pages/companies/index.astro` | labels as `mb-1 block text-ui font-medium text-foreground/70`              |
| os                             | `src/pages/people/index.astro:251`, `:261`                                                                                              | "Email (optional)" in label text; a checkbox as `rounded-sm border-border` |
| os                             | `src/components/PipelineCard.css:51`, `:65`; `src/lib/pipeline-board.client.ts:365`                                                     | own `.is-invalid` in `--error`                                             |
| os                             | `DealDialog.astro:148`, `TagManager.astro`, `EntityDetailScripts.astro`                                                                 | errors as toasts only, none on the field                                   |
| trainer-hub                    | `src/pages/onboarding/brand.astro:119-144`                                                                                              | fieldset and legend in Tailwind, native radios, "Phone, optional"          |
| trainer-hub                    | `src/pages/deliver/[...slug].astro:226`; `src/components/ListFilter.astro:119-142`                                                      | native checkbox and radios, legend in Tailwind                             |
| admin                          | `site/src/components/ItemRow.astro:114`, `:120`                                                                                         | `hw-check` and `form-input` already: nothing to move                       |
| practitioners, mail, documents | –                                                                                                                                       | no form controls or error styles                                           |

The hint and the error message appear in one repo each (verifier), the label pattern in three
(os, trainer hub, verifier), the optional mark in two (os, trainer hub). All are shared by
nature, so all moved into brand.

## 3. What changed in brand

- **Sections.** The portal's element view and the `/catalog/` stories group the elements as
  Forms, Actions, Navigation, Feedback, Data display, Typography, Containers and Utilities. The
  catalog shell reserves "Foundations" for its home's own group, hence Utilities.
- **Field** (`elements/field.css`): `aria-invalid="true"` draws the line twice as thick in the
  error red, red-night on night (an app's `--error` where it has one); disabled is half opacity,
  as on `hw-check`; the class also frames a `<textarea>` and a `<select class="hw-field
hw-select">`. New setting `--hw-field-size`, and every scale now sets the field's height,
  padding and size, so the field keeps its proportion on dense, paper and stage.
- **Checkbox and radio** (`elements/check.css`): `aria-invalid="true"` draws an unchecked box's
  line in the error red.
- **Form field** (`elements/form-field.css`, new): wrapper, label, optional mark, hint, error
  message with its icon drawn by the element, fieldset and legend. Settings `--hw-form-gap` and
  `--hw-form-small` at all four scales.
- **Chevron**: `select.css` moved from `expert/` to `elements/` (the export `./select.css` keeps
  its name) so `brand-elements` measures a select field whole. On the field the chevron sits at
  the field's padding and scales with its text.
- **Expert layer**: `form-input` takes the same two states, `aria-invalid` and disabled.

## 4. Blind review

Medium review, as the change touches every surface that shows a form. Medium: a desktop web page
at desk distance, about 500 CSS px per pane, rendered at 2x. Personas: a frontend developer who
consumes the library, a product designer who designs its forms. Each on Claude (Opus) and Codex
(gpt-6.1-sol), labels shuffled per reviewer, the current state scored alongside.

**Error states**, overall 1 to 10:

| Variant                                                              | Claude dev | Claude design | Codex dev | Codex design | Mean    |
| -------------------------------------------------------------------- | ---------- | ------------- | --------- | ------------ | ------- |
| Current: amber line, separate message styles, uppercase mono labels  | 7          | 6             | 8         | 8            | 7.25    |
| B: red double line, red message with icon below, medium-weight label | 8          | 8             | 9         | 9            | **8.5** |
| C: red bar along the whole question, bold message, no icon           | 7          | 6             | 8         | 8            | 7.25    |

**Catalog grouping**, overall 1 to 10:

| Variant                      | Claude dev | Claude design | Codex dev | Codex design | Mean    |
| ---------------------------- | ---------- | ------------- | --------- | ------------ | ------- |
| Current: one flat list of 30 | 3          | 2             | 4         | 4            | 3.25    |
| Seven sections               | 8          | 8             | 9         | 9            | **8.5** |
| Four broader sections        | 6          | 6             | 8         | 8            | 7.0     |

Noise: the Codex designer ran twice and gave the same overall scores both times (spread 0);
the other three ran once. Both leads (1.25 and 1.5) exceed that one measured spread.

Fixes taken from the reasons: the focus ring left Actions (all four reviewers), with accent rule
and gradient strip, into Utilities; a group's options no longer each turn red (three reviewers
read that as each option being wrong), and a group's message stands a gap further from the last
option. Not taken: C's bar, which reviewers found loud and which shifts the field's left edge.

One reviewer prompt, verbatim (Claude, product designer):

> You are a product designer who designs forms and app screens for this company and owns how they
> look and read. You are reviewing a small company's shared design library: plain-CSS elements
> that its website, internal web apps, printed documents and slides all use. Nothing else about
> the work is known to you; judge only what you see. PART 1. Three versions of the same form,
> labelled P, Q and R. Each image shows the form on a light page (left) and a dark page (right),
> rendered at 2x device pixels: on a desktop monitor at desk distance each pane is about 500 CSS
> px wide. […] Score each version from 1 to 10 on each criterion: 1. An error is unmistakable at
> a glance, for a reader with and without full colour vision. 2. Each error message reads as
> belonging to its own control. 3. Visual calm […] 4. Breathing room, not cramped. 5. Legibility […] 6. The dark version works as well as the light one. 7. One rule covers text
> field, dropdown and checkbox group consistently […] PART 2. Three ways to group the same
> elements […] labelled K, L and M […]

Review: medium, because the error state ships to every surface with a form.

## 5. Assumptions

- The rarer kind of question is marked in words, "(optional)" or "(required)", never with an
  asterisk: GOV.UK and Carbon agree, and os and the trainer hub already write "optional".
- The error message stands below its control. Bootstrap, Primer and Carbon place it there, and
  the reviewers marked C down for moving it above the options.
- The apps keep `form-input` with the small corner; moving them onto `hw-field` at the dense
  scale is a separate step.

## 6. Beside the catalog coherence audit

os's `docs/agent-work/2026-11-08-catalog-coherence.md` asks brand, in its brief step 4, to
story the eight expert components in a group "Expert" and to change the portal's line on them.
That group now sits after the eight element sections (add "Expert" to `groupOrder` in
`catalog/astro.config.ts`). The portal's sentence on the expert components moved to the end of
the element view and now also names `form-input` and its states.

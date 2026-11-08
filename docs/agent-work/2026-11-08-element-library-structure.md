# Element library structure and form states, 08.11.

Brand's catalog now groups its elements in eight sections, Forms first. Forms gained an error
state on the field, the select and the checkbox, plus a new element `hw-form-field` with label,
hint, error message, optional mark and fieldset. Both were chosen in a blind review against the
current state. Benedikt then asked for every form element the mature systems ship that brand
lacked (section 7), and whether other common elements could be designed ahead (section 8,
decision `decide-common-elements-ahead`).

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

| Element or state          | Bootstrap 3          | Bootstrap 5                | Tailwind Plus  | GOV.UK                  | Primer              | Carbon                    | brand now                            |
| ------------------------- | -------------------- | -------------------------- | -------------- | ----------------------- | ------------------- | ------------------------- | ------------------------------------ |
| Text field                | ✓ 14 types           | ✓                          | ✓ input groups | ✓                       | ✓ TextInput         | ✓                         | ✓ `hw-field`                         |
| Textarea                  | ✓                    | ✓                          | ✓              | ✓                       | ✓                   | (n)                       | ✓ `textarea.hw-field`                |
| Select                    | ✓ incl. multiple     | ✓                          | ✓ select menus | ✓                       | ✓                   | ✓ select, dropdown        | ✓ `hw-field hw-select`               |
| Checkbox, radio           | ✓ stacked, inline    | ✓                          | ✓              | ✓                       | ✓ plus groups       | ✓                         | ✓ `hw-check`                         |
| Switch, toggle            | –                    | (n)                        | ✓ toggles      | –                       | ✓ ToggleSwitch      | ✓ toggle                  | ✓ `hw-switch`                        |
| Fieldset, legend          | ✓ disabled fieldset  | (n)                        | (n)            | ✓                       | ✓ groups            | –                         | ✓ `fieldset.hw-form-field`           |
| Label                     | ✓                    | ✓                          | (n)            | ✓                       | ✓ FormControl.Label | ✓                         | ✓ `hw-form-label`                    |
| Hint, help text           | ✓ help-block         | (n)                        | (n)            | ✓                       | ✓ Caption           | ✓ helper text             | ✓ `hw-form-hint`                     |
| Error message             | ✓ has-error on group | ✓ invalid-feedback         | (n)            | ✓                       | ✓ Validation        | ✓ red line, icon, message | ✓ `hw-form-error`                    |
| Error state on control    | ✓                    | ✓ is-invalid, all controls | (n)            | ✓                       | ✓                   | ✓                         | ✓ `aria-invalid`                     |
| Error summary             | –                    | –                          | –              | ✓                       | –                   | –                         | ✓ `hw-error-summary`                 |
| Warning, success state    | ✓                    | ✓ valid                    | –              | –                       | ✓ success           | ✓ warning                 | ✓ `data-state`                       |
| Required or optional mark | –                    | –                          | –              | "(optional)", never `*` | `*`                 | mark the rarer kind       | ✓ `hw-form-mark`                     |
| Disabled                  | ✓                    | (n)                        | (n)            | –                       | ✓ prop              | ✓                         | ✓                                    |
| Read-only                 | ✓                    | (n)                        | –              | –                       | –                   | ✓                         | ✓ `readonly`                         |
| Input group               | ✓ add-ons            | ✓                          | ✓              | –                       | –                   | –                         | ✓ joined `hw-field-row`              |
| File input                | ✓ plain              | ✓                          | –              | ✓ file upload           | –                   | ✓ uploader                | ✓ `type="file"`                      |
| Range, slider             | –                    | ✓                          | –              | –                       | –                   | ✓                         | ✓ `hw-range`                         |
| Date input                | –                    | –                          | –              | ✓                       | –                   | ✓ picker                  | ✓ `type="date"`                      |
| Combobox, autocomplete    | –                    | –                          | ✓              | –                       | ✓                   | ✓ multiselect             | ✓ `list` + `hw-select`               |
| Character count, password | –                    | –                          | –              | ✓ both                  | –                   | –                         | ✓ `hw-form-count`, `hw-field-toggle` |
| Floating label, sizes     | ✓ sizes              | ✓ floating                 | –              | –                       | –                   | (n)                       | ✓ `hw-form-float`, `data-size`       |

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

## 7. Form elements added on 08.11.

Every form element of section 1 that brand lacked is now in `elements/`, with a story under Forms
in `/catalog/`, a tile on the portal and a part in `brand-elements`:

- **Switch** (`switch.css`, new): `<input type="checkbox" role="switch" class="hw-switch">`, a
  round track 2.25 by 1.25 em with a knob, the checkbox's line and accent. A disabled switch that
  is on keeps its knob right on a grey track.
- **Range** (`range.css`, new): the native slider, a thin track filled in the accent up to the
  knob. `form.ts` keeps `--hw-range-fill` in step; Firefox fills natively.
- **Error summary** (`error-summary.css`, new): the red double line, the brand corner, a title
  behind the error mark and one link per field.
- **Field** (`field.css`): `readonly` draws a dashed line on no fill; `data-state="warning"` or
  `"success"` draws the double line in amber-dark or green-dark; `data-size="small"` or `"large"`
  takes 5/6 or 7/6 of the scale's height; `type="file"` puts the choose button flush left;
  `type="date"` keeps the browser's picker, its calendar dark on night; a field with `list` and
  `hw-select` is a combobox over a `<datalist>`; `hw-field-toggle` in a joined row is the password
  field's show button.
- **Form field** (`form-field.css`): `hw-form-warning` and `hw-form-success` messages with their
  own icons, `hw-form-count` (an error message once over the limit), `hw-form-float` for a
  floating label, and the muted text of a disabled option.
- **Behaviour** (`form.ts`, export `./elements/form.ts`): `enhanceForms()` wires the character
  count, the password toggle and the range fill. Everything else is CSS on native controls.
- **Check**: `brand-elements` compares a field under a floating label against a reference in a
  floating-label box, as it does for a joined row.

Not built: a custom calendar (the native picker does it), a listbox for the combobox (the
browser's datalist), a multiselect. Each needs a component; a surface that needs one asks first.

### Blind review

Medium: a desktop web page at desk distance, about 500 CSS px per pane, rendered at 2x, light and
night side by side. Personas: a frontend developer who builds the forms from the library, a
product designer who designs them. Each on Claude (Opus) and Codex (gpt-6.1-sol), labels and
order shuffled per reviewer. The Codex designer ran twice for the noise.

**Read-only field**, overall 1 to 10:

| Variant                          | Claude dev | Claude design | Codex dev | Codex design | Mean    |
| -------------------------------- | ---------- | ------------- | --------- | ------------ | ------- |
| No style (the state before)      | 4          | 3             | 6         | 6            | 4.75    |
| Grey ground, light line          | 6.5        | 6             | 7         | 7            | 6.6     |
| Dashed line, no ground (shipped) | 8          | 8             | 8         | 8            | **8.0** |

**Switch**, overall 1 to 10:

| Variant                        | Claude dev | Claude design | Codex dev | Codex design | Mean    |
| ------------------------------ | ---------- | ------------- | --------- | ------------ | ------- |
| Round track and knob (shipped) | 8.5        | 8             | 9         | 9            | **8.6** |
| Small corner, square knob      | 6.5        | 6             | 8         | 8            | 7.1     |

Noise: the Codex designer's second run moved one score by 1 (grey ground 7 to 8) and left the
others. Both leads (1.4 and 1.5) exceed it.

**Each element**, overall 1 to 10, mean of the four reviewers, round 1 and round 2 after the fixes:

| Element               | Round 1 | Round 2 |
| --------------------- | ------- | ------- |
| Read-only field       | 6.5     | 7.5     |
| Combobox              | 8.5     | 8       |
| Date field            | 8.75    | 8.75    |
| File field            | 8.5     | 8.5     |
| Small and large field | 8.4     | 7.75    |
| Warning               | 8.4     | 9       |
| Success               | 8.9     | 9       |
| Character count, over | 5.75    | 8       |
| Password with show    | 9       | 8.75    |
| Floating label, empty | 7.6     | 6 (ink) |
| Error summary         | 7.75    | 8.5     |
| Switch group          | 7.75    | 8       |
| Range                 | 7.9     | 7.75    |

Fixes taken from round 1: the over-limit count turns into an error message with its icon and
`form.ts` marks the field invalid (all four); a disabled switch that is on draws a grey track,
and its option's text turns muted (both Claude reviewers: on night it read as a second "on"); the
range's empty track on night sits below the fill (both Claude reviewers); the error summary's
title carries the error mark (both Claude reviewers); the small and large fields keep the scale's
padding, so values align (one reviewer). Round 2 tried the resting floating label in the label's
ink and weight: both Claude reviewers read it as a typed value (4 each), so it is back to muted at
regular weight, the round-1 version. Not taken: a lock icon or a written "read-only" on the
field (content for the surface), a tinted fill on the file button, the Codex reviewers' wish to
drop floating labels (the element was asked for; its comment says to prefer the label above).
Open, from two reviewers: the textarea's resize grip sits in the brand corner's large curve. That
predates this batch and is left for the field's next change.

One reviewer prompt, verbatim (Claude, frontend developer, round 1; paths shortened):

> You are a frontend developer who builds this company's web forms from the library and owns how
> they behave for users. You are reviewing a small company's shared design library: plain-CSS
> form elements that its public website and its internal web apps both use. Nothing else about
> the work is known to you; judge only what you see. Medium: a desktop web page seen at desk
> distance. Each image shows the same content on a light page (left) and a dark page (right);
> each pane is about 500 CSS px wide on a desktop monitor, rendered at 2x device pixels. […]
> PART 1. Three sheets of elements […] For each element named above, score 1 to 10 on: 1. It
> reads at a glance as what it is and in which state, for a reader with and without full colour
> vision. 2. It is consistent with the other elements on its sheet. 3. Visual calm. 4. Breathing
> room, not cramped. 5. Legibility. 6. The dark version works as well as the light one. […]
> PART 2. Three versions of a form with one read-only field […] labelled as follows: P (…), Q
> (…), R (…). […] PART 3. Two versions of a group of on/off switches beside a text field and a
> button […]

Review: medium, because these elements ship to every surface that shows a form.

## 8. Common elements beyond forms

Component indexes fetched on 08.11.: Bootstrap 5.3 (docs sidebar, Components and Content),
shadcn/ui (`/docs/components`), Radix Primitives (the component links of its docs navigation),
Primer (`/product/components/`), Carbon (`/components/overview/components/`). ✓ ships it, – not in
its index. Consumer use read on `origin/main` of os, website, trainer-hub and talks on 08.11.

| Element                         | Bootstrap 5           | shadcn/ui                  | Radix                    | Primer                          | Carbon                       | Of 5 | Built today in a consumer                                                   | brand now                                                 |
| ------------------------------- | --------------------- | -------------------------- | ------------------------ | ------------------------------- | ---------------------------- | ---- | --------------------------------------------------------------------------- | --------------------------------------------------------- |
| Dialog, modal                   | ✓ Modal               | ✓ Dialog, Alert Dialog     | ✓ Dialog, Alert Dialog   | ✓ Dialog, ConfirmationDialog    | ✓ Modal                      | 5    | os (`dialog-form`: deal, assignment, command palette), website (image zoom) | –                                                         |
| Dropdown menu, context menu     | ✓ Dropdowns           | ✓ Dropdown, Context Menu   | ✓ Dropdown, Context Menu | ✓ ActionMenu                    | ✓ Menu, Menu buttons         | 5    | os (`ContextMenu.astro`)                                                    | –                                                         |
| Popover                         | ✓                     | ✓ Popover, Hover Card      | ✓ Popover, Hover Card    | ✓                               | ✓ Popover, Toggletip         | 5    | os (detail pane, list row)                                                  | –                                                         |
| Tooltip                         | ✓                     | ✓                          | ✓                        | ✓                               | ✓                            | 5    | os (6 components), website                                                  | – (stays per system, as the portal's element intro says)  |
| Tabs                            | ✓ Navs & tabs         | ✓                          | ✓                        | ✓ UnderlineNav, UnderlinePanels | ✓                            | 5    | none found                                                                  | –                                                         |
| Progress bar                    | ✓                     | ✓                          | ✓                        | ✓ ProgressBar                   | ✓ Progress bar               | 5    | none found                                                                  | –                                                         |
| Accordion, collapse             | ✓ Accordion, Collapse | ✓ Accordion, Collapsible   | ✓ Accordion, Collapsible | ✓ Details                       | ✓                            | 5    | –                                                                           | part: `hw-disclosure` (expert)                            |
| Segmented control, toggle group | ✓ Button group        | ✓ Toggle Group             | ✓ Toggle Group           | ✓ SegmentedControl              | ✓ Content switcher           | 5    | –                                                                           | ✓ `hw-segmented`                                          |
| Navigation bar, sidebar         | ✓ Navbar              | ✓ Navigation Menu, Sidebar | ✓ Navigation Menu        | ✓ NavList, PageHeader           | ✓ UI shell                   | 5    | –                                                                           | ✓ expert header, space nav                                |
| Alert, banner, notification     | ✓ Alerts              | ✓ Alert                    | –                        | ✓ Banner, InlineMessage         | ✓ Notification               | 4    | –                                                                           | ✓ `hw-status`, `hw-callout`                               |
| Badge, tag                      | ✓ Badge               | ✓ Badge                    | –                        | ✓ Label, StateLabel, Token      | ✓ Tag                        | 4    | –                                                                           | ✓ `hw-pill`                                               |
| Breadcrumb                      | ✓                     | ✓                          | –                        | ✓ Breadcrumbs                   | ✓                            | 4    | –                                                                           | ✓ `hw-breadcrumb`                                         |
| Card, tile                      | ✓ Card                | ✓ Card                     | –                        | ✓ Card                          | ✓ Tile                       | 4    | –                                                                           | ✓ `hw-card`                                               |
| Table, data table               | ✓ Tables              | ✓ Table, Data Table        | –                        | ✓ DataTable                     | ✓ Data table                 | 4    | –                                                                           | ✓ `hw-table` (sorting; no selected, empty or loading row) |
| List group, list row            | ✓ List group          | ✓ Item                     | –                        | ✓ ActionList                    | ✓ Contained, Structured list | 4    | –                                                                           | ✓ `hw-row`                                                |
| Pagination                      | ✓                     | ✓                          | –                        | ✓                               | ✓                            | 4    | none found                                                                  | –                                                         |
| Spinner, loading                | ✓ Spinners            | ✓ Spinner                  | –                        | ✓ Spinner                       | ✓ Loading, Inline loading    | 4    | os (2 files)                                                                | –                                                         |
| Toast                           | ✓ Toasts              | ✓ Toast                    | ✓ Toast                  | –                               | ✓ (a Notification kind)      | 4    | os (errors and confirmations, 6 or more components)                         | –                                                         |
| Skeleton, placeholder           | ✓ Placeholders        | ✓ Skeleton                 | –                        | ✓ SkeletonBox, Text, Avatar     | –                            | 3    | none found                                                                  | –                                                         |
| Avatar                          | –                     | ✓                          | ✓                        | ✓ Avatar, AvatarStack           | –                            | 3    | website (portraits)                                                         | –                                                         |
| Separator, rule                 | ✓ Vertical rule       | ✓ Separator                | ✓ Separator              | –                               | –                            | 3    | –                                                                           | ✓ `hw-rule`                                               |
| Drawer, offcanvas, sheet        | ✓ Offcanvas           | ✓ Drawer, Sheet            | –                        | –                               | –                            | 2    | none found                                                                  | –                                                         |
| Empty state                     | –                     | ✓ Empty                    | –                        | ✓ Blankslate                    | –                            | 2    | –                                                                           | part: `hw-frame`                                          |
| Code block, keycap              | –                     | ✓ Code Block, Kbd          | –                        | ✓ KeybindingHint                | ✓ Code snippet               | 3    | –                                                                           | ✓ `hw-code`, `hw-kbd`                                     |
| Carousel                        | ✓                     | ✓                          | –                        | –                               | –                            | 2    | –                                                                           | –                                                         |
| Tree view                       | –                     | –                          | –                        | ✓ TreeView                      | ✓ Tree view                  | 2    | –                                                                           | part: expert space nav tree                               |
| Stepper, progress indicator     | –                     | –                          | –                        | – (Timeline)                    | ✓ Progress indicator         | 1    | none found                                                                  | –                                                         |
| Command palette                 | –                     | ✓ Command                  | –                        | –                               | –                            | 1    | os (`CommandPalette.astro`)                                                 | –                                                         |

"Built today" counts a file only where it renders the element; a keyword in content (a talk
mentioning "pagination") does not count. The counts are files on `origin/main` and say nothing on
how often a page shows one.

**Shared by four or five of the systems and missing in brand:** dialog, dropdown menu, popover,
tabs, progress bar, pagination, spinner, toast, plus an accordion around the existing disclosure.
Tooltip is the ninth; the portal lists it among the parts that stay with each system. Of these,
os already draws dialog, context menu, popover, spinner and toast in its own CSS, and the website
a dialog. Dialog is the only one two consumers build today, which is the rule this repo's
`CLAUDE.md` sets for moving an element into brand.

**Most need behaviour.** Dialog, popover, tooltip and toast can sit on native HTML (`<dialog>`,
the `popover` attribute), so brand can ship their look as CSS. Dropdown menu, tabs and accordion
need keyboard handling beyond the native elements, so they would land as small scripts like
`form.ts` or in the expert components.

The decision is `decide-common-elements-ahead`.

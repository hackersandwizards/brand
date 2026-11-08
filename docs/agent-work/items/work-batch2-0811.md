---
kind: work
status: open
priority: 2
owner: Ada
---

# Five defects other runs measured on 08.11.

1. `@layer base` and `@layer components` are opened without a declared order: a surface loading
   `elements.css` before `text-base.css` renders `h2.hw-label` at 700 instead of 500
   (certificate-verifier).
2. `brand-elements` measures elements carrying `hidden` (trainer-hub).
3. `hw-check` and the option label in `form-field` set no minimum target size (trainer-hub set
   44 x 48 px itself twice).
4. `brand-elements` gives a consumer no way to leave out catalog stories it does not own
   (trainer-hub: 253 of 314 pages are slides stories, about 40 s).
5. `brand-elements` flags brand's own focus state on `data-tone="danger"`, cause not yet explained
   (os pin run).

Completion check: each point has its commit and the release is tagged.

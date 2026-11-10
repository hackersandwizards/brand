# Git hooks

Project-scoped hooks at `.githooks/`, enabled per clone by `bun install` (the `prepare` script sets `core.hooksPath`, never in user-global git config). `pre-commit` calls a package.json script, `commit-msg` and `pre-push` scaffolding's `check-confidential` command, and `post-merge` and `post-checkout` run `bun install` themselves.

## What fires when

| Hook            | Trigger                                                     | Runs                                                                                                                                            |
| --------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit`    | every commit that is not a conflict-free merge              | `bun run check:staged`: scaffolding's `check-staged` (gitleaks, coupling, confidential, prettier, eslint, stylelint on CSS and Astro; `check-licenses` when `package.json` or `bun.lock` is staged, `admin-check` when an item is) |
| `commit-msg`    | every commit                                                | `check-confidential` on the message                                                                                                             |
| `pre-push`      | every push                                                  | `check-confidential prepush`: refuses commits listed in `.confidential-purged.json`, then the LFS upload                                        |
| `post-merge`    | a merge that changed `bun.lock` or `package.json`           | `bun install --frozen-lockfile` through `check-lock` without waiting, quiet; a held lock skips it, and a failure never fails the merge |
| `post-checkout` | a branch checkout that changed `bun.lock` or `package.json` | the same install                                                                                                                                |

## LFS

`core.hooksPath` bypasses `.git/hooks/`, so `pre-push` hands the refs to `git lfs pre-push` itself and fails when `git-lfs` is missing or the upload fails: a push never carries pointers without their objects. Smudging on checkout and merge is the LFS filter's job, not a hook's. Git LFS's `post-checkout`, `post-commit` and `post-merge` hooks only make `lockable` files read-only, and `.gitattributes` declares none, so this repo carries no `post-commit`, and its `post-checkout` and `post-merge` leave Git LFS out.

## Troubleshooting

- **Hooks not firing**: confirm `git config core.hooksPath` returns `.githooks` and `ls .githooks` shows executable files.
- **bun, gitleaks, prettier or eslint missing**: the commit fails closed; `brew install gitleaks`, `bun install`.
- **git-lfs missing**: the push fails closed; `brew install git-lfs`.
- **Other checks**: no hook runs `bun run check` or any validator. A session runs the ones that fit its change, from the commands in `CLAUDE.md`.

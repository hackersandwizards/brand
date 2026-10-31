# Git hooks

Project-scoped hooks at `.githooks/`, enabled per clone by `bun install` (the `prepare` script sets `core.hooksPath`, never in user-global git config). Each hook is one line calling a package.json script.

## What fires when

| Hook         | Trigger                                        | Runs                                                                                                            |
| ------------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | every commit that is not a conflict-free merge | `bun run check:staged`: `gitleaks` over the staged changes, `prettier --check` and `eslint` on the staged files |
| `pre-push`   | every push                                     | `bun run lfs:pre-push`: the LFS upload                                                                          |

`check:staged` runs `.claude/skills/engineering/check-staged.ts`, which every repository shares.

## LFS

`core.hooksPath` bypasses `.git/hooks/`, so `pre-push` runs `git lfs pre-push` itself and fails when `git-lfs` is missing or the upload fails: a push never carries pointers without their objects. Smudging on checkout and merge is the LFS filter's job, not a hook's. Git LFS's `post-checkout`, `post-commit` and `post-merge` hooks only make `lockable` files read-only, and `.gitattributes` declares none, so this repo carries none of them.

## Troubleshooting

- **Hooks not firing**: confirm `git config core.hooksPath` returns `.githooks` and `ls .githooks` shows executable files.
- **bun, gitleaks, prettier or eslint missing**: the commit fails closed; `brew install gitleaks`, `bun install`.
- **git-lfs missing**: the push fails closed; `brew install git-lfs`.
- **Other checks**: no hook runs `bun run check` or any validator. A session runs the ones that fit its change, from the commands in `CLAUDE.md`.

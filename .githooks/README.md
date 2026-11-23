# Git hooks

Project-scoped hooks at `.githooks/`, enabled per clone by `bun install` (the `prepare` script sets `core.hooksPath`, never in user-global git config). `pre-commit` calls a package.json script, `commit-msg` scaffolding's `check-confidential` command, `pre-push` that command and then the gate, and `post-merge` and `post-checkout` run `install`, scaffolding's skeleton script, as `.mcp.json`'s chrome-devtools server does before it starts. `install` runs `bun install --frozen-lockfile` under `check-lock.ts`, the skeleton's copy of the lock, without waiting behind a gate or a build. `session-start` is the skeleton's SessionStart script; this repository's SessionStart hook in `.claude/settings.json` is its own and does not call it.

## What fires when

| Hook            | Trigger                                                     | Runs                                                                                                                                            |
| --------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit`    | every commit that is not a conflict-free merge              | `bun run check:staged`: scaffolding's `check-staged` (gitleaks, coupling, confidential, Prettier, ESLint, Oxlint, Stylelint on CSS and Astro, ShellCheck on staged shell scripts, markdownlint on staged Markdown; `check-licenses` when `package.json` or `bun.lock` is staged, `admin-check` when an item is) |
| `commit-msg`    | every commit                                                | `check-confidential` on the message                                                                                                             |
| `pre-push`      | every push                                                  | `check-confidential prepush` refuses commits listed in `.confidential-purged.json` and runs Git LFS when needed. Then `bun run check --changed` selects fast steps by the pushed branch's changed paths. Unmapped paths select all fast steps. Source changes select the fast unit suite. The full gate also runs the integration suite, the catalog build and its tests, and the generated output check. |
| `post-merge`    | a merge that changed `bun.lock` or `package.json`           | `install`: a held lock skips it, and a skip or failure is named on stderr |
| `post-checkout` | a branch checkout that changed `bun.lock` or `package.json`, and one from no commit (a new worktree) without `node_modules` | the same install |

## LFS

`core.hooksPath` bypasses `.git/hooks/`. The `check-confidential prepush` command calls `git lfs pre-push` when the push may carry LFS objects or touch a lockable file. It refuses the push if Git LFS is required and the command is missing or fails. The LFS filter smudges files on checkout and merge. Git LFS's `post-checkout`, `post-commit` and `post-merge` hooks make lockable files read-only. This repository declares no lockable files in `.gitattributes`, so its checkout and merge hooks omit Git LFS and it needs no `post-commit` hook.

## Troubleshooting

- **Hooks not firing**: confirm `git config core.hooksPath` returns `.githooks` and `ls .githooks` shows executable files.
- **bun, gitleaks, prettier or eslint missing**: the commit fails closed; `brew install gitleaks`, `bun install`.
- **git-lfs missing**: the push fails closed; `brew install git-lfs`.
- **Other checks** run `bun run check` for the full gate or use the commands in `CLAUDE.md` to check a specific change.

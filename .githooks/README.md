# Git hooks

Project-scoped hooks at `.githooks/`, enabled per-clone via `git config core.hooksPath .githooks` (`bun install` sets it, never in user-global git config). Hosts the brand package's `pre-commit` gate plus explicit LFS pass-through for the `post-commit`, `post-merge`, `post-checkout`, and `pre-push` events.

## What fires when

| Hook | Trigger | Action |
|------|---------|--------|
| `pre-commit` | every commit | `gitleaks` over the staged changes, then `bun run check` |
| `post-commit` | every commit (incl. `--amend`) | LFS post-commit |
| `post-merge` | `git pull`, `git merge` | LFS smudge |
| `post-checkout` | branch switch (incl. each rebase step) | LFS smudge |
| `pre-push` | every push | LFS upload |

## LFS preservation

`core.hooksPath` bypasses `.git/hooks/` entirely, so each hook explicitly calls its `git lfs <hook>` counterpart with proper exit-code propagation. Without this, `git pull`/`checkout`/`push`/`commit` would stop smudging or uploading LFS-tracked binaries. `pre-push` propagates the LFS exit code so a failed upload aborts the push; the post-* hooks tolerate transient LFS errors so they never block a commit or merge.

## Troubleshooting

- **Hooks not firing**: confirm `git config core.hooksPath` returns `.githooks` and `ls .githooks` shows executable files.
- **gitleaks missing**: the commit fails closed; `brew install gitleaks`.

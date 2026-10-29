---
name: dependency-updates
description: >-
  Update a repository's dependencies: fix audit advisories, raise patch and minor versions, bump the brand
  package pin, run the fitting checks, one commit per repository. Use for "dependency updates", "update
  dependencies", "bun audit", "fix advisories", "Abhängigkeiten aktualisieren".
---

# Dependency updates

Work through each repository you are given, one at a time. A repository without `bun.lock` uses its
package manager's equivalent of each command.

1. Run `bun audit fix`, then `bun audit`. Remove or replace the package behind each advisory still
   listed. One you cannot remove or replace today goes in the report with its GHSA ID.
2. Run `bun update`, which stays inside the ranges in `package.json`. Raise an exact pin that
   `bun outdated` lists to the newest version in its major. A new major goes in the report, never in
   the commit.
3. Where `package.json` depends on `@hackersandwizards/brand`, set it to the newest release.
4. Run the build, type check and tests the repository's `CLAUDE.md` names. Where an update turns one
   red, roll that package back and report it with the failing check. Continue when every check is
   green.
5. Commit the manifest and the lockfile as one commit and push it. Nothing changed means no commit.

Report per repository: the commit hash or "nothing to update", each major left out, each advisory
left open with its GHSA ID, each rolled-back package with its failing check.

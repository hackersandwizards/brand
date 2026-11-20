import { expect, test } from "vitest";
import { packed } from "../../scripts/git";
import { checkoutRoot } from "../checkout";

// A tag install is GitHub's tarball of the tag, which `git archive` builds and bun unpacks whole,
// `files` unread: `export-ignore` alone narrows it, and keeps an LFS pointer out. Archived from the
// index, so a new shipped file passes once added, before its commit.
test("the tag archive holds exactly the shipped files, none in Git LFS", () => {
  const cwd = checkoutRoot();
  const archived = Bun.spawnSync(
    ["sh", "-c", "git archive --worktree-attributes $(git write-tree) | tar -t"],
    {
      cwd,
    },
  )
    .stdout.toString()
    .split("\n")
    .filter((f) => f && !f.endsWith("/"));
  expect(archived.toSorted()).toEqual(packed().toSorted());
  const lfs = Bun.spawnSync(["git", "check-attr", "filter", "--", ...archived], { cwd })
    .stdout.toString()
    .split("\n")
    .filter((line) => line.endsWith(": filter: lfs"));
  expect(lfs).toEqual([]);
});

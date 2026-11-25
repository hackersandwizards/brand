import { execFileSync } from "node:child_process";
import { expect, test } from "vitest";
import { packed } from "../../scripts/git";
import { checkoutRoot } from "../checkout";

// A tag install is GitHub's tarball of the tag, which `git archive` builds and bun unpacks whole,
// `files` unread: `export-ignore` alone narrows it, and keeps an LFS pointer out. Archived from the
// index, so a new shipped file passes once added, before its commit.
test("the tag archive holds exactly the shipped files, none in Git LFS", async () => {
  const cwd = checkoutRoot();
  const tree = execFileSync("git", ["write-tree"], { cwd, encoding: "utf8" }).trim();
  const archive = Bun.spawn(["git", "archive", "--worktree-attributes", tree], { cwd });
  const listing = Bun.spawn(["tar", "-tf", "-"], { cwd, stdin: archive.stdout });
  const archived = (await new Response(listing.stdout).text())
    .split("\n")
    .filter((f) => /[^/]$/.test(f));
  expect(await archive.exited, "git archive").toBe(0);
  expect(await listing.exited, "tar -tf -").toBe(0);
  expect(archived.toSorted()).toEqual(packed().toSorted());
  const lfs = execFileSync("git", ["check-attr", "filter", "--", ...archived], {
    cwd,
    encoding: "utf8",
  })
    .split("\n")
    .filter((line) => line.endsWith(": filter: lfs"));
  expect(lfs).toEqual([]);
});

import { execFileSync } from "node:child_process";
import { ROOT } from "../scripts/git";

// Tests can load files from a Stryker sandbox nested inside the checkout.
export const checkoutRoot = () =>
  execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: ROOT, encoding: "utf8" }).trim();

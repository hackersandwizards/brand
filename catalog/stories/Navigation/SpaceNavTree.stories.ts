import SpaceNavTreeDemo from "../../SpaceNavTreeDemo.astro";
import { expert } from "../../expert-frame";
import { TREE } from "./space-nodes";

export default { component: SpaceNavTreeDemo };
const decorators = [expert("SpaceNavTree")];
export const Collapsed = { args: { nodes: TREE, currentPath: "/knowledge/glossary" }, decorators };
export const BranchWithPageOpen = {
  args: { nodes: TREE, currentPath: "/knowledge/evaluation/review-loops" },
  decorators,
};
export const BranchWithoutPageOpen = {
  args: { nodes: TREE, currentPath: "/knowledge/factories/light-and-dark" },
  decorators,
};

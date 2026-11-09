import SpaceNav from "../../../expert/components/SpaceNav.astro";
import { expert } from "../../expert-frame";
import { TREE } from "./space-nodes";

export default { component: SpaceNav };
const decorators = [expert("SpaceNav")];
const space = {
  label: "Knowledge base",
  base: "/knowledge",
  nodes: TREE,
  pageCount: 5,
  extra: [{ href: "/knowledge/all-resources", label: "All resources" }],
};
export const OnTheHome = { args: { ...space, currentPath: "/knowledge" }, decorators };
export const OnANestedPage = {
  args: { ...space, currentPath: "/knowledge/evaluation/review-loops" },
  decorators,
};
export const OnAnExtraLink = {
  args: { ...space, currentPath: "/knowledge/all-resources" },
  decorators,
};
export const InGerman = {
  args: {
    ...space,
    label: "Wissensbasis",
    currentPath: "/knowledge/evaluation/review-loops",
    extra: [{ href: "/knowledge/all-resources", label: "Alle Ressourcen" }],
    labels: {
      sections: "Bereiche der Wissensbasis",
      browse: "Wissensbasis durchsuchen",
      pages: (n: number) => `${n} ${n === 1 ? "Seite" : "Seiten"}`,
      home: "Start der Wissensbasis",
      overview: "Überblick",
    },
  },
  decorators,
};

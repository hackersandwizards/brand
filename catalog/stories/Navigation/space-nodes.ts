import type { SpaceNode } from "../../../expert/components/space-nav";

/** A space's tree: a branch with its own page, one without, and a page. */
export const TREE: SpaceNode[] = [
  {
    href: "/knowledge/evaluation",
    label: "Evaluation",
    order: 1,
    hasPage: true,
    children: [
      {
        href: "/knowledge/evaluation/review-loops",
        label: "Review loops",
        order: 1,
        hasPage: true,
        children: [],
      },
    ],
  },
  {
    href: "/knowledge/factories",
    label: "Software factories",
    order: 2,
    hasPage: false,
    children: [
      {
        href: "/knowledge/factories/light-and-dark",
        label: "Light and dark factories",
        order: 1,
        hasPage: true,
        children: [],
      },
    ],
  },
  { href: "/knowledge/glossary", label: "Glossary", order: 3, hasPage: true, children: [] },
];

import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "tree" } };
export const Dense = { args: { name: "tree", scale: "dense" } };
export const Print = { args: { name: "tree", scale: "print" } };
export const Stage = { args: { name: "tree", scale: "stage" } };
export const Night = { args: { name: "tree", night: true } };

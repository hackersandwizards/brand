import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "skeleton" } };
export const Dense = { args: { name: "skeleton", scale: "dense" } };
export const Print = { args: { name: "skeleton", scale: "print" } };
export const Stage = { args: { name: "skeleton", scale: "stage" } };
export const Night = { args: { name: "skeleton", night: true } };

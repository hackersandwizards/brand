import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "kbd" } };
export const Dense = { args: { name: "kbd", scale: "dense" } };
export const Print = { args: { name: "kbd", scale: "print" } };
export const Stage = { args: { name: "kbd", scale: "stage" } };
export const Night = { args: { name: "kbd", night: true } };

import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "strip" } };
export const Dense = { args: { name: "strip", scale: "dense" } };
export const Print = { args: { name: "strip", scale: "print" } };
export const Stage = { args: { name: "strip", scale: "stage" } };
export const Night = { args: { name: "strip", night: true } };

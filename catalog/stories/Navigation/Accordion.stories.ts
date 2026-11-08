import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "accordion" } };
export const Dense = { args: { name: "accordion", scale: "dense" } };
export const Print = { args: { name: "accordion", scale: "print" } };
export const Stage = { args: { name: "accordion", scale: "stage" } };
export const Night = { args: { name: "accordion", night: true } };

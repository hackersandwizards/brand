import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "field" } };
export const Dense = { args: { name: "field", scale: "dense" } };
export const Print = { args: { name: "field", scale: "print" } };
export const Stage = { args: { name: "field", scale: "stage" } };
export const Night = { args: { name: "field", night: true } };

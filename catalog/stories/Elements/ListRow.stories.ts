import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "row" } };
export const Dense = { args: { name: "row", scale: "dense" } };
export const Print = { args: { name: "row", scale: "print" } };
export const Stage = { args: { name: "row", scale: "stage" } };
export const Night = { args: { name: "row", night: true } };

import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "table" } };
export const Dense = { args: { name: "table", scale: "dense" } };
export const Print = { args: { name: "table", scale: "print" } };
export const Stage = { args: { name: "table", scale: "stage" } };
export const Night = { args: { name: "table", night: true } };

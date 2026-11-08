import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "search" } };
export const Dense = { args: { name: "search", scale: "dense" } };
export const Print = { args: { name: "search", scale: "print" } };
export const Stage = { args: { name: "search", scale: "stage" } };
export const Night = { args: { name: "search", night: true } };

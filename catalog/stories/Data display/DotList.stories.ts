import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "dot-list" } };
export const Dense = { args: { name: "dot-list", scale: "dense" } };
export const Print = { args: { name: "dot-list", scale: "print" } };
export const Stage = { args: { name: "dot-list", scale: "stage" } };
export const Night = { args: { name: "dot-list", night: true } };

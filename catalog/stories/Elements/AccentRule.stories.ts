import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "rule" } };
export const Dense = { args: { name: "rule", scale: "dense" } };
export const Print = { args: { name: "rule", scale: "print" } };
export const Stage = { args: { name: "rule", scale: "stage" } };
export const Night = { args: { name: "rule", night: true } };

import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "label" } };
export const Dense = { args: { name: "label", scale: "dense" } };
export const Print = { args: { name: "label", scale: "print" } };
export const Stage = { args: { name: "label", scale: "stage" } };
export const Night = { args: { name: "label", night: true } };

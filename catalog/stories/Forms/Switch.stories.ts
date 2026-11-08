import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "switch" } };
export const Dense = { args: { name: "switch", scale: "dense" } };
export const Print = { args: { name: "switch", scale: "print" } };
export const Stage = { args: { name: "switch", scale: "stage" } };
export const Night = { args: { name: "switch", night: true } };

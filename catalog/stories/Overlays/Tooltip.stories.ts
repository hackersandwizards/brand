import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "tooltip" } };
export const Dense = { args: { name: "tooltip", scale: "dense" } };
export const Print = { args: { name: "tooltip", scale: "print" } };
export const Stage = { args: { name: "tooltip", scale: "stage" } };
export const Night = { args: { name: "tooltip", night: true } };

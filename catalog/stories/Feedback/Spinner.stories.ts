import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "spinner" } };
export const Dense = { args: { name: "spinner", scale: "dense" } };
export const Print = { args: { name: "spinner", scale: "print" } };
export const Stage = { args: { name: "spinner", scale: "stage" } };
export const Night = { args: { name: "spinner", night: true } };

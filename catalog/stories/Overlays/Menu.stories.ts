import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "menu" } };
export const Dense = { args: { name: "menu", scale: "dense" } };
export const Print = { args: { name: "menu", scale: "print" } };
export const Stage = { args: { name: "menu", scale: "stage" } };
export const Night = { args: { name: "menu", night: true } };

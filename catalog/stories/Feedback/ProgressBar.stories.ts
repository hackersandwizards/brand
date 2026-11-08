import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "progress" } };
export const Dense = { args: { name: "progress", scale: "dense" } };
export const Print = { args: { name: "progress", scale: "print" } };
export const Stage = { args: { name: "progress", scale: "stage" } };
export const Night = { args: { name: "progress", night: true } };

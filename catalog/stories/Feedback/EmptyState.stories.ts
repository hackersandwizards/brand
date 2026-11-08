import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "empty" } };
export const Dense = { args: { name: "empty", scale: "dense" } };
export const Print = { args: { name: "empty", scale: "print" } };
export const Stage = { args: { name: "empty", scale: "stage" } };
export const Night = { args: { name: "empty", night: true } };

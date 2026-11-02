import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "pill" } };
export const Dense = { args: { name: "pill", scale: "dense" } };
export const Print = { args: { name: "pill", scale: "print" } };
export const Stage = { args: { name: "pill", scale: "stage" } };
export const Night = { args: { name: "pill", night: true } };

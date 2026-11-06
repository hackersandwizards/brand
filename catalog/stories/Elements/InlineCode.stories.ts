import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "inline-code" } };
export const Dense = { args: { name: "inline-code", scale: "dense" } };
export const Print = { args: { name: "inline-code", scale: "print" } };
export const Stage = { args: { name: "inline-code", scale: "stage" } };
export const Night = { args: { name: "inline-code", night: true } };

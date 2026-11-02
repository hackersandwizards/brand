import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "focus-ring" } };
export const Dense = { args: { name: "focus-ring", scale: "dense" } };
export const Print = { args: { name: "focus-ring", scale: "print" } };
export const Stage = { args: { name: "focus-ring", scale: "stage" } };
export const Night = { args: { name: "focus-ring", night: true } };

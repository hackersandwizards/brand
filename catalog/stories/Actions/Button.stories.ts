import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "button" } };
export const Dense = { args: { name: "button", scale: "dense" } };
export const Print = { args: { name: "button", scale: "print" } };
export const Stage = { args: { name: "button", scale: "stage" } };
export const Night = { args: { name: "button", night: true } };

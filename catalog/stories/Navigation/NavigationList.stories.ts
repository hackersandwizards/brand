import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "nav" } };
export const Dense = { args: { name: "nav", scale: "dense" } };
export const Print = { args: { name: "nav", scale: "print" } };
export const Stage = { args: { name: "nav", scale: "stage" } };
export const Night = { args: { name: "nav", night: true } };

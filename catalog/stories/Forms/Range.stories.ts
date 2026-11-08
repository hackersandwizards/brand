import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "range" } };
export const Dense = { args: { name: "range", scale: "dense" } };
export const Print = { args: { name: "range", scale: "print" } };
export const Stage = { args: { name: "range", scale: "stage" } };
export const Night = { args: { name: "range", night: true } };

import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "error-summary" } };
export const Dense = { args: { name: "error-summary", scale: "dense" } };
export const Print = { args: { name: "error-summary", scale: "print" } };
export const Stage = { args: { name: "error-summary", scale: "stage" } };
export const Night = { args: { name: "error-summary", night: true } };

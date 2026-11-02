import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "quote" } };
export const Dense = { args: { name: "quote", scale: "dense" } };
export const Print = { args: { name: "quote", scale: "print" } };
export const Stage = { args: { name: "quote", scale: "stage" } };
export const Night = { args: { name: "quote", night: true } };

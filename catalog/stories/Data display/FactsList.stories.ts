import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "facts" } };
export const Dense = { args: { name: "facts", scale: "dense" } };
export const Print = { args: { name: "facts", scale: "print" } };
export const Stage = { args: { name: "facts", scale: "stage" } };
export const Night = { args: { name: "facts", night: true } };

import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "carousel" } };
export const Dense = { args: { name: "carousel", scale: "dense" } };
export const Print = { args: { name: "carousel", scale: "print" } };
export const Stage = { args: { name: "carousel", scale: "stage" } };
export const Night = { args: { name: "carousel", night: true } };

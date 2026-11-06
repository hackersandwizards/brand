import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "label-box" } };
export const Dense = { args: { name: "label-box", scale: "dense" } };
export const Print = { args: { name: "label-box", scale: "print" } };
export const Stage = { args: { name: "label-box", scale: "stage" } };
export const Night = { args: { name: "label-box", night: true } };

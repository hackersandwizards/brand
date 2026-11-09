import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "disclosure" } };
export const Dense = { args: { name: "disclosure", scale: "dense" } };
export const Print = { args: { name: "disclosure", scale: "print" } };
export const Stage = { args: { name: "disclosure", scale: "stage" } };
export const Night = { args: { name: "disclosure", night: true } };

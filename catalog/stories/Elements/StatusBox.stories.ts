import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "status" } };
export const Dense = { args: { name: "status", scale: "dense" } };
export const Print = { args: { name: "status", scale: "print" } };
export const Stage = { args: { name: "status", scale: "stage" } };
export const Night = { args: { name: "status", night: true } };

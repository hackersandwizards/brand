import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "code" } };
export const Dense = { args: { name: "code", scale: "dense" } };
export const Print = { args: { name: "code", scale: "print" } };
export const Stage = { args: { name: "code", scale: "stage" } };
export const Night = { args: { name: "code", night: true } };

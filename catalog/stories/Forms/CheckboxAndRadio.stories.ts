import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "check" } };
export const Dense = { args: { name: "check", scale: "dense" } };
export const Print = { args: { name: "check", scale: "print" } };
export const Stage = { args: { name: "check", scale: "stage" } };
export const Night = { args: { name: "check", night: true } };

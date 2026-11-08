import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "tabs" } };
export const Dense = { args: { name: "tabs", scale: "dense" } };
export const Print = { args: { name: "tabs", scale: "print" } };
export const Stage = { args: { name: "tabs", scale: "stage" } };
export const Night = { args: { name: "tabs", night: true } };

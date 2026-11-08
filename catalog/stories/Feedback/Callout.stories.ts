import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "callout" } };
export const Dense = { args: { name: "callout", scale: "dense" } };
export const Print = { args: { name: "callout", scale: "print" } };
export const Stage = { args: { name: "callout", scale: "stage" } };
export const Night = { args: { name: "callout", night: true } };

import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "breadcrumb" } };
export const Dense = { args: { name: "breadcrumb", scale: "dense" } };
export const Print = { args: { name: "breadcrumb", scale: "print" } };
export const Stage = { args: { name: "breadcrumb", scale: "stage" } };
export const Night = { args: { name: "breadcrumb", night: true } };

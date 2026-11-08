import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "link" } };
export const Dense = { args: { name: "link", scale: "dense" } };
export const Print = { args: { name: "link", scale: "print" } };
export const Stage = { args: { name: "link", scale: "stage" } };
export const Night = { args: { name: "link", night: true } };

import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "dialog" } };
export const Dense = { args: { name: "dialog", scale: "dense" } };
export const Print = { args: { name: "dialog", scale: "print" } };
export const Stage = { args: { name: "dialog", scale: "stage" } };
export const Night = { args: { name: "dialog", night: true } };
export const Narrow = { args: { name: "dialog", settings: "width: 357px" } };

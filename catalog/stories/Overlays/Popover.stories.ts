import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "popover" } };
export const Dense = { args: { name: "popover", scale: "dense" } };
export const Print = { args: { name: "popover", scale: "print" } };
export const Stage = { args: { name: "popover", scale: "stage" } };
export const Night = { args: { name: "popover", night: true } };

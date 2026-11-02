import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "icon-button" } };
export const Dense = { args: { name: "icon-button", scale: "dense" } };
export const Print = { args: { name: "icon-button", scale: "print" } };
export const Stage = { args: { name: "icon-button", scale: "stage" } };
export const Night = { args: { name: "icon-button", night: true } };

import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "command" } };
export const Dense = { args: { name: "command", scale: "dense" } };
export const Print = { args: { name: "command", scale: "print" } };
export const Stage = { args: { name: "command", scale: "stage" } };
export const Night = { args: { name: "command", night: true } };

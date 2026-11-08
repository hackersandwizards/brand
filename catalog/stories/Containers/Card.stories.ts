import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "card" } };
export const Dense = { args: { name: "card", scale: "dense" } };
export const Print = { args: { name: "card", scale: "print" } };
export const Stage = { args: { name: "card", scale: "stage" } };
export const Night = { args: { name: "card", night: true } };

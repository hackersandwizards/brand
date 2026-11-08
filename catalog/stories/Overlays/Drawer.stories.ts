import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "drawer" } };
export const Dense = { args: { name: "drawer", scale: "dense" } };
export const Print = { args: { name: "drawer", scale: "print" } };
export const Stage = { args: { name: "drawer", scale: "stage" } };
export const Night = { args: { name: "drawer", night: true } };

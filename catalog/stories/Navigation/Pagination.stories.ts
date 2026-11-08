import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "pagination" } };
export const Dense = { args: { name: "pagination", scale: "dense" } };
export const Print = { args: { name: "pagination", scale: "print" } };
export const Stage = { args: { name: "pagination", scale: "stage" } };
export const Night = { args: { name: "pagination", night: true } };

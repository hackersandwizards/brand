import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "toast" } };
export const Dense = { args: { name: "toast", scale: "dense" } };
export const Print = { args: { name: "toast", scale: "print" } };
export const Stage = { args: { name: "toast", scale: "stage" } };
export const Night = { args: { name: "toast", night: true } };

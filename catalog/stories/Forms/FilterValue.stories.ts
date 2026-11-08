import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "choice" } };
export const Dense = { args: { name: "choice", scale: "dense" } };
export const Print = { args: { name: "choice", scale: "print" } };
export const Stage = { args: { name: "choice", scale: "stage" } };
export const Night = { args: { name: "choice", night: true } };

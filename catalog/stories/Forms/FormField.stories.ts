import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "form-field" } };
export const Dense = { args: { name: "form-field", scale: "dense" } };
export const Print = { args: { name: "form-field", scale: "print" } };
export const Stage = { args: { name: "form-field", scale: "stage" } };
export const Night = { args: { name: "form-field", night: true } };

import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "stepper" } };
export const Dense = { args: { name: "stepper", scale: "dense" } };
export const Print = { args: { name: "stepper", scale: "print" } };
export const Stage = { args: { name: "stepper", scale: "stage" } };
export const Night = { args: { name: "stepper", night: true } };

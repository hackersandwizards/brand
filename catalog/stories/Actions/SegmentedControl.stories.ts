import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "segmented" } };
export const Dense = { args: { name: "segmented", scale: "dense" } };
export const Print = { args: { name: "segmented", scale: "print" } };
export const Stage = { args: { name: "segmented", scale: "stage" } };
export const Night = { args: { name: "segmented", night: true } };

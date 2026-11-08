import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "frame" } };
export const Dense = { args: { name: "frame", scale: "dense" } };
export const Print = { args: { name: "frame", scale: "print" } };
export const Stage = { args: { name: "frame", scale: "stage" } };
export const Night = { args: { name: "frame", night: true } };

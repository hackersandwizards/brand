import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "avatar" } };
export const Dense = { args: { name: "avatar", scale: "dense" } };
export const Print = { args: { name: "avatar", scale: "print" } };
export const Stage = { args: { name: "avatar", scale: "stage" } };
export const Night = { args: { name: "avatar", night: true } };

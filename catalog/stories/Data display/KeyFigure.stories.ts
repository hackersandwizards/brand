import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "kpi" } };
export const Dense = { args: { name: "kpi", scale: "dense" } };
export const Print = { args: { name: "kpi", scale: "print" } };
export const Stage = { args: { name: "kpi", scale: "stage" } };
export const Night = { args: { name: "kpi", night: true } };

import ListFilterDemo from "../../ListFilterDemo.astro";

export default { component: ListFilterDemo };
export const Dense = { args: { scale: "dense" } };
export const Screen = { args: { scale: "screen" } };
export const Night = { args: { night: true } };
export const Inert = { args: { scale: "screen", mode: "inert" } };
export const Listed = { args: { scale: "screen", mode: "listed" } };
export const Source = { args: { scale: "screen", mode: "source" } };
export const Many = { args: { scale: "screen", mode: "many" } };

import Element from "../../Element.astro";

export default { component: Element };
export const Screen = { args: { name: "prose" } };
export const Dense = { args: { name: "prose", scale: "dense" } };
export const Print = { args: { name: "prose", scale: "print" } };
export const Stage = { args: { name: "prose", scale: "stage" } };
export const Night = { args: { name: "prose", night: true } };
export const ReadingWidth = {
  args: { name: "prose", scale: "dense", settings: "--hw-prose-width: 14rem" },
};

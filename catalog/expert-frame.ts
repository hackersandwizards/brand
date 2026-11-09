import ExpertFrame from "./ExpertFrame.astro";

/** A story's decorator: the expert component `component` in its frame. */
export const expert = (component: string) => ({ component: ExpertFrame, props: { component } });

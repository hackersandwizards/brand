/** Reads the system motion preference at the moment an interaction starts. */
export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

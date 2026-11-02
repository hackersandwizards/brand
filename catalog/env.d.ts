// For tsc, which reads no .astro file: the stories import Element.astro.
declare module "*.astro" {
  const component: (props: Record<string, unknown>) => unknown;
  export default component;
}

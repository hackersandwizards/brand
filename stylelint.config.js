// The stylelint base from scaffolding: a stylesheet reads only the custom properties brand's tokens
// define, the print layer, the expert set's roles, or the booth banners' own sheet tokens.
import styles from "@hackersandwizards/scaffolding/stylelint";

export default styles({
  importFrom: ["./tokens/print.css", "./expert/expert.css", "./applications/booth/tokens.css"],
});

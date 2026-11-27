#!/usr/bin/env bun
/**
 * Prints the prompt for a generated LinkedIn sketch, then each worked example: a filled prompt and
 * the post image it produced, sketch-example-<name>.png beside it in this folder (the brand
 * catalogue shows them).
 *
 *   bun run brand-linkedin-sketch-prompt
 */
import { answerHelp, printSketchPrompt } from "../../scan/help";

answerHelp(
  "usage: brand-linkedin-sketch-prompt\nPrints the prompt for a generated LinkedIn sketch, then each worked example.",
);

printSketchPrompt(import.meta.dir);

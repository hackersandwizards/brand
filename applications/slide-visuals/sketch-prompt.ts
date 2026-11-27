#!/usr/bin/env bun
/**
 * Prints the prompt for a generated slide sketch, then each worked example: the filled parts of the
 * prompt and the sketch it produced, sketch-example-<name>.png beside it in this folder (the brand
 * catalogue shows them).
 *
 *   bun run brand-slide-sketch-prompt
 */
import { answerHelp, printSketchPrompt } from "../../scan/help";

answerHelp(
  "usage: brand-slide-sketch-prompt\nPrints the prompt for a generated slide sketch, then each worked example.",
);

printSketchPrompt(import.meta.dir);

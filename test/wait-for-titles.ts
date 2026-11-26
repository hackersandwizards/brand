import { TimeoutError } from "puppeteer-core";

/** A timeout lets the caller compare the rows that are actually visible. */
export async function waitForTitles(wait: Promise<unknown>) {
  try {
    await wait;
  } catch (error) {
    if (!(error instanceof TimeoutError)) throw error;
  }
}

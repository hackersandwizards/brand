import { availableParallelism, loadavg } from "node:os";

/** How many times a wait stretches, as the gate reads the machine: the one-minute load against the
 *  cores (SCAFFOLDING_LOAD stands in for the load), 1 up to one waiting process per core, at most
 *  10. A navigation waits 30 s times it. */
export const loadFactor = () =>
  Math.min(
    10,
    Math.max(1, Number(process.env.SCAFFOLDING_LOAD ?? loadavg()[0]) / availableParallelism() || 1),
  );

/** How many pages load side by side: 1.5 per core, at most 48, at least `floor`. A load mostly
 *  waits for the network to go quiet, so the machine's load does not shrink it. */
export const tabs = (floor: number) =>
  Math.max(floor, Math.min(Math.round(availableParallelism() * 1.5), 48));

/** `run` over `items`, at most `limit` at a time, each call told which of the `limit` workers runs it;
 * the results in the items' order. */
export async function pool<T, R>(
  items: T[],
  limit: number,
  run: (item: T, worker: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(items.length, limit) }, async (_, worker) => {
      for (let i = next++; i < items.length; i = next++) out[i] = await run(items[i], worker);
    }),
  );
  return out;
}

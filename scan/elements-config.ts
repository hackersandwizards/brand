import type { Csp } from "./browser-csp";
import { isRecord, isStringList } from "./help";
import { basePath, type CatalogDirectory, type MountedSite } from "./site";

export const LIST = "brand-elements.json";
export type Exception = string | { reason: string; files?: string[] };
export type Config = {
  pages: string[];
  exceptions?: Record<string, Exception>;
  lightOnly?: boolean;
  site?: Site;
  catalog?: Catalog;
  csp?: Csp;
};

/** The "site" of brand-elements.json: a built folder, served at its root or, as { dir, at }, at the
 * base path it was built for. */
export type Site = string | { dir: string; at?: string };

/** The "catalog" of brand-elements.json. */
export type Catalog = string | CatalogDirectory;

/** Reads the folder common to site and catalog entries before validating their own keys. */
function folderEntry(raw: unknown): { dir: string; at?: unknown; exclude?: unknown } | undefined {
  if (typeof raw === "string" && raw) return { dir: raw };
  if (isRecord(raw) && typeof raw.dir === "string" && raw.dir)
    return { dir: raw.dir, at: raw.at, exclude: raw.exclude };
}

/** The folder and path of a "site" or --site with --site-at; undefined for none. */
export const listedSite = (site?: unknown, at?: string): MountedSite | undefined => {
  if (site == null) return;
  const folder = folderEntry(site);
  const prefix = folder?.at;
  if (!folder || (!at && prefix != null && typeof prefix !== "string"))
    throw new Error(
      `brand-elements.json "site": ${JSON.stringify(site)} does not tell the check where to serve the build. Set "site" to the built folder or to { "dir": "<folder>", "at": "<path>" }.`,
    );
  return { dir: folder.dir, at: basePath(at || (typeof prefix === "string" ? prefix : "") || "/") };
};

/** Reads the catalog settings that brand-elements and brand-markers share in brand-elements.json. */
export const listedCatalog = ({ catalog }: { catalog?: unknown }): Partial<CatalogDirectory> => {
  if (catalog == null) return {};
  const entry = folderEntry(catalog);
  if (
    !entry ||
    (entry.at != null && typeof entry.at !== "string") ||
    (entry.exclude !== undefined && !isStringList(entry.exclude))
  )
    throw new Error(
      'brand-elements.json "catalog": the check cannot locate or filter stories with this setting. Use a built folder path or set "dir" with an optional string "at" and an optional array of glob strings in "exclude".',
    );
  if (typeof catalog === "string") return { dir: entry.dir };
  return { dir: entry.dir, at: entry.at ?? undefined, exclude: entry.exclude };
};

export const readElementsConfig = (json: string) => {
  const config: unknown = JSON.parse(json);
  if (!isRecord(config))
    throw new Error(
      'brand-elements.json: the check needs an object to read page and catalog settings. Put "pages" or "catalog" in a JSON object.',
    );
  return config;
};

export const listedElementPages = (value: unknown) => {
  if (value == null) return [];
  if (!isStringList(value))
    throw new Error(
      'brand-elements.json "pages": the check cannot read the page list. Set "pages" to an array of URL or path strings.',
    );
  return value;
};

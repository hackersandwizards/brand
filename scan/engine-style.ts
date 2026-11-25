// A style element the documents engine (@hackersandwizards/documents) wrote into a document it
// composed: the engine's own stylesheets, inlined so the document stands alone, which the engine's
// gate scans in its source. Whatever else the document carries is the consumer's and is read.
export const ENGINE_STYLE =
  /<style\s+data-hw-(?:document|components|page|onepager|readout|certificate)\b[^>]*>[\s\S]*?<\/style>/g;

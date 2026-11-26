export function createBrowserColorProbe() {
  const probe = document.createElement("i");

  const read = (element: Element, expression: string): readonly [number, number, number] => {
    probe.style.color = expression;
    element.append(probe);
    try {
      const computed = getComputedStyle(probe).color;
      const channels = computed.match(/-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?/gi);
      if (!computed.startsWith("color(") || channels?.length !== 3)
        throw new Error(`Expected three channels for ${expression}, got ${computed}`);
      return [Number(channels[0]), Number(channels[1]), Number(channels[2])];
    } finally {
      probe.style.removeProperty("color");
      probe.remove();
    }
  };

  const rgba = (element: Element, color: string) => {
    const [r, g, b] = read(element, `color(from ${color} srgb r g b / 1)`);
    // Project alpha into a colour channel so serialization includes it even for opaque colours.
    const [a] = read(element, `color(from ${color} srgb alpha 0 0 / 1)`);
    return [r, g, b, a] as const;
  };

  const luminance = (element: Element, rgb: readonly number[]) => {
    const [r, g, b] = read(
      element,
      `color(from color(srgb ${rgb.slice(0, 3).join(" ")}) srgb-linear r g b / 1)`,
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  return { rgba, luminance };
}

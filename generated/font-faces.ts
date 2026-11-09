// Generated from tokens/fonts.css by scripts/tokens.ts. Edit the source, never this file.

/** fonts.css's @font-face rules, its web faces and fallback faces with every descriptor, for a
 *  surface that serves the font files from its own path: each file's url is `base` followed by the
 *  file name, or what `base` returns for the file name, such as a data: URL. */
export const fontFaceRules = (base: string | ((file: string) => string)) => {
  const url = typeof base === "string" ? (file: string) => base + file : base;
  return `@font-face {
  font-family: "Inter Variable";
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url("${url("inter-latin-wght-normal.woff2")}") format("woff2-variations");
}

@font-face {
  font-family: "Inter Variable";
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url("${url("inter-latin-ext-wght-normal.woff2")}") format("woff2-variations");
  unicode-range:
    U+0100-0130, U+0132-0151, U+0154-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF,
    U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F,
    U+A720-A7FF;
}

@font-face {
  font-family: "JetBrains Mono Variable";
  font-style: normal;
  font-display: swap;
  font-weight: 100 800;
  src: url("${url("jetbrains-mono-latin-wght-normal.woff2")}") format("woff2-variations");
}

@font-face {
  font-family: "JetBrains Mono Variable";
  font-style: normal;
  font-display: swap;
  font-weight: 100 800;
  src: url("${url("jetbrains-mono-latin-ext-wght-normal.woff2")}") format("woff2-variations");
  unicode-range:
    U+0100-0101, U+0103-0130, U+0132-0151, U+0154-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7,
    U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113,
    U+2C60-2C7F, U+A720-A7FF;
}

@font-face {
  font-family: "Inter Fallback";
  font-weight: 100 449;
  src: local("Arial"), local("ArialMT");
  size-adjust: 107.14%;
  ascent-override: 90.42%;
  descent-override: 22.51%;
  line-gap-override: 0%;
  unicode-range: U+0000, U+0020-007E, U+00A0-00AC, U+00AE-0148, U+014A-01C3, U+01C5-0254, U+0256-027B, U+027E-0284, U+0286-0290, U+0292-02A4, U+02A6-02CC, U+02CE-02D7, U+02DA, U+02DC-0301, U+0303-0304, U+0308-0309, U+0323, U+1D00, U+1D0D, U+1D1B, U+1D43, U+1D47-1D49, U+1D4D, U+1D4F-1D50, U+1D52, U+1D56-1D58, U+1D5B, U+1D62-1D65, U+1D9C, U+1DA0, U+1DBB, U+1DBF, U+1E00-1E9B, U+1E9D-1E9F, U+1EF2-1EFF, U+2002, U+2009, U+200B, U+2013-2014, U+2018-201A, U+201C-201E, U+2020, U+2022, U+2026, U+2032-2033, U+2039-203A, U+2044, U+20A0-20AF, U+20B1-20B5, U+20B8-20BA, U+20BC-20BF, U+2113, U+2122, U+2191, U+2193, U+2212, U+2C7C, U+2C7F, U+A7FF, U+FEFF;
}

@font-face {
  font-family: "Inter Fallback";
  font-weight: 450 549;
  src: local("Arial"), local("ArialMT");
  size-adjust: 108.28%;
  ascent-override: 89.47%;
  descent-override: 22.28%;
  line-gap-override: 0%;
  unicode-range: U+0000, U+0020-007E, U+00A0-00AC, U+00AE-0148, U+014A-01C3, U+01C5-0254, U+0256-027B, U+027E-0284, U+0286-0290, U+0292-02A4, U+02A6-02CC, U+02CE-02D7, U+02DA, U+02DC-0301, U+0303-0304, U+0308-0309, U+0323, U+1D00, U+1D0D, U+1D1B, U+1D43, U+1D47-1D49, U+1D4D, U+1D4F-1D50, U+1D52, U+1D56-1D58, U+1D5B, U+1D62-1D65, U+1D9C, U+1DA0, U+1DBB, U+1DBF, U+1E00-1E9B, U+1E9D-1E9F, U+1EF2-1EFF, U+2002, U+2009, U+200B, U+2013-2014, U+2018-201A, U+201C-201E, U+2020, U+2022, U+2026, U+2032-2033, U+2039-203A, U+2044, U+20A0-20AF, U+20B1-20B5, U+20B8-20BA, U+20BC-20BF, U+2113, U+2122, U+2191, U+2193, U+2212, U+2C7C, U+2C7F, U+A7FF, U+FEFF;
}

@font-face {
  font-family: "Inter Fallback";
  font-weight: 550 649;
  src: local("Arial Bold"), local("Arial-BoldMT");
  size-adjust: 101.38%;
  ascent-override: 95.56%;
  descent-override: 23.79%;
  line-gap-override: 0%;
  unicode-range: U+0000, U+0020-007E, U+00A0-00AC, U+00AE-0148, U+014A-01C3, U+01C5-0254, U+0256-027B, U+027E-0284, U+0286-0290, U+0292-02A4, U+02A6-02CC, U+02CE-02D7, U+02DA, U+02DC-0301, U+0303-0304, U+0308-0309, U+0323, U+1D00, U+1D0D, U+1D1B, U+1D43, U+1D47-1D49, U+1D4D, U+1D4F-1D50, U+1D52, U+1D56-1D58, U+1D5B, U+1D62-1D65, U+1D9C, U+1DA0, U+1DBB, U+1DBF, U+1E00-1E9B, U+1E9D-1E9F, U+1EF2-1EFF, U+2002, U+2009, U+200B, U+2013-2014, U+2018-201A, U+201C-201E, U+2020, U+2022, U+2026, U+2032-2033, U+2039-203A, U+2044, U+20A0-20AF, U+20B1-20B5, U+20B8-20BA, U+20BC-20BF, U+2113, U+2122, U+2191, U+2193, U+2212, U+2C7C, U+2C7F, U+A7FF, U+FEFF;
}

@font-face {
  font-family: "Inter Fallback";
  font-weight: 650 900;
  src: local("Arial Bold"), local("Arial-BoldMT");
  size-adjust: 102.41%;
  ascent-override: 94.60%;
  descent-override: 23.55%;
  line-gap-override: 0%;
  unicode-range: U+0000, U+0020-007E, U+00A0-00AC, U+00AE-0148, U+014A-01C3, U+01C5-0254, U+0256-027B, U+027E-0284, U+0286-0290, U+0292-02A4, U+02A6-02CC, U+02CE-02D7, U+02DA, U+02DC-0301, U+0303-0304, U+0308-0309, U+0323, U+1D00, U+1D0D, U+1D1B, U+1D43, U+1D47-1D49, U+1D4D, U+1D4F-1D50, U+1D52, U+1D56-1D58, U+1D5B, U+1D62-1D65, U+1D9C, U+1DA0, U+1DBB, U+1DBF, U+1E00-1E9B, U+1E9D-1E9F, U+1EF2-1EFF, U+2002, U+2009, U+200B, U+2013-2014, U+2018-201A, U+201C-201E, U+2020, U+2022, U+2026, U+2032-2033, U+2039-203A, U+2044, U+20A0-20AF, U+20B1-20B5, U+20B8-20BA, U+20BC-20BF, U+2113, U+2122, U+2191, U+2193, U+2212, U+2C7C, U+2C7F, U+A7FF, U+FEFF;
}

@font-face {
  font-family: "JetBrains Mono Fallback";
  font-weight: 100 549;
  src: local("Courier New"), local("CourierNewPSMT");
  size-adjust: 99.98%;
  ascent-override: 102.02%;
  descent-override: 30.01%;
  line-gap-override: 0%;
  unicode-range: U+000D, U+0020-007E, U+00A0-0131, U+0134-017F, U+018F, U+0192, U+01A0-01A1, U+01AF-01B0, U+01CD-01CE, U+01E6-01E7, U+01EA-01EB, U+01F4-01F5, U+01FC-01FF, U+0218-021B, U+0232-0233, U+0237, U+0259, U+02B9-02BA, U+02BC, U+02C6-02C7, U+02C9, U+02DA, U+02DC-02DD, U+02F3, U+02F7, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+1E80-1E85, U+1E9E, U+1EF2-1EF9, U+2013-2014, U+2018-201A, U+201C-201E, U+2020, U+2022, U+2026, U+2032-2033, U+2039-203A, U+2044, U+20AB-20AC, U+20AE, U+20BD, U+20BF, U+2113, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
}

@font-face {
  font-family: "JetBrains Mono Fallback";
  font-weight: 550 900;
  src: local("Courier New Bold"), local("CourierNewPS-BoldMT");
  size-adjust: 99.98%;
  ascent-override: 102.02%;
  descent-override: 30.01%;
  line-gap-override: 0%;
  unicode-range: U+000D, U+0020-007E, U+00A0-0131, U+0134-017F, U+018F, U+0192, U+01A0-01A1, U+01AF-01B0, U+01CD-01CE, U+01E6-01E7, U+01EA-01EB, U+01F4-01F5, U+01FC-01FF, U+0218-021B, U+0232-0233, U+0237, U+0259, U+02B9-02BA, U+02BC, U+02C6-02C7, U+02C9, U+02DA, U+02DC-02DD, U+02F3, U+02F7, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+1E80-1E85, U+1E9E, U+1EF2-1EF9, U+2013-2014, U+2018-201A, U+201C-201E, U+2020, U+2022, U+2026, U+2032-2033, U+2039-203A, U+2044, U+20AB-20AC, U+20AE, U+20BD, U+20BF, U+2113, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
}`;
};

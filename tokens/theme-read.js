// Run inline in <head> before first paint to prevent a flash of the wrong theme.
// Astro: import themeRead from "@hackersandwizards/brand/theme-read.js?raw";
// <script is:inline set:html={themeRead} />
{
  let theme;
  try {
    theme = localStorage.getItem("theme");
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== "SecurityError") throw error;
  }
  if (theme !== "dark" && theme !== "light") {
    theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", theme);
}

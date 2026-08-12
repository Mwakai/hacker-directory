(function () {
  const STORAGE_KEY = "hd-theme";

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById("theme-toggle");
    if (btn)
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      );
  }

  // Apply immediately to avoid flash of wrong theme
  applyTheme(getPreferredTheme());

  window.HDTheme = {
    init: function () {
      const btn = document.getElementById("theme-toggle");
      if (!btn) return;
      btn.addEventListener("click", function () {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        btn.classList.add("spin");
        setTimeout(function () {
          btn.classList.remove("spin");
        }, 500);
        applyTheme(next);
      });
    },
  };
})();

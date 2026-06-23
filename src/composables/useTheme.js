import { ref } from "vue";

const STORAGE_KEY = "theme";

const theme = ref(null); // Null = not yet initialized

function resolveInitial() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  // No stored preference — use system
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme() {
  document.documentElement.classList.toggle("dark", theme.value === "dark");
}

let initialized = false;

export function useTheme() {
  if (!initialized && typeof globalThis !== "undefined") {
    theme.value = resolveInitial();
    applyTheme();
    initialized = true;
  }

  function setTheme(value) {
    theme.value = value;
    localStorage.setItem(STORAGE_KEY, value);
    applyTheme();
  }

  function toggleTheme() {
    setTheme(theme.value === "dark" ? "light" : "dark");
  }

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}

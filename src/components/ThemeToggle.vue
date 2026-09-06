<template>
  <button
    class="theme-toggle"
    type="button"
    :title="tooltip"
    :aria-label="tooltip"
    @click="toggleTheme"
  >
    <i :class="icon" aria-hidden="true" />
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useTheme } from "../composables/useTheme";

const { theme, toggleTheme } = useTheme();

const icon = computed(() => (theme.value === "dark" ? "pi pi-moon" : "pi pi-sun"));

const tooltip = computed(() => `Switch to ${theme.value === "dark" ? "light" : "dark"} mode`);
</script>

<style scoped>
.theme-toggle {
  display: flex;
  width: var(--control-size);
  height: var(--control-size);
  padding: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-base);
  cursor: pointer;
  transition:
    background var(--motion-base) var(--ease-standard),
    border-color var(--motion-base) var(--ease-standard),
    color var(--motion-base) var(--ease-standard);
}

.theme-toggle:hover {
  color: var(--text-primary);
  background: var(--bg-surface);
}
</style>

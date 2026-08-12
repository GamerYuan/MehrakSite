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
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.theme-toggle:hover {
  color: var(--text-primary);
  background: var(--bg-surface);
}
</style>

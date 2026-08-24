<script setup>
defineProps({
  as: { type: String, default: "section" },
  interactive: Boolean,
  compact: Boolean,
});
</script>

<template>
  <component
    :is="as"
    :class="[
      'surface-card',
      { 'surface-card-interactive': interactive, 'surface-card-compact': compact },
    ]"
  >
    <slot />
  </component>
</template>

<style scoped>
.surface-card {
  min-width: 0;
  padding: var(--space-6);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  background: var(--card-surface);
  box-shadow: var(--shadow-sm);
}

.surface-card-compact {
  padding: var(--space-4);
}

.surface-card-interactive {
  transition:
    border-color var(--motion-base) var(--ease-standard),
    box-shadow var(--motion-base) var(--ease-standard),
    transform var(--motion-base) var(--ease-standard);
}

.surface-card-interactive:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
</style>

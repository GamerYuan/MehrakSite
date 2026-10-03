<script setup>
defineProps({
  icon: { type: String, default: "pi pi-inbox" },
  title: { type: String, required: true },
  description: String,
});
</script>

<template>
  <div class="empty-state-panel">
    <i :class="icon" aria-hidden="true"></i>
    <strong>{{ title }}</strong>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: center;
  padding: var(--space-12) var(--space-4);
  border: 1px dashed var(--border-secondary);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
  text-align: center;
}

.empty-state-panel > i {
  color: var(--accent);
  font-size: var(--text-2xl);
}

.empty-state-panel > strong {
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-lg);
}

.empty-state-panel > p {
  margin: 0;
}
</style>

<script setup>
import SurfaceCard from "./SurfaceCard.vue";

defineProps({
  id: { type: String, default: "admin-panel-title" },
  title: { type: String, required: true },
  count: String,
});
</script>

<template>
  <SurfaceCard compact class="admin-panel" :aria-labelledby="id">
    <header class="admin-panel__header">
      <h2 :id="id">{{ title }}</h2>
      <strong v-if="count">{{ count }}</strong>
      <slot name="actions" />
    </header>
    <slot name="filters" />
    <div class="admin-panel__content"><slot /></div>
  </SurfaceCard>
</template>

<style scoped>
.admin-panel {
  overflow: hidden;
  padding: 0;
}

.admin-panel__header {
  display: flex;
  min-height: var(--control-size);
  padding: var(--space-3) var(--space-4);
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  border-bottom: 1px solid var(--divider);
  background: var(--bg-surface-sunken);
}

.admin-panel__header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
}

.admin-panel__header strong {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.admin-panel__content {
  min-width: 0;
}
</style>

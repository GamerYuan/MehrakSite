<script setup>
defineProps({
  summary: String,
  clearable: Boolean,
});

defineEmits(["clear"]);
</script>

<template>
  <div class="admin-filter-bar">
    <div class="admin-filter-bar__controls"><slot /></div>
    <div v-if="summary || clearable" class="admin-filter-bar__summary" aria-live="polite">
      <span v-if="summary">{{ summary }}</span>
      <button v-if="clearable" type="button" @click="$emit('clear')">Clear filters</button>
    </div>
  </div>
</template>

<style scoped>
.admin-filter-bar {
  display: grid;
  padding: var(--space-4);
  gap: var(--space-3);
  border-bottom: 1px solid var(--divider);
}

.admin-filter-bar__controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.admin-filter-bar__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.admin-filter-bar button {
  min-height: var(--control-size);
  padding: 0 var(--space-3);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--accent-strong);
  font-weight: 650;
  cursor: pointer;
}
</style>

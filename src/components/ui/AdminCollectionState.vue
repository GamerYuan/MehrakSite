<script setup>
import Button from "primevue/button";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import EmptyState from "./EmptyState.vue";

defineProps({
  loading: Boolean,
  error: String,
  empty: Boolean,
  filtered: Boolean,
  loadingLabel: { type: String, default: "Loading records…" },
  emptyTitle: { type: String, default: "No records available" },
  emptyDescription: String,
  filteredTitle: { type: String, default: "No records match the active filters" },
});

defineEmits(["retry", "clear"]);
</script>

<template>
  <div v-if="loading" class="collection-state" role="status" aria-live="polite" aria-busy="true">
    <ProgressSpinner style="width: 2rem; height: 2rem" strokeWidth="4" />
    <span>{{ loadingLabel }}</span>
  </div>
  <div v-else-if="error" class="collection-error" role="alert">
    <Message severity="error" :closable="false">{{ error }}</Message>
    <Button label="Retry" icon="pi pi-refresh" severity="secondary" @click="$emit('retry')" />
  </div>
  <EmptyState
    v-else-if="filtered"
    icon="pi pi-filter-slash"
    :title="filteredTitle"
    description="Clear the active criteria to restore all records."
  >
    <Button label="Clear filters" severity="secondary" text @click="$emit('clear')" />
  </EmptyState>
  <EmptyState v-else-if="empty" :title="emptyTitle" :description="emptyDescription">
    <slot name="empty-actions" />
  </EmptyState>
  <slot v-else />
</template>

<style scoped>
.collection-state,
.collection-error {
  display: flex;
  min-height: 12rem;
  padding: var(--space-6);
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  border: 1px dashed var(--border-secondary);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
}

.collection-error {
  flex-direction: column;
  border-style: solid;
}
</style>

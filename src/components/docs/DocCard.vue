<script setup>
import GameTag from "./GameTag.vue";

defineProps({
  doc: { type: Object, required: true },
  index: { type: Number, required: true },
});

const emit = defineEmits(["click"]);
</script>

<template>
  <button type="button" class="doc-card" @click="emit('click', doc)">
    <span class="card-index" aria-hidden="true">/{{ String(index).padStart(2, "0") }}</span>
    <span class="card-top">
      <strong class="card-name">/{{ doc.name }}</strong>
      <GameTag :game="doc.game" size="small" />
    </span>
    <span class="card-desc">{{ doc.description }}</span>
    <span class="card-foot">
      <span>Open field note</span>
      <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
    </span>
  </button>
</template>

<style scoped>
.doc-card {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 11rem;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  overflow: hidden;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--card-surface);
  box-shadow: var(--shadow-sm);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition:
    border-color var(--motion-base) var(--ease-standard),
    box-shadow var(--motion-base) var(--ease-standard),
    transform var(--motion-base) var(--ease-standard);
}

.doc-card::after {
  position: absolute;
  right: -2.75rem;
  bottom: -3.75rem;
  width: 8rem;
  height: 8rem;
  border: 1px solid var(--border-primary);
  border-radius: 50%;
  content: "";
  opacity: 0.65;
}

.doc-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-index {
  position: absolute;
  top: var(--space-2);
  right: var(--space-3);
  color: var(--border-secondary);
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  line-height: 1;
  opacity: 0.45;
}

.card-top,
.card-foot {
  position: relative;
  z-index: 1;
  display: flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.card-top {
  padding-right: var(--space-8);
  align-items: flex-start;
}

.card-name {
  min-width: 0;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  overflow-wrap: anywhere;
}

.card-desc {
  position: relative;
  z-index: 1;
  display: -webkit-box;
  flex: 1;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.card-foot {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>

<script setup>
import GameTag from "./GameTag.vue";
import SurfaceCard from "../ui/SurfaceCard.vue";

defineProps({
  doc: { type: Object, required: true },
});

const emit = defineEmits(["click"]);
</script>

<template>
  <SurfaceCard as="button" type="button" class="doc-card" interactive @click="emit('click', doc)">
    <span class="card-top">
      <strong class="card-name">/{{ doc.name }}</strong>
      <GameTag :game="doc.game" size="small" />
    </span>
    <span class="card-desc">{{ doc.description }}</span>
    <span class="card-foot">View command details <i class="pi pi-arrow-right" aria-hidden="true"></i></span>
  </SurfaceCard>
</template>

<style scoped>
.doc-card {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 9.5rem;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.card-top,
.card-foot {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.card-top {
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
  margin-top: auto;
  color: var(--text-muted);
  font-size: var(--text-xs);
  font-weight: 600;
  transition: color var(--motion-fast) var(--ease-standard);
}

.doc-card:hover .card-foot {
  color: var(--accent-strong);
}
</style>

<script setup>
import GameTag from "./GameTag.vue";
import SurfaceCard from "../ui/SurfaceCard.vue";

defineProps({
  doc: { type: Object, required: true },
});

const emit = defineEmits(["click"]);
</script>

<template>
  <SurfaceCard
    as="button"
    type="button"
    class="doc-card"
    interactive
    :aria-label="`Open /${doc.name} command reference`"
    @click="emit('click', doc)"
  >
    <span class="doc-card__header">
      <GameTag :game="doc.game" size="small" />
      <span class="doc-card__open" aria-hidden="true">
        <i class="pi pi-arrow-up-right"></i>
      </span>
    </span>

    <span class="doc-card__command">
      <span aria-hidden="true">/</span>
      <code>{{ doc.name }}</code>
    </span>

    <span class="doc-card__description">{{ doc.description }}</span>
  </SurfaceCard>
</template>

<style scoped>
.doc-card {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 13rem;
  overflow: hidden;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  border-color: var(--border-primary);
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.doc-card::after {
  position: absolute;
  right: -4rem;
  bottom: -5rem;
  width: 10rem;
  height: 10rem;
  border: 1px solid color-mix(in oklch, var(--accent) 16%, transparent);
  border-radius: 50%;
  content: "";
  pointer-events: none;
}

.doc-card__header,
.doc-card__command {
  display: flex;
  align-items: center;
}

.doc-card__header {
  justify-content: space-between;
  gap: var(--space-3);
}

.doc-card__open {
  display: grid;
  width: var(--control-size);
  height: var(--control-size);
  place-items: center;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-surface-raised);
  color: var(--text-muted);
  transition:
    border-color var(--motion-fast) var(--ease-standard),
    color var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-standard);
}

.doc-card__command {
  min-width: 0;
  min-height: var(--control-size);
  padding: var(--space-3) var(--space-4);
  gap: var(--space-2);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--code-bg);
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-base);
  font-weight: 650;
}

.doc-card__command code {
  overflow-wrap: anywhere;
}

.doc-card__description {
  display: -webkit-box;
  flex: 1;
  overflow: hidden;
  color: var(--text-secondary);
  line-height: var(--leading-body);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.doc-card:hover .doc-card__open,
.doc-card:focus-visible .doc-card__open {
  border-color: var(--accent);
  color: var(--accent-strong);
  transform: translate(0.1rem, -0.1rem);
}
</style>

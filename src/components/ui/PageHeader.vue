<script setup>
defineProps({
  as: { type: String, default: "h2" },
  eyebrow: String,
  title: { type: String, required: true },
  subtitle: String,
  icon: String,
});
</script>

<template>
  <header class="page-header">
    <div v-if="icon" class="page-header-icon" aria-hidden="true">
      <i :class="icon"></i>
    </div>
    <div class="page-header-copy">
      <p v-if="eyebrow" class="page-header-eyebrow">{{ eyebrow }}</p>
      <component :is="as" class="page-header-title">{{ title }}</component>
      <p v-if="subtitle" class="page-header-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header-actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--border-primary);
}

.page-header-icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-lg);
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.page-header-copy {
  min-width: 0;
  flex: 1;
}

.page-header-eyebrow {
  margin: 0 0 var(--space-1);
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header-title {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: var(--leading-snug);
}

.page-header-subtitle {
  max-width: 44rem;
  margin: var(--space-1) 0 0;
  color: var(--text-secondary);
}

.page-header-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

@media (max-width: 40rem) {
  .page-header {
    flex-wrap: wrap;
  }

  .page-header-actions {
    width: 100%;
  }
}
</style>

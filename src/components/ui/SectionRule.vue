<script setup>
defineProps({ label: String });
</script>

<template>
  <div class="section-rule" aria-hidden="true">
    <span v-if="label">{{ label }}</span>
  </div>
</template>

<style scoped>
.section-rule {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-rule::after {
  height: 1px;
  flex: 1;
  background: var(--border-primary);
  content: "";
}
</style>

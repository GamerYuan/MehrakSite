<script setup>
defineProps({
  tone: {
    type: String,
    default: "neutral",
    validator: (value) =>
      typeof value === "string" &&
      ["neutral", "success", "warn", "danger", "info", "brand"].includes(value),
  },
  icon: String,
});
</script>

<template>
  <span :class="['status-pill', `status-pill-${tone}`]">
    <i v-if="icon" :class="icon" aria-hidden="true"></i>
    <slot />
  </span>
</template>

<style scoped>
.status-pill {
  display: inline-flex;
  gap: var(--space-1);
  align-items: center;
  width: fit-content;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-pill);
  background: var(--bg-surface-raised);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1;
  text-transform: uppercase;
}

.status-pill-success {
  border-color: var(--success);
  background: var(--success-soft);
  color: var(--success);
}
.status-pill-warn {
  border-color: var(--warn);
  background: var(--warn-soft);
  color: var(--warn);
}
.status-pill-danger {
  border-color: var(--danger);
  background: var(--danger-soft);
  color: var(--danger);
}
.status-pill-info {
  border-color: var(--info);
  background: var(--info-soft);
  color: var(--info);
}
.status-pill-brand {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
}
</style>

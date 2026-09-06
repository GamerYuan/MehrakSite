<script setup>
defineProps({
  command: { type: String, required: true },
  label: { type: String, required: true },
});
</script>

<template>
  <div class="command-preview">
    <div class="command-preview__input">
      <span aria-hidden="true">&gt;</span>
      <code :aria-label="label">{{ command }}</code>
      <span class="command-preview__cursor" aria-hidden="true"></span>
    </div>
    <div class="command-preview__output">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.command-preview {
  overflow: hidden;
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
  background: var(--bg-surface-raised);
  box-shadow: var(--shadow-lg);
}

.command-preview__input {
  display: flex;
  min-height: var(--control-size);
  padding: var(--space-3) var(--space-4);
  align-items: center;
  gap: var(--space-3);
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-surface-sunken);
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.command-preview__input code {
  overflow: hidden;
  color: var(--text-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-preview__cursor {
  width: 0.45rem;
  height: 1.1rem;
  margin-left: auto;
  background: var(--accent);
  animation: cursor-pulse 1.2s steps(2, jump-none) infinite;
}

.command-preview__output {
  padding: var(--space-3);
}

@keyframes cursor-pulse {
  50% {
    opacity: 0.2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .command-preview__cursor {
    animation: none;
  }
}
</style>

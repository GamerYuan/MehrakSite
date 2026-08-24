<script setup>
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import GameTag from "./GameTag.vue";

const props = defineProps({
  visible: Boolean,
  doc: Object,
  loading: Boolean,
  error: String,
});

const emit = defineEmits(["update:visible"]);
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :pt="{ root: { 'aria-labelledby': 'doc-detail-modal-title' } }"
    :style="{ width: '92%', maxWidth: '560px' }"
    class="doc-modal"
  >
    <template #header>
      <div class="modal-heading">
        <h2 id="doc-detail-modal-title" class="modal-title">
          /{{ doc?.name || "documentation" }}
        </h2>
        <GameTag v-if="doc" :game="doc.game" size="small" />
      </div>
    </template>
    <div v-if="loading" class="modal-loader" role="status" aria-live="polite">
      <ProgressSpinner style="width: 32px; height: 32px" strokeWidth="3" />
      <span>Loading details...</span>
    </div>

    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-else-if="doc" class="modal-body">
      <section class="modal-section">
        <h3 class="modal-label">Description</h3>
        <p class="modal-text">{{ doc.description }}</p>
      </section>

      <section v-if="doc.name" class="modal-section">
        <h3 class="modal-label">Usage</h3>
        <div class="modal-code">
          /{{ doc.name
          }}<template v-if="doc.parameters?.length"
            ><template v-for="p in doc.parameters" :key="p.name"
              ><template v-if="p.required">&lt;{{ p.name }}&gt;</template
              ><template v-else> [{{ p.name }}]</template></template
            ></template
          >
        </div>
      </section>

      <section v-if="doc.parameters?.length" class="modal-section">
        <h3 class="modal-label">Parameters</h3>
        <div class="param-list">
          <div v-for="p in doc.parameters" :key="p.name" class="param-row">
            <div class="param-head">
              <code class="param-name">{{ p.name }}</code>
              <span class="param-type">{{ p.type }}</span>
              <span v-if="p.required" class="param-req">Required</span>
            </div>
            <p v-if="p.description" class="param-desc">{{ p.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="doc.examples?.length" class="modal-section">
        <h3 class="modal-label">Examples</h3>
        <div class="modal-code modal-code-block">
          <template v-for="(ex, i) in doc.examples" :key="i">
            {{ ex }}<br v-if="i < doc.examples.length - 1" />
          </template>
        </div>
      </section>
    </div>
  </Dialog>
</template>

<style scoped>
.modal-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  color: var(--text-muted);
}

.modal-title {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 600;
}

.modal-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-3);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-badge-row {
  display: flex;
}

.modal-section {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.modal-label {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.modal-text {
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0;
  font-size: 0.8125rem;
}

.modal-code {
  padding: 0.75rem 1rem;
  background: var(--code-bg);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--accent);
  word-break: break-all;
  line-height: 1.6;
}

.modal-code-block {
  line-height: 1.8;
  white-space: pre-wrap;
}

.param-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.param-row {
  padding: 0.75rem;
  background: var(--card-surface);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
}

.param-head {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}

.param-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.8125rem;
}

.param-type {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.0625rem 0.375rem;
  background: var(--accent-soft);
  color: var(--accent);
  border-radius: 0.1875rem;
  font-family: var(--font-mono);
}

.param-req {
  font-size: 0.5625rem;
  font-weight: 700;
  padding: 0.0625rem 0.3125rem;
  background: var(--danger-soft);
  color: var(--danger);
  border-radius: 0.1875rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.param-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

:deep(.p-dialog-header) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-primary);
}

:deep(.p-dialog-content) {
  padding: 1.25rem;
}
</style>

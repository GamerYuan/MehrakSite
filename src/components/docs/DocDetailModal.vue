<script setup>
import { computed, onUnmounted, ref, watch } from "vue";
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
const copied = ref(false);
let copyTimer = null;

const parameters = computed(() => {
  const values = props.doc?.parameters ?? props.doc?.Parameters;
  if (!Array.isArray(values)) return [];
  return values.map((parameter) => ({
    name: parameter.name ?? parameter.Name ?? "",
    type: parameter.type ?? parameter.Type ?? "text",
    description: parameter.description ?? parameter.Description ?? "",
    required: parameter.required ?? parameter.Required ?? false,
  }));
});

const examples = computed(() => {
  const values = props.doc?.examples ?? props.doc?.Examples;
  return Array.isArray(values)
    ? values.map((example) => String(example).trim()).filter(Boolean)
    : [];
});

const usage = computed(() => {
  const command = `/${props.doc?.name || "command"}`;
  return parameters.value.reduce(
    (value, parameter) =>
      `${value}${parameter.required ? ` <${parameter.name}>` : ` [${parameter.name}]`}`,
    command,
  );
});

const copyUsage = async () => {
  if (!globalThis.navigator.clipboard) return;
  await globalThis.navigator.clipboard.writeText(usage.value);
  copied.value = true;
  globalThis.clearTimeout(copyTimer);
  copyTimer = globalThis.setTimeout(() => (copied.value = false), 1800);
};

watch(
  () => props.visible,
  (visible) => {
    if (!visible) copied.value = false;
  },
);
onUnmounted(() => globalThis.clearTimeout(copyTimer));
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    class="doc-modal"
    :pt="{ root: { 'aria-labelledby': 'doc-detail-modal-title' } }"
    :style="{ width: 'min(48rem, calc(100vw - 2rem))' }"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div class="modal-heading">
        <div class="modal-command-title">
          <span aria-hidden="true">/</span>
          <h2 id="doc-detail-modal-title">{{ doc?.name || "documentation" }}</h2>
          <GameTag v-if="doc" :game="doc.game" size="small" class="modal-game-tag" />
        </div>
      </div>
    </template>

    <div v-if="loading" class="modal-loader" role="status" aria-live="polite">
      <ProgressSpinner style="width: 2rem; height: 2rem" strokeWidth="3" />
      <span>Loading command details…</span>
    </div>

    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-else-if="doc" class="modal-body">
      <section class="description-panel" aria-labelledby="command-description-title">
        <h3 id="command-description-title">Description</h3>
        <p>{{ doc.description }}</p>
      </section>

      <section class="usage-panel" aria-labelledby="command-usage-title">
        <header>
          <div>
            <h3 id="command-usage-title">Usage</h3>
            <p>Required values use angle brackets; optional values use square brackets.</p>
          </div>
          <button
            type="button"
            class="copy-button"
            :aria-label="copied ? 'Command copied' : 'Copy command usage'"
            @click="copyUsage"
          >
            <i :class="copied ? 'pi pi-check' : 'pi pi-copy'" aria-hidden="true"></i>
            <span>{{ copied ? "Copied" : "Copy" }}</span>
          </button>
        </header>
        <pre><code>{{ usage }}</code></pre>
      </section>

      <section
        v-if="parameters.length"
        class="detail-section"
        aria-labelledby="command-parameters-title"
      >
        <div class="section-heading">
          <h3 id="command-parameters-title">Parameters</h3>
          <span>{{ parameters.length }}</span>
        </div>
        <div class="parameter-grid">
          <article v-for="parameter in parameters" :key="parameter.name" class="parameter-card">
            <header>
              <code>{{ parameter.name }}</code>
              <div>
                <span class="parameter-type">{{ parameter.type }}</span>
                <span v-if="parameter.required" class="parameter-required">Required</span>
                <span v-else class="parameter-optional">Optional</span>
              </div>
            </header>
            <p v-if="parameter.description">{{ parameter.description }}</p>
          </article>
        </div>
      </section>

      <section
        v-if="examples.length"
        class="detail-section"
        aria-labelledby="command-examples-title"
      >
        <div class="section-heading">
          <h3 id="command-examples-title">Examples</h3>
          <span>{{ examples.length }}</span>
        </div>
        <div class="example-list">
          <pre
            v-for="(example, index) in examples"
            :key="`${example}-${index}`"
          ><code>{{ example }}</code></pre>
        </div>
      </section>
    </div>
  </Dialog>
</template>

<style scoped>
.modal-loader {
  display: grid;
  min-height: 16rem;
  place-items: center;
  align-content: center;
  gap: var(--space-3);
  color: var(--text-muted);
}

.modal-heading,
.modal-command-title,
.usage-panel > header,
.section-heading,
.parameter-card > header {
  display: flex;
  align-items: center;
}

.modal-heading {
  min-width: 0;
  flex: 1;
  justify-content: space-between;
  gap: var(--space-4);
}

.modal-command-title {
  min-width: 0;
  gap: var(--space-2);
  color: var(--accent-strong);
  font-family: var(--font-mono);
}

.modal-game-tag {
  margin-left: var(--space-2);
  flex: 0 0 auto;
}

.modal-command-title h2 {
  overflow: hidden;
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: clamp(var(--text-lg), 3vw, var(--text-2xl));
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-body {
  display: grid;
  gap: var(--space-6);
}

.description-panel {
  padding: var(--space-5);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-raised);
}

.description-panel h3,
.usage-panel h3,
.detail-section h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
}

.description-panel p {
  margin: var(--space-2) 0 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: var(--leading-body);
}

.usage-panel {
  overflow: hidden;
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-sunken);
}

.usage-panel > header {
  padding: var(--space-4) var(--space-5);
  justify-content: space-between;
  gap: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
}

.usage-panel header p {
  margin: var(--space-1) 0 0;
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.usage-panel pre,
.example-list pre {
  overflow-x: auto;
  margin: 0;
}

.usage-panel pre {
  padding: var(--space-5);
}

.usage-panel code,
.example-list code {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.copy-button {
  display: inline-flex;
  min-width: 5.5rem;
  min-height: var(--control-size);
  padding: 0 var(--space-3);
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-weight: 650;
  cursor: pointer;
}

.detail-section {
  display: grid;
  gap: var(--space-3);
}

.section-heading {
  min-height: var(--control-size);
  justify-content: space-between;
  border-bottom: 1px solid var(--divider);
}

.section-heading > span {
  display: grid;
  min-width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
}

.parameter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.parameter-card {
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
}

.parameter-card > header {
  justify-content: space-between;
  gap: var(--space-3);
}

.parameter-card header > div {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-1);
}

.parameter-card > header > code {
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-weight: 700;
}

.parameter-type,
.parameter-required,
.parameter-optional {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 650;
}

.parameter-type {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.parameter-required {
  background: var(--danger-soft);
  color: var(--danger);
}

.parameter-optional {
  background: var(--bg-surface-sunken);
  color: var(--text-muted);
}

.parameter-card p {
  margin: var(--space-3) 0 0;
  color: var(--text-secondary);
  line-height: var(--leading-body);
}

.example-list {
  display: grid;
  gap: var(--space-2);
}

.example-list pre {
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--code-bg);
}

:deep(.p-dialog-header) {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-primary);
}

:deep(.p-dialog-content) {
  padding: var(--space-6);
}

@media (max-width: 40rem) {
  .modal-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .usage-panel > header {
    align-items: flex-start;
  }

  .parameter-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  :deep(.p-dialog-header),
  :deep(.p-dialog-content) {
    padding: var(--space-4);
  }
}
</style>

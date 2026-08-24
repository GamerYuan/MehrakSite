<script setup>
import { computed, ref, useId } from "vue";

const props = defineProps({
  inputId: { type: String, default: "" },
  label: { type: String, required: true },
  accept: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  status: { type: String, default: "" },
});

const emit = defineEmits(["select"]);
const generatedId = useId();
const input = ref(null);
const selectedName = ref("");
const id = computed(() => props.inputId || generatedId);
const statusId = computed(() => `${id.value}-status`);

const onChange = (event) => {
  const file = event.target.files?.[0] ?? null;
  selectedName.value = file?.name ?? "";
  if (file) emit("select", file);
  // Reset so re-picking the same file fires another change event.
  event.target.value = "";
};

const clear = () => {
  selectedName.value = "";
  if (input.value) input.value.value = "";
};

defineExpose({ clear });
</script>

<template>
  <div class="file-upload-field" :class="{ 'is-disabled': disabled }">
    <label :for="id" class="file-upload-label">{{ label }}</label>
    <input
      :id="id"
      ref="input"
      class="file-upload-input"
      type="file"
      :accept="accept"
      :disabled="disabled"
      :aria-describedby="statusId"
      @change="onChange"
    />
    <label :for="id" class="file-upload-control">
      <span class="file-upload-action">
        <i class="pi pi-upload" aria-hidden="true"></i>
        Choose file
      </span>
      <span class="file-upload-name">{{ selectedName || "No file selected" }}</span>
    </label>
    <span :id="statusId" class="file-upload-status" role="status" aria-live="polite">
      {{ status || (selectedName ? "File selected" : "Awaiting selection") }}
    </span>
  </div>
</template>

<style scoped>
.file-upload-field {
  display: grid;
  gap: var(--space-2);
}

.file-upload-label {
  color: var(--text-primary);
  font-weight: 600;
}

.file-upload-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.file-upload-control {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  min-height: 2.75rem;
  overflow: hidden;
  color: var(--text-primary);
  background: var(--bg-surface-sunken);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    border-color var(--motion-fast) var(--ease-standard),
    background var(--motion-fast) var(--ease-standard);
}

.file-upload-field:focus-within .file-upload-control {
  outline: var(--focus-width) solid var(--focus-color);
  outline-offset: 2px;
  border-color: var(--focus-color);
}

.file-upload-control:hover {
  background: var(--bg-surface-raised);
  border-color: var(--border-secondary);
}

.file-upload-action {
  display: flex;
  align-self: stretch;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-3);
  color: var(--accent-contrast);
  background: var(--accent);
  font-weight: 600;
}

.file-upload-name {
  min-width: 0;
  padding: 0 var(--space-3);
  overflow: hidden;
  color: var(--text-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-upload-status {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.is-disabled {
  opacity: 0.55;
}

.is-disabled .file-upload-control {
  cursor: not-allowed;
}

@media (max-width: 420px) {
  .file-upload-control {
    grid-template-columns: 1fr;
  }

  .file-upload-action,
  .file-upload-name {
    min-height: 2.5rem;
  }

  .file-upload-name {
    display: flex;
    align-items: center;
  }
}
</style>

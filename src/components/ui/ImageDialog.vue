<script setup>
import Dialog from "primevue/dialog";

const props = defineProps({
  visible: Boolean,
  title: { type: String, required: true },
  description: { type: String, required: true },
  src: { type: String, required: true },
  alt: { type: String, required: true },
});

const emit = defineEmits(["update:visible"]);
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    dismissable-mask
    block-scroll
    close-on-escape
    :header="title"
    :aria-describedby="`${$attrs.id || 'image-dialog'}-description`"
    class="image-dialog"
    @update:visible="emit('update:visible', $event)"
  >
    <img class="image-dialog__image" :src="src" :alt="alt" />
    <p :id="`${$attrs.id || 'image-dialog'}-description`" class="image-dialog__description">
      {{ description }}
    </p>
  </Dialog>
</template>

<style>
.image-dialog {
  width: min(76rem, calc(100vw - 2rem));
  max-height: calc(100svh - 2rem);
}

.image-dialog .p-dialog-content {
  display: grid;
  min-height: 0;
  gap: var(--space-4);
}

.image-dialog__image {
  display: block;
  width: 100%;
  max-height: calc(100svh - 12rem);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-sunken);
  object-fit: contain;
}

.image-dialog__description {
  margin: 0;
  color: var(--text-secondary);
}
</style>

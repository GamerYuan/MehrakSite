<script setup>
import PageHeader from "./PageHeader.vue";

defineProps({
  id: { type: String, default: "admin-page-title" },
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: String,
});
</script>

<template>
  <section class="admin-page-shell" :aria-labelledby="id">
    <PageHeader
      :id="id"
      as="h1"
      :eyebrow="eyebrow"
      :title="title"
      :subtitle="description"
      :icon="icon"
      class="admin-page-shell__header"
    >
      <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    </PageHeader>
    <slot />
  </section>
</template>

<style scoped>
.admin-page-shell {
  max-width: 86rem;
  margin: 0 auto;
}

.admin-page-shell__header {
  margin-bottom: var(--space-8);
}
</style>

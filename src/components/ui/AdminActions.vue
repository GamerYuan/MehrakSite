<script setup>
defineProps({
  pending: Boolean,
  label: { type: String, default: "Record actions" },
});
</script>

<template>
  <div class="admin-actions" role="group" :aria-label="label" :aria-busy="pending">
    <div class="admin-actions__primary"><slot /></div>
    <div v-if="$slots.destructive" class="admin-actions__destructive">
      <slot name="destructive" />
    </div>
  </div>
</template>

<style scoped>
.admin-actions,
.admin-actions__primary,
.admin-actions__destructive {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.admin-actions__destructive {
  padding-left: var(--space-2);
  border-left: 1px solid var(--divider);
}
</style>

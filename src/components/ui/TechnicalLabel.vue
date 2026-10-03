<script setup>
defineProps({
  as: { type: String, default: "span" },
});
</script>

<template>
  <component :is="as" class="technical-label"><slot /></component>
</template>

<style scoped>
.technical-label {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 650;
  letter-spacing: 0.06em;
  line-height: 1.4;
  text-transform: uppercase;
}
</style>

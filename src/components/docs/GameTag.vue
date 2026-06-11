<script setup>
import { computed } from "vue";
import { gameMeta } from "../../configs/gameMeta";

const props = defineProps({
  game: { type: String, required: true },
  size: { type: String, default: "normal", validator: (v) => ["small", "normal"].includes(v) },
});

const meta = computed(() => gameMeta[props.game] || gameMeta.Unsupported);
</script>

<template>
  <span
    :class="['tag', size === 'small' ? 'tag-sm' : 'tag-md']"
    :style="{
      color: meta.lightColor || meta.color,
      background: meta.lightBgColor || meta.bgColor,
      borderColor: meta.lightBorderColor || meta.borderColor,
    }"
  >
    {{ meta.shortLabel || meta.label }}
  </span>
</template>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  border-radius: 0.25rem;
  border: 1px solid;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
}
.tag-sm {
  font-size: 0.5625rem;
  padding: 0.0625rem 0.375rem;
}
.tag-md {
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
}
</style>

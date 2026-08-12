<script setup>
import { computed } from "vue";
import { gameMeta } from "../../configs/gameMeta";

const props = defineProps({
  game: { type: String, required: true },
  size: {
    type: String,
    default: "normal",
    validator: (value) => ["small", "normal"].includes(value),
  },
  full: Boolean,
});

const meta = computed(() => gameMeta[props.game] || gameMeta.Unsupported);
</script>

<template>
  <span
    :class="['game-tag', `game-tag-${size}`]"
    :style="{
      '--tag-color-light': meta.lightColor || meta.color,
      '--tag-bg-light': meta.lightBgColor || meta.bgColor,
      '--tag-border-light': meta.lightBorderColor || meta.borderColor,
      '--tag-color-dark': meta.color,
      '--tag-bg-dark': meta.bgColor,
      '--tag-border-dark': meta.borderColor,
    }"
  >
    <span class="game-tag-dot" aria-hidden="true"></span>
    {{ full ? meta.label : meta.shortLabel || meta.label }}
  </span>
</template>

<style scoped>
.game-tag {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  width: fit-content;
  border: 1px solid var(--tag-border-light);
  border-radius: var(--radius-pill);
  background: var(--tag-bg-light);
  color: var(--tag-color-light);
  font-family: var(--font-mono);
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
}

:global(.dark) .game-tag {
  border-color: var(--tag-border-dark);
  background: var(--tag-bg-dark);
  color: var(--tag-color-dark);
}

.game-tag-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: currentColor;
}

.game-tag-small {
  padding: 0.25rem 0.45rem;
  font-size: 0.5625rem;
}

.game-tag-normal {
  padding: 0.35rem 0.65rem;
  font-size: 0.625rem;
}
</style>

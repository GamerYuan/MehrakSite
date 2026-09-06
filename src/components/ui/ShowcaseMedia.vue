<script setup>
import CommandPreview from "./CommandPreview.vue";

defineProps({
  src: { type: String, required: true },
  srcset: { type: String, required: true },
  sizes: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  alt: { type: String, required: true },
  loading: { type: String, default: "lazy" },
  expandLabel: { type: String, required: true },
  command: { type: String, default: "" },
  commandLabel: { type: String, default: "Example Discord command" },
});

defineEmits(["expand"]);
</script>

<template>
  <figure class="showcase-media">
    <CommandPreview
      v-if="command"
      :command="command"
      :label="commandLabel"
    >
      <button
        type="button"
        class="showcase-media__zoom"
        :aria-label="expandLabel"
        @click="$emit('expand', $event)"
      >
        <picture>
          <source type="image/webp" :srcset="srcset" :sizes="sizes" />
          <img
            :src="src"
            :width="width"
            :height="height"
            :alt="alt"
            :loading="loading === 'eager' ? 'eager' : 'lazy'"
            decoding="async"
          />
        </picture>
      </button>
    </CommandPreview>
    <div v-else class="showcase-media__frame">
      <button
        type="button"
        class="showcase-media__zoom"
        :aria-label="expandLabel"
        @click="$emit('expand', $event)"
      >
        <picture>
          <source type="image/webp" :srcset="srcset" :sizes="sizes" />
          <img
            :src="src"
            :width="width"
            :height="height"
            :alt="alt"
            :loading="loading === 'eager' ? 'eager' : 'lazy'"
            decoding="async"
          />
        </picture>
      </button>
    </div>
    <figcaption v-if="$slots.default"><slot /></figcaption>
  </figure>
</template>

<style scoped>
.showcase-media {
  min-width: 0;
  margin: 0;
}

.showcase-media__frame {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-sunken);
}

.showcase-media__zoom {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
}

.showcase-media__zoom:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.showcase-media__zoom picture,
.showcase-media__zoom img {
  display: block;
  width: 100%;
}

.showcase-media__zoom img {
  height: auto;
  border-radius: var(--radius-lg);
  object-fit: contain;
}

.showcase-media figcaption {
  margin-top: var(--space-3);
  color: var(--text-secondary);
}
</style>

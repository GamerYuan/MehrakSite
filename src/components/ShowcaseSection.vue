<script setup>
import CardDeckShowcase from "./CardDeckShowcase.vue";

defineProps({
  index: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: Array, required: true },
  reversed: { type: Boolean, default: false },
});
</script>

<template>
  <section class="showcase-section" :class="{ reversed }">
    <div class="showcase-copy">
      <span class="section-index">OBSERVATION / {{ index }}</span>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
    <CardDeckShowcase :images="images" :label="title" />
  </section>
</template>

<style scoped>
.showcase-section {
  display: grid;
  grid-template-columns: minmax(14rem, 0.7fr) minmax(0, 1.6fr);
  align-items: center;
  gap: clamp(var(--space-8), 7vw, var(--space-20));
  padding: clamp(var(--space-12), 9vw, var(--space-24)) 0;
  border-top: 1px solid var(--border-primary);
}

.showcase-section.reversed {
  grid-template-columns: minmax(0, 1.6fr) minmax(14rem, 0.7fr);
}

.showcase-section.reversed .showcase-copy {
  order: 2;
}

.section-index {
  color: var(--brass);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.11em;
}

h3 {
  margin: var(--space-3) 0 var(--space-4);
  font-size: clamp(var(--text-2xl), 4vw, var(--text-3xl));
  font-weight: 600;
  line-height: var(--leading-snug);
}

p {
  max-width: 32rem;
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
}

@media (max-width: 48rem) {
  .showcase-section,
  .showcase-section.reversed {
    grid-template-columns: minmax(0, 1fr);
  }

  .showcase-section.reversed .showcase-copy {
    order: 0;
  }
}
</style>

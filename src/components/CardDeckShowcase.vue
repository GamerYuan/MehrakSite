<script setup>
defineProps({
  images: { type: Array, required: true },
  label: { type: String, required: true },
});
</script>

<template>
  <div class="plate" :style="{ '--count': Math.min(images.length, 4) }">
    <figure v-for="(image, index) in images.slice(0, 4)" :key="image" class="plate-item">
      <img :src="image" :alt="`${label} generated card example ${index + 1}`" loading="lazy" />
      <figcaption>PLATE {{ String(index + 1).padStart(2, "0") }}</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.plate {
  display: grid;
  grid-template-columns: repeat(var(--count), minmax(0, 1fr));
  width: min(100%, 52rem);
  padding: var(--space-6) var(--space-4) var(--space-8);
  border-top: 1px solid var(--border-secondary);
  border-bottom: 1px solid var(--border-secondary);
  background: var(--bg-surface-raised);
  box-shadow: var(--shadow-md);
}

.plate-item {
  position: relative;
  min-width: 0;
  margin: 0 -8%;
  padding: var(--space-2);
  border: 1px solid var(--border-secondary);
  background: var(--bg-surface);
  box-shadow: var(--shadow-md);
}

.plate-item:nth-child(odd) {
  transform: translateY(-3%) rotate(-1.2deg);
}

.plate-item:nth-child(even) {
  transform: translateY(5%) rotate(1.5deg);
}

.plate-item:hover {
  z-index: 2;
  transform: translateY(-5%) rotate(0);
}

.plate-item img {
  display: block;
  width: 100%;
  height: clamp(11rem, 23vw, 22rem);
  object-fit: contain;
}

.plate-item figcaption {
  padding: var(--space-2) 0 0;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.1em;
}

@media (max-width: 40rem) {
  .plate {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .plate-item {
    margin: -3% -3%;
  }

  .plate-item img {
    height: 10rem;
  }
}
</style>

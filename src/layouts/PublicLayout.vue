<script setup>
import { nextTick, ref, watch } from "vue";
import { RouterView, useRoute } from "vue-router";
import AppFooter from "../components/AppFooter.vue";
import AppNavbar from "../components/AppNavbar.vue";

const route = useRoute();
const main = ref(null);

watch(
  () => route.path,
  async (path, previousPath) => {
    if (path === previousPath) return;
    await nextTick();
    main.value?.focus();
  },
);
</script>

<template>
  <div class="public-layout">
    <a class="skip-link" href="#public-main">Skip to main content</a>
    <AppNavbar />
    <main id="public-main" ref="main" class="public-main" tabindex="-1">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.public-layout {
  position: relative;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  overflow: clip;
  background: var(--page-gradient);
}

.public-layout::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: min(28rem, 55vh);
  background: var(--glow-dendro-soft);
  pointer-events: none;
  z-index: 0;
}

/* Keep content above the glow without overriding the navbar's sticky stacking layer. */
.public-layout > main,
.public-layout > footer {
  position: relative;
  z-index: 1;
}

.public-main {
  flex: 1;
  min-width: 0;
}

.skip-link {
  position: fixed;
  top: var(--space-3);
  left: var(--space-3);
  z-index: 1000;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--accent-strong);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-weight: 600;
  text-decoration: none;
  transform: translateY(calc(-100% - var(--space-6)));
  transition: transform var(--motion-fast) var(--ease-enter);
}

.skip-link:focus {
  transform: translateY(0);
}
</style>

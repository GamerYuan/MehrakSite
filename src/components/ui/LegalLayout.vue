<script setup>
defineProps({
  eyebrow: { type: String, default: "" },
  title: { type: String, required: true },
  summary: { type: String, default: "" },
  filed: { type: String, required: true },
  updated: { type: String, required: true },
  sections: { type: Array, required: true },
});

const sectionId = (section) =>
  typeof section === "object" && section !== null && "id" in section ? String(section.id) : "";
const sectionLabel = (section) =>
  typeof section === "object" && section !== null && "label" in section
    ? String(section.label)
    : "";
</script>
<template>
  <article class="legal-page">
    <header class="legal-header">
      <p v-if="eyebrow" class="legal-eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="summary" class="legal-summary">{{ summary }}</p>
    </header>
    <div class="legal-filed">
      <span>{{ filed }}</span>
    </div>
    <div class="legal-grid">
      <details class="legal-mobile-toc">
        <summary>On this page</summary>
        <nav aria-label="On this page">
          <a v-for="section in sections" :key="sectionId(section)" :href="`#${sectionId(section)}`">
            {{ sectionLabel(section) }}
          </a>
        </nav>
      </details>
      <aside class="legal-toc">
        <nav aria-label="On this page">
          <p>On this page</p>
          <a v-for="section in sections" :key="sectionId(section)" :href="`#${sectionId(section)}`">
            {{ sectionLabel(section) }}
          </a>
        </nav>
      </aside>
      <div class="legal-content">
        <p class="last-updated"><strong>Last updated:</strong> {{ updated }}</p>
        <slot />
      </div>
    </div>
  </article>
</template>

<style scoped>
.legal-page {
  width: min(100% - 2rem, 78rem);
  margin: 0 auto;
  padding: clamp(var(--space-16), 8vw, var(--space-24)) 0 var(--space-24);
}

.legal-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.8fr);
  gap: var(--space-4) var(--space-16);
  align-items: end;
}

.legal-eyebrow {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.legal-header h1 {
  margin: 0;
  font-size: var(--text-4xl);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: var(--leading-tight);
}

.legal-summary {
  max-width: 30rem;
  margin: 0 0 var(--space-2);
  color: var(--text-secondary);
  font-size: var(--text-lg);
}

.legal-filed {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  margin: var(--space-10) 0 var(--space-12);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.legal-filed::after {
  height: 1px;
  flex: 1;
  background: var(--border-secondary);
  content: "";
}

.legal-grid {
  display: grid;
  grid-template-columns: 13rem minmax(0, 48rem);
  gap: clamp(var(--space-8), 7vw, var(--space-16));
  align-items: start;
}

.legal-toc {
  position: sticky;
  top: 6rem;
}

.legal-toc nav {
  display: flex;
  max-height: calc(100vh - 8rem);
  flex-direction: column;
  gap: var(--space-1);
  overflow-y: auto;
  padding-left: var(--space-4);
  border-left: 1px solid var(--border-primary);
}

.legal-toc p {
  margin: 0 0 var(--space-2);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.legal-toc a {
  display: flex;
  min-height: var(--control-size);
  padding: var(--space-2) 0;
  align-items: center;
  color: var(--text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-snug);
  text-decoration: none;
}

.legal-toc a:hover {
  color: var(--accent-strong);
}

.last-updated {
  margin: 0 0 var(--space-8);
  color: var(--text-muted);
}

.legal-content :deep(h2) {
  margin: var(--space-10) 0 var(--space-3);
  color: var(--text-primary);
  font-size: var(--text-xl);
  scroll-margin-top: 6rem;
}

.legal-content :deep(h2:first-of-type) {
  margin-top: 0;
}
.legal-content :deep(h3) {
  margin: var(--space-6) 0 var(--space-2);
  color: var(--text-primary);
  font-size: var(--text-base);
}
.legal-content :deep(p),
.legal-content :deep(ul) {
  margin: 0 0 var(--space-4);
  color: var(--text-secondary);
  line-height: 1.75;
}
.legal-content :deep(ul) {
  padding-left: var(--space-6);
}
.legal-content :deep(li) {
  margin-bottom: var(--space-2);
}
.legal-content :deep(a) {
  color: var(--accent-strong);
}

.legal-mobile-toc {
  display: none;
}

.legal-mobile-toc summary {
  min-height: var(--control-size);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-weight: 650;
  cursor: pointer;
}

.legal-mobile-toc nav {
  display: grid;
  margin-top: var(--space-2);
  padding: var(--space-2);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-surface-raised);
}

.legal-mobile-toc a {
  display: flex;
  min-height: var(--control-size);
  padding: 0 var(--space-3);
  align-items: center;
  color: var(--text-secondary);
}

@media (max-width: 52rem) {
  .legal-header,
  .legal-grid {
    grid-template-columns: 1fr;
  }

  .legal-toc {
    display: none;
  }

  .legal-mobile-toc {
    display: block;
  }
}

@media (max-width: 40rem) {
  .legal-page {
    width: min(100% - 1.5rem, 78rem);
    padding-top: var(--space-12);
  }
  .legal-header h1 {
    font-size: clamp(2.65rem, 15vw, 4rem);
  }
  .legal-toc nav {
    grid-template-columns: 1fr;
  }
}
</style>

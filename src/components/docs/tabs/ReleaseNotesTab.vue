<script setup>
import { computed, onMounted, ref } from "vue";
import ProgressSpinner from "primevue/progressspinner";
import { useReleaseNotes } from "../../../composables/useReleaseNotes";
import EmptyState from "../../ui/EmptyState.vue";
import PageHeader from "../../ui/PageHeader.vue";
import StatusPill from "../../ui/StatusPill.vue";
import SurfaceCard from "../../ui/SurfaceCard.vue";

const { fetchAll } = useReleaseNotes();

const releases = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedVersion = ref("");

const getTypeOrder = (type) => ({ feature: 0, improvement: 1, fix: 2 })[type] ?? 3;

const sortedReleases = computed(() =>
  releases.value.map((r) => ({
    ...r,
    sections: r.sections.map((s) => ({
      ...s,
      notes: [...s.notes]
        .toSorted((a, b) => {
          const d = getTypeOrder(a.type) - getTypeOrder(b.type);
          return d !== 0 ? d : a.text.localeCompare(b.text);
        })
        .map((n) => {
          n.parts = parseNote(n.text);
          return n;
        }),
    })),
  })),
);

const parseNote = (text) => {
  const parts = [];
  const re = /\[(?<cmd>[^\]]+)\]/g;
  let last = 0;
  let m = re.exec(text);
  let hasCmd = false;
  while (m !== null) {
    hasCmd = true;
    if (m.index > last) parts.push({ type: "text", text: text.slice(last, m.index) });
    parts.push({ type: "cmd", text: m[1] });
    last = m.index + m[0].length;
    m = re.exec(text);
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return hasCmd ? parts : [{ type: "text", text }];
};

const typeStyle = (t) =>
  ({
    feature: { label: "Feature", tone: "brand" },
    improvement: { label: "Improvement", tone: "info" },
    fix: { label: "Fix", tone: "danger" },
  })[t] || { label: t, tone: "neutral" };

onMounted(async () => {
  try {
    releases.value = await fetchAll();
    if (releases.value.length) selectedVersion.value = releases.value[0].version;
  } catch {
    error.value = "Failed to load release notes.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="rn">
    <PageHeader
      as="h3"
      icon="pi pi-calendar"
      title="Release Notes"
      subtitle="Review command, documentation, and behavior changes by version."
    />

    <div v-if="loading" class="rn-state" role="status" aria-live="polite">
      <ProgressSpinner style="width: 32px; height: 32px" strokeWidth="3" />
    </div>
    <div v-else-if="error" class="rn-state" role="alert">{{ error }}</div>
    <EmptyState
      v-else-if="!sortedReleases.length"
      icon="pi pi-calendar"
      title="No release notes available"
    />

    <div v-else class="rn-layout">
      <div class="rn-list">
        <SurfaceCard
          v-for="release in sortedReleases"
          :key="release.version"
          :id="'release-' + release.version"
        >
          <div class="rn-card-head">
            <span class="rn-ver">{{ release.version }}</span>
            <span v-if="release.date" class="rn-date">{{ release.date }}</span>
          </div>

          <div v-for="section in release.sections" :key="section.name" class="rn-section">
            <h4 class="rn-section-label">{{ section.name }}</h4>
            <ul class="rn-notes">
              <li v-for="(note, i) in section.notes" :key="i" class="rn-note">
                <div class="rn-note-meta">
                  <StatusPill :tone="typeStyle(note.type).tone">{{
                    typeStyle(note.type).label
                  }}</StatusPill>
                  <template v-for="(part, pi) in note.parts" :key="pi">
                    <span v-if="part.type === 'cmd'" class="rn-cmd">{{ part.text }}</span>
                  </template>
                </div>
                <span class="rn-note-text">
                  <template v-for="(part, pi) in note.parts" :key="pi">
                    <span v-if="part.type === 'text'">{{ part.text }}</span>
                  </template>
                </span>
              </li>
            </ul>
          </div>
        </SurfaceCard>
      </div>

      <aside class="rn-versions">
        <SurfaceCard as="div" compact class="rn-versions-card">
          <h4 class="rn-versions-label">Versions</h4>
          <nav class="rn-versions-nav">
            <a
              v-for="r in sortedReleases"
              :key="r.version"
              :href="`#release-${r.version}`"
              :class="['rn-ver-btn', { active: selectedVersion === r.version }]"
              @click="selectedVersion = r.version"
            >
              {{ r.version }}
            </a>
          </nav>
        </SurfaceCard>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.rn {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rn-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.rn-layout {
  display: grid;
  grid-template-columns: 1fr 130px;
  gap: 1.5rem;
}

.rn-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rn-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border-primary);
}

.rn-ver {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.rn-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.rn-section {
  margin-bottom: 1rem;
}

.rn-section:last-child {
  margin-bottom: 0;
}

.rn-section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.625rem 0;
}

.rn-notes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rn-note {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
}

.rn-note-meta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.rn-cmd {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.1875rem;
  background: var(--info-soft);
  color: var(--info);
  font-family: var(--font-mono);
}

.rn-note-text {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.55;
  flex: 1;
  min-width: 0;
}

/* Versions sidebar */
.rn-versions {
  position: sticky;
  top: 5.5rem;
}

.rn-versions-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
}

.rn-versions-nav {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  max-height: 18rem;
  overflow-y: auto;
}

.rn-ver-btn {
  width: 100%;
  text-align: left;
  padding: 0.3125rem 0.5rem;
  border-radius: 0.3125rem;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.1s ease;
  text-decoration: none;
}

.rn-ver-btn:hover {
  color: var(--text-primary);
  background: var(--bg-surface);
}

.rn-ver-btn.active {
  color: var(--accent);
  background: var(--accent-soft);
}

@media (max-width: 1024px) {
  .rn-layout {
    grid-template-columns: 1fr;
  }
  .rn-versions {
    position: static;
  }
  .rn-versions-nav {
    flex-direction: row;
    overflow-x: auto;
    max-height: none;
    gap: 0.25rem;
  }
  .rn-ver-btn {
    white-space: nowrap;
  }
}
</style>

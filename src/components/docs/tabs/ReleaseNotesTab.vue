<script setup>
import { computed, onMounted, ref } from "vue";
import ProgressSpinner from "primevue/progressspinner";
import { useReleaseNotes } from "../../../composables/useReleaseNotes";

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
        .map((n) => ({ ...n, parts: parseNote(n.text) })),
    })),
  })),
);

const parseNote = (text) => {
  const parts = [];
  const re = /\[([^\]]+)\]/g;
  let last = 0;
  let m;
  let hasCmd = false;
  while ((m = re.exec(text)) !== null) {
    hasCmd = true;
    if (m.index > last) parts.push({ type: "text", text: text.slice(last, m.index) });
    parts.push({ type: "cmd", text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return hasCmd ? parts : [{ type: "text", text }];
};

const typeStyle = (t) =>
  ({
    feature: { label: "Feature", cls: "tp-feat" },
    improvement: { label: "Improvement", cls: "tp-imp" },
    fix: { label: "Fix", cls: "tp-fix" },
  })[t] || { label: t, cls: "tp-def" };

const scrollToVersion = (v) => {
  selectedVersion.value = v;
  document.getElementById(`release-${  v}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

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
    <div class="rn-hero">
      <div class="rn-hero-icon">
        <i class="pi pi-calendar"></i>
      </div>
      <div>
        <h1 class="rn-title">Release Notes</h1>
        <p class="rn-sub">Track documentation updates and behavior changes between bot releases.</p>
      </div>
    </div>

    <div v-if="loading" class="rn-state">
      <ProgressSpinner style="width: 32px; height: 32px" strokeWidth="3" />
    </div>
    <div v-else-if="error" class="rn-state">{{ error }}</div>
    <div v-else-if="!sortedReleases.length" class="rn-state">No release notes available.</div>

    <div v-else class="rn-layout">
      <div class="rn-list">
        <article
          v-for="release in sortedReleases"
          :key="release.version"
          :id="'release-' + release.version"
          class="rn-card"
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
                  <span :class="['rn-type', typeStyle(note.type).cls]">{{
                    typeStyle(note.type).label
                  }}</span>
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
        </article>
      </div>

      <aside class="rn-versions">
        <div class="rn-versions-card">
          <h4 class="rn-versions-label">Versions</h4>
          <nav class="rn-versions-nav">
            <button
              v-for="r in sortedReleases"
              :key="r.version"
              type="button"
              :class="['rn-ver-btn', { active: selectedVersion === r.version }]"
              @click="scrollToVersion(r.version)"
            >
              {{ r.version }}
            </button>
          </nav>
        </div>
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

.rn-hero {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.rn-hero-icon {
  width: 3rem;
  height: 3rem;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
}

.rn-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.rn-sub {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
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

.rn-card {
  background: var(--card-surface);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
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
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
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

.rn-type {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.1875rem;
  letter-spacing: 0.02em;
}

.tp-feat {
  background: rgba(34, 197, 94, 0.12);
  color: var(--accent);
}
.tp-imp {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}
.tp-fix {
  background: rgba(249, 115, 22, 0.12);
  color: #f97316;
}
.tp-def {
  background: var(--bg-surface);
  color: var(--text-muted);
}

.rn-cmd {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.1875rem;
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
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

.rn-versions-card {
  background: var(--card-surface);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1rem;
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
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.1s ease;
}

.rn-ver-btn:hover {
  color: var(--text-primary);
  background: var(--bg-surface);
}

.rn-ver-btn.active {
  color: var(--accent);
  background: rgba(34, 197, 94, 0.08);
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

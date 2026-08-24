<script setup>
import { computed, onMounted, ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import EmptyState from "../components/ui/EmptyState.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import StatusPill from "../components/ui/StatusPill.vue";
import SurfaceCard from "../components/ui/SurfaceCard.vue";
import { useReleaseNotes } from "../composables/useReleaseNotes";

const { fetchAll, createVersion, updateVersion, deleteVersion } = useReleaseNotes();
const confirm = useConfirm();
const toast = useToast();
const releases = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const error = ref(null);
const emptyNote = () => ({ type: "feature", text: "" });
const emptySection = () => ({ name: "", notes: [emptyNote()] });
const form = ref({ version: "", date: "", displayOrder: 0, sections: [emptySection()] });
const noteTypes = [
  { label: "Feature", value: "feature" },
  { label: "Improvement", value: "improvement" },
  { label: "Fix", value: "fix" },
];
const noteTone = (type) =>
  ({ feature: "brand", improvement: "info", fix: "danger" })[type] || "neutral";
const sortedReleases = computed(() =>
  [...releases.value].toSorted((a, b) => b.displayOrder - a.displayOrder),
);
const loadReleases = async () => {
  loading.value = true;
  error.value = null;
  try {
    releases.value = await fetchAll();
  } catch {
    error.value = "Failed to load release notes.";
  } finally {
    loading.value = false;
  }
};
const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    version: "",
    date: "",
    displayOrder:
      releases.value.reduce((max, release) => Math.max(max, release.displayOrder), 0) + 1,
    sections: [emptySection()],
  };
  showModal.value = true;
};
const openEditModal = (release) => {
  isEditing.value = true;
  editingId.value = release.id;
  form.value = {
    version: release.version,
    date: release.date,
    displayOrder: release.displayOrder,
    sections: release.sections.map((section) => ({
      name: section.name,
      notes: section.notes.map((note) => ({ type: note.type, text: note.text })),
    })),
  };
  showModal.value = true;
};
const addSection = () => form.value.sections.push(emptySection());
const removeSection = (index) => form.value.sections.splice(index, 1);
const addNote = (sectionIndex) => form.value.sections[sectionIndex].notes.push(emptyNote());
const removeNote = (sectionIndex, noteIndex) =>
  form.value.sections[sectionIndex].notes.splice(noteIndex, 1);
const warn = (detail) => toast.add({ severity: "warn", summary: "Validation", detail, life: 3000 });
const handleSave = async () => {
  if (!form.value.version.trim()) return warn("Version is required");
  const payload = {
    version: form.value.version.trim(),
    date: form.value.date?.trim() || "",
    displayOrder: form.value.displayOrder,
    sections: form.value.sections
      .filter((section) => section.name.trim())
      .map((section) => ({
        name: section.name.trim(),
        notes: section.notes
          .filter((note) => note.text.trim())
          .map((note) => ({ type: note.type.trim().toLowerCase(), text: note.text.trim() })),
      })),
  };
  if (!payload.sections.length) return warn("At least one section is required");
  saving.value = true;
  try {
    const success = isEditing.value
      ? await updateVersion(editingId.value, payload)
      : await createVersion(payload);
    if (success) {
      showModal.value = false;
      await loadReleases();
    }
  } finally {
    saving.value = false;
  }
};
const confirmDelete = (release) =>
  confirm.require({
    message: `Are you sure you want to delete version ${release.version}?`,
    header: "Confirm Delete",
    icon: "pi pi-exclamation-triangle",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    acceptProps: { label: "Delete", severity: "danger" },
    accept: async () => {
      if (await deleteVersion(release.id)) await loadReleases();
    },
  });
onMounted(loadReleases);
</script>

<template>
  <div class="management-page">
    <PageHeader
      as="h1"
      eyebrow="Administration / Releases"
      title="Release notes"
      subtitle="Publish the version history shown in public documentation."
      icon="pi pi-megaphone"
      class="management-header"
    >
      <template #actions>
        <Button icon="pi pi-plus" label="Add version" @click="openAddModal" />
      </template>
    </PageHeader>
    <SurfaceCard v-if="loading" class="state-panel" role="status">
      <ProgressSpinner style="width: 2rem; height: 2rem" strokeWidth="4" /><span
        >Loading release history...</span
      >
    </SurfaceCard>
    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>
    <EmptyState
      v-else-if="!sortedReleases.length"
      icon="pi pi-megaphone"
      title="No releases published"
      description="Create the first version to begin the public change log."
    >
      <Button label="Add first version" icon="pi pi-plus" text @click="openAddModal" />
    </EmptyState>

    <div v-else class="release-workspace">
      <SurfaceCard as="aside" compact class="release-index" aria-labelledby="version-index-title">
        <div class="panel-heading">
          <h2 id="version-index-title">Versions</h2>
        </div>
        <nav aria-label="Release versions">
          <a v-for="release in sortedReleases" :key="release.id" :href="`#release-${release.id}`"
            ><strong>{{ release.version }}</strong
            ><time v-if="release.date">{{ release.date }}</time></a
          >
        </nav>
      </SurfaceCard>
      <div class="release-list">
        <SurfaceCard
          v-for="release in sortedReleases"
          :id="`release-${release.id}`"
          :key="release.id"
          as="article"
          class="release-card"
        >
          <header>
            <div>
              <h2>{{ release.version }}</h2>
              <time v-if="release.date">{{ release.date }}</time>
            </div>
            <div class="row-actions">
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                text
                rounded
                aria-label="Edit release"
                @click="openEditModal(release)"
              /><Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                aria-label="Delete release"
                @click="confirmDelete(release)"
              />
            </div>
          </header>
          <section v-for="section in release.sections" :key="section.name" class="note-section">
            <h3>{{ section.name }}</h3>
            <ul>
              <li v-for="(note, noteIndex) in section.notes" :key="noteIndex">
                <StatusPill :tone="noteTone(note.type)">{{ note.type }}</StatusPill
                ><span>{{ note.text }}</span>
              </li>
            </ul>
          </section>
        </SurfaceCard>
      </div>
    </div>

    <Dialog
      v-model:visible="showModal"
      :header="isEditing ? 'Edit release version' : 'Add release version'"
      modal
      :style="{ width: '46rem' }"
    >
      <form class="release-form" @submit.prevent="handleSave">
        <div class="release-meta">
          <div class="field">
            <label for="release-version">Version</label
            ><InputText
              id="release-version"
              v-model="form.version"
              placeholder="v1.2.0"
              required
              fluid
            />
          </div>
          <div class="field">
            <label for="release-date">Date</label
            ><InputText id="release-date" v-model="form.date" placeholder="2026-08-12" fluid />
          </div>
        </div>
        <div class="field">
          <label for="release-order">Display order</label
          ><InputNumber inputId="release-order" v-model="form.displayOrder" fluid />
        </div>
        <div class="sections-editor">
          <section
            v-for="(section, sectionIndex) in form.sections"
            :key="sectionIndex"
            class="section-editor"
          >
            <header>
              <InputText
                v-model="section.name"
                :aria-label="`Section ${sectionIndex + 1} name`"
                placeholder="Section name"
                fluid
              /><Button
                type="button"
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                aria-label="Remove section"
                @click="removeSection(sectionIndex)"
              />
            </header>
            <div class="notes-editor">
              <div v-for="(note, noteIndex) in section.notes" :key="noteIndex" class="note-editor">
                <Select
                  v-model="note.type"
                  :options="noteTypes"
                  option-label="label"
                  option-value="value"
                  aria-label="Note type"
                /><Textarea
                  v-model="note.text"
                  :aria-label="`Note ${noteIndex + 1} text`"
                  placeholder="Describe the change"
                  rows="2"
                  fluid
                /><Button
                  type="button"
                  icon="pi pi-times"
                  severity="danger"
                  text
                  rounded
                  aria-label="Remove note"
                  @click="removeNote(sectionIndex, noteIndex)"
                />
              </div>
              <Button
                type="button"
                icon="pi pi-plus"
                label="Add note"
                text
                size="small"
                @click="addNote(sectionIndex)"
              />
            </div>
          </section>
        </div>
        <Button
          type="button"
          icon="pi pi-plus"
          label="Add section"
          text
          class="add-section"
          @click="addSection"
        />
        <div class="form-actions">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            outlined
            @click="showModal = false"
          /><Button type="submit" label="Save release" :loading="saving" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style scoped>
.management-page {
  max-width: 86rem;
  margin: 0 auto;
}
.management-header {
  margin-bottom: var(--space-8);
}
.state-panel {
  display: flex;
  min-height: 14rem;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: var(--text-muted);
}
.release-workspace {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  gap: var(--space-5);
  align-items: start;
}
.release-index {
  position: sticky;
  top: var(--space-5);
  overflow: hidden;
  padding: 0;
}
.panel-heading {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-surface-sunken);
}
.panel-heading h2 {
  margin: var(--space-1) 0 0;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-lg);
}
.release-index nav {
  display: flex;
  max-height: calc(100vh - 15rem);
  flex-direction: column;
  overflow-y: auto;
  padding: var(--space-2);
}
.release-index a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
}
.release-index a:hover {
  background: var(--bg-surface-raised);
  color: var(--text-primary);
}
.release-index strong {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}
.release-index time {
  color: var(--text-muted);
  font-size: 0.625rem;
}
.release-list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--space-4);
}
.release-card {
  scroll-margin-top: var(--space-6);
}
.release-card > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
}
.release-card h2 {
  margin: var(--space-1) 0 0;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-xl);
}
.release-card time {
  color: var(--text-muted);
  font-size: var(--text-xs);
}
.row-actions {
  display: flex;
}
.note-section {
  margin-top: var(--space-5);
}
.note-section h3 {
  margin: 0 0 var(--space-3);
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-lg);
}
.note-section ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.note-section li {
  display: grid;
  grid-template-columns: 6.5rem 1fr;
  gap: var(--space-3);
  align-items: start;
  color: var(--text-secondary);
}
.release-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.release-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.field label {
  color: var(--text-primary);
  font-weight: 600;
}
.sections-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.section-editor {
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-surface-raised);
}
.section-editor > header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-2);
}
.notes-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-left: var(--space-3);
  border-left: 2px solid var(--border-secondary);
}
.note-editor {
  display: grid;
  grid-template-columns: 9rem 1fr auto;
  gap: var(--space-2);
  align-items: start;
}
.add-section {
  align-self: flex-start;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-primary);
}
@media (max-width: 760px) {
  .management-header :deep(.page-header-actions .p-button) {
    width: 100%;
  }
  .release-workspace {
    grid-template-columns: 1fr;
  }
  .release-index {
    position: static;
  }
  .release-index nav {
    max-height: 12rem;
  }
  .release-meta,
  .note-editor {
    grid-template-columns: 1fr;
  }
  .note-editor :deep(.p-button) {
    justify-self: end;
  }
  .note-section li {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }
}
</style>

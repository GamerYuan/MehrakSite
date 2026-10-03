<script setup>
import { computed, onMounted, ref } from "vue";
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import { useConfirm } from "primevue/useconfirm";
import AdminActions from "../components/ui/AdminActions.vue";
import AdminCollectionState from "../components/ui/AdminCollectionState.vue";
import AdminFilterBar from "../components/ui/AdminFilterBar.vue";
import AdminPanel from "../components/ui/AdminPanel.vue";
import DocFormModal from "../components/docs/DocFormModal.vue";
import GameTag from "../components/docs/GameTag.vue";
import EmptyState from "../components/ui/EmptyState.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import { canManageGame, gameFilterOptions } from "../configs/gameMeta";
import { useApi } from "../composables/useApi";

const props = defineProps({ userInfo: { type: Object, required: true } });
const confirm = useConfirm();
const { apiFetch, apiFetchJson, showErrorToast, showSuccessToast, handleApiError } = useApi();
const documents = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const filterGame = ref("All");
const errorMsg = ref("");
const showModal = ref(false);
const selectedDoc = ref(null);
const isEditing = ref(false);
const saving = ref(false);
const expandedDocs = ref(new Set());
const toggleDocDetails = (id) => {
  const next = new Set(expandedDocs.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedDocs.value = next;
};
const hasGameWriteAccess = (game) => canManageGame(props.userInfo, game);

const fetchDocuments = async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const { ok, data, status } = await apiFetchJson("/docs/list");
    if (ok) documents.value = data;
    else {
      errorMsg.value = data.error || "Failed to fetch documentation";
      showErrorToast(errorMsg.value, status);
    }
  } catch (error) {
    errorMsg.value = error.message || "Failed to fetch documentation";
    handleApiError(error);
  } finally {
    loading.value = false;
  }
};
const filteredDocuments = computed(() =>
  documents.value.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesSearch && (filterGame.value === "All" || doc.game === filterGame.value);
  }),
);
const openAddModal = () => {
  selectedDoc.value = null;
  isEditing.value = false;
  showModal.value = true;
};
const openEditModal = async (doc) => {
  if (!hasGameWriteAccess(doc.game))
    return showErrorToast("You do not have permission to edit this documentation.");
  try {
    const response = await apiFetch(`/docs/${doc.id}`);
    if (!response.ok) throw new Error("Failed to fetch documentation details");
    selectedDoc.value = await response.json();
    isEditing.value = true;
    showModal.value = true;
  } catch (error) {
    handleApiError(error);
  }
};
const handleDelete = async (doc) => {
  try {
    const response = await apiFetch(`/docs/${doc.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete documentation");
    }
    await fetchDocuments();
    showSuccessToast("Documentation deleted successfully");
  } catch (error) {
    handleApiError(error);
  }
};
const confirmDelete = (doc) => {
  if (!hasGameWriteAccess(doc.game))
    return showErrorToast("You do not have permission to delete this documentation.");
  confirm.require({
    message: `Are you sure you want to delete "${doc.name}"?`,
    header: "Confirm Delete",
    icon: "pi pi-exclamation-triangle",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    acceptProps: { label: "Delete", severity: "danger" },
    accept: () => handleDelete(doc),
  });
};
const handleSave = async (formData) => {
  if (saving.value) return;
  if (!isEditing.value && !hasGameWriteAccess(formData.game))
    return showErrorToast("You do not have permission to create documentation for this game.");
  saving.value = true;
  try {
    const response = await apiFetch(
      isEditing.value ? `/docs/${selectedDoc.value.id}` : "/docs/add",
      {
        method: isEditing.value ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
    );
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to save documentation");
    }
    showModal.value = false;
    await fetchDocuments();
    showSuccessToast(
      isEditing.value ? "Documentation updated successfully" : "Documentation created successfully",
    );
  } catch (error) {
    if (!handleApiError(error)) showErrorToast(error.message || "Failed to save documentation");
  } finally {
    saving.value = false;
  }
};
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Not set";
onMounted(fetchDocuments);
</script>

<template>
  <div class="management-page">
    <PageHeader
      as="h1"
      eyebrow="Administration / Documentation"
      title="Command documentation"
      subtitle="Create and maintain public command entries for permitted games."
      icon="pi pi-book"
      class="management-header"
    >
      <template #actions>
        <Button label="Add document" icon="pi pi-plus" @click="openAddModal" />
      </template>
    </PageHeader>
    <AdminCollectionState v-if="errorMsg" :error="errorMsg" @retry="fetchDocuments" />

    <AdminPanel
      id="catalog-title"
      title="Documentation index"
      :count="`${filteredDocuments.length} records`"
    >
      <template #filters>
        <AdminFilterBar
          :summary="
            filterGame !== 'All' || searchQuery ? 'Filters active' : 'Showing all documents'
          "
          :clearable="filterGame !== 'All' || Boolean(searchQuery)"
          @clear="
            () => {
              searchQuery = '';
              filterGame = 'All';
            }
          "
        >
          <label class="search-field"
            ><span class="sr-only">Search documents by name</span
            ><i class="pi pi-search" aria-hidden="true"></i
            ><InputText v-model="searchQuery" placeholder="Search command name" fluid
          /></label>
          <Select
            v-model="filterGame"
            :options="gameFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filter by game"
            class="game-filter"
          />
        </AdminFilterBar>
      </template>
      <DataTable
        :value="filteredDocuments"
        :loading="loading"
        responsiveLayout="scroll"
        size="small"
        class="management-table"
      >
        <template #empty>
          <EmptyState
            class="table-empty"
            icon="pi pi-book"
            title="No documents found"
            :description="
              documents.length
                ? 'Adjust the active filters.'
                : 'Add the first command document to this catalog.'
            "
          />
        </template>
        <Column field="name" header="Command"
          ><template #body="{ data }"
            ><strong class="command-name">/{{ data.name }}</strong></template
          ></Column
        >
        <Column field="description" header="Description"
          ><template #body="{ data }"
            ><span class="description-cell">{{ data.description }}</span></template
          ></Column
        >
        <Column field="game" header="Game" style="width: 8rem"
          ><template #body="{ data }"><GameTag :game="data.game" size="small" /></template
        ></Column>
        <Column field="updatedAt" header="Last update" style="width: 9rem"
          ><template #body="{ data }"
            ><time class="date-cell">{{ formatDate(data.updatedAt) }}</time></template
          ></Column
        >
        <Column header="Actions" style="width: 7rem"
          ><template #body="{ data }"
            ><div class="row-actions">
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                text
                rounded
                aria-label="Edit document"
                :disabled="!hasGameWriteAccess(data.game)"
                @click="openEditModal(data)"
              /><Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                aria-label="Delete document"
                :disabled="!hasGameWriteAccess(data.game)"
                @click="confirmDelete(data)"
              /></div></template
        ></Column>
      </DataTable>
    </AdminPanel>
    <div class="mobile-records" aria-label="Documentation records">
      <article v-for="doc in filteredDocuments" :key="doc.id" class="mobile-record-card">
        <header>
          <div>
            <strong class="command-name">/{{ doc.name }}</strong>
            <GameTag :game="doc.game" size="small" />
          </div>
          <Button
            text
            severity="secondary"
            :label="expandedDocs.has(doc.id) ? 'Hide details' : 'Show details'"
            :aria-expanded="expandedDocs.has(doc.id)"
            :aria-controls="`doc-details-${doc.id}`"
            @click="toggleDocDetails(doc.id)"
          />
        </header>
        <div v-show="expandedDocs.has(doc.id)" :id="`doc-details-${doc.id}`" class="record-details">
          <p>{{ doc.description }}</p>
          <time>Updated {{ formatDate(doc.updatedAt) }}</time>
          <AdminActions :pending="saving" label="Document actions">
            <Button
              label="Edit"
              icon="pi pi-pencil"
              severity="secondary"
              :disabled="saving || !hasGameWriteAccess(doc.game)"
              @click="openEditModal(doc)"
            />
            <template #destructive>
              <Button
                label="Delete"
                icon="pi pi-trash"
                severity="danger"
                :disabled="saving || !hasGameWriteAccess(doc.game)"
                @click="confirmDelete(doc)"
              />
            </template>
          </AdminActions>
        </div>
      </article>
    </div>
    <DocFormModal
      v-model:visible="showModal"
      :doc="selectedDoc"
      :isEditing="isEditing"
      :userInfo="userInfo"
      :saving="saving"
      @save="handleSave"
    />
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
.catalog-panel {
  overflow: hidden;
  padding: 0;
}
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-surface-sunken);
}
.panel-heading > div {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.panel-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
}
.panel-heading strong {
  color: var(--text-muted);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.filters-row {
  display: grid;
  grid-template-columns: minmax(12rem, 1fr) 16rem;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
}
.search-field {
  position: relative;
  display: block;
}
.search-field i {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: var(--space-3);
  color: var(--text-muted);
  transform: translateY(-50%);
}
.search-field :deep(input) {
  padding-left: 2.4rem;
}
.game-filter {
  width: 100%;
}
.management-table :deep(th) {
  background: var(--bg-surface-raised);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.management-table :deep(td) {
  border-color: var(--border-primary);
}
.command-name {
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
.description-cell {
  display: -webkit-box;
  overflow: hidden;
  color: var(--text-secondary);
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.date-cell {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  white-space: nowrap;
}
.row-actions {
  display: flex;
  justify-content: flex-end;
}
.table-empty {
  min-height: 14rem;
  border: 0;
  border-radius: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
.mobile-records {
  display: none;
}

.mobile-record-card {
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
}

.mobile-record-card > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.mobile-record-card > header > div {
  display: grid;
  gap: var(--space-2);
}

.record-details {
  display: grid;
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  gap: var(--space-3);
  border-top: 1px solid var(--divider);
  color: var(--text-secondary);
}

.record-details p {
  margin: 0;
}

.record-details time {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

@media (max-width: 640px) {
  .management-header :deep(.page-header-actions .p-button) {
    width: 100%;
  }
  .filters-row {
    grid-template-columns: 1fr;
  }
  .panel-heading strong {
    display: none;
  }
  .management-table {
    display: none;
  }
  .mobile-records {
    display: grid;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }
}
</style>

<script setup>
import { computed, onMounted, ref } from "vue";
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Select from "primevue/select";
import { useConfirm } from "primevue/useconfirm";
import DocFormModal from "../components/docs/DocFormModal.vue";
import GameTag from "../components/docs/GameTag.vue";
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
  if (!isEditing.value && !hasGameWriteAccess(formData.game))
    return showErrorToast("You do not have permission to create documentation for this game.");
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
      const data = await response.json();
      throw new Error(data.error || "Failed to save documentation");
    }
    showModal.value = false;
    await fetchDocuments();
    showSuccessToast(
      isEditing.value ? "Documentation updated successfully" : "Documentation created successfully",
    );
  } catch (error) {
    handleApiError(error);
  }
};
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
onMounted(fetchDocuments);
</script>

<template>
  <div class="management-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Global management · Field guide</p>
        <h1 class="page-title">Command documents</h1>
        <p class="page-subtitle">Maintain the public command reference for your permitted games.</p>
      </div>
      <Button label="Add document" icon="pi pi-plus" @click="openAddModal" />
    </header>
    <Message v-if="errorMsg" severity="error" :closable="false">{{ errorMsg }}</Message>

    <section class="catalog-panel" aria-labelledby="catalog-title">
      <div class="panel-heading">
        <div>
          <span>CATALOG / 01</span>
          <h2 id="catalog-title">Documentation index</h2>
        </div>
        <strong>{{ filteredDocuments.length }} records</strong>
      </div>
      <div class="filters-row">
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
      </div>
      <DataTable
        :value="filteredDocuments"
        :loading="loading"
        responsiveLayout="scroll"
        size="small"
        class="management-table"
      >
        <template #empty
          ><div class="table-empty">
            <i class="pi pi-book" aria-hidden="true"></i><strong>No documents found</strong
            ><span>{{
              documents.length
                ? "Adjust the active filters."
                : "Add the first command document to this catalog."
            }}</span>
          </div></template
        >
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
    </section>
    <DocFormModal
      v-model:visible="showModal"
      :doc="selectedDoc"
      :isEditing="isEditing"
      :userInfo="userInfo"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.management-page {
  max-width: 86rem;
  margin: 0 auto;
}
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}
.eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.page-title {
  font-size: clamp(2.15rem, 4vw, 3.5rem);
  font-weight: 500;
}
.catalog-panel {
  overflow: hidden;
  border: 1px solid var(--border-primary);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
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
.panel-heading span {
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
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
  display: flex;
  min-height: 14rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--text-muted);
}
.table-empty i {
  color: var(--accent);
  font-size: var(--text-2xl);
}
.table-empty strong {
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-lg);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
@media (max-width: 640px) {
  .page-header {
    align-items: stretch;
    flex-direction: column;
  }
  .page-header :deep(.p-button) {
    width: 100%;
  }
  .filters-row {
    grid-template-columns: 1fr;
  }
  .panel-heading strong {
    display: none;
  }
}
</style>

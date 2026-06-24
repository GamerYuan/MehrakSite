<script setup>
import { computed, onMounted, ref } from "vue";
import { gameFilterOptions, gameLabels } from "../configs/gameMeta";
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import DocFormModal from "../components/docs/DocFormModal.vue";
import GameTag from "../components/docs/GameTag.vue";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import { useApi } from "../composables/useApi";
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();
const { apiFetch, apiFetchJson, showErrorToast, showSuccessToast } = useApi();

const props = defineProps({
  userInfo: {
    type: Object,
    required: true,
  },
});

const documents = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const filterGame = ref("All");

const showModal = ref(false);
const selectedDoc = ref(null);
const isEditing = ref(false);

const hasGameWriteAccess = (game) => {
  if (props.userInfo.isSuperAdmin) return true;
  return props.userInfo.gameWritePermissions?.includes(game);
};

const fetchDocuments = async () => {
  loading.value = true;
  try {
    const { ok, data, status } = await apiFetchJson("/docs/list");
    if (ok) {
      documents.value = data;
    } else {
      showErrorToast(data.error || "Failed to fetch documentation", status);
    }
  } catch (error) {
    if (error._redirected) return;
    showErrorToast(error.message, error.status);
  } finally {
    loading.value = false;
  }
};

const filteredDocuments = computed(() => 
  documents.value.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.value.toLowerCase());

    if (filterGame.value === "All") return matchesSearch;
    return matchesSearch && doc.game === filterGame.value;
  })
);

const openAddModal = () => {
  selectedDoc.value = null;
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = async (doc) => {
  if (!hasGameWriteAccess(doc.game)) {
    showErrorToast("You do not have permission to edit this documentation.");
    return;
  }

  try {
    const response = await apiFetch(`/docs/${doc.id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch documentation details");
    }
    selectedDoc.value = await response.json();
    isEditing.value = true;
    showModal.value = true;
  } catch (error) {
    if (error._redirected) return;
    showErrorToast(error.message, error.status);
  }
};

const confirmDelete = (doc) => {
  if (!hasGameWriteAccess(doc.game)) {
    showErrorToast("You do not have permission to delete this documentation.");
    return;
  }

  confirm.require({
    message: `Are you sure you want to delete "${doc.name}"?`,
    header: "Confirm Delete",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },
    accept: () => handleDelete(doc),
  });
};

const handleDelete = async (doc) => {
  try {
    const response = await apiFetch(`/docs/${doc.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete documentation");
    }

    fetchDocuments();
    showSuccessToast("Documentation deleted successfully");
  } catch (error) {
    if (error._redirected) return;
    showErrorToast(error.message, error.status);
  }
};

const handleSave = async (formData) => {
  if (!isEditing.value && !hasGameWriteAccess(formData.game)) {
    showErrorToast("You do not have permission to create documentation for this game.");
    return;
  }

  try {
    const url = isEditing.value ? `/docs/${selectedDoc.value.id}` : "/docs/add";
    const method = isEditing.value ? "PUT" : "POST";

    const response = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to save documentation");
    }

    showModal.value = false;
    fetchDocuments();
    showSuccessToast(
      isEditing.value ? "Documentation updated successfully" : "Documentation created successfully",
    );
  } catch (error) {
    if (error._redirected) return;
    showErrorToast(error.message, error.status);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(() => {
  fetchDocuments();
});
</script>

<template>
  <div class="management-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">Documentation Management</h1>
        <p class="page-subtitle">Create and edit command docs for each supported game.</p>
      </div>
      <Button label="Add Documentation" icon="pi pi-plus" @click="openAddModal" />
    </header>

    <Card class="card-elevated filters-card">
      <template #content>
        <div class="filters-row">
          <InputText v-model="searchQuery" placeholder="Search by name..." fluid />
          <Select
            v-model="filterGame"
            :options="gameFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filter by game"
            class="game-filter"
          />
        </div>
      </template>
    </Card>

    <Card class="card-elevated table-card">
      <template #content>
        <DataTable
          :value="filteredDocuments"
          :loading="loading"
          responsiveLayout="scroll"
          class="docs-table"
          size="small"
        >
          <Column field="name" header="Name">
            <template #body="slotProps">
              <span class="font-medium">{{ slotProps.data.name }}</span>
            </template>
          </Column>
          <Column field="description" header="Description">
            <template #body="slotProps">
              <span class="description-cell">{{ slotProps.data.description }}</span>
            </template>
          </Column>
          <Column field="game" header="Game" style="width: 7rem">
            <template #body="slotProps">
              <GameTag :game="slotProps.data.game" size="small" />
            </template>
          </Column>
          <Column field="updatedAt" header="Last Updated" style="width: 9rem">
            <template #body="slotProps">
              <span class="date-cell">{{ formatDate(slotProps.data.updatedAt) }}</span>
            </template>
          </Column>
          <Column header="Actions" style="width: 7rem">
            <template #body="slotProps">
              <div class="row-actions">
                <Button
                  icon="pi pi-pencil"
                  severity="secondary"
                  text
                  rounded
                  aria-label="Edit"
                  @click="openEditModal(slotProps.data)"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  aria-label="Delete"
                  @click="confirmDelete(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

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
  max-width: 80rem;
  margin: 0 auto;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .page-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.filters-card {
  margin-bottom: 1rem;
}

.filters-card :deep(.p-card-content) {
  padding: 1rem;
}

.filters-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .filters-row {
    flex-direction: row;
  }

  .game-filter {
    width: 16rem;
    flex-shrink: 0;
  }
}

.table-card :deep(.p-card-content) {
  padding: 0;
  overflow-x: auto;
}

.docs-table :deep(th) {
  background: var(--bg-surface-raised) !important;
  color: var(--text-secondary) !important;
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
}

.font-medium {
  font-weight: 500;
  color: var(--text-primary);
}

.description-cell {
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.date-cell {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.row-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}
</style>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAlias } from "../../../composables/useAlias";
import { gameConfigs } from "../../../configs/gameConfigs";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";

const { aliases, loading, error, searchQuery, fetchAllAliases } = useAlias();

const games = Object.values(gameConfigs);
const activeGame = ref(games[0].id);

onMounted(() => fetchAllAliases());

const filteredAliases = computed(() => {
  const current = aliases.value[activeGame.value] || [];
  if (!searchQuery.value) return current;
  const q = searchQuery.value.toLowerCase();
  return current.filter(
    (item) =>
      item.name.toLowerCase().includes(q) || item.aliases.some((a) => a.toLowerCase().includes(q)),
  );
});
</script>

<template>
  <div class="alias">
    <div class="alias-hero">
      <div class="alias-hero-icon">
        <i class="pi pi-tags"></i>
      </div>
      <div>
        <h1 class="alias-title">Character Aliases</h1>
        <p class="alias-sub">View supported aliases for characters across different games.</p>
      </div>
    </div>

    <div class="alias-search-wrap">
      <i class="pi pi-search alias-search-icon"></i>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search character or alias..."
        class="alias-search"
      />
    </div>

    <div v-if="loading" class="alias-state">
      <ProgressSpinner style="width: 36px; height: 36px" strokeWidth="3" />
      <span>Loading aliases...</span>
    </div>

    <div v-else-if="error" class="alias-state">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div v-else class="alias-tabs">
      <Tabs v-model:value="activeGame">
        <TabList>
          <Tab v-for="game in games" :key="game.id" :value="game.id">{{ game.title }}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel v-for="game in games" :key="game.id" :value="game.id">
            <div v-if="!aliases[game.id] || aliases[game.id].length === 0" class="alias-empty">
              <i class="pi pi-inbox" style="font-size: 1.5rem; opacity: 0.3"></i>
              <p>No aliases for this game yet.</p>
            </div>
            <div v-else-if="filteredAliases.length === 0" class="alias-empty">
              <Message severity="warn" :closable="false" icon="pi pi-search"
                >No results found for '{{ searchQuery }}'.</Message
              >
            </div>
            <DataTable
              v-else
              :value="filteredAliases"
              paginator
              :rows="10"
              sortField="name"
              :sortOrder="1"
              class="alias-table"
              :pt="{
                root: { class: 'table-root' },
                headerRow: { class: 'table-header-row' },
                row: { class: 'table-body-row' },
              }"
            >
              <Column field="name" header="Character Name" sortable style="width: 30%">
                <template #body="{ data }">
                  <span class="char-name">{{ data.name }}</span>
                </template>
              </Column>
              <Column header="Aliases">
                <template #body="{ data }">
                  <div class="alias-tags">
                    <Tag
                      v-for="alias in data.aliases"
                      :key="alias"
                      :value="alias"
                      severity="secondary"
                      class="alias-tag"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>

<style scoped>
.alias {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.alias-hero {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.alias-hero-icon {
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

.alias-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.alias-sub {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.alias-search-wrap {
  position: relative;
}

.alias-search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.875rem;
  pointer-events: none;
}

.alias-search {
  width: 100%;
  padding: 0.625rem 0.875rem 0.625rem 2.5rem;
  background: var(--card-surface);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 0.8125rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.12s ease;
}

.alias-search:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.08);
}

.alias-search::placeholder {
  color: var(--text-muted);
}

.alias-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.alias-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  color: var(--text-muted);
}

.alias-tabs :deep(.p-tabs) {
  border-radius: 0.75rem;
}

.alias-tabs :deep(.p-tablist) {
  background: var(--bg-surface);
  border: 1px solid var(--border-primary);
}

.alias-tabs :deep(.p-tab) {
  color: var(--text-secondary);
}

.alias-tabs :deep(.p-tab.p-highlight) {
  color: var(--accent);
}

.alias-tabs :deep(.p-tabpanels) {
  background: transparent;
  padding: 1rem 0;
}

.alias-table {
  background: transparent !important;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  overflow: hidden;
}

.alias-table :deep(.p-datatable-thead > tr > th) {
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.75rem;
  border-bottom: 1px solid var(--border-primary);
}

.alias-table :deep(.p-datatable-tbody > tr) {
  background: transparent;
  transition: background 0.1s ease;
}

.alias-table :deep(.p-datatable-tbody > tr:hover) {
  background: var(--bg-surface);
}

.alias-table :deep(.p-datatable-tbody > tr > td) {
  border-bottom: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

.alias-table :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

.char-name {
  font-weight: 500;
  color: var(--text-primary);
}

.alias-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.alias-tag {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-primary) !important;
  color: var(--text-secondary) !important;
  font-weight: 400 !important;
  font-size: 0.75rem !important;
}
</style>

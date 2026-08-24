<script setup>
import { computed, onMounted, ref } from "vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import Tag from "primevue/tag";
import EmptyState from "../../ui/EmptyState.vue";
import PageHeader from "../../ui/PageHeader.vue";
import { gameConfigs } from "../../../configs/gameConfigs";
import { useAlias } from "../../../composables/useAlias";

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
    <PageHeader
      icon="pi pi-tags"
      title="Character Aliases"
      subtitle="Check the alternate names accepted by each game's commands."
    />

    <div class="alias-search-wrap">
      <label for="alias-search">Search aliases</label>
      <i class="pi pi-search alias-search-icon"></i>
      <input
        id="alias-search"
        v-model="searchQuery"
        type="text"
        placeholder="Search character or alias..."
        class="alias-search"
      />
    </div>

    <div v-if="loading" class="alias-state" role="status" aria-live="polite">
      <ProgressSpinner style="width: 36px; height: 36px" strokeWidth="3" />
      <span>Loading aliases...</span>
    </div>

    <div v-else-if="error" class="alias-state" role="alert">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div v-else class="alias-tabs">
      <Tabs v-model:value="activeGame">
        <TabList>
          <Tab v-for="game in games" :key="game.id" :value="game.id">{{ game.title }}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel v-for="game in games" :key="game.id" :value="game.id">
            <EmptyState
              v-if="
                !aliases[game.id] || (aliases[game.id].length === 0 && searchQuery.length === 0)
              "
              title="No aliases available"
              description="This game does not have alias records yet."
            />
            <EmptyState
              v-else-if="filteredAliases.length === 0"
              icon="pi pi-search"
              title="No aliases matched"
              :description="`No results found for '${searchQuery}'.`"
            />
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

.alias-search-wrap {
  position: relative;
}

.alias-search-wrap label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.alias-search-icon {
  position: absolute;
  left: 0.875rem;
  bottom: 0.85rem;
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
  transition: border-color 0.12s ease;
}

.alias-search:focus-visible {
  border-color: var(--accent);
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

.alias-tabs :deep(.p-tab.p-tab-active) {
  color: var(--accent);
}

.alias-tabs :deep(.p-tabpanels) {
  background: transparent;
  padding: 1rem 0;
}

.alias-table {
  background: var(--card-surface) !important;
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

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAlias } from "../../../composables/useAlias";
import { gameConfigs } from "../../../configs/gameConfigs";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import InputText from "primevue/inputtext";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Card from "primevue/card";

const { aliases, loading, error, searchQuery, fetchAllAliases } = useAlias();

const games = Object.values(gameConfigs);
const activeGame = ref(games[0].id);

onMounted(() => {
  fetchAllAliases();
});

const filteredAliases = computed(() => {
  const currentAliases = aliases.value[activeGame.value] || [];
  if (!searchQuery.value) return currentAliases;

  const query = searchQuery.value.toLowerCase();
  return currentAliases.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.aliases.some((alias) => alias.toLowerCase().includes(query)),
  );
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl">
      <template #content>
        <div class="flex flex-col gap-4">
          <h2 class="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
            Character Aliases
          </h2>
          <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed m-0">
            View supported aliases for characters across different games.
          </p>
        </div>
      </template>
    </Card>

    <div class="relative w-full">
      <i
        class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 z-10 pointer-events-none"
      ></i>
      <InputText
        v-model="searchQuery"
        placeholder="Search character or alias..."
        class="w-full py-3 bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
      />
    </div>

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center gap-4 py-16 text-zinc-500 dark:text-zinc-400"
    >
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span>Loading aliases...</span>
    </div>

    <div v-else-if="error" class="py-8">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div v-else>
      <Tabs v-model:value="activeGame">
        <TabList>
          <Tab v-for="game in games" :key="game.id" :value="game.id">
            {{ game.title }}
          </Tab>
        </TabList>
        <TabPanels class="bg-transparent px-6 py-6">
          <TabPanel v-for="game in games" :key="game.id" :value="game.id">
            <div
              v-if="!aliases[game.id] || aliases[game.id].length === 0"
              class="py-16 text-center text-zinc-500 dark:text-zinc-400"
            >
              <i class="pi pi-inbox text-4xl mb-4 opacity-50"></i>
              <p>No aliases for this game yet.</p>
            </div>

            <div
              v-else-if="filteredAliases.length === 0"
              class="py-16 text-center text-zinc-500 dark:text-zinc-400"
            >
              <Message severity="warn" :closable="false" icon="pi pi-search">
                No results found for '{{ searchQuery }}'.
              </Message>
            </div>

            <DataTable
              v-else
              :value="filteredAliases"
              paginator
              :rows="10"
              sortField="name"
              :sortOrder="1"
              class="p-datatable-sm"
              :pt="{
                root: {
                  class:
                    'bg-white dark:bg-white/5 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10',
                },
                headerRow: { class: 'bg-white dark:bg-white/5 px-4' },
                row: {
                  class:
                    'hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors text-zinc-700 dark:text-zinc-300 px-4',
                },
              }"
            >
              <Column
                field="name"
                header="Character Name"
                sortable
                style="width: 30%"
              >
                <template #body="{ data }">
                  <span class="font-medium px-2">{{ data.name }}</span>
                </template>
              </Column>
              <Column header="Aliases">
                <template #body="{ data }">
                  <div class="flex flex-wrap gap-2 px-2">
                    <Tag
                      v-for="alias in data.aliases"
                      :key="alias"
                      :value="alias"
                      severity="secondary"
                      class="bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 font-normal px-3 py-1"
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
:deep(.p-inputtext) {
  padding-left: 2.75rem;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
:deep(.p-datatable .p-datatable-tbody > tr) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem 1.5rem;
  border: none;
}
:deep(.p-datatable .p-paginator) {
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  border-left: none;
  border-right: none;
}
:deep(.p-datatable-column-title) {
  padding: 0.5rem 0.5rem;
}
</style>

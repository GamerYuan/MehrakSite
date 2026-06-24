<script setup>
import AuthModal from "./AuthModal.vue";
import Button from "primevue/button";
import Card from "primevue/card";
import CommandCard from "./CommandCard.vue";
import Image from "primevue/image";
import ManageAliasesCard from "./ManageAliasesCard.vue";
import ManageCharactersCard from "./ManageCharactersCard.vue";
import ManageCodesCard from "./ManageCodesCard.vue";
import PortraitConfigModal from "./PortraitConfigModal.vue";
import StatEditModal from "./StatEditModal.vue";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import { computed } from "vue";
import { gameMeta } from "../../configs/gameMeta";
import { useGameViewInject } from "../../composables/game/injectKey";

const gv = useGameViewInject();

const getTabConfig = (tabId) => gv.config.tabs.find((t) => t.id === tabId);

const meta = computed(() => gameMeta[gv.config.id]);
const gameColor = computed(() => meta.value?.color || "var(--accent)");
const gameLogo = computed(() => gv.config.logo);

const clearResult = () => {
  gv.resultImages[gv.activeTab] = null;
};
</script>

<template>
  <div class="game-view" :style="{ '--game-color': gameColor }">
    <div class="game-header">
      <img v-if="gameLogo" :src="gameLogo" :alt="gv.config.title" class="game-logo" />
      <div class="game-title-block">
        <h1 class="game-title">{{ gv.config.title }}</h1>
        <p class="game-subtitle">Choose a tab and run a command.</p>
      </div>
    </div>

    <Tabs v-model:value="gv.activeTab" scrollable class="game-tabs">
      <TabList>
        <Tab
          v-for="tab in gv.tabs"
          :key="tab.id"
          :value="tab.id"
          class="whitespace-nowrap shrink-0"
        >
          {{ tab.name }}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel v-for="tab in gv.tabs" :key="tab.id" :value="tab.id">
          <ManageCharactersCard v-if="tab.id === 'manage'" />

          <ManageAliasesCard v-else-if="tab.id === 'aliases'" />

          <ManageCodesCard v-else-if="tab.id === 'codes'" />

          <CommandCard v-else :tabConfig="getTabConfig(tab.id)" />
        </TabPanel>
      </TabPanels>
    </Tabs>

    <div v-if="gv.resultImages[gv.activeTab]" class="result-container">
      <Card class="result-card">
        <template #title>
          <div class="result-header">
            <span class="result-title">Result</span>
            <Button
              icon="pi pi-times"
              text
              rounded
              size="small"
              aria-label="Clear result"
              @click="clearResult"
            />
          </div>
        </template>
        <template #content>
          <Image :src="gv.resultImages[gv.activeTab]" alt="Result" preview width="100%" />
        </template>
      </Card>
    </div>

    <AuthModal />

    <StatEditModal v-if="gv.config.hasStatEdit" />

    <PortraitConfigModal />
  </div>
</template>

<style scoped>
.game-view {
  max-width: 64rem;
  margin: 0 auto;
}

.game-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--card-surface);
  border: 1px solid var(--card-border);
  border-left: 4px solid var(--game-color);
  border-radius: 0.875rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  margin-bottom: 1.5rem;
}

.dark .game-header {
  box-shadow: none;
}

.game-logo {
  width: 3rem;
  height: 3rem;
  border-radius: 0.625rem;
  object-fit: contain;
  flex-shrink: 0;
}

.game-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.game-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.125rem 0 0;
}

.game-tabs :deep(.p-tab-active) {
  color: var(--game-color) !important;
}

.game-tabs :deep(.p-tablist-active-bar) {
  background: var(--game-color) !important;
}

.game-view :deep(.game-card) {
  background: var(--card-surface) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 0.875rem !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04) !important;
}

.dark .game-view :deep(.game-card) {
  box-shadow: none !important;
}

.result-container {
  margin-top: 1.5rem;
}

.result-card {
  background: var(--card-surface) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 0.875rem !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04) !important;
}

.dark .result-card {
  box-shadow: none !important;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-title {
  font-weight: 600;
  color: var(--text-primary);
}

.result-card :deep(img) {
  max-width: 100%;
  border-radius: 0.5rem;
}

@media (max-width: 768px) {
  .game-header {
    padding: 1rem;
  }

  .game-logo {
    width: 2.5rem;
    height: 2.5rem;
  }

  .game-title {
    font-size: 1.25rem;
  }
}
</style>

<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { computed } from "vue";
import { useGameViewInject } from "../../composables/game/injectKey";

const gv = useGameViewInject();

const listItems = computed(() => {
  if (gv.config.hasStatEdit && Array.isArray(gv.manageCharacterItems)) {
    return gv.manageCharacterItems;
  }

  return (gv.filteredManageCharacters || []).map((name) => ({
    name,
    baseVal: 0,
    maxAscVal: 0,
  }));
});

const formatStat = (value) => {
  const number = typeof value === "number" ? value : Number(value || 0);
  return number === 0 ? "-" : number;
};
</script>

<template>
  <Card class="game-card">
    <template #title>Manage Characters</template>
    <template #content>
      <div class="flex flex-col gap-4">
        <div v-if="gv.canManage" class="flex gap-2">
          <InputText
            v-model="gv.newCharacterName"
            placeholder="New Character Name"
            fluid
            class="flex-1"
          />
          <Button label="Add" @click="gv.addCharacter" :loading="gv.manageLoading" />
        </div>
        <Message v-if="gv.manageError" severity="error">{{ gv.manageError }}</Message>
        <div class="flex flex-col gap-2">
          <InputText v-model="gv.manageSearchQuery" placeholder="Search characters..." fluid />
        </div>
        <div
          v-if="gv.config.hasStatEdit && gv.canManage"
          class="flex items-center align-middle gap-2"
        >
          <Checkbox
            v-model="gv.showOnlyMissingAscension"
            binary
            inputId="missing-ascension-filter"
          />
          <label for="missing-ascension-filter" class="text-sm text-gray-500 mb-0!">
            Only show characters without max ascension value
          </label>
        </div>
        <div class="flex flex-col max-h-150 overflow-y-auto rounded">
          <div
            v-for="item in listItems"
            :key="item.name"
            class="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors gap-2"
          >
            <div class="flex flex-col gap-1 text-left">
              <span>{{ item.name }}</span>
              <div
                v-if="gv.config.hasStatEdit && gv.canManage"
                class="flex gap-2 text-xs text-gray-500"
              >
                <span>Base: {{ formatStat(item.baseVal) }}</span>
                <span>Max Asc: {{ formatStat(item.maxAscVal) }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <Button
                v-if="gv.config.hasStatEdit && gv.canManage"
                icon="pi pi-pencil"
                severity="info"
                text
                @click="gv.openEditStatModal(item.name)"
                :loading="gv.manageLoading"
              />
              <Button
                icon="pi pi-image"
                severity="info"
                text
                aria-label="Edit portrait configuration"
                title="Edit portrait configuration"
                @click="gv.openPortraitConfigModal(item.name)"
                :loading="gv.manageLoading"
              />
              <Button
                v-if="gv.canManage"
                icon="pi pi-trash"
                severity="danger"
                text
                @click="gv.deleteCharacter(item.name)"
                :loading="gv.manageLoading"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>

  <Dialog
    v-model:visible="gv.showMissingServerIdModal"
    modal
    header="Portrait Not Found"
    :style="{ width: '24rem' }"
  >
    <div class="flex flex-col gap-4">
      <p class="text-(--text-secondary)">
        Server ID not found for character
        <strong class="text-(--text-primary)">{{ gv.missingServerIdCharacter }}</strong
        >.
      </p>
      <div class="flex justify-end">
        <Button label="OK" severity="secondary" @click="gv.showMissingServerIdModal = false" />
      </div>
    </div>
  </Dialog>
</template>

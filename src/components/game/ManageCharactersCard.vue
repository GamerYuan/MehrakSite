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
defineProps({ personalPortraits: { type: Boolean, default: false } });

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
    <template #title>
      <div class="management-heading">
        <div>
          <span class="surface-kicker">{{
            personalPortraits ? "Personal portraits" : "Roster operations"
          }}</span>
          <span>{{ personalPortraits ? "Choose a character" : "Characters" }}</span>
        </div>
        <span class="record-count">{{ listItems.length }} records</span>
      </div>
    </template>
    <template #content>
      <div class="management-stack">
        <div v-if="!personalPortraits && gv.canManageCapability('characters')" class="action-strip">
          <label for="new-character" class="sr-only">New character name</label>
          <InputText
            id="new-character"
            v-model="gv.newCharacterName"
            placeholder="New character name"
            fluid
            class="flex-1"
          />
          <Button
            label="Add character"
            icon="pi pi-plus"
            @click="gv.addCharacter"
            :loading="gv.manageLoading"
          />
        </div>
        <Message v-if="gv.manageError" severity="error">{{ gv.manageError }}</Message>
        <div class="filter-row">
          <label for="character-search" class="sr-only">Search characters</label>
          <InputText
            id="character-search"
            v-model="gv.manageSearchQuery"
            placeholder="Search characters..."
            fluid
          />
          <div
            v-if="!personalPortraits && gv.config.hasStatEdit && gv.canManageCapability('stats')"
            class="missing-filter"
          >
            <Checkbox
              v-model="gv.showOnlyMissingAscension"
              binary
              inputId="missing-ascension-filter"
            />
            <label for="missing-ascension-filter">Missing ascension only</label>
          </div>
        </div>
        <div class="character-list">
          <div v-for="item in listItems" :key="item.name" class="character-row">
            <div class="character-name">
              <strong>{{ item.name }}</strong>
              <div
                v-if="
                  !personalPortraits && gv.config.hasStatEdit && gv.canManageCapability('stats')
                "
                class="stat-readout"
              >
                <span>Base: {{ formatStat(item.baseVal) }}</span>
                <span>Max Asc: {{ formatStat(item.maxAscVal) }}</span>
              </div>
            </div>
            <div class="row-actions">
              <Button
                v-if="
                  !personalPortraits && gv.config.hasStatEdit && gv.canManageCapability('stats')
                "
                icon="pi pi-pencil"
                severity="info"
                text
                @click="gv.openEditStatModal(item.name)"
                :loading="gv.manageLoading"
                aria-label="Edit character stats"
              />
              <Button
                v-if="personalPortraits || gv.canManageCapability('portraits')"
                icon="pi pi-image"
                severity="info"
                text
                :aria-label="
                  personalPortraits ? 'Manage my portraits' : 'Edit portrait configuration'
                "
                :title="personalPortraits ? 'Manage my portraits' : 'Edit portrait configuration'"
                @click="
                  personalPortraits
                    ? gv.openUserPortraitConfigModal(item.name)
                    : gv.openPortraitConfigModal(item.name)
                "
                :loading="gv.manageLoading"
              />
              <Button
                v-if="!personalPortraits && gv.canManageCapability('characters')"
                icon="pi pi-trash"
                severity="danger"
                text
                @click="gv.deleteCharacter(item.name)"
                :loading="gv.manageLoading"
                aria-label="Delete character"
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
    :style="{ width: 'min(24rem, calc(100vw - 2rem))' }"
    class="operation-dialog"
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

<style scoped>
.management-heading,
.filter-row,
.character-row,
.row-actions,
.missing-filter {
  display: flex;
  align-items: center;
}

.management-heading > div > span:last-child {
  display: block;
  font-size: var(--text-xl);
}

.management-heading,
.character-row {
  justify-content: space-between;
}

.record-count {
  padding: 0.25rem 0.55rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-pill);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.management-stack {
  display: grid;
  gap: 1rem;
}

.action-strip {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  padding: 0.85rem;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.filter-row {
  gap: 1rem;
}

.missing-filter {
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  white-space: nowrap;
}

.character-list {
  display: grid;
  max-height: 37.5rem;
  overflow-y: auto;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.character-row {
  gap: 1rem;
  min-height: 4rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-primary);
  transition: background var(--motion-fast) var(--ease-standard);
}

.character-row:last-child {
  border-bottom: 0;
}

.character-row:hover {
  background: var(--bg-surface-raised);
}

.character-name {
  min-width: 0;
}

.stat-readout {
  display: flex;
  gap: 0.75rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.row-actions {
  gap: 0.25rem;
}

@media (max-width: 560px) {
  .action-strip,
  .filter-row {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
  }

  .character-row {
    align-items: flex-start;
  }

  .row-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>

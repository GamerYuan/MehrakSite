<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Tag from "primevue/tag";
import { useGameViewInject } from "../../composables/game/injectKey";

const gv = useGameViewInject();
</script>

<template>
  <Card class="game-card">
    <template #title>
      <div class="management-heading">
        <div>
          <span class="surface-kicker">Lookup operations</span>
          <span>Aliases</span>
        </div>
        <span class="record-count">{{ gv.filteredAliases.length }} entries</span>
      </div>
    </template>
    <template #content>
      <div class="management-stack">
        <div class="action-strip">
          <label for="alias-search" class="sr-only">Search aliases</label>
          <InputText
            id="alias-search"
            v-model="gv.aliasSearchQuery"
            placeholder="Search names or aliases..."
            fluid
          />
          <Button
            label="Add alias"
            icon="pi pi-plus"
            @click="gv.openAddAliasModal"
            :loading="gv.manageLoading"
          />
        </div>
        <DataTable
          :value="gv.filteredAliases"
          paginator
          :rows="10"
          responsiveLayout="scroll"
          class="operations-table"
        >
          <Column field="name" header="Character Name" sortable></Column>
          <Column header="Aliases">
            <template #body="slotProps">
              <div class="flex flex-wrap gap-2">
                <Tag
                  v-for="alias in slotProps.data.aliases"
                  :key="alias"
                  :value="alias"
                  severity="info"
                />
              </div>
            </template>
          </Column>
          <Column style="width: 3rem">
            <template #body="slotProps">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                severity="secondary"
                aria-label="Edit aliases"
                @click="gv.openEditAliasModal(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </Card>

  <Dialog
    v-model:visible="gv.showAddAliasModal"
    modal
    :header="gv.isEditingAlias ? 'Edit Alias' : 'Add Alias'"
    :style="{ width: 'min(30rem, calc(100vw - 2rem))' }"
    class="operation-dialog"
  >
    <form @submit.prevent="gv.handleAliasSubmit()">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="alias-char">Character Name</label>
          <InputText
            id="alias-char"
            v-model="gv.newAliasCharacter"
            required
            placeholder="e.g. Nahida"
            fluid
            :disabled="gv.isEditingAlias"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="alias-list">Aliases (comma-separated)</label>
          <InputText
            id="alias-list"
            v-model="gv.newAliasList"
            required
            placeholder="e.g. Radish, Dendro Archon"
            fluid
          />
        </div>
        <div class="flex justify-end gap-2 mt-2">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            @click="gv.showAddAliasModal = false"
          />
          <Button
            type="submit"
            :label="gv.isEditingAlias ? 'Update' : 'Add'"
            :loading="gv.addAliasLoading"
            :disabled="!gv.newAliasCharacter || !gv.newAliasList"
          />
        </div>
      </div>
    </form>
  </Dialog>
</template>

<style scoped>
.management-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.management-heading > div > span:last-child {
  display: block;
  font-size: var(--text-xl);
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

.operations-table {
  overflow: hidden;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

@media (max-width: 560px) {
  .action-strip {
    grid-template-columns: 1fr;
  }
}
</style>

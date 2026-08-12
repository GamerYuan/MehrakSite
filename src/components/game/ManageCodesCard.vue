<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import { useGameViewInject } from "../../composables/game/injectKey";

const gv = useGameViewInject();
</script>

<template>
  <Card class="game-card">
    <template #title>
      <div class="management-heading">
        <div>
          <span class="surface-kicker">Redemption operations</span>
          <span>Codes</span>
        </div>
        <span class="record-count">{{ gv.filteredCodes.length }} active</span>
      </div>
    </template>
    <template #content>
      <div class="management-stack">
        <div class="action-strip">
          <label for="new-codes" class="sr-only">New codes</label>
          <InputText
            id="new-codes"
            v-model="gv.newCodesInput"
            placeholder="New Codes (comma-separated)"
            fluid
            class="flex-1"
          />
          <Button
            label="Add codes"
            icon="pi pi-plus"
            @click="gv.confirmAddCodes"
            :loading="gv.codesLoading"
            :disabled="!gv.newCodesInput"
          />
        </div>

        <div class="filter-strip">
          <label for="code-search" class="sr-only">Search codes</label>
          <InputText
            id="code-search"
            v-model="gv.codesSearchQuery"
            placeholder="Search codes..."
            fluid
            class="flex-1"
          />
          <Button
            label="Delete Selected"
            severity="danger"
            @click="gv.confirmDeleteCodes(gv.selectedCodes.map((c) => c.code))"
            :disabled="!gv.selectedCodes.length"
            :loading="gv.codesLoading"
          />
        </div>

        <DataTable
          v-model:selection="gv.selectedCodes"
          :value="gv.filteredCodes"
          dataKey="code"
          paginator
          :rows="10"
          responsiveLayout="scroll"
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column field="code" header="Code" sortable></Column>
          <Column style="width: 3rem">
            <template #body="slotProps">
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                aria-label="Delete code"
                @click="gv.confirmDeleteCodes([slotProps.data.code])"
                :loading="gv.codesLoading"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </Card>
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

.action-strip,
.filter-strip {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
}

.action-strip {
  padding: 0.85rem;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

@media (max-width: 560px) {
  .action-strip,
  .filter-strip {
    grid-template-columns: 1fr;
  }
}
</style>

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
    <template #title>Manage Codes</template>
    <template #content>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row gap-2">
          <InputText
            v-model="gv.newCodesInput"
            placeholder="New Codes (comma-separated)"
            fluid
            class="flex-1"
          />
          <Button
            label="Add"
            @click="gv.confirmAddCodes"
            :loading="gv.codesLoading"
            :disabled="!gv.newCodesInput"
          />
        </div>

        <div class="flex flex-col sm:flex-row sm:justify-between gap-2">
          <InputText
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

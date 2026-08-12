<script setup>
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Card from "primevue/card";
import InputNumber from "primevue/inputnumber";
import Message from "primevue/message";
import Select from "primevue/select";
import { useGameViewInject } from "../../composables/game/injectKey";

defineProps({
  tabConfig: Object,
});

const gv = useGameViewInject();
</script>

<template>
  <Card class="game-card">
    <template #title>
      <div class="command-heading">
        <div>
          <span class="surface-kicker">Command protocol</span>
          <span class="command-title">{{ tabConfig?.name }}</span>
        </div>
        <span class="command-endpoint">POST {{ gv.config.endpoint }}/{{ tabConfig?.id }}</span>
      </div>
    </template>
    <template #content>
      <form class="command-form" @submit.prevent="gv.executeCommand()">
        <div class="command-fields">
          <div class="field-grid">
            <div class="field-group">
              <label :for="`${tabConfig?.id}-profile-id`">Profile ID (1-10)</label>
              <InputNumber
                :inputId="`${tabConfig?.id}-profile-id`"
                v-model="gv.profileId"
                showButtons
                :min="1"
                :max="10"
                fluid
              />
            </div>
            <div class="field-group">
              <label :for="`${tabConfig?.id}-server`">Server</label>
              <Select
                :inputId="`${tabConfig?.id}-server`"
                v-model="gv.server"
                :options="gv.config.servers"
                optionLabel="label"
                optionValue="value"
                fluid
                class="h-full items-center"
              />
            </div>
          </div>

          <div v-if="tabConfig?.hasCharacterInput" class="field-group">
            <label :for="`${tabConfig?.id}-character-name`">
              {{ tabConfig?.characterLabel || "Character Name" }}
            </label>
            <AutoComplete
              :inputId="`${tabConfig?.id}-character-name`"
              v-model="gv.characterName"
              :suggestions="gv.filteredCharacters"
              @complete="gv.searchCharacter"
              dropdown
              fluid
              :placeholder="gv.config.characterPlaceholder"
            />
          </div>

          <div v-if="tabConfig?.hasFloorInput" class="field-group">
            <label :for="`${tabConfig?.id}-floor`"
              >Floor ({{ tabConfig.floorMin }}-{{ tabConfig.floorMax }})</label
            >
            <InputNumber
              :inputId="`${tabConfig?.id}-floor`"
              v-model="gv.floor"
              showButtons
              :min="tabConfig.floorMin"
              :max="tabConfig.floorMax"
              fluid
            />
          </div>

          <Button
            type="submit"
            :label="gv.loading[tabConfig?.id] ? 'Transmitting...' : 'Generate card'"
            :loading="gv.loading[tabConfig?.id]"
            fluid
            icon="pi pi-bolt"
            class="execute-button"
          />
        </div>
      </form>
      <Message v-if="gv.error[tabConfig?.id]" severity="error" class="mt-2">
        {{ gv.error[tabConfig?.id] }}
      </Message>
    </template>
  </Card>
</template>

<style scoped>
.command-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.command-title {
  display: block;
  margin-top: 0.2rem;
  color: var(--text-primary);
  font-size: var(--text-xl);
}

.command-endpoint {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.command-form {
  padding-top: 0.25rem;
}

.command-fields,
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.command-fields {
  gap: 1.25rem;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

label {
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.execute-button {
  margin-top: 0.25rem;
}

@media (max-width: 560px) {
  .command-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>

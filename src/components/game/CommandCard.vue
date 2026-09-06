<script setup>
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Card from "primevue/card";
import InputNumber from "primevue/inputnumber";
import Message from "primevue/message";
import Select from "primevue/select";
import { computed } from "vue";
import { useGameViewInject } from "../../composables/game/injectKey";

defineProps({
  tabConfig: Object,
});

const gv = useGameViewInject();

const profileOptions = computed(() =>
  (gv.profiles || []).map((profile) => ({
    profileId: Number(profile.profileId),
    ltUid: profile.ltUid,
  })),
);

const profileLabel = (profile) => `Profile ${profile.profileId} - ${profile.ltUid}`;

const serverOptions = computed(() => {
  const gameUids = gv.selectedProfile?.gameUids?.[gv.config.id] || {};
  return gv.config.servers.map((server) => ({
    value: server.value,
    label:
      gameUids[server.value] != null ? `${server.label} - ${gameUids[server.value]}` : server.label,
  }));
});
</script>

<template>
  <Card class="game-card">
    <template #title>
      <div class="command-heading">
        <div>
          <span class="surface-kicker">Card command</span>
          <span class="command-title">{{ tabConfig?.name }}</span>
        </div>
      </div>
    </template>
    <template #content>
      <form class="command-form" @submit.prevent="gv.executeCommand()">
        <Message
          v-if="!gv.profilesLoading && !profileOptions.length"
          severity="warn"
          :closable="false"
        >
          Add a HoYoLAB profile before generating a card.
        </Message>
        <div class="command-fields">
          <div class="field-grid">
            <div class="field-group">
              <label :for="`${tabConfig?.id}-profile-id`">Profile</label>
              <Select
                :inputId="`${tabConfig?.id}-profile-id`"
                v-model="gv.profileId"
                :options="profileOptions"
                :optionLabel="profileLabel"
                optionValue="profileId"
                placeholder="Select a profile"
                :loading="gv.profilesLoading"
                :disabled="gv.profilesLoading || !profileOptions.length"
                fluid
                :invalid="Boolean(gv.validationErrors.profileId)"
                :aria-describedby="
                  gv.validationErrors.profileId ? `${tabConfig?.id}-profile-error` : undefined
                "
                @update:model-value="gv.selectProfile"
              >
                <template #option="slotProps">
                  <div class="profile-option">
                    <strong>{{ profileLabel(slotProps.option) }}</strong>
                  </div>
                </template>
              </Select>
              <p
                v-if="gv.validationErrors.profileId"
                :id="`${tabConfig?.id}-profile-error`"
                class="field-error"
                role="alert"
              >
                {{ gv.validationErrors.profileId }}
              </p>
              <p v-if="gv.profilesLoading" class="field-help">Loading profiles...</p>
              <p v-else-if="!profileOptions.length" class="field-help">
                No profiles are registered.
              </p>
              <RouterLink class="registry-link" to="/dashboard">
                <i class="pi pi-users" aria-hidden="true"></i>
                Open profile registry
              </RouterLink>
            </div>
            <div class="field-group">
              <label :for="`${tabConfig?.id}-server`">Server</label>
              <Select
                :inputId="`${tabConfig?.id}-server`"
                v-model="gv.server"
                :options="serverOptions"
                optionLabel="label"
                optionValue="value"
                fluid
                class="h-full items-center"
                :disabled="!gv.selectedProfile"
                :invalid="Boolean(gv.validationErrors.server)"
                :aria-describedby="
                  gv.validationErrors.server ? `${tabConfig?.id}-server-error` : undefined
                "
              />
              <p
                v-if="gv.validationErrors.server"
                :id="`${tabConfig?.id}-server-error`"
                class="field-error"
                role="alert"
              >
                {{ gv.validationErrors.server }}
              </p>
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
              :invalid="Boolean(gv.validationErrors.characterName)"
              :aria-describedby="
                gv.validationErrors.characterName
                  ? `${tabConfig?.id}-character-name-error`
                  : undefined
              "
            />
            <p
              v-if="gv.validationErrors.characterName"
              :id="`${tabConfig?.id}-character-name-error`"
              class="field-error"
              role="alert"
            >
              {{ gv.validationErrors.characterName }}
            </p>
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
              :invalid="Boolean(gv.validationErrors.floor)"
              :aria-describedby="
                gv.validationErrors.floor ? `${tabConfig?.id}-floor-error` : undefined
              "
            />
            <p
              v-if="gv.validationErrors.floor"
              :id="`${tabConfig?.id}-floor-error`"
              class="field-error"
              role="alert"
            >
              {{ gv.validationErrors.floor }}
            </p>
          </div>

          <Button
            type="submit"
            :label="gv.loading[tabConfig?.id] ? 'Generating...' : 'Generate card'"
            :loading="gv.loading[tabConfig?.id]"
            :disabled="
              gv.profilesLoading || !profileOptions.length || Boolean(gv.loading[tabConfig?.id])
            "
            fluid
            icon="pi pi-bolt"
            class="execute-button"
          />
        </div>
      </form>
      <Message
        v-if="gv.error[tabConfig?.id]"
        severity="error"
        class="mt-2"
        role="alert"
        :closable="false"
      >
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

.profile-option {
  display: grid;
  gap: var(--space-1);
}

.field-help {
  color: var(--text-muted);
  font-size: var(--text-xs);
}

.field-help {
  margin: 0;
}

.field-error {
  margin: 0;
  color: var(--danger);
  font-size: var(--text-sm);
}

.registry-link {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  width: fit-content;
  color: var(--accent-strong);
  font-size: var(--text-xs);
  font-weight: 600;
  text-decoration: none;
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

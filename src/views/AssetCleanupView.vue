<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import AdminPageShell from "../components/ui/AdminPageShell.vue";
import SurfaceCard from "../components/ui/SurfaceCard.vue";
import StatusPill from "../components/ui/StatusPill.vue";
import { useAssetCleanup } from "../composables/useAssetCleanup";

const {
  prefix,
  result,
  pending,
  executing,
  error,
  confirmation,
  operationallyVerified,
  validation,
  canExecute,
  preview,
  execute,
} = useAssetCleanup();
const showConfirmation = ref(false);
const confirmed = computed(
  () => canExecute.value && confirmation.value === prefix.value && operationallyVerified.value,
);
const openConfirmation = () => {
  confirmation.value = "";
  operationallyVerified.value = false;
  showConfirmation.value = true;
};
const confirmExecution = () => {
  if (!confirmed.value) return;
  showConfirmation.value = false;
  void execute();
};
const preventUnload = (event) => {
  if (!pending.value) return;
  event.preventDefault();
  event.returnValue = "";
};
onBeforeRouteLeave(() => !pending.value);
onMounted(() => globalThis.addEventListener("beforeunload", preventUnload));
onUnmounted(() => globalThis.removeEventListener("beforeunload", preventUnload));
</script>

<template>
  <AdminPageShell
    eyebrow="Administration / Storage"
    title="Asset cleanup"
    description="Preview, back up, and delete asset objects by literal prefix."
    icon="pi pi-trash"
  >
    <div class="cleanup-workspace">
      <Message severity="warn" :closable="false">
        Asset bucket only; attachments and user uploads are excluded. Execution backs up each match
        before conditional deletion. Backup lifecycle rules expire versions after seven days;
        physical removal is asynchronous. There is no automatic rollback.
      </Message>
      <SurfaceCard>
        <form class="cleanup-form" @submit.prevent="preview">
          <label for="cleanup-prefix">Full object-key prefix</label>
          <InputText
            id="cleanup-prefix"
            v-model="prefix"
            placeholder="genshin/"
            :disabled="pending"
            autocomplete="off"
            :spellcheck="false"
            aria-describedby="prefix-help prefix-validation"
            fluid
          />
          <p id="prefix-help">
            Literal and case-sensitive, not a wildcard or regular expression. Spaces are preserved.
            For example, <code>genshin/</code> matches <code>genshin/example_bg.png</code>, but not
            <code>Genshin/example_bg.png</code> or <code>hsr/example_bg.png</code>.
          </p>
          <p id="prefix-validation" v-if="prefix && validation">{{ validation }}</p>
          <div class="actions">
            <Button
              type="submit"
              label="Preview matches"
              icon="pi pi-search"
              :disabled="pending || !!validation"
              :loading="pending && !executing"
            />
            <Button
              type="button"
              label="Back up and delete…"
              icon="pi pi-trash"
              severity="danger"
              :disabled="!canExecute"
              @click="openConfirmation"
            />
          </div>
        </form>
      </SurfaceCard>
      <Message v-if="pending" severity="info" :closable="false" role="status">
        {{ executing ? "Backing up and deleting current matches…" : "Listing matching assets…" }}
        This synchronous request has no progress endpoint. Keep this page open. Leaving or losing
        the connection does not cancel server processing; never automatically retry execution.
      </Message>
      <Message v-if="error" severity="error" :closable="false" role="alert">{{ error }}</Message>
      <SurfaceCard v-if="result" aria-labelledby="cleanup-results-title">
        <h2 id="cleanup-results-title">
          {{ result.dryRun ? "Preview results" : "Execution results" }}
        </h2>
        <p>
          Prefix: <code class="literal">{{ result.prefix }}</code>
        </p>
        <div class="summary" aria-live="polite">
          <StatusPill>{{ result.matchedCount }} matched</StatusPill>
          <StatusPill tone="success">{{ result.deletedCount }} deleted</StatusPill>
          <StatusPill :tone="result.failedCount ? 'danger' : 'neutral'"
            >{{ result.failedCount }} failed</StatusPill
          >
        </div>
        <Message v-if="result.failedCount" severity="warn" :closable="false">
          Execution completed with failures. Inspect each outcome below; HTTP success does not mean
          every object was deleted. Preview again before any further execution.
        </Message>
        <p v-if="!result.matchedCount">No matching assets. No source objects were changed.</p>
        <p v-if="result.dryRun && result.matchedCount">
          Preview only: no storage changes. Execution re-lists current objects, so matches may
          differ.
        </p>
        <p v-if="result.backupLocation">
          Backup storage location (not a download link): <code>{{ result.backupLocation }}</code>
        </p>
        <DataTable
          v-if="result.keys.length"
          :value="result.keys"
          paginator
          :rows="25"
          :rowsPerPageOptions="[25, 50, 100]"
          dataKey="key"
          tableStyle="table-layout: fixed; width: 100%"
        >
          <Column field="key" header="Object key"
            ><template #body="{ data }"
              ><code>{{ data.key }}</code></template
            ></Column
          >
          <Column field="status" header="Outcome"
            ><template #body="{ data }">
              <StatusPill
                :tone="
                  data.status === 'failed'
                    ? 'danger'
                    : data.status === 'deleted'
                      ? 'success'
                      : 'neutral'
                "
                >{{ data.status }}</StatusPill
              >
            </template></Column
          >
          <Column header="Backup / error"
            ><template #body="{ data }">
              <code v-if="data.backupKey">{{ data.backupKey }}</code>
              <p v-if="data.errorCode">
                <strong>{{ data.errorCode }}</strong
                >: {{ data.error }}
              </p>
            </template></Column
          >
        </DataTable>
        <p v-if="!result.dryRun">
          A backup key on a failed outcome does not guarantee backup verification.
        </p>
      </SurfaceCard>
    </div>
    <Dialog
      v-model:visible="showConfirmation"
      header="Confirm asset deletion"
      modal
      :style="{ width: '36rem', maxWidth: '95vw' }"
    >
      <div class="cleanup-form">
        <p>
          Delete current asset keys starting with <code class="literal">{{ prefix }}</code
          >? The preview found {{ result?.matchedCount }} matches; execution may find a different
          set.
        </p>
        <p>
          There is no rollback or cancellation. A lost connection may leave some assets deleted.
          Backup retention is not a guarantee of removal exactly 168 hours later.
        </p>
        <div class="acknowledgement">
          <Checkbox v-model="operationallyVerified" inputId="cleanup-verified" binary />
          <label for="cleanup-verified"
            >I have verified SeaweedFS conditional-operation and lifecycle enforcement operationally
            before relying on this deletion.</label
          >
        </div>
        <label for="cleanup-confirm">Re-enter the exact prefix to confirm (including spaces)</label>
        <InputText
          id="cleanup-confirm"
          v-model="confirmation"
          autocomplete="off"
          :spellcheck="false"
          fluid
        />
        <div class="actions">
          <Button label="Cancel" severity="secondary" outlined @click="showConfirmation = false" />
          <Button
            label="Back up and delete"
            severity="danger"
            :disabled="!confirmed"
            @click="confirmExecution"
          />
        </div>
      </div>
    </Dialog>
  </AdminPageShell>
</template>

<style scoped>
.cleanup-workspace,
.cleanup-form {
  display: grid;
  gap: var(--space-4);
}
h2 {
  margin-top: 0;
  color: var(--text-primary);
  font-family: var(--font-display);
}
p {
  color: var(--text-secondary);
  line-height: 1.6;
}
.cleanup-form p {
  margin: 0;
}
label {
  color: var(--text-primary);
  font-weight: 600;
}
.actions,
.summary,
.acknowledgement {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}
.acknowledgement {
  flex-wrap: nowrap;
  align-items: flex-start;
}
.summary {
  margin-bottom: var(--space-4);
}
code {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  overflow-wrap: anywhere;
}
.literal {
  white-space: pre-wrap;
}
:deep(td) {
  vertical-align: top;
  overflow-wrap: anywhere;
}
</style>

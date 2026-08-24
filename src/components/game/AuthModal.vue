<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import Password from "primevue/password";
import { useGameViewInject } from "../../composables/game/injectKey";

const gv = useGameViewInject();

const handleVisibleUpdate = (value) => {
  gv.showAuthModal = value;
  if (!value) {
    gv.authPassphrase = "";
  }
};
</script>

<template>
  <Dialog
    v-model:visible="gv.showAuthModal"
    modal
    header="Profile Authentication Required"
    :style="{ width: 'min(25rem, calc(100vw - 2rem))' }"
  >
    <p class="auth-context">
      Card generation is paused. Authenticate profile
      <strong>#{{ gv.authProfileId }}</strong> to retry automatically.
    </p>

    <form @submit.prevent="gv.handleAuth()">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="profile-passphrase">Passphrase</label>
          <Password
            inputId="profile-passphrase"
            v-model="gv.authPassphrase"
            required
            :feedback="false"
            toggleMask
            fluid
          />
        </div>

        <Message v-if="gv.authError" severity="error">{{ gv.authError }}</Message>

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            @click="handleVisibleUpdate(false)"
          />
          <Button
            type="submit"
            :label="gv.authLoading ? 'Authenticating...' : 'Authenticate'"
            :loading="gv.authLoading"
          />
        </div>
      </div>
    </form>
  </Dialog>
</template>

<style scoped>
.auth-context {
  margin: 0 0 1rem;
  padding: 0.75rem;
  color: var(--text-secondary);
  background: var(--bg-surface-raised);
  border-left: 3px solid var(--brass);
  border-radius: var(--radius-sm);
}
</style>

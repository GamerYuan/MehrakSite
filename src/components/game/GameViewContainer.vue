<script setup>
import AuthModal from "./AuthModal.vue";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import CommandCard from "./CommandCard.vue";
import Image from "primevue/image";
import { computed, defineAsyncComponent } from "vue";
import { useGameViewInject } from "../../composables/game/injectKey";
import SurfaceCard from "../ui/SurfaceCard.vue";

const ManageAliasesCard = defineAsyncComponent(() => import("./ManageAliasesCard.vue"));
const ManageCharactersCard = defineAsyncComponent(() => import("./ManageCharactersCard.vue"));
const ManageCodesCard = defineAsyncComponent(() => import("./ManageCodesCard.vue"));
const ManageWeaponIconsCard = defineAsyncComponent(() => import("./ManageWeaponIconsCard.vue"));
const PortraitConfigModal = defineAsyncComponent(() => import("./PortraitConfigModal.vue"));
const StatEditModal = defineAsyncComponent(() => import("./StatEditModal.vue"));

const gv = useGameViewInject();

const getTabConfig = (tabId) => gv.config.tabs.find((t) => t.id === tabId);

const gameLogo = computed(() => gv.config.logo);

const clearResult = () => {
  gv.resultImages[gv.activeTab] = null;
};
</script>

<template>
  <section class="game-view" :style="gv.config.gameColorStyle">
    <header class="game-header">
      <div class="game-identity">
        <img v-if="gameLogo" :src="gameLogo" alt="" class="game-logo" />
        <h1 class="game-title">{{ gv.config.title }}</h1>
      </div>
    </header>

    <div class="workspace-grid" :class="{ 'is-management': gv.isManagementWorkspace }">
      <nav class="workspace-nav" aria-label="Game workspaces">
        <div class="nav-group">
          <span class="nav-label">Commands</span>
          <RouterLink
            v-for="tab in gv.commandTabs"
            :key="tab.id"
            :to="gv.getTabLocation(tab.id)"
            class="workspace-link"
            :class="{ active: gv.activeTab === tab.id }"
            :aria-current="gv.activeTab === tab.id ? 'page' : undefined"
          >
            <i class="pi pi-bolt" aria-hidden="true"></i>
            <span>{{ tab.name }}</span>
          </RouterLink>
        </div>
        <div v-if="gv.managementTabs.length" class="nav-group management-group">
          <span class="nav-label">Management</span>
          <RouterLink
            v-for="tab in gv.managementTabs"
            :key="tab.id"
            :to="gv.getTabLocation(tab.id)"
            class="workspace-link management-link"
            :class="{ active: gv.activeTab === tab.id }"
            :aria-current="gv.activeTab === tab.id ? 'page' : undefined"
          >
            <i class="pi pi-wrench" aria-hidden="true"></i>
            <span>{{ tab.name }}</span>
          </RouterLink>
        </div>
        <div v-if="gv.personalTabs.length" class="nav-group personal-group">
          <span class="nav-label">Personal</span>
          <RouterLink
            v-for="tab in gv.personalTabs"
            :key="tab.id"
            :to="gv.getTabLocation(tab.id)"
            class="workspace-link personal-link"
            :class="{ active: gv.activeTab === tab.id }"
            :aria-current="gv.activeTab === tab.id ? 'page' : undefined"
          >
            <i class="pi pi-images" aria-hidden="true"></i>
            <span>{{ tab.name }}</span>
          </RouterLink>
        </div>
      </nav>

      <div class="workspace-main">
        <ManageCharactersCard
          v-if="gv.activeTab === 'manage' || gv.activeTab === 'portraits'"
          :personal-portraits="gv.activeTab === 'portraits'"
        />

        <ManageAliasesCard v-else-if="gv.activeTab === 'aliases'" />

        <ManageCodesCard v-else-if="gv.activeTab === 'codes'" />

        <ManageWeaponIconsCard v-else-if="gv.activeTab === 'weaponicons'" />

        <div v-else class="command-workspace">
          <CommandCard :tabConfig="getTabConfig(gv.activeTab)" />

          <aside class="preview-column" aria-label="Generated card preview">
            <SurfaceCard class="result-card">
              <div class="result-header">
                <div>
                  <span class="surface-kicker">Generated card</span>
                  <h2 class="result-title">Preview</h2>
                </div>
                <Button
                  v-if="gv.resultImages[gv.activeTab]"
                  icon="pi pi-times"
                  text
                  rounded
                  size="small"
                  aria-label="Clear generated card"
                  @click="clearResult"
                />
              </div>

              <div
                v-if="gv.loading[gv.activeTab]"
                class="preview-state"
                role="status"
                aria-live="polite"
              >
                <ProgressSpinner style="width: 2rem; height: 2rem" strokeWidth="4" />
                <strong>Generating card</strong>
                <span>Keep this page open while MehrakBot prepares the result.</span>
              </div>

              <div
                v-else-if="gv.error[gv.activeTab]"
                class="preview-state error-state"
                role="alert"
              >
                <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
                <strong>Generation failed</strong>
                <span>{{ gv.error[gv.activeTab] }}</span>
              </div>

              <Image
                v-else-if="gv.resultImages[gv.activeTab]"
                :src="gv.resultImages[gv.activeTab]"
                alt="Generated game card result"
                preview
                width="100%"
              />

              <div v-else class="preview-state">
                <i class="pi pi-image" aria-hidden="true"></i>
                <strong>Your card will appear here</strong>
                <span>Complete the command form, then generate a preview.</span>
              </div>
            </SurfaceCard>
          </aside>
        </div>
      </div>
    </div>

    <AuthModal />

    <StatEditModal v-if="gv.config.hasStatEdit && gv.showEditStatModal" />

    <PortraitConfigModal v-if="gv.showPortraitConfigModal" />
  </section>
</template>

<style scoped>
.game-view {
  max-width: 82rem;
  margin: 0 auto;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem clamp(1rem, 3vw, 1.75rem);
  background: var(--bg-surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  margin-bottom: 1rem;
}

.game-identity {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.game-logo {
  width: 3.75rem;
  height: 3.75rem;
  padding: 0.45rem;
  border: 1px solid color-mix(in srgb, var(--game-color) 42%, var(--border-primary));
  border-radius: var(--radius-lg);
  background: var(--bg-surface-raised);
  object-fit: contain;
  flex-shrink: 0;
}

.nav-label,
.game-view :deep(.surface-kicker) {
  display: block;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.game-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(12rem, 15rem) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.workspace-nav {
  position: sticky;
  top: 1rem;
  display: grid;
  gap: 1rem;
  padding: 0.8rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.nav-group {
  display: grid;
  gap: 0.3rem;
}

.nav-label {
  padding: 0.35rem 0.55rem;
}

.management-group,
.personal-group {
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-primary);
}

.workspace-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: var(--control-size);
  padding: 0.55rem 0.7rem;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition:
    background var(--motion-fast) var(--ease-standard),
    color var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard);
}

.workspace-link:hover {
  color: var(--text-primary);
  background: var(--bg-surface-raised);
}

.workspace-link.active {
  color: var(--text-primary);
  border-color: color-mix(in srgb, var(--game-color) 42%, var(--border-primary));
  background: color-mix(in srgb, var(--game-color) 10%, var(--bg-surface));
}

.management-link i {
  color: var(--brass);
}

.personal-link i {
  color: var(--accent);
}

.workspace-main {
  min-width: 0;
}

.game-view :deep(.game-card) {
  background: var(--card-surface) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-sm) !important;
}

.command-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: var(--space-4);
}

.preview-column {
  min-width: 0;
}

.result-card {
  min-height: 24rem;
  box-shadow: var(--shadow-md);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.result-title {
  margin: var(--space-1) 0 0;
  color: var(--text-primary);
  font-weight: 600;
}

.result-card :deep(img) {
  max-width: 100%;
  margin-top: var(--space-4);
  border-radius: var(--radius-md);
}

.preview-state {
  display: grid;
  min-height: 18rem;
  padding: var(--space-6);
  place-items: center;
  align-content: center;
  gap: var(--space-2);
  color: var(--text-muted);
  text-align: center;
}

.preview-state > i {
  color: var(--accent);
  font-size: var(--text-3xl);
}

.preview-state strong {
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-lg);
}

.error-state > i,
.error-state strong {
  color: var(--danger);
}

@media (max-width: 75rem) {
  .workspace-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .workspace-nav {
    position: static;
    display: flex;
    overflow-x: auto;
    padding: var(--space-2);
    gap: var(--space-1);
    scrollbar-width: thin;
  }

  .nav-group {
    display: flex;
    flex: 0 0 auto;
    gap: var(--space-1);
  }

  .nav-label {
    display: none;
  }

  .management-group,
  .personal-group {
    padding-top: 0;
    padding-left: var(--space-2);
    border-top: 0;
    border-left: 1px solid var(--border-primary);
  }

  .workspace-link {
    white-space: nowrap;
  }
}

@media (max-width: 64rem) {
  .command-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .preview-column {
    position: static;
  }
}

@media (max-width: 48rem) {
  .game-header {
    align-items: flex-start;
    padding: var(--space-4);
  }

  .game-logo {
    width: 3rem;
    height: 3rem;
  }

  .game-title {
    font-size: 1.65rem;
  }
}

@media (max-width: 420px) {
  .game-logo {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>

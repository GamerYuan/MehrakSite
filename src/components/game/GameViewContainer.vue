<script setup>
import AuthModal from "./AuthModal.vue";
import Button from "primevue/button";
import Card from "primevue/card";
import CommandCard from "./CommandCard.vue";
import Image from "primevue/image";
import ManageAliasesCard from "./ManageAliasesCard.vue";
import ManageCharactersCard from "./ManageCharactersCard.vue";
import ManageCodesCard from "./ManageCodesCard.vue";
import ManageWeaponIconsCard from "./ManageWeaponIconsCard.vue";
import PortraitConfigModal from "./PortraitConfigModal.vue";
import StatEditModal from "./StatEditModal.vue";
import { computed } from "vue";
import { useGameViewInject } from "../../composables/game/injectKey";

const gv = useGameViewInject();

const getTabConfig = (tabId) => gv.config.tabs.find((t) => t.id === tabId);

const gameColor = computed(() => gv.config.color || "var(--accent)");
const gameLogo = computed(() => gv.config.logo);
const workspaceTitle = computed(() => {
  if (gv.isManagementWorkspace) return "Management workspace";
  if (gv.isPersonalPortraitWorkspace) return "Personal portrait workspace";
  return "Command workspace";
});
const workspaceSubtitle = computed(() => {
  if (gv.isManagementWorkspace) {
    return "Maintain game data, portraits, aliases, and operational assets.";
  }
  if (gv.isPersonalPortraitWorkspace) {
    return "Choose a character and manage portraits owned by your account.";
  }
  return "Configure a profile request and generate a fresh game card.";
});

const clearResult = () => {
  gv.resultImages[gv.activeTab] = null;
};
</script>

<template>
  <section class="game-view" :style="{ '--game-color': gameColor }">
    <header class="game-header">
      <div class="game-identity">
        <img v-if="gameLogo" :src="gameLogo" alt="" class="game-logo" />
        <div class="game-title-block">
          <span class="game-kicker">Field station / {{ workspaceTitle }}</span>
          <h1 class="game-title">{{ gv.config.title }}</h1>
          <p class="game-subtitle">{{ workspaceSubtitle }}</p>
        </div>
      </div>
      <div class="station-status" aria-label="Workspace status">
        <span class="status-dot"></span>
        <span>{{ gv.isManagementWorkspace ? "Write access" : "Authenticated" }}</span>
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

        <CommandCard v-else :tabConfig="getTabConfig(gv.activeTab)" />

        <div v-if="gv.resultImages[gv.activeTab]" class="result-container">
          <Card class="result-card">
            <template #title>
              <div class="result-header">
                <div>
                  <span class="surface-kicker">Generated specimen</span>
                  <span class="result-title">Command result</span>
                </div>
                <Button
                  icon="pi pi-times"
                  text
                  rounded
                  size="small"
                  aria-label="Clear result"
                  @click="clearResult"
                />
              </div>
            </template>
            <template #content>
              <Image
                :src="gv.resultImages[gv.activeTab]"
                alt="Generated game card result"
                preview
                width="100%"
              />
            </template>
          </Card>
        </div>
      </div>
    </div>

    <AuthModal />

    <StatEditModal v-if="gv.config.hasStatEdit" />

    <PortraitConfigModal />
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
  padding: 1.5rem clamp(1rem, 3vw, 2rem);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--game-color) 12%, transparent), transparent 42%),
    var(--bg-surface);
  border: 1px solid var(--border-primary);
  border-top: 3px solid var(--game-color);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
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

.game-kicker,
.nav-label {
  display: block;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

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

.game-subtitle {
  max-width: 42rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0.125rem 0 0;
}

.station-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-pill);
  color: var(--text-secondary);
  background: var(--bg-overlay);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  white-space: nowrap;
}

.status-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--success) 16%, transparent);
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
  min-height: 2.55rem;
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
  box-shadow: inset 3px 0 var(--game-color);
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
  border-radius: var(--radius-xl) !important;
  box-shadow: var(--shadow-sm) !important;
}

.result-container {
  margin-top: 1.5rem;
}

.result-card {
  background: var(--card-surface) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: var(--radius-xl) !important;
  box-shadow: var(--shadow-md) !important;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-title {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}

.result-card :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-md);
}

@media (max-width: 768px) {
  .game-header {
    align-items: flex-start;
    padding: 1rem;
  }

  .station-status {
    display: none;
  }

  .game-logo {
    width: 2.5rem;
    height: 2.5rem;
  }

  .game-title {
    font-size: 1.65rem;
  }

  .workspace-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .workspace-nav {
    position: static;
    display: flex;
    overflow-x: auto;
    padding: 0.6rem;
    scrollbar-width: thin;
  }

  .nav-group {
    display: flex;
    flex: 0 0 auto;
  }

  .nav-label {
    align-self: center;
    writing-mode: vertical-rl;
  }

  .management-group,
  .personal-group {
    padding: 0 0 0 0.75rem;
    border-top: 0;
    border-left: 1px solid var(--border-primary);
  }

  .workspace-link {
    white-space: nowrap;
  }
}

@media (max-width: 420px) {
  .game-logo {
    width: 3rem;
    height: 3rem;
  }

  .game-subtitle {
    font-size: var(--text-xs);
  }
}
</style>

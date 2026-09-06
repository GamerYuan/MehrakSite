<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import DocCard from "../components/docs/DocCard.vue";
import DocDetailModal from "../components/docs/DocDetailModal.vue";
import DocSearchBar from "../components/docs/DocSearchBar.vue";
import GameTag from "../components/docs/GameTag.vue";
import AboutCookiesTab from "../components/docs/tabs/AboutCookiesTab.vue";
import AboutMehrakTab from "../components/docs/tabs/AboutMehrakTab.vue";
import AliasTab from "../components/docs/tabs/AliasTab.vue";
import CommendationsTab from "../components/docs/tabs/CommendationsTab.vue";
import FaqTab from "../components/docs/tabs/FaqTab.vue";
import GettingStartedTab from "../components/docs/tabs/GettingStartedTab.vue";
import ReleaseNotesTab from "../components/docs/tabs/ReleaseNotesTab.vue";
import EmptyState from "../components/ui/EmptyState.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import SectionRule from "../components/ui/SectionRule.vue";
import { useDocs } from "../composables/useDocs";

const route = useRoute();
const router = useRouter();

const {
  loading,
  error: docsError,
  searchQuery,
  selectedGames,
  groupedDocuments,
  fetchDocumentDetail,
  toggleGame,
  selectAllGames,
} = useDocs();

const navItems = [
  { key: "getting-started", label: "Getting Started", icon: "pi pi-compass" },
  { key: "commands", label: "Command Index", icon: "pi pi-hashtag" },
  { key: "alias", label: "Character Aliases", icon: "pi pi-tags" },
  { key: "faq", label: "FAQ", icon: "pi pi-question-circle" },
  { key: "appendix", label: "Appendix", icon: "pi pi-folder-open" },
];

const appendixTabs = [
  { key: "about", label: "About Mehrak" },
  { key: "cookies", label: "HoYoLAB Cookies" },
  { key: "notes", label: "Release Notes" },
  { key: "commendations", label: "Commendations" },
];

const validTabs = new Set(navItems.map(({ key }) => key));
const validAppendixTabs = new Set(appendixTabs.map(({ key }) => key));
const validJourneys = new Set(["server", "personal"]);
const activeTab = ref("getting-started");
const appendixTab = ref("about");
const activeJourney = ref("server");
const selectedDoc = ref(null);
const showDetailModal = ref(false);
const loadingDetail = ref(false);
const detailError = ref("");
const mobileNavOpen = ref(false);
const activeNavItem = computed(() => navItems.find(({ key }) => key === activeTab.value));
const queryString = (value) => {
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : undefined;
};

watch(
  [
    () => queryString(route.query.tab),
    () => queryString(route.query.section),
    () => queryString(route.query.journey),
    () => queryString(route.query.search),
  ],
  ([tab, section, journey, search]) => {
    activeTab.value = validTabs.has(tab) ? tab : "getting-started";
    appendixTab.value = validAppendixTabs.has(section) ? section : "about";
    activeJourney.value = validJourneys.has(journey) ? journey : "server";
    searchQuery.value = typeof search === "string" ? search : "";
    showDetailModal.value = false;
    mobileNavOpen.value = false;

    if (journey && !validJourneys.has(journey)) {
      router.replace({
        name: "docs",
        query: { ...route.query, journey: undefined },
        hash: route.hash,
      });
    }
  },
  { immediate: true },
);

const handleDocClick = async (doc) => {
  loadingDetail.value = true;
  detailError.value = "";
  showDetailModal.value = true;
  selectedDoc.value = { ...doc, parameters: [], examples: [] };
  try {
    selectedDoc.value = await fetchDocumentDetail(doc.id);
  } catch {
    detailError.value = "The command details could not be loaded. Please try again.";
  } finally {
    loadingDetail.value = false;
  }
};

const handleTabChange = (tab) => {
  if (typeof tab !== "string" || !validTabs.has(tab)) return;
  mobileNavOpen.value = false;
  router.push({
    name: "docs",
    query: {
      ...route.query,
      tab,
      section: tab === "appendix" ? appendixTab.value : undefined,
    },
    hash: route.hash,
  });
};

const handleAppendixChange = (section) => {
  if (typeof section !== "string" || !validAppendixTabs.has(section)) return;
  router.push({
    name: "docs",
    query: { ...route.query, tab: "appendix", section },
    hash: route.hash,
  });
};

const handleJourneyChange = (journey) => {
  if (typeof journey !== "string" || !validJourneys.has(journey)) return;
  router.push({
    name: "docs",
    query: { ...route.query, tab: "getting-started", journey },
    hash: route.hash,
  });
};

const handleSearchChange = (value) => {
  if (typeof value !== "string") return;
  searchQuery.value = value;
  router.replace({
    name: "docs",
    query: { ...route.query, tab: "commands", search: value.trim() || undefined },
    hash: route.hash,
  });
};

const clearCommandSearch = () => handleSearchChange("");
</script>

<template>
  <section class="docs-page" aria-labelledby="docs-title">
    <header class="docs-masthead">
      <h1 id="docs-title">Documentation</h1>
      <p class="masthead-intro">
        Install Mehrak, search the live command index, and connect HoYoverse profiles with clear
        security guidance.
      </p>
    </header>

    <div class="mobile-guide-nav">
      <span class="mobile-nav-label">Manual section</span>
      <button
        type="button"
        class="mobile-nav-trigger"
        :aria-expanded="mobileNavOpen"
        aria-controls="mobile-docs-menu"
        @click="mobileNavOpen = !mobileNavOpen"
      >
        <i :class="activeNavItem.icon" aria-hidden="true"></i>
        <span>{{ activeNavItem.label }}</span>
        <i
          :class="mobileNavOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
          aria-hidden="true"
        ></i>
      </button>
      <div v-show="mobileNavOpen" id="mobile-docs-menu" class="mobile-nav-menu">
        <button
          v-for="item in navItems"
          :key="item.key"
          type="button"
          :class="['mobile-nav-option', { active: activeTab === item.key }]"
          :aria-current="activeTab === item.key ? 'page' : undefined"
          @click="handleTabChange(item.key)"
        >
          <i :class="item.icon" aria-hidden="true"></i>
          <strong>{{ item.label }}</strong>
          <i v-if="activeTab === item.key" class="pi pi-check" aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <div class="docs-grid">
      <aside class="guide-sidebar">
        <div class="sidebar-heading">
          <span>Contents</span>
        </div>
        <nav class="sidebar-nav" aria-label="Documentation sections">
          <button
            v-for="item in navItems"
            :key="item.key"
            type="button"
            :class="['nav-item', { active: activeTab === item.key }]"
            :aria-current="activeTab === item.key ? 'page' : undefined"
            @click="handleTabChange(item.key)"
          >
            <i :class="item.icon" aria-hidden="true"></i>
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </aside>

      <div class="docs-content">
        <GettingStartedTab
          v-if="activeTab === 'getting-started'"
          :journey="activeJourney"
          @update:journey="handleJourneyChange"
        />

        <section v-else-if="activeTab === 'commands'" class="commands-view">
          <PageHeader
            title="Command Index"
            subtitle="Search the live index, then open a command brief for usage and parameters."
          />

          <DocSearchBar
            :searchQuery="searchQuery"
            :selectedGames="selectedGames"
            @update:searchQuery="handleSearchChange"
            @toggleGame="toggleGame"
            @selectAllGames="selectAllGames"
          />

          <div v-if="loading" class="state-box" role="status" aria-live="polite">
            <ProgressSpinner style="width: 2.25rem; height: 2.25rem" strokeWidth="3" />
            <span>Consulting the command catalogue…</span>
          </div>

          <div v-else-if="docsError" class="state-box" role="alert">
            <Message severity="error" :closable="false">{{ docsError }}</Message>
          </div>

          <EmptyState
            v-else-if="Object.keys(groupedDocuments).length === 0"
            icon="pi pi-search"
            :title="searchQuery ? `No command matches “${searchQuery}”` : 'No commands available'"
            :description="
              searchQuery
                ? 'This command link may be stale or malformed. Clear it to return to the full index.'
                : 'Restore all game filters or try again later.'
            "
          >
            <div class="empty-actions">
              <button
                v-if="searchQuery"
                type="button"
                class="recovery-action"
                @click="clearCommandSearch"
              >
                Show all commands
              </button>
              <button
                type="button"
                class="recovery-action"
                @click="handleTabChange('getting-started')"
              >
                Open Getting Started
              </button>
            </div>
          </EmptyState>

          <div v-else class="game-groups">
            <section v-for="(docs, game) in groupedDocuments" :key="game" class="game-group">
              <header class="game-group-head">
                <GameTag :game="game" />
                <SectionRule />
                <span class="game-count"
                  >{{ docs.length }} {{ docs.length === 1 ? "entry" : "entries" }}</span
                >
              </header>
              <div class="card-grid">
                <DocCard v-for="doc in docs" :key="doc.id" :doc="doc" @click="handleDocClick" />
              </div>
            </section>
          </div>
        </section>

        <AliasTab v-else-if="activeTab === 'alias'" />
        <FaqTab v-else-if="activeTab === 'faq'" />

        <section v-else class="appendix-view">
          <PageHeader
            title="Appendix"
            subtitle="Product context, credential security, release history, and acknowledgements."
          />

          <Tabs :value="appendixTab" class="appendix-tabs" @update:value="handleAppendixChange">
            <TabList>
              <Tab v-for="tab in appendixTabs" :key="tab.key" :value="tab.key">
                {{ tab.label }}
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel value="about"><AboutMehrakTab /></TabPanel>
              <TabPanel value="cookies"><AboutCookiesTab /></TabPanel>
              <TabPanel value="notes"><ReleaseNotesTab /></TabPanel>
              <TabPanel value="commendations"><CommendationsTab /></TabPanel>
            </TabPanels>
          </Tabs>
        </section>
      </div>
    </div>

    <DocDetailModal
      v-model:visible="showDetailModal"
      :doc="selectedDoc"
      :loading="loadingDetail"
      :error="detailError"
    />
  </section>
</template>

<style scoped>
.docs-page {
  width: min(100%, 90rem);
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 4.5rem) clamp(1rem, 4vw, 3rem) var(--space-20);
}

.docs-masthead {
  margin-bottom: var(--space-10);
}

.docs-masthead h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.masthead-intro {
  max-width: 42rem;
  margin: var(--space-4) 0 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: var(--leading-body);
}

.docs-grid {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 5rem);
  align-items: start;
}

.guide-sidebar {
  position: sticky;
  top: 6rem;
}

.sidebar-heading {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-secondary);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  width: 100%;
  padding: var(--space-3) var(--space-2);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--text-sm);
  text-align: left;
  transition:
    background var(--motion-fast) var(--ease-standard),
    color var(--motion-fast) var(--ease-standard);
}

.nav-item:hover {
  background: var(--bg-surface-raised);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-weight: 600;
}

.nav-item > i {
  font-size: 0.75rem;
}

.mobile-guide-nav {
  display: none;
}

.docs-content {
  min-width: 0;
  max-width: 64rem;
  padding: var(--space-6);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-surface-raised);
}

.commands-view,
.appendix-view {
  min-width: 0;
}

.commands-view > :first-child,
.appendix-view > :first-child {
  margin-bottom: var(--space-8);
}

.state-box {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  align-items: center;
  margin-top: var(--space-8);
  padding: var(--space-16) var(--space-4);
  border: 1px dashed var(--border-secondary);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
  text-align: center;
}

.game-groups {
  display: grid;
  margin-top: var(--space-8);
  gap: var(--space-8);
}

.game-group {
  min-width: 0;
  padding: var(--space-5);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.game-group-head {
  display: flex;
  min-height: var(--control-size);
  margin-bottom: var(--space-5);
  align-items: center;
  gap: var(--space-3);
}

.game-group-head > :nth-child(2) {
  flex: 1;
}

.game-count {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.appendix-tabs :deep(.p-tablist) {
  overflow-x: auto;
  border-bottom: 1px solid var(--border-secondary);
  background: transparent;
}

.appendix-tabs :deep(.p-tab) {
  padding: var(--space-3) var(--space-4);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  white-space: nowrap;
}

.appendix-tabs :deep(.p-tab.p-tab-active) {
  color: var(--accent-strong);
}

.appendix-tabs :deep(.p-tabpanels) {
  min-width: 0;
  padding: var(--space-8) 0 0;
  background: transparent;
}

.empty-actions {
  display: flex;
  margin-top: var(--space-3);
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
}

.recovery-action {
  min-height: var(--control-size);
  padding: 0 var(--space-4);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-weight: 650;
  cursor: pointer;
}

.recovery-action:hover {
  border-color: var(--accent);
  color: var(--accent-strong);
}

@media (max-width: 64rem) {
  .docs-grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }

  .guide-sidebar {
    display: none;
  }

  .mobile-guide-nav {
    display: block;
    margin-bottom: var(--space-8);
  }

  .mobile-nav-label {
    display: block;
    margin-bottom: var(--space-2);
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .mobile-nav-trigger {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--space-3);
    align-items: center;
    width: 100%;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--border-secondary);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    color: var(--text-primary);
    cursor: pointer;
    font-weight: 600;
    text-align: left;
  }

  .mobile-nav-menu {
    margin-top: var(--space-2);
    padding: var(--space-2);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    background: var(--bg-surface-raised);
    box-shadow: var(--shadow-md);
  }

  .mobile-nav-option {
    display: grid;
    grid-template-columns: 1rem minmax(0, 1fr) auto;
    gap: var(--space-2);
    align-items: center;
    width: 100%;
    padding: var(--space-3);
    border: 0;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    text-align: left;
  }

  .mobile-nav-option:hover {
    background: var(--bg-surface);
    color: var(--text-primary);
  }
  .mobile-nav-option.active {
    background: var(--accent-soft);
    color: var(--accent-strong);
  }
  .mobile-nav-option > strong {
    font-weight: 600;
  }
  .mobile-nav-option > i:last-child {
    font-size: var(--text-xs);
  }
}

@media (max-width: 40rem) {
  .docs-page {
    padding-inline: var(--space-4);
  }

  .docs-content {
    padding: var(--space-4);
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .game-group {
    padding: var(--space-4);
  }
}
</style>

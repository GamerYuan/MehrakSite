<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppNavbar from "../components/AppNavbar.vue";
import AppFooter from "../components/AppFooter.vue";
import DocCard from "../components/docs/DocCard.vue";
import DocDetailModal from "../components/docs/DocDetailModal.vue";
import DocSearchBar from "../components/docs/DocSearchBar.vue";
import GettingStartedTab from "../components/docs/tabs/GettingStartedTab.vue";
import FaqTab from "../components/docs/tabs/FaqTab.vue";
import AboutMehrakTab from "../components/docs/tabs/AboutMehrakTab.vue";
import AboutCookiesTab from "../components/docs/tabs/AboutCookiesTab.vue";
import ReleaseNotesTab from "../components/docs/tabs/ReleaseNotesTab.vue";
import CommendationsTab from "../components/docs/tabs/CommendationsTab.vue";
import AliasTab from "../components/docs/tabs/AliasTab.vue";
import { useDocs } from "../composables/useDocs";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";

const route = useRoute();
const router = useRouter();

const {
  loading,
  error,
  searchQuery,
  selectedGames,
  groupedDocuments,
  fetchDocumentDetail,
  toggleGame,
  selectAllGames,
  gameLabels,
} = useDocs();

const selectedDoc = ref(null);
const showDetailModal = ref(false);
const loadingDetail = ref(false);
const activeTab = ref("getting-started");
const appendixTab = ref("about");

const navItems = [
  { key: "getting-started", label: "Getting Started", icon: "pi pi-book" },
  { key: "commands", label: "Commands", icon: "pi pi-hashtag" },
  { key: "alias", label: "Aliases", icon: "pi pi-tags" },
  { key: "faq", label: "FAQ", icon: "pi pi-question-circle" },
  { key: "appendix", label: "Appendix", icon: "pi pi-folder-open" },
];

const appendixTabs = [
  { key: "about", label: "About Mehrak" },
  { key: "cookies", label: "About HoYoLAB Cookies" },
  { key: "notes", label: "Release Notes" },
  { key: "commendations", label: "Commendations" },
];

const syncFromUrl = () => {
  const tab = route.query.tab;
  const section = route.query.section;
  const hash = route.hash;
  if (tab) {
    activeTab.value = tab;
    if (tab === "appendix" && section) appendixTab.value = section;
  }
  if (hash) {
    setTimeout(() => {
      const id = hash.startsWith("#") ? hash.slice(1) : hash;
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
};

watch(() => route.query, syncFromUrl, { immediate: true });

const handleDocClick = async (doc) => {
  loadingDetail.value = true;
  showDetailModal.value = true;
  selectedDoc.value = { ...doc, parameters: [], examples: [] };
  try {
    selectedDoc.value = await fetchDocumentDetail(doc.id);
  } catch (err) {
    console.error("Failed to fetch document details:", err);
  } finally {
    loadingDetail.value = false;
  }
};

const handleSearchUpdate = (value) => {
  searchQuery.value = value;
};

const handleTabChange = (tab) => {
  activeTab.value = tab;
  showDetailModal.value = false;
  router.push({ path: "/docs", query: { tab } });
};
</script>

<template>
  <div class="docs-page">
    <AppNavbar />

    <main class="docs-main">
      <div class="docs-grid">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-head">
            <div class="sidebar-icon">
              <i class="pi pi-book"></i>
            </div>
            <div>
              <h1 class="sidebar-title">Docs</h1>
              <p class="sidebar-sub">Mehrak Discord Bot</p>
            </div>
          </div>

          <nav class="sidebar-nav">
            <button
              v-for="item in navItems"
              :key="item.key"
              type="button"
              :class="['nav-item', { active: activeTab === item.key }]"
              @click="handleTabChange(item.key)"
            >
              <i :class="item.icon" class="nav-icon"></i>
              <span>{{ item.label }}</span>
              <i v-if="activeTab === item.key" class="pi pi-arrow-right nav-arrow"></i>
            </button>
          </nav>
        </aside>

        <!-- Content -->
        <section class="content">
          <div v-if="activeTab === 'getting-started'">
            <GettingStartedTab />
          </div>

          <div v-else-if="activeTab === 'commands'" class="commands-view">
            <div class="content-head">
              <h2 class="content-title">Commands</h2>
              <p class="content-desc">Search and view details about available commands.</p>
            </div>

            <DocSearchBar
              :searchQuery="searchQuery"
              :selectedGames="selectedGames"
              @update:searchQuery="handleSearchUpdate"
              @toggleGame="toggleGame"
              @selectAllGames="selectAllGames"
            />

            <div v-if="loading" class="state-box">
              <ProgressSpinner style="width:36px;height:36px" strokeWidth="3" />
              <span>Loading commands...</span>
            </div>

            <div v-else-if="error" class="state-box">
              <Message severity="error" :closable="false">{{ error }}</Message>
            </div>

            <div v-else-if="Object.keys(groupedDocuments).length === 0" class="state-box">
              <i class="pi pi-search" style="font-size:1.5rem;opacity:0.3"></i>
              <span>No commands found matching your search.</span>
            </div>

            <div v-else class="game-groups">
              <section v-for="(docs, game) in groupedDocuments" :key="game" class="game-group">
                <div class="game-group-head">
                  <span class="game-dot" :style="{ background: gameLabels[game] ? undefined : 'var(--accent)' }"></span>
                  <h3 class="game-group-title">{{ gameLabels[game] }}</h3>
                  <span class="game-count">{{ docs.length }}</span>
                </div>
                <div class="card-grid">
                  <DocCard v-for="doc in docs" :key="doc.id" :doc="doc" @click="handleDocClick" />
                </div>
              </section>
            </div>
          </div>

          <div v-else-if="activeTab === 'alias'">
            <AliasTab />
          </div>

          <div v-else-if="activeTab === 'faq'">
            <FaqTab />
          </div>

          <div v-else>
            <div class="content-head">
              <h2 class="content-title">Appendix</h2>
              <p class="content-desc">Additional information and resources.</p>
            </div>

            <Tabs v-model:value="appendixTab" class="appendix-tabs">
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
          </div>
        </section>
      </div>
    </main>

    <DocDetailModal v-model:visible="showDetailModal" :doc="selectedDoc" :loading="loadingDetail" />
    <AppFooter />
  </div>
</template>

<style scoped>
.docs-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--page-gradient);
}

.docs-main {
  flex: 1;
  padding: 7rem 2rem 4rem;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}

.docs-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 3.5rem;
  align-items: start;
}

/* ── Sidebar ───────────────────────────── */

.sidebar {
  position: sticky;
  top: 5.5rem;
}

.sidebar-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1.25rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-primary);
}

.sidebar-icon {
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  border-radius: 0.625rem;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: #fff;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.sidebar-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0.125rem 0 0 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.12s ease;
  text-align: left;
}

.nav-item:hover {
  color: var(--text-primary);
  background: var(--bg-surface);
}

.nav-item.active {
  color: var(--accent);
  background: rgba(34, 197, 94, 0.08);
}

.nav-icon {
  width: 1.125rem;
  text-align: center;
  font-size: 0.875rem;
  opacity: 0.6;
}

.nav-item.active .nav-icon {
  opacity: 1;
}

.nav-arrow {
  margin-left: auto;
  font-size: 0.625rem;
  opacity: 0.5;
}

/* ── Content ───────────────────────────── */

.content {
  min-width: 0;
}

.content-head {
  margin-bottom: 2rem;
}

.content-title {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.375rem 0;
  letter-spacing: -0.025em;
}

.content-desc {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  color: var(--text-muted);
  text-align: center;
}

/* ── Commands grid ─────────────────────── */

.commands-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.game-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.game-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.game-group-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid var(--border-primary);
}

.game-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

.game-group-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.game-count {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-surface);
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  margin-left: auto;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.625rem;
}

/* ── Appendix tabs ─────────────────────── */

.appendix-tabs :deep(.p-tabs) {
  border-radius: 0;
}

.appendix-tabs :deep(.p-tablist) {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-primary);
  padding: 0;
  gap: 0.125rem;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.appendix-tabs :deep(.p-tab) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  transition: all 0.12s ease;
  white-space: nowrap;
}

.appendix-tabs :deep(.p-tab:hover) {
  color: var(--text-primary);
  background: var(--bg-surface);
}

.appendix-tabs :deep(.p-tab.p-highlight) {
  color: var(--accent);
  background: rgba(34, 197, 94, 0.08);
}

.appendix-tabs :deep(.p-tabpanels) {
  background: transparent;
  padding: 1.5rem 0 0 0;
}

/* ── Responsive ────────────────────────── */

@media (max-width: 1024px) {
  .docs-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .sidebar {
    position: static;
  }
  .sidebar-head {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0.75rem;
  }
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 0.25rem;
    padding-bottom: 0.25rem;
    -webkit-overflow-scrolling: touch;
  }
  .nav-item {
    white-space: nowrap;
    padding: 0.5rem 0.875rem;
  }
  .nav-icon,
  .nav-arrow {
    display: none;
  }
}

@media (max-width: 640px) {
  .docs-main {
    padding: 6rem 1rem 2rem;
  }
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>

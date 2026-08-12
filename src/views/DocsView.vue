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
  { key: "getting-started", label: "Getting Started", index: "01", icon: "pi pi-compass" },
  { key: "commands", label: "Command Index", index: "02", icon: "pi pi-hashtag" },
  { key: "alias", label: "Alias Atlas", index: "03", icon: "pi pi-tags" },
  { key: "faq", label: "Field Notes", index: "04", icon: "pi pi-question-circle" },
  { key: "appendix", label: "Appendix", index: "05", icon: "pi pi-folder-open" },
];

const appendixTabs = [
  { key: "about", label: "About Mehrak" },
  { key: "cookies", label: "HoYoLAB Cookies" },
  { key: "notes", label: "Release Notes" },
  { key: "commendations", label: "Commendations" },
];

const validTabs = new Set(navItems.map(({ key }) => key));
const validAppendixTabs = new Set(appendixTabs.map(({ key }) => key));
const activeTab = ref("getting-started");
const appendixTab = ref("about");
const selectedDoc = ref(null);
const showDetailModal = ref(false);
const loadingDetail = ref(false);
const detailError = ref("");
const activeNavItem = computed(() => navItems.find(({ key }) => key === activeTab.value));

watch(
  [() => route.query.tab, () => route.query.section],
  ([tab, section]) => {
    activeTab.value = validTabs.has(tab) ? tab : "getting-started";
    appendixTab.value = validAppendixTabs.has(section) ? section : "about";
    showDetailModal.value = false;
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
  if (!validTabs.has(tab)) return;
  const query = tab === "appendix" ? { tab, section: appendixTab.value } : { tab };
  router.push({ name: "docs", query });
};

const handleAppendixChange = (section) => {
  if (!validAppendixTabs.has(section)) return;
  router.push({ name: "docs", query: { tab: "appendix", section } });
};
</script>

<template>
  <section class="docs-page" aria-labelledby="docs-title">
    <header class="docs-masthead">
      <div class="masthead-copy">
        <p class="eyebrow"><span>Mehrak Observatory</span><span>Field guide · Vol. I</span></p>
        <h1 id="docs-title">Chart the commands.<br /><em>Find your bearings.</em></h1>
        <p class="masthead-intro">
          A practical guide to installing Mehrak, navigating its command catalogue, and keeping your
          HoYoverse profiles secure.
        </p>
      </div>
      <div class="masthead-mark" aria-hidden="true">
        <span class="orbit orbit-outer"></span>
        <span class="orbit orbit-inner"></span>
        <i class="pi pi-sparkles"></i>
        <small>N 36° 51′</small>
      </div>
    </header>

    <div class="mobile-guide-nav">
      <label for="docs-section">Guide section</label>
      <div class="mobile-select-wrap">
        <i :class="activeNavItem.icon" aria-hidden="true"></i>
        <select id="docs-section" :value="activeTab" @change="handleTabChange($event.target.value)">
          <option v-for="item in navItems" :key="item.key" :value="item.key">
            {{ item.index }} — {{ item.label }}
          </option>
        </select>
        <i class="pi pi-chevron-down" aria-hidden="true"></i>
      </div>
    </div>

    <div class="docs-grid">
      <aside class="guide-sidebar">
        <div class="sidebar-heading">
          <span>Contents</span>
          <small>Navigate the guide</small>
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
            <span class="nav-index">{{ item.index }}</span>
            <i :class="item.icon" aria-hidden="true"></i>
            <span>{{ item.label }}</span>
            <i class="pi pi-arrow-up-right nav-arrow" aria-hidden="true"></i>
          </button>
        </nav>
        <p class="sidebar-note">
          <i class="pi pi-circle-fill" aria-hidden="true"></i>
          Public reference · Live catalogue
        </p>
      </aside>

      <div class="docs-content">
        <GettingStartedTab v-if="activeTab === 'getting-started'" />

        <section v-else-if="activeTab === 'commands'" class="commands-view">
          <header class="content-head">
            <p class="section-kicker">Catalogue 02</p>
            <h2>Command Index</h2>
            <p>Search the live catalogue and open a specimen card for usage and parameters.</p>
          </header>

          <DocSearchBar
            :searchQuery="searchQuery"
            :selectedGames="selectedGames"
            @update:searchQuery="searchQuery = $event"
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

          <div v-else-if="Object.keys(groupedDocuments).length === 0" class="state-box empty">
            <i class="pi pi-search" aria-hidden="true"></i>
            <strong>No commands found</strong>
            <span>Try another name or restore all game filters.</span>
          </div>

          <div v-else class="game-groups">
            <section v-for="(docs, game) in groupedDocuments" :key="game" class="game-group">
              <header class="game-group-head">
                <GameTag :game="game" />
                <span class="rule"></span>
                <span class="game-count">{{ docs.length }} entries</span>
              </header>
              <div class="card-grid">
                <DocCard
                  v-for="(doc, index) in docs"
                  :key="doc.id"
                  :doc="doc"
                  :index="index + 1"
                  @click="handleDocClick"
                />
              </div>
            </section>
          </div>
        </section>

        <AliasTab v-else-if="activeTab === 'alias'" />
        <FaqTab v-else-if="activeTab === 'faq'" />

        <section v-else class="appendix-view">
          <header class="content-head">
            <p class="section-kicker">Archive 05</p>
            <h2>Appendix</h2>
            <p>Background records, security notes, release logs, and acknowledgements.</p>
          </header>

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
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 15rem;
  align-items: end;
  min-height: 21rem;
  margin-bottom: var(--space-12);
  padding: clamp(1.5rem, 4vw, 3.5rem);
  overflow: hidden;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(90deg, rgba(var(--accent-rgb), 0.08) 1px, transparent 1px) 0 0 / 3rem 3rem,
    linear-gradient(rgba(var(--accent-rgb), 0.08) 1px, transparent 1px) 0 0 / 3rem 3rem,
    var(--bg-surface);
  box-shadow: var(--shadow-lg);
}

.docs-masthead::before {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, var(--bg-surface) 10%, transparent 72%);
  content: "";
  pointer-events: none;
}

.masthead-copy,
.masthead-mark {
  position: relative;
}

.eyebrow {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  margin: 0 0 var(--space-8);
  color: var(--accent-strong);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.eyebrow span + span {
  padding-left: var(--space-3);
  border-left: 1px solid var(--border-secondary);
  color: var(--text-muted);
}

.docs-masthead h1 {
  max-width: 55rem;
  margin: 0;
  font-size: clamp(3rem, 7vw, 6.25rem);
  font-weight: 400;
  letter-spacing: -0.055em;
  line-height: 0.88;
}

.docs-masthead h1 em {
  color: var(--accent-strong);
  font-weight: 300;
}

.masthead-intro {
  max-width: 42rem;
  margin: var(--space-8) 0 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: var(--leading-body);
}

.masthead-mark {
  display: grid;
  width: 13rem;
  height: 13rem;
  place-items: center;
  justify-self: end;
  color: var(--brass);
}

.masthead-mark .orbit {
  position: absolute;
  border: 1px solid currentColor;
  border-radius: 50%;
  opacity: 0.5;
}

.orbit-outer {
  inset: 0;
}

.orbit-outer::before,
.orbit-inner::before {
  position: absolute;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: currentColor;
  content: "";
}

.orbit-outer::before {
  top: 1.25rem;
  right: 1.5rem;
}

.orbit-inner {
  inset: 2.2rem;
  transform: rotate(-35deg);
}

.orbit-inner::before {
  bottom: -0.25rem;
  left: 50%;
}

.masthead-mark > i {
  font-size: 2rem;
}

.masthead-mark small {
  position: absolute;
  right: 0;
  bottom: -1.5rem;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.1em;
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
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-secondary);
  font-family: var(--font-display);
  font-size: var(--text-xl);
}

.sidebar-heading small {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: grid;
  grid-template-columns: 1.75rem 1rem minmax(0, 1fr) auto;
  gap: var(--space-2);
  align-items: center;
  width: 100%;
  padding: var(--space-3) var(--space-2);
  border: 0;
  border-bottom: 1px solid transparent;
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
  border-bottom-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-weight: 600;
}

.nav-index {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.625rem;
}

.nav-item > i {
  font-size: 0.75rem;
}

.nav-arrow {
  opacity: 0;
}

.nav-item.active .nav-arrow {
  opacity: 1;
}

.sidebar-note {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  margin: var(--space-8) 0 0;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  line-height: 1.5;
}

.sidebar-note i {
  color: var(--success);
  font-size: 0.4rem;
}

.mobile-guide-nav {
  display: none;
}

.docs-content {
  min-width: 0;
  max-width: 64rem;
}

.content-head {
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border-primary);
}

.section-kicker {
  margin: 0 0 var(--space-2);
  color: var(--brass) !important;
  font-family: var(--font-mono);
  font-size: var(--text-xs) !important;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.content-head h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(2rem, 5vw, 3.75rem);
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: var(--leading-tight);
}

.content-head > p:last-child {
  max-width: 40rem;
  margin: var(--space-3) 0 0;
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.commands-view,
.appendix-view {
  min-width: 0;
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

.state-box.empty > i {
  color: var(--accent);
  font-size: var(--text-2xl);
}

.state-box.empty strong {
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: var(--text-xl);
}

.game-groups {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  margin-top: var(--space-10);
}

.game-group {
  min-width: 0;
}

.game-group-head {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  margin-bottom: var(--space-4);
}

.game-group-head .rule {
  height: 1px;
  flex: 1;
  background: var(--border-primary);
}

.game-count {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
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

@media (max-width: 64rem) {
  .docs-masthead {
    grid-template-columns: 1fr 10rem;
  }

  .masthead-mark {
    width: 9rem;
    height: 9rem;
  }

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

  .mobile-guide-nav label {
    display: block;
    margin-bottom: var(--space-2);
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .mobile-select-wrap {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--space-3);
    align-items: center;
    padding: 0 var(--space-4);
    border: 1px solid var(--border-secondary);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
  }

  .mobile-select-wrap select {
    width: 100%;
    padding: var(--space-3) 0;
    border: 0;
    outline: 0;
    appearance: none;
    background: transparent;
    color: var(--text-primary);
    font-weight: 600;
  }
}

@media (max-width: 40rem) {
  .docs-page {
    padding-inline: var(--space-4);
  }

  .docs-masthead {
    display: block;
    min-height: auto;
    padding: var(--space-8) var(--space-5);
  }

  .docs-masthead h1 {
    font-size: clamp(2.65rem, 14vw, 4.25rem);
  }

  .eyebrow {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: var(--space-12);
  }

  .eyebrow span + span {
    padding-left: 0;
    border-left: 0;
  }

  .masthead-intro {
    font-size: var(--text-sm);
  }

  .masthead-mark {
    display: none;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>

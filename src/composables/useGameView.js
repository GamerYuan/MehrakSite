import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { canManageGame, canManageGameCapability, getGameCapabilities } from "../configs/gameMeta";
import { useAliasManagement } from "./game/useAliasManagement";
import { useCharacterManagement } from "./game/useCharacterManagement";
import { useCodesManagement } from "./game/useCodesManagement";
import { useCommandExecution } from "./game/useCommandExecution";
import { usePortraitConfig } from "./game/usePortraitConfig";
import { useProfileManagement } from "./useProfileManagement";
import { useUserPortraits } from "./game/useUserPortraits";
import { useWeaponIcons } from "./game/useWeaponIcons";
import { useAuth } from "./useAuth";

const managementTabRoutes = {
  manage: { name: "game-management", capability: "characters", label: "Characters" },
  aliases: { name: "game-alias-management", capability: "aliases", label: "Aliases" },
  codes: { name: "game-code-management", capability: "codes", label: "Codes" },
  weaponicons: {
    name: "game-weapon-icon-management",
    capability: "weaponIcons",
    label: "Weapon icons",
  },
};

const personalTabRoute = {
  id: "portraits",
  name: "game-user-portraits",
  capability: "userPortraits",
  label: "My portraits",
};

export function resolveGameTab(config, route) {
  if (route.meta?.gameWorkspaceTab === personalTabRoute.id) return personalTabRoute.id;
  const managementTab = route.meta?.gameManagementTab;
  if (managementTabRoutes[managementTab]) return managementTab;

  const queryTab = Array.isArray(route.query?.tab) ? route.query.tab[0] : route.query?.tab;
  return config.tabs.some((tab) => tab.id === queryTab) ? queryTab : config.tabs[0]?.id;
}

export function getGameTabLocation(config, tabId) {
  if (tabId === personalTabRoute.id) {
    return { name: personalTabRoute.name, params: { game: config.routeKey } };
  }
  const managementRoute = managementTabRoutes[tabId];
  if (managementRoute) {
    return { name: managementRoute.name, params: { game: config.routeKey } };
  }

  const commandTab = config.tabs.some((tab) => tab.id === tabId) ? tabId : config.tabs[0]?.id;
  return { name: "game", params: { game: config.routeKey }, query: { tab: commandTab } };
}

export function getGameWorkspaceTabs(config, user) {
  const tabs = config.tabs.map((tab) => ({ ...tab, kind: "command" }));
  const capabilities = config.capabilities?.management || {};
  if (capabilities[personalTabRoute.capability]) {
    tabs.push({ id: personalTabRoute.id, name: personalTabRoute.label, kind: "personal" });
  }
  if (!canManageGame(user, config.id)) return tabs;

  Object.entries(managementTabRoutes).forEach(([id, tab]) => {
    if (capabilities[tab.capability]) {
      tabs.push({ id, name: tab.label, kind: "management" });
    }
  });
  return tabs;
}

export function useGameView(config) {
  const route = useRoute();
  const activeTab = ref(resolveGameTab(config, route) || "character");

  const { profiles, fetchProfiles } = useProfileManagement();

  const command = useCommandExecution(config, activeTab);
  const characters = useCharacterManagement(config, activeTab);
  const aliases = useAliasManagement(config, activeTab);
  const portrait = usePortraitConfig(config);
  const userPortraits = useUserPortraits(config);

  const codes = useCodesManagement(config, activeTab);
  const weaponIcons = useWeaponIcons(config, activeTab);

  const { user } = useAuth();
  const canManage = computed(() => canManageGame(user.value, config.id));
  const managementCapabilities = computed(() => getGameCapabilities(config.id).management || {});
  const canManageCapability = (capability) =>
    canManageGameCapability(user.value, config.id, capability);

  const guardManagementAction =
    (capability, action) =>
    (...args) => {
      if (!canManageCapability(capability)) return undefined;
      return action(...args);
    };

  const tabs = computed(() => getGameWorkspaceTabs(config, user.value));

  const commandTabs = computed(() => tabs.value.filter((tab) => tab.kind === "command"));
  const personalTabs = computed(() => tabs.value.filter((tab) => tab.kind === "personal"));
  const managementTabs = computed(() => tabs.value.filter((tab) => tab.kind === "management"));
  const isManagementWorkspace = computed(() => Boolean(managementTabRoutes[activeTab.value]));
  const isPersonalPortraitWorkspace = computed(() => activeTab.value === personalTabRoute.id);
  const getTabLocation = (tabId) => getGameTabLocation(config, tabId);

  let serverManuallyChanged = false;
  watch(
    () => command.server.value,
    (newRegion) => {
      serverManuallyChanged = true;
      const p = profiles.value?.[0];
      if (p && newRegion) {
        p.lastUsedRegions = { ...p.lastUsedRegions, [config.id]: newRegion };
      }
    },
  );

  onMounted(() => {
    if (isPersonalPortraitWorkspace.value) {
      characters.fetchCharacters();
    } else if (!isManagementWorkspace.value) {
      fetchProfiles();
      characters.fetchCharacters();
    } else if (activeTab.value === "manage") {
      characters.fetchCharacters();
    }
    if (activeTab.value === "manage" && canManageCapability("stats")) {
      characters.fetchCharacterStats();
    }
  });

  watch(profiles, (newProfiles) => {
    if (serverManuallyChanged) return;
    const region = newProfiles?.[0]?.lastUsedRegions?.[config.id];
    if (region) {
      command.server.value = region;
    }
  });

  watch(
    activeTab,
    (newTab) => {
      if (newTab === "aliases" && canManageCapability("aliases")) {
        aliases.fetchAliases();
      } else if (newTab === "codes" && canManageCapability("codes")) {
        codes.fetchCodes();
      } else if (newTab === "weaponicons" && canManageCapability("weaponIcons")) {
        weaponIcons.fetchWeapons();
      }
    },
    { immediate: true },
  );

  // DashboardLayout remounts on path changes. Only sync query-only command changes here so the
  // Outgoing management view cannot start a second fetch while its replacement mounts.
  watch(
    () => route.query.tab,
    () => {
      if (route.name === "game") activeTab.value = resolveGameTab(config, route);
    },
  );

  const codeRefs = {
    codes: codes.codes,
    selectedCodes: codes.selectedCodes,
    newCodesInput: codes.newCodesInput,
    codesSearchQuery: codes.codesSearchQuery,
    codesLoading: codes.codesLoading,
    filteredCodes: codes.filteredCodes,
    confirmAddCodes: codes.confirmAddCodes,
    confirmDeleteCodes: codes.confirmDeleteCodes,
  };

  const managementActions = {
    addCharacter: guardManagementAction("characters", characters.addCharacter),
    deleteCharacter: guardManagementAction("characters", characters.deleteCharacter),
    fetchCharacterStats: guardManagementAction("stats", characters.fetchCharacterStats),
    openEditStatModal: guardManagementAction("stats", characters.openEditStatModal),
    handleStatSubmit: guardManagementAction("stats", characters.handleStatSubmit),
    openPortraitConfigModal: guardManagementAction("portraits", portrait.openPortraitConfigModal),
    fetchPortraitConfig: guardManagementAction("portraits", portrait.fetchPortraitConfig),
    handlePortraitConfigSubmit: guardManagementAction(
      "portraits",
      portrait.handlePortraitConfigSubmit,
    ),
    fetchAliases: guardManagementAction("aliases", aliases.fetchAliases),
    openAddAliasModal: guardManagementAction("aliases", aliases.openAddAliasModal),
    openEditAliasModal: guardManagementAction("aliases", aliases.openEditAliasModal),
    handleAliasSubmit: guardManagementAction("aliases", aliases.handleAliasSubmit),
    fetchCodes: guardManagementAction("codes", codes.fetchCodes),
    confirmAddCodes: guardManagementAction("codes", codes.confirmAddCodes),
    confirmDeleteCodes: guardManagementAction("codes", codes.confirmDeleteCodes),
    fetchWeapons: guardManagementAction("weaponIcons", weaponIcons.fetchWeapons),
    processWeaponImage: guardManagementAction("weaponIcons", weaponIcons.processWeaponImage),
    uploadWeaponIcon: guardManagementAction("weaponIcons", weaponIcons.uploadWeaponIcon),
    confirmUploadWeaponIcon: guardManagementAction(
      "weaponIcons",
      weaponIcons.confirmUploadWeaponIcon,
    ),
  };

  const openUserPortraitConfigModal = (character) => {
    portrait.portraitConfigCharacter.value = character;
    portrait.portraitConfigEntries.value = [];
    portrait.portraitConfigSelection.value = null;
    userPortraits.resetUserPortraitConfig();
    userPortraits.userPortraits.value = [];
    userPortraits.userPortraitId.value = null;
    userPortraits.userPortraitsCharacter.value = character;
    portrait.showPortraitConfigModal.value = true;
  };

  return {
    config,
    activeTab,
    tabs,
    commandTabs,
    personalTabs,
    managementTabs,
    isManagementWorkspace,
    isPersonalPortraitWorkspace,
    getTabLocation,
    canManage,
    managementCapabilities,
    canManageCapability,
    openUserPortraitConfigModal,
    profiles,

    ...command,
    ...characters,
    ...aliases,
    ...portrait,
    ...userPortraits,
    ...codeRefs,
    ...weaponIcons,
    ...managementActions,
  };
}

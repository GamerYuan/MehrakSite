import { ref, computed, watch, onMounted } from "vue";
import { getUser } from "./authStore";
import { useCommandExecution } from "./game/useCommandExecution";
import { useCharacterManagement } from "./game/useCharacterManagement";
import { useAliasManagement } from "./game/useAliasManagement";
import { useCodesManagement } from "./game/useCodesManagement";
import { usePortraitConfig } from "./game/usePortraitConfig";
import { useUserPortraits } from "./game/useUserPortraits";
import { useProfileManagement } from "./useProfileManagement";

export function useGameView(config) {
  const activeTab = ref(config.tabs[0]?.id || "character");

  const { profiles, fetchProfiles } = useProfileManagement();

  const command = useCommandExecution(config, activeTab);
  const characters = useCharacterManagement(config, activeTab);
  const aliases = useAliasManagement(config, activeTab);
  const portrait = usePortraitConfig(config);
  const userPortraits = useUserPortraits(config);

  const codes = useCodesManagement(config, activeTab);

  const user = getUser();
  const canManage =
    user.isSuperAdmin ||
    (user.gameWritePermissions && user.gameWritePermissions.includes(config.permission));

  const tabs = computed(() => {
    const t = [...config.tabs];
    t.push({ id: "manage", name: "Manage Characters" });
    if (canManage) {
      t.push({ id: "aliases", name: "Manage Aliases" });
      if (config.hasCodesManagement) {
        t.push({ id: "codes", name: "Manage Codes" });
      }
    }
    return t;
  });

  let serverManuallyChanged = false;
  watch(() => command.server.value, (newRegion) => {
    serverManuallyChanged = true;
    const p = profiles.value?.[0];
    if (p && newRegion) {
      p.lastUsedRegions = { ...p.lastUsedRegions, [config.id]: newRegion };
    }
  });

  onMounted(() => {
    fetchProfiles();
    characters.fetchCharacters();
    if (config.hasStatEdit) {
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

  watch(activeTab, (newTab) => {
    if (newTab === "aliases" && canManage) {
      aliases.fetchAliases();
    } else if (newTab === "codes" && canManage && config.hasCodesManagement) {
      codes.fetchCodes();
    }
  });

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

  return {
    config,
    activeTab,
    tabs,
    canManage,
    profiles,

    ...command,
    ...characters,
    ...aliases,
    ...portrait,
    ...userPortraits,
    ...codeRefs,
  };
}

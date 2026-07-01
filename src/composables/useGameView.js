import { computed, onMounted, ref, watch } from "vue";
import { getUser } from "./authStore";
import { useAliasManagement } from "./game/useAliasManagement";
import { useCharacterManagement } from "./game/useCharacterManagement";
import { useCodesManagement } from "./game/useCodesManagement";
import { useCommandExecution } from "./game/useCommandExecution";
import { usePortraitConfig } from "./game/usePortraitConfig";
import { useProfileManagement } from "./useProfileManagement";
import { useUserPortraits } from "./game/useUserPortraits";
import { useWeaponIcons } from "./game/useWeaponIcons";

export function useGameView(config) {
  const activeTab = ref(config.tabs[0]?.id || "character");

  const { profiles, fetchProfiles } = useProfileManagement();

  const command = useCommandExecution(config, activeTab);
  const characters = useCharacterManagement(config, activeTab);
  const aliases = useAliasManagement(config, activeTab);
  const portrait = usePortraitConfig(config);
  const userPortraits = useUserPortraits(config);

  const codes = useCodesManagement(config, activeTab);
  const weaponIcons = useWeaponIcons(config, activeTab);

  const user = getUser();
  const canManage =
    user.isSuperAdmin ||
    (user.gameWritePermissions && user.gameWritePermissions.includes(config.id));

  const tabs = computed(() => {
    const t = [...config.tabs];
    t.push({ id: "manage", name: "Manage Characters" });
    if (canManage) {
      t.push({ id: "aliases", name: "Manage Aliases" });
      if (config.hasCodesManagement) {
        t.push({ id: "codes", name: "Manage Codes" });
      }
      if (config.hasWeaponIcons) {
        t.push({ id: "weaponicons", name: "Weapon Icons" });
      }
    }
    return t;
  });

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
    } else if (newTab === "weaponicons" && canManage && config.hasWeaponIcons) {
      weaponIcons.fetchWeapons();
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
    ...weaponIcons,
  };
}

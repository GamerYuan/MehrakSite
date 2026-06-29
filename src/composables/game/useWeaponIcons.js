import { computed, ref } from "vue";
import { useApi } from "../useApi";
import { useConfirm } from "primevue/useconfirm";

export const WEAPON_TYPES = [
  { value: 1, label: "Sword" },
  { value: 2, label: "Claymore" },
  { value: 3, label: "Polearm" },
  { value: 4, label: "Catalyst" },
  { value: 5, label: "Bow" },
];

export const RARITIES = [1, 2, 3, 4, 5];

export function useWeaponIcons(config, _activeTab) {
  const { showErrorToast, showSuccessToast, buildError, handleApiError, apiFetch, apiFetchJson } = useApi();
  const confirm = useConfirm();

  if (!config || !config.hasWeaponIcons) {
    return {
      weapons: ref([]),
      selectedWeaponId: ref(null),
      weaponsLoading: ref(false),
      selectedTypes: ref([]),
      selectedRarities: ref([]),
      showOnlyMissingAscended: ref(false),
      filteredWeapons: ref([]),
      baseImageUrl: ref(null),
      ascendedImageUrl: ref(null),
      hasBase: ref(false),
      hasAscended: ref(false),
      fetchWeapons: () => {},
      processWeaponImage: () => Promise.resolve(null),
      uploadWeaponIcon: () => Promise.resolve(null),
      confirmUploadWeaponIcon: () => {},
    };
  }

  // State
  const weapons = ref([]);
  const selectedWeaponId = ref(null);
  const weaponsLoading = ref(false);
  const selectedTypes = ref([]);
  const selectedRarities = ref([]);
  const showOnlyMissingAscended = ref(false);

  // Computed: filtered weapons based on type/rarity/missing ascended
  const filteredWeapons = computed(() =>
    weapons.value.filter((w) => {
      const digit2 = Math.floor(w.id / 1000) % 10;
      const digit3 = Math.floor(w.id / 100) % 10;
      if (selectedTypes.value.length && !selectedTypes.value.includes(digit2)) return false;
      if (selectedRarities.value.length && !selectedRarities.value.includes(digit3)) return false;
      if (showOnlyMissingAscended.value && w.hasAscended) return false;
      return true;
    }),
  );

  // Computed: icon URLs for selected weapon
  const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

  const baseImageUrl = computed(() => {
    if (!selectedWeaponId.value) return null;
    return `${backendUrl}/genshin/weapons/icons/weapon_base_${selectedWeaponId.value}.png`;
  });

  const ascendedImageUrl = computed(() => {
    if (!selectedWeaponId.value) return null;
    return `${backendUrl}/genshin/weapons/icons/weapon_ascended_${selectedWeaponId.value}.png`;
  });

  const hasBase = computed(() => {
    const found = weapons.value.find((item) => item.id === selectedWeaponId.value);
    return found?.hasBase ?? false;
  });

  const hasAscended = computed(() => {
    const found = weapons.value.find((item) => item.id === selectedWeaponId.value);
    return found?.hasAscended ?? false;
  });

  // Fetch weapons list
  const fetchWeapons = async () => {
    weaponsLoading.value = true;
    try {
      const { ok, data, status } = await apiFetchJson("/genshin/weapons/list");
      if (ok) {
        weapons.value = data.weapons || [];
      } else {
        showErrorToast(data.error || "Failed to fetch weapons", status);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      weaponsLoading.value = false;
    }
  };

  // Process unprocessed ascended image, returns Blob URL for preview
  const processWeaponImage = async (weaponId, file) => {
    const formData = new FormData();
    formData.append("weaponId", weaponId);
    formData.append("ascendedImage", file);
    try {
      const response = await apiFetch("/genshin/weapons/process", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw buildError(data.error || "Failed to process image", response.status);
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      handleApiError(error);
      return null;
    }
  };

  // Upload ascended weapon icon
  const uploadWeaponIcon = async (key, file) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const { ok, data, status } = await apiFetchJson(`/genshin/weapons/icons/${key}`, {
        method: "PUT",
        body: formData,
      });
      if (!ok) {
        showErrorToast(data.error || "Failed to upload weapon icon", status);
        return null;
      }
      return data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  };

  // Confirm before uploading. Resolves true on success, false on reject.
  const confirmUploadWeaponIcon = (key, file) =>
    new Promise((resolve) => {
      confirm.require({
        message: "Are you sure you want to overwrite this weapon icon?",
        header: "Confirm Upload",
        icon: "pi pi-exclamation-triangle",
        rejectProps: {
          label: "Cancel",
          severity: "secondary",
          outlined: true,
        },
        acceptProps: {
          label: "Upload",
          severity: "primary",
        },
        accept: async () => {
          const result = await uploadWeaponIcon(key, file);
          if (result) {
            showSuccessToast("Weapon icon uploaded successfully");
            await fetchWeapons();
          }
          resolve(Boolean(result));
        },
        reject: () => resolve(false),
      });
    });

  return {
    weapons,
    selectedWeaponId,
    weaponsLoading,
    selectedTypes,
    selectedRarities,
    showOnlyMissingAscended,
    filteredWeapons,
    baseImageUrl,
    ascendedImageUrl,
    hasBase,
    hasAscended,
    fetchWeapons,
    processWeaponImage,
    uploadWeaponIcon,
    confirmUploadWeaponIcon,
  };
}

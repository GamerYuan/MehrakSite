import { ref } from "vue";
import { useApi } from "../useApi";

export function usePortraitConfig(config) {
  const { showErrorToast, showSuccessToast, buildError, handleApiError, apiFetch, apiFetchJson } = useApi();

  const showPortraitConfigModal = ref(false);
  const showMissingServerIdModal = ref(false);
  const missingServerIdCharacter = ref("");
  const portraitConfigCharacter = ref("");
  const portraitConfigEntries = ref([]);
  const portraitConfigSelection = ref(null);
  const portraitConfigOffsetX = ref(null);
  const portraitConfigOffsetY = ref(null);
  const portraitConfigTargetScale = ref(null);
  const portraitConfigFlipX = ref(false);
  const portraitConfigFetching = ref(false);
  const portraitConfigSaving = ref(false);

  const fetchPortraitConfig = async (entry) => {
    portraitConfigSelection.value = entry;
    portraitConfigOffsetX.value = null;
    portraitConfigOffsetY.value = null;
    portraitConfigTargetScale.value = null;
    portraitConfigFlipX.value = false;
    portraitConfigFetching.value = true;

    try {
      const url = `/portraits/config?game=${config.id}&serverId=${entry.serverId}${
        entry.subId != null ? `&subId=${entry.subId}` : ""
      }`;
      const { ok, data } = await apiFetchJson(url);
      if (ok) {
        portraitConfigOffsetX.value = data.offsetX ?? 0;
        portraitConfigOffsetY.value = data.offsetY ?? 0;
        portraitConfigTargetScale.value = data.targetScale ?? null;
        portraitConfigFlipX.value = data.flipX ?? false;
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      portraitConfigFetching.value = false;
    }
  };

  const openPortraitConfigModal = async (char) => {
    portraitConfigCharacter.value = char;
    portraitConfigEntries.value = [];
    portraitConfigSelection.value = null;
    portraitConfigOffsetX.value = 0;
    portraitConfigOffsetY.value = 0;
    portraitConfigTargetScale.value = null;
    portraitConfigFlipX.value = false;
    portraitConfigFetching.value = true;

    try {
      const listResponse = await apiFetch(
        `/portraits/list?game=${config.id}&character=${encodeURIComponent(char)}`,
      );
      if (!listResponse.ok) {
        const data = await listResponse.json().catch(() => ({}));
        throw new Error(data.error || `Failed to fetch portrait list (${listResponse.status})`);
      }

      portraitConfigEntries.value = await listResponse.json();

      if (portraitConfigEntries.value.length === 0) {
        missingServerIdCharacter.value = char;
        showMissingServerIdModal.value = true;
        return;
      }

      showPortraitConfigModal.value = true;
      await fetchPortraitConfig(portraitConfigEntries.value[0]);
    } catch (error) {
      handleApiError(error);
    } finally {
      portraitConfigFetching.value = false;
    }
  };

  const handlePortraitConfigSubmit = async () => {
    const entry = portraitConfigSelection.value;
    if (!entry) {
      showErrorToast("No portrait selected. Please select a portrait first.", 400);
      return;
    }
    portraitConfigSaving.value = true;
    try {
      const url = `/portraits/config?game=${config.id}&serverId=${entry.serverId}${
        entry.subId != null ? `&subId=${entry.subId}` : ""
      }`;
      const response = await apiFetch(url, {
        method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offsetX: Math.round(portraitConfigOffsetX.value),
            offsetY: Math.round(portraitConfigOffsetY.value),
            targetScale: portraitConfigTargetScale.value,
            flipX: portraitConfigFlipX.value,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw buildError(data.error || "Failed to update portrait config", response.status);
      }

      showPortraitConfigModal.value = false;
      showSuccessToast("Portrait config updated successfully");
    } catch (error) {
      handleApiError(error);
    } finally {
      portraitConfigSaving.value = false;
    }
  };

  return {
    showPortraitConfigModal,
    showMissingServerIdModal,
    missingServerIdCharacter,
    portraitConfigCharacter,
    portraitConfigEntries,
    portraitConfigSelection,
    portraitConfigOffsetX,
    portraitConfigOffsetY,
    portraitConfigTargetScale,
    portraitConfigFlipX,
    portraitConfigFetching,
    portraitConfigSaving,
    openPortraitConfigModal,
    fetchPortraitConfig,
    handlePortraitConfigSubmit,
  };
}

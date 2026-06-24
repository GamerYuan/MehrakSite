import { ref } from "vue";
import { useApi } from "../useApi";

const MAX_PORTRAITS_PER_CHARACTER = 5;

export function useUserPortraits(config) {
  const { showErrorToast, showSuccessToast, buildError, handleApiError, apiFetch, apiFetchJson } = useApi();

  const userPortraits = ref([]);
  const userPortraitsLoading = ref(false);
  const userPortraitsCharacter = ref("");

  const userPortraitId = ref(null);
  const userPortraitConfigOffsetX = ref(0);
  const userPortraitConfigOffsetY = ref(0);
  const userPortraitConfigTargetScale = ref(null);
  const userPortraitConfigFlipX = ref(false);
  const userPortraitConfigArtistAttribution = ref(null);
  const userPortraitConfigFetching = ref(false);
  const userPortraitConfigSaving = ref(false);

  const MAX_PER_CHARACTER = MAX_PORTRAITS_PER_CHARACTER;

  const fetchUserPortraits = async (character) => {
    userPortraitsCharacter.value = character;
    userPortraitsLoading.value = true;
    try {
      const { ok, data } = await apiFetchJson(
        `/user-portraits?game=${encodeURIComponent(config.id)}&character=${encodeURIComponent(character)}`,
      );
      if (ok && Array.isArray(data)) {
        userPortraits.value = data;
        const active = data.find((p) => p.isActive);
        if (active) {
          userPortraitId.value = active.id;
        } else if (data.length) {
          userPortraitId.value = data[0].id;
        } else {
          userPortraitId.value = null;
        }
      } else {
        userPortraits.value = [];
        userPortraitId.value = null;
      }
    } catch (error) {
      if (handleApiError(error)) return;
      userPortraits.value = [];
      userPortraitId.value = null;
    } finally {
      userPortraitsLoading.value = false;
    }
  };

  const fetchUserPortraitConfig = async (id) => {
    userPortraitId.value = id;
    userPortraitConfigOffsetX.value = 0;
    userPortraitConfigOffsetY.value = 0;
    userPortraitConfigTargetScale.value = null;
    userPortraitConfigFlipX.value = false;
    userPortraitConfigArtistAttribution.value = null;
    userPortraitConfigFetching.value = true;

    try {
      const { ok, data } = await apiFetchJson(`/user-portraits/${id}`);
      if (ok && data?.config) {
        const cfg = data.config;
        userPortraitConfigOffsetX.value = cfg.offsetX ?? 0;
        userPortraitConfigOffsetY.value = cfg.offsetY ?? 0;
        userPortraitConfigTargetScale.value = cfg.targetScale ?? null;
        userPortraitConfigFlipX.value = cfg.flipX ?? false;
        userPortraitConfigArtistAttribution.value = cfg.artistAttribution ?? null;
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      userPortraitConfigFetching.value = false;
    }
  };

  const uploadUserPortrait = async (character, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiFetch(
      `/user-portraits/upload?game=${encodeURIComponent(config.id)}&character=${encodeURIComponent(character)}`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const err = buildError(data.error || "Failed to upload portrait", response.status);
      err.data = data;
      throw err;
    }

    return response.json();
  };

  const deleteUserPortrait = async (id) => {
    const response = await apiFetch(`/user-portraits/${id}`, {
      method: "DELETE",
    });
    if (!response.ok && response.status !== 204) {
      const data = await response.json().catch(() => ({}));
      throw buildError(data.error || "Failed to delete portrait", response.status);
    }
  };

  const setActiveUserPortrait = async (id) => {
    try {
      const response = await apiFetch(`/user-portraits/${id}/active`, {
        method: "PATCH",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw buildError(data.error || "Failed to set active portrait", response.status);
      }
      showSuccessToast("Active portrait updated");
      if (userPortraitsCharacter.value) {
        await fetchUserPortraits(userPortraitsCharacter.value);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleUserPortraitConfigSubmit = async () => {
    if (!userPortraitId.value) {
      showErrorToast("No portrait selected. Please select a portrait first.", 400);
      return;
    }
    userPortraitConfigSaving.value = true;
    try {
      const response = await apiFetch(`/user-portraits/${userPortraitId.value}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offsetX: Math.round(userPortraitConfigOffsetX.value),
          offsetY: Math.round(userPortraitConfigOffsetY.value),
          targetScale: userPortraitConfigTargetScale.value,
          flipX: userPortraitConfigFlipX.value,
          artistAttribution: userPortraitConfigArtistAttribution.value || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw buildError(data.error || "Failed to update portrait config", response.status);
      }

      showSuccessToast("Portrait config updated successfully");
    } catch (error) {
      if (handleApiError(error)) return;
    } finally {
      userPortraitConfigSaving.value = false;
    }
  };

  return {
    MAX_PER_CHARACTER,

    userPortraits,
    userPortraitsLoading,
    userPortraitsCharacter,

    userPortraitId,
    userPortraitConfigOffsetX,
    userPortraitConfigOffsetY,
    userPortraitConfigTargetScale,
    userPortraitConfigFlipX,
    userPortraitConfigArtistAttribution,
    userPortraitConfigFetching,
    userPortraitConfigSaving,

    fetchUserPortraits,
    fetchUserPortraitConfig,
    uploadUserPortrait,
    deleteUserPortrait,
    setActiveUserPortrait,
    handleUserPortraitConfigSubmit,
  };
}

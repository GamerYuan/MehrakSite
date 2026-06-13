import { ref } from "vue";
import { useApi } from "../useApi";

const MAX_PORTRAITS_PER_CHARACTER = 5;

export function useUserPortraits(config) {
  const {
    showErrorToast,
    showSuccessToast,
    buildError,
    apiFetch,
    apiFetchJson,
  } = useApi();

  const userPortraits = ref([]);
  const userPortraitsLoading = ref(false);
  const userPortraitsCharacter = ref("");

  const userPortraitId = ref(null);
  const userPortraitConfigOffsetX = ref(0);
  const userPortraitConfigOffsetY = ref(0);
  const userPortraitConfigTargetScale = ref(null);
  const userPortraitConfigEnableFade = ref(false);
  const userPortraitConfigFadeStart = ref(0.75);
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
      } else {
        userPortraits.value = [];
      }
    } catch (err) {
      if (err._redirected) return;
      userPortraits.value = [];
      showErrorToast(err.message, err.status);
    } finally {
      userPortraitsLoading.value = false;
    }
  };

  const fetchUserPortraitConfig = async (id) => {
    userPortraitId.value = id;
    userPortraitConfigOffsetX.value = 0;
    userPortraitConfigOffsetY.value = 0;
    userPortraitConfigTargetScale.value = null;
    userPortraitConfigEnableFade.value = false;
    userPortraitConfigFadeStart.value = 0.75;
    userPortraitConfigFetching.value = true;

    try {
      const { ok, data } = await apiFetchJson(`/user-portraits/${id}`);
      if (ok && data?.config) {
        const cfg = data.config;
        userPortraitConfigOffsetX.value = cfg.offsetX ?? 0;
        userPortraitConfigOffsetY.value = cfg.offsetY ?? 0;
        userPortraitConfigTargetScale.value = cfg.targetScale ?? null;
        userPortraitConfigEnableFade.value = cfg.enableGradientFade ?? false;
        userPortraitConfigFadeStart.value = cfg.gradientFadeStart ?? 0.75;
      }
    } catch (err) {
      if (err._redirected) return;
      showErrorToast(err.message, err.status);
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
      const err = buildError(
        data.error || "Failed to upload portrait",
        response.status,
      );
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
      throw buildError(
        data.error || "Failed to delete portrait",
        response.status,
      );
    }
  };

  const handleUserPortraitConfigSubmit = async () => {
    if (!userPortraitId.value) {
      showErrorToast(
        "No portrait selected. Please select a portrait first.",
        400,
      );
      return;
    }
    userPortraitConfigSaving.value = true;
    try {
      const response = await apiFetch(
        `/user-portraits/${userPortraitId.value}/config`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offsetX: userPortraitConfigOffsetX.value,
            offsetY: userPortraitConfigOffsetY.value,
            targetScale: userPortraitConfigTargetScale.value,
            enableGradientFade: userPortraitConfigEnableFade.value,
            gradientFadeStart: userPortraitConfigFadeStart.value,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw buildError(
          data.error || "Failed to update portrait config",
          response.status,
        );
      }

      showSuccessToast("Portrait config updated successfully");
    } catch (err) {
      if (err._redirected) return;
      showErrorToast(err.message, err.status);
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
    userPortraitConfigEnableFade,
    userPortraitConfigFadeStart,
    userPortraitConfigFetching,
    userPortraitConfigSaving,

    fetchUserPortraits,
    fetchUserPortraitConfig,
    uploadUserPortrait,
    deleteUserPortrait,
    handleUserPortraitConfigSubmit,
  };
}

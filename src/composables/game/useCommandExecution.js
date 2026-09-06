import { ref } from "vue";
import { useApi } from "../useApi";

export function useCommandExecution(config, activeTab, onSuccess) {
  const { buildError, handleApiError, apiFetch } = useApi();

  const loading = ref({});
  const errorMsg = ref({});
  const resultImages = ref({});

  const showAuthModal = ref(false);
  const authProfileId = ref(0);
  const authPassphrase = ref("");
  const authLoading = ref(false);
  const authError = ref("");
  let authDialogRevision = 0;
  let authRequestId = 0;

  const profileId = ref(1);
  const server = ref(config.servers[0]?.value || "America");
  const characterName = ref("");
  const floor = ref(config.tabs.find((t) => t.hasFloorInput)?.floorMin || 12);

  const clearAuthForm = () => {
    authPassphrase.value = "";
    authError.value = "";
  };

  const openAuthModal = (requestedProfileId) => {
    authDialogRevision += 1;
    authProfileId.value = requestedProfileId;
    authLoading.value = false;
    clearAuthForm();
    showAuthModal.value = true;
  };

  const closeAuthModal = () => {
    authDialogRevision += 1;
    showAuthModal.value = false;
    authLoading.value = false;
    clearAuthForm();
  };

  const executeCommand = async () => {
    const currentTab = activeTab.value;
    if (loading.value[currentTab]) return;
    loading.value[currentTab] = true;
    errorMsg.value[currentTab] = "";
    resultImages.value[currentTab] = "";

    try {
      const endpoint = `${config.endpoint}/${currentTab}`;
      const payload = {
        profileId: Number(profileId.value),
        server: server.value,
      };

      const currentTabConfig = config.tabs.find((t) => t.id === currentTab);
      if (currentTabConfig?.hasCharacterInput) {
        if (config.id === "HonkaiImpact3") {
          payload.battlesuit = characterName.value;
        } else {
          payload.character = characterName.value;
        }
      }
      if (currentTabConfig?.hasFloorInput) {
        payload.floor = Number(floor.value);
      }

      const response = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 403 && data.code === "AUTH_REQUIRED") {
        openAuthModal(Number(profileId.value));
        loading.value[currentTab] = false;
        return;
      }

      if (!response.ok) {
        throw buildError(data.error || "Command failed", response.status);
      }

      if (data.storageFileName) {
        const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;
        resultImages.value[currentTab] = `${backendUrl}/attachments/${data.storageFileName}`;
      }
      await onSuccess?.();
    } catch (error) {
      if (handleApiError(error)) return;
      errorMsg.value[currentTab] = error.message;
    } finally {
      loading.value[currentTab] = false;
    }
  };

  const handleAuth = async () => {
    if (authLoading.value || !showAuthModal.value) return;
    const dialogRevision = authDialogRevision;
    const requestId = ++authRequestId;
    authLoading.value = true;
    authError.value = "";
    let retryCommand = false;

    try {
      const response = await apiFetch("/profile-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: Number(authProfileId.value),
          passphrase: authPassphrase.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw buildError(data.error || "Authentication failed", response.status);
      }

      if (dialogRevision !== authDialogRevision) return;
      closeAuthModal();
      retryCommand = true;
    } catch (error) {
      if (dialogRevision !== authDialogRevision) return;
      if (handleApiError(error)) return;
      authError.value = error.message;
    } finally {
      if (requestId === authRequestId && dialogRevision === authDialogRevision) {
        authLoading.value = false;
      }
    }

    if (retryCommand) await executeCommand();
  };

  return {
    loading,
    error: errorMsg,
    resultImages,
    showAuthModal,
    authProfileId,
    authPassphrase,
    authLoading,
    authError,
    clearAuthForm,
    openAuthModal,
    closeAuthModal,
    profileId,
    server,
    characterName,
    floor,
    executeCommand,
    handleAuth,
  };
}

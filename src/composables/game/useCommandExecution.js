import { ref } from "vue";
import { useApi } from "../useApi";

export function useCommandExecution(config, activeTab, initialServer) {
  const { showErrorToast, buildError, apiFetch } = useApi();

  const loading = ref({});
  const error = ref({});
  const resultImages = ref({});

  const showAuthModal = ref(false);
  const authProfileId = ref("");
  const authPassphrase = ref("");
  const authLoading = ref(false);
  const authError = ref("");

  const profileId = ref(1);
  const server = ref(initialServer || config.servers[0]?.value || "America");
  const characterName = ref("");
  const floor = ref(config.tabs.find((t) => t.hasFloorInput)?.floorMin || 12);

  const executeCommand = async () => {
    const currentTab = activeTab.value;
    loading.value[currentTab] = true;
    error.value[currentTab] = "";
    resultImages.value[currentTab] = "";

    try {
      let endpoint = `${config.endpoint}/${currentTab}`;
      let payload = {
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
        authProfileId.value = profileId.value;
        showAuthModal.value = true;
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
    } catch (err) {
      if (err._redirected) return;
      error.value[currentTab] = err.message;
      showErrorToast(err.message, err.status);
    } finally {
      loading.value[currentTab] = false;
    }
  };

  const handleAuth = async () => {
    authLoading.value = true;
    authError.value = "";

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

      showAuthModal.value = false;
      authPassphrase.value = "";
      executeCommand();
    } catch (err) {
      if (err._redirected) return;
      authError.value = err.message;
      showErrorToast(err.message, err.status);
    } finally {
      authLoading.value = false;
    }
  };

  return {
    loading,
    error,
    resultImages,
    showAuthModal,
    authProfileId,
    authPassphrase,
    authLoading,
    authError,
    profileId,
    server,
    characterName,
    floor,
    executeCommand,
    handleAuth,
  };
}

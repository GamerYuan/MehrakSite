import { ref } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useApi } from "./useApi";

export function useProfileManagement() {
  const { showErrorToast, showSuccessToast, buildError, apiFetch, apiFetchJson } = useApi();
  const confirm = useConfirm();

  const profiles = ref([]);
  const loading = ref(false);
  const showAddModal = ref(false);
  const showEditModal = ref(false);
  const selectedProfile = ref(null);

  const addForm = ref({ ltUid: "", lToken: "", passphrase: "" });
  const editForm = ref({ lToken: "", passphrase: "" });

  const fetchProfiles = async () => {
    loading.value = true;
    try {
      const { ok, data, status } = await apiFetchJson("/profiles");
      if (ok) {
        profiles.value = data;
      } else {
        showErrorToast(data.error || "Failed to fetch profiles", status);
      }
    } catch (error) {
      if (error._redirected) return;
      showErrorToast(error.message, error.status);
    } finally {
      loading.value = false;
    }
  };

  const openAddModal = () => {
    addForm.value = { ltUid: "", lToken: "", passphrase: "" };
    showAddModal.value = true;
  };

  const handleAdd = async () => {
    loading.value = true;
    try {
      const response = await apiFetch("/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ltUid: Number(addForm.value.ltUid),
          lToken: addForm.value.lToken,
          passphrase: addForm.value.passphrase,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw buildError(data.error || "Failed to add profile", response.status);
      }

      showAddModal.value = false;
      await fetchProfiles();
      showSuccessToast("Profile added successfully");
    } catch (error) {
      if (error._redirected) return;
      showErrorToast(error.message, error.status);
    } finally {
      loading.value = false;
    }
  };

  const openEditModal = (profile) => {
    selectedProfile.value = profile;
    editForm.value = { lToken: "", passphrase: "" };
    showEditModal.value = true;
  };

  const handleEdit = async () => {
    loading.value = true;
    try {
      const response = await apiFetch(`/profiles/${selectedProfile.value.profileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lToken: editForm.value.lToken,
          passphrase: editForm.value.passphrase,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw buildError(data.error || "Failed to update profile", response.status);
      }

      showEditModal.value = false;
      await fetchProfiles();
      showSuccessToast("Profile updated successfully");
    } catch (error) {
      if (error._redirected) return;
      showErrorToast(error.message, error.status);
    } finally {
      loading.value = false;
    }
  };

  const confirmDelete = (profile) => {
    confirm.require({
      message: `Are you sure you want to delete Profile ${profile.profileId}?`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true,
      },
      acceptProps: {
        label: "Delete",
        severity: "danger",
      },
      accept: () => executeDelete(profile),
    });
  };

  const executeDelete = async (profile) => {
    loading.value = true;
    try {
      const response = await apiFetch(`/profiles/${profile.profileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw buildError(data.error || "Failed to delete profile", response.status);
      }

      await fetchProfiles();
      showSuccessToast("Profile deleted successfully");
    } catch (error) {
      if (error._redirected) return;
      showErrorToast(error.message, error.status);
    } finally {
      loading.value = false;
    }
  };

  const confirmDeleteAll = () => {
    confirm.require({
      message: "Are you sure you want to delete all profiles? This action cannot be undone.",
      header: "Delete All Profiles",
      icon: "pi pi-exclamation-triangle",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true,
      },
      acceptProps: {
        label: "Delete All",
        severity: "danger",
      },
      accept: executeDeleteAll,
    });
  };

  const executeDeleteAll = async () => {
    loading.value = true;
    try {
      const response = await apiFetch("/profiles", { method: "DELETE" });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw buildError(data.error || "Failed to delete profiles", response.status);
      }

      await fetchProfiles();
      showSuccessToast("All profiles deleted");
    } catch (error) {
      if (error._redirected) return;
      showErrorToast(error.message, error.status);
    } finally {
      loading.value = false;
    }
  };

  return {
    profiles,
    loading,
    showAddModal,
    showEditModal,
    selectedProfile,
    addForm,
    editForm,
    fetchProfiles,
    openAddModal,
    handleAdd,
    openEditModal,
    handleEdit,
    confirmDelete,
    confirmDeleteAll,
  };
}

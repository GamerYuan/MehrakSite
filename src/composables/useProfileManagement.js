import { ref } from "vue";
import { useApi } from "./useApi";
import { useConfirm } from "primevue/useconfirm";

const emptyAddForm = () => ({ ltUid: "", lToken: "", passphrase: "" });
const emptyEditForm = () => ({ lToken: "", passphrase: "" });

export function useProfileManagement() {
  const { showErrorToast, showSuccessToast, buildError, handleApiError, apiFetch, apiFetchJson } =
    useApi();
  const confirm = useConfirm();

  const profiles = ref([]);
  const loading = ref(false);
  const addLoading = ref(false);
  const editLoading = ref(false);
  const showAddModal = ref(false);
  const showEditModal = ref(false);
  const selectedProfile = ref(null);

  const addForm = ref(emptyAddForm());
  const editForm = ref(emptyEditForm());
  let addModalRevision = 0;
  let editModalRevision = 0;
  let addRequestId = 0;
  let editRequestId = 0;

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
      handleApiError(error);
    } finally {
      loading.value = false;
    }
  };

  const clearAddForm = () => {
    addForm.value = emptyAddForm();
  };

  const clearEditForm = () => {
    editForm.value = emptyEditForm();
  };

  const closeAddModal = () => {
    addModalRevision += 1;
    showAddModal.value = false;
    clearAddForm();
  };

  const closeEditModal = () => {
    editModalRevision += 1;
    showEditModal.value = false;
    selectedProfile.value = null;
    clearEditForm();
  };

  const handleAddModalVisibility = (visible) => {
    if (visible) {
      showAddModal.value = true;
      return;
    }
    closeAddModal();
  };

  const handleEditModalVisibility = (visible) => {
    if (visible) {
      showEditModal.value = true;
      return;
    }
    closeEditModal();
  };

  const handleAddModalHide = () => {
    if (!showAddModal.value) clearAddForm();
  };

  const handleEditModalHide = () => {
    if (!showEditModal.value) clearEditForm();
  };

  const openAddModal = () => {
    addModalRevision += 1;
    clearAddForm();
    showAddModal.value = true;
  };

  const handleAdd = async () => {
    if (addLoading.value) return;
    const modalRevision = addModalRevision;
    const requestId = ++addRequestId;
    addLoading.value = true;
    const payload = {
      ltUid: Number(addForm.value.ltUid),
      lToken: addForm.value.lToken,
      passphrase: addForm.value.passphrase,
    };
    try {
      const response = await apiFetch("/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw buildError(data.error || "Failed to add profile", response.status);
      }

      const shouldUpdateModal = modalRevision === addModalRevision;
      if (shouldUpdateModal) closeAddModal();
      await fetchProfiles();
      if (shouldUpdateModal) showSuccessToast("Profile added successfully");
    } catch (error) {
      if (modalRevision === addModalRevision) handleApiError(error);
    } finally {
      if (requestId === addRequestId) addLoading.value = false;
    }
  };

  const openEditModal = (profile) => {
    selectedProfile.value = profile;
    editModalRevision += 1;
    clearEditForm();
    showEditModal.value = true;
  };

  const handleEdit = async () => {
    if (editLoading.value || !selectedProfile.value) return;
    const modalRevision = editModalRevision;
    const requestId = ++editRequestId;
    const { profileId } = selectedProfile.value;
    editLoading.value = true;
    const payload = {
      lToken: editForm.value.lToken,
      passphrase: editForm.value.passphrase,
    };
    try {
      const response = await apiFetch(`/profiles/${profileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw buildError(data.error || "Failed to update profile", response.status);
      }

      const shouldUpdateModal = modalRevision === editModalRevision;
      if (shouldUpdateModal) closeEditModal();
      await fetchProfiles();
      if (shouldUpdateModal) showSuccessToast("Profile updated successfully");
    } catch (error) {
      if (modalRevision === editModalRevision) handleApiError(error);
    } finally {
      if (requestId === editRequestId) editLoading.value = false;
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
      handleApiError(error);
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
      handleApiError(error);
    } finally {
      loading.value = false;
    }
  };

  return {
    profiles,
    loading,
    addLoading,
    editLoading,
    showAddModal,
    showEditModal,
    selectedProfile,
    addForm,
    editForm,
    fetchProfiles,
    clearAddForm,
    clearEditForm,
    closeAddModal,
    closeEditModal,
    handleAddModalVisibility,
    handleEditModalVisibility,
    handleAddModalHide,
    handleEditModalHide,
    openAddModal,
    handleAdd,
    openEditModal,
    handleEdit,
    confirmDelete,
    confirmDeleteAll,
  };
}

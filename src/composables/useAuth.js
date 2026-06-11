import { ref, computed, readonly } from "vue";
import { useApi } from "./useApi";
import { setUserCache } from "../router";

const user = ref(null);
const loading = ref(true);
const error = ref("");

let fetched = false;

export function useAuth() {
  const { apiFetchJson, apiFetch } = useApi();

  const isAuthenticated = computed(() => !!user.value);
  const isSuperAdmin = computed(() => !!user.value?.isSuperAdmin);
  const isRootUser = computed(() => !!user.value?.isRootUser);

  const fetchUser = async () => {
    if (fetched) return user.value;
    loading.value = true;
    error.value = "";
    try {
      const { ok, data } = await apiFetchJson("/auth/me", {
        skipAuthRedirect: true,
      });
      if (ok) {
        user.value = data;
        setUserCache(data);
        fetched = true;
      } else {
        user.value = null;
      }
    } catch (err) {
      if (err._redirected) return null;
      user.value = null;
      error.value = err.message || "Failed to fetch user";
    } finally {
      loading.value = false;
    }
    return user.value;
  };

  const login = () => {
    window.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        skipAuthRedirect: true,
      });
    } catch {
      // ignore
    } finally {
      user.value = null;
      fetched = false;
      setUserCache(null);
      window.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
    }
  };

  const hasGamePermission = (game) => {
    if (isSuperAdmin.value) return true;
    return user.value?.gameWritePermissions?.includes(game) ?? false;
  };

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    isSuperAdmin,
    isRootUser,
    fetchUser,
    login,
    logout,
    hasGamePermission,
  };
}

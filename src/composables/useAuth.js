import { computed, readonly, ref } from "vue";
import { standaloneApiFetch, standaloneApiFetchJson } from "./useApi";
import { setUserCache } from "./authStore";

const normalizeUser = (data) => ({
  discordId: data.discordId || data.DiscordId || "",
  discordUserId: data.discordUserId || data.DiscordUserId || "",
  isSuperAdmin: data.isSuperAdmin ?? data.IsSuperAdmin ?? false,
  isRootUser: data.isRootUser ?? data.IsRootUser ?? false,
  gameWritePermissions: data.gameWritePermissions || data.GameWritePermissions || [],
  username: data.username || data.Username || "",
  avatarUrl:
    data.avatarUrl ||
    data.avatar ||
    data.AvatarUrl ||
    data.Avatar ||
    `https://cdn.discordapp.com/embed/avatars/${(BigInt(data.discordId || data.DiscordId || 0) >> 22n) % 6n}.png`,
});

const user = ref(null);
const loading = ref(true);
const errorMsg = ref("");

let fetched = false;
let inflight = null;

const login = () => {
  globalThis.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
};

const setAuthState = (userData) => {
  user.value = userData;
  setUserCache(userData);
  fetched = true;
  loading.value = false;
};

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(user.value));
  const isSuperAdmin = computed(() => Boolean(user.value?.isSuperAdmin));
  const isRootUser = computed(() => Boolean(user.value?.isRootUser));

  const fetchUser = async () => {
    if (fetched) return user.value;
    if (inflight) return inflight;
    loading.value = true;
    errorMsg.value = "";

    inflight = (async () => {
      try {
        const { ok, data } = await standaloneApiFetchJson("/users/me", {
          skipAuthRedirect: true,
        });
        if (ok) {
          setAuthState(normalizeUser(data));
        } else {
          user.value = null;
          fetched = true;
        }
      } catch (error) {
        if (error._redirected) return null;
        user.value = null;
        errorMsg.value = error.message || "Failed to fetch user";
        // ponytail: don't set fetched=true on transient errors — allow retry
      } finally {
        loading.value = false;
        inflight = null;
      }
      return user.value;
    })();

    return inflight;
  };

  const logout = async () => {
    try {
      await standaloneApiFetch("/auth/logout", {
        method: "POST",
        skipAuthRedirect: true,
      });
    } catch {
      // Ignore
    } finally {
      user.value = null;
      fetched = false;
      setUserCache(null);
      globalThis.location.href = "/";
    }
  };

  const hasGamePermission = (game) => {
    if (isSuperAdmin.value) return true;
    return user.value?.gameWritePermissions?.includes(game) ?? false;
  };

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(errorMsg),
    isAuthenticated,
    isSuperAdmin,
    isRootUser,
    fetchUser,
    login,
    logout,
    hasGamePermission,
  };
}

export { normalizeUser, setAuthState };

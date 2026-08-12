import { computed, readonly, ref } from "vue";
import { canManageGame, canManageGameCapability } from "../configs/gameMeta";
import { standaloneApiFetch, standaloneApiFetchJson } from "./useApi";

const discordAvatar = (discordId) => {
  try {
    return `https://cdn.discordapp.com/embed/avatars/${(BigInt(discordId || 0) >> 22n) % 6n}.png`;
  } catch {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
};

const normalizeUser = (data = {}) => {
  const source = data || {};
  const discordId = source.discordId || source.DiscordId || "";
  const permissions = source.gameWritePermissions || source.GameWritePermissions;

  return {
    discordId,
    discordUserId: source.discordUserId || source.DiscordUserId || "",
    isSuperAdmin: source.isSuperAdmin ?? source.IsSuperAdmin ?? false,
    isRootUser: source.isRootUser ?? source.IsRootUser ?? false,
    gameWritePermissions: Array.isArray(permissions) ? permissions : [],
    username: source.username || source.Username || "",
    avatarUrl:
      source.avatarUrl ||
      source.avatar ||
      source.AvatarUrl ||
      source.Avatar ||
      discordAvatar(discordId),
  };
};

// This is the only auth source. Router guards and components read these same refs and request.
const user = ref(null);
const loading = ref(true);
const errorMsg = ref("");

let fetched = false;
let inflight = null;
let lastFetchStatus = null;
let authGeneration = 0;

const login = () => {
  globalThis.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
};

const setAuthState = (userData) => {
  user.value = userData ? normalizeUser(userData) : null;
  fetched = true;
  loading.value = false;
  errorMsg.value = "";
  lastFetchStatus = user.value ? 200 : null;
};

const clearAuthState = () => {
  authGeneration += 1;
  user.value = null;
  fetched = false;
  inflight = null;
  loading.value = false;
  errorMsg.value = "";
  lastFetchStatus = null;
};

const fetchUser = async () => {
  if (fetched) return user.value;
  if (inflight) return inflight;

  const generation = authGeneration;
  loading.value = true;
  errorMsg.value = "";

  inflight = (async () => {
    try {
      const { ok, data, status } = await standaloneApiFetchJson("/users/me", {
        skipAuthRedirect: true,
      });
      if (generation !== authGeneration) return null;
      lastFetchStatus = status;
      if (ok) {
        setAuthState(data);
      } else {
        user.value = null;
        fetched = status === 401;
        errorMsg.value = data?.error || `Failed to fetch user (${status})`;
        loading.value = false;
      }
    } catch (error) {
      if (generation !== authGeneration) return null;
      if (error._redirected) return null;
      user.value = null;
      errorMsg.value = error.message || "Failed to fetch user";
      lastFetchStatus = error.status ?? null;
      // Ponytail: transient errors stay retryable; a later guard can try the shared request again.
    } finally {
      if (generation === authGeneration) {
        loading.value = false;
        inflight = null;
      }
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
    // Ignore logout failures; the local session must still be cleared.
  } finally {
    clearAuthState();
    globalThis.location.href = "/";
  }
};

const getUser = () => user.value;
const getAuthStatus = () => lastFetchStatus;

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(user.value));
  const isSuperAdmin = computed(() => Boolean(user.value?.isSuperAdmin));
  const isRootUser = computed(() => Boolean(user.value?.isRootUser));

  const hasGamePermission = (game) => canManageGame(user.value, game);
  const canManageCapability = (game, capability) =>
    canManageGameCapability(user.value, game, capability);

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
    canManageCapability,
  };
}

export { clearAuthState, fetchUser, getAuthStatus, getUser, normalizeUser, setAuthState };

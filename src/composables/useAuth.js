import { computed, readonly, ref } from "vue";
import { canManageGame, canManageGameCapability } from "../configs/gameMeta";
import { buildError, standaloneApiFetch, standaloneApiFetchJson } from "./useApi";

const discordAvatar = (discordId) => {
  try {
    return `https://cdn.discordapp.com/embed/avatars/${(BigInt(discordId || 0) >> 22n) % 6n}.png`;
  } catch {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }
};

const LOGOUT_FAILURE_STORAGE_KEY = "mehrak.logout.unconfirmed";
const LOGOUT_FAILURE_MESSAGE =
  "Sign out could not be confirmed. Your browser may still have an active session. Try again.";

const getSessionStorage = () => {
  try {
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
};

const hasStoredLogoutFailure = () => {
  try {
    return getSessionStorage()?.getItem(LOGOUT_FAILURE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const storeLogoutFailure = () => {
  try {
    const storage = getSessionStorage();
    if (!storage) return false;
    storage.setItem(LOGOUT_FAILURE_STORAGE_KEY, "1");
    return true;
  } catch {
    // The in-memory state still provides the failure indication when storage is unavailable.
    return false;
  }
};

const clearStoredLogoutFailure = () => {
  try {
    getSessionStorage()?.removeItem(LOGOUT_FAILURE_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in privacy-restricted browsers.
  }
};

const normalizeUser = (data = {}) => {
  const source = data || {};
  const discordId = source.discordId || source.DiscordId || "";
  const permissions = source.gameWritePermissions || source.GameWritePermissions;
  const activeValue = source.isActive ?? source.IsActive;

  return {
    discordId,
    discordUserId: source.discordUserId || source.DiscordUserId || "",
    isSuperAdmin: source.isSuperAdmin ?? source.IsSuperAdmin ?? false,
    isRootUser: source.isRootUser ?? source.IsRootUser ?? false,
    isActive: activeValue === true || activeValue === false ? activeValue : null,
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
const logoutStatus = ref(hasStoredLogoutFailure() ? "failed" : "idle");
const logoutError = ref(logoutStatus.value === "failed" ? LOGOUT_FAILURE_MESSAGE : "");
let logoutInFlight = null;

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
  if (logoutInFlight || logoutStatus.value === "pending") return null;
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

const logout = () => {
  if (logoutInFlight) return logoutInFlight;

  // Invalidate the local auth generation before waiting on the server. This prevents an
  // Already-started /users/me request from repopulating the account while sign-out is pending.
  clearAuthState();
  logoutStatus.value = "pending";
  logoutError.value = "";
  storeLogoutFailure();

  logoutInFlight = (async () => {
    let result = null;
    let shouldRedirect = true;
    try {
      const response = await standaloneApiFetch("/auth/logout", {
        method: "POST",
        skipAuthRedirect: true,
      });

      // The endpoint requires an authenticated cookie.
      // A 401 means the server no longer recognizes the session.
      // That is already a successful invalidation from the user's perspective.
      if (!response.ok && response.status !== 401) {
        throw buildError(LOGOUT_FAILURE_MESSAGE, response.status);
      }

      clearAuthState();
      logoutStatus.value = "idle";
      logoutError.value = "";
      clearStoredLogoutFailure();
      result = {
        confirmed: true,
        alreadyExpired: response.status === 401,
        status: response.status,
      };
    } catch (error) {
      // Local state is safe to clear even when the browser cannot confirm server invalidation.
      // Keep a session-scoped marker so a redirect or refresh cannot hide the retry affordance.
      clearAuthState();
      logoutStatus.value = "failed";
      logoutError.value = LOGOUT_FAILURE_MESSAGE;
      shouldRedirect = storeLogoutFailure();
      result = { confirmed: false, status: error?.status ?? null, error };
    } finally {
      if (shouldRedirect) {
        try {
          globalThis.location.href = "/";
        } catch {
          // The persistent status remains available when navigation is blocked by the host.
        }
      }
      logoutInFlight = null;
    }
    return result;
  })();

  return logoutInFlight;
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
    logoutStatus: readonly(logoutStatus),
    logoutError: readonly(logoutError),
    hasGamePermission,
    canManageCapability,
  };
}

export { clearAuthState, fetchUser, getAuthStatus, getUser, logout, normalizeUser, setAuthState };

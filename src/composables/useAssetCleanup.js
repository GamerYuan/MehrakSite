import { computed, ref, watch } from "vue";
import { useApi } from "./useApi";

export function useAssetCleanup() {
  const { apiFetch } = useApi();
  const suffix = ref("");
  const result = ref(null);
  const pending = ref(false);
  const executing = ref(false);
  const error = ref("");
  const confirmation = ref("");
  const operationallyVerified = ref(false);
  const validation = computed(() => {
    if (!suffix.value.trim()) return "Enter a non-whitespace suffix.";
    if (suffix.value.length > 1024) return "Use at most 1024 UTF-16 code units.";
    if (
      [...suffix.value].some((character) => {
        const code = character.charCodeAt(0);
        return code <= 31 || (code >= 127 && code <= 159);
      })
    ) {
      return "Control characters are not allowed.";
    }
    return "";
  });
  const canExecute = computed(
    () =>
      !pending.value &&
      !validation.value &&
      result.value?.dryRun === true &&
      result.value.suffix === suffix.value &&
      result.value.matchedCount > 0,
  );
  watch(
    suffix,
    () => {
      result.value = null;
      confirmation.value = "";
      operationallyVerified.value = false;
      error.value = "";
    },
    { flush: "sync" },
  );

  const request = async (dryRun) => {
    if (pending.value || validation.value) return;
    if (
      !dryRun &&
      (!canExecute.value || confirmation.value !== suffix.value || !operationallyVerified.value)
    )
      return;
    const requestedSuffix = suffix.value;
    pending.value = true;
    executing.value = !dryRun;
    result.value = null;
    error.value = "";
    confirmation.value = "";
    operationallyVerified.value = false;
    try {
      const response = await apiFetch("/assets/cleanup-by-suffix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suffix: requestedSuffix, dryRun }),
        skipAuthRedirect: true,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const details = data?.errors ? Object.values(data.errors).flat().join(" ") : "";
        const message =
          data?.error ||
          details ||
          data?.detail ||
          data?.title ||
          {
            401: "Session expired. Sign in again.",
            403: "Superadmin access is required.",
            429: "Rate limit exceeded. Wait before making another request.",
          }[response.status] ||
          "The server could not complete the request.";
        throw new Error(
          `${data?.code ? `${data.code}: ` : ""}${message} (HTTP ${response.status})`,
        );
      }
      if (
        data?.dryRun !== dryRun ||
        data?.suffix !== requestedSuffix ||
        !Array.isArray(data?.keys)
      ) {
        throw new Error("The server returned an invalid cleanup result.");
      }
      if (suffix.value === requestedSuffix) result.value = data;
    } catch (caughtError) {
      error.value = `${caughtError.message}${dryRun ? "" : " Execution may have partially completed. Do not blindly retry; inspect storage and backups, then preview again. No rollback is guaranteed."}`;
    } finally {
      pending.value = false;
      executing.value = false;
    }
  };
  return {
    suffix,
    result,
    pending,
    executing,
    error,
    confirmation,
    operationallyVerified,
    validation,
    canExecute,
    preview: () => request(true),
    execute: () => request(false),
  };
}

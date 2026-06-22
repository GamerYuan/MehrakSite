import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

const MISSING_BACKEND_URL =
  "VITE_APP_BACKEND_URL is not defined. Check your environment variables.";

const buildError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const standaloneApiFetch = async (path, options = {}) => {
  const { skipAuthRedirect, ...fetchOptions } = options;
  const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!backendUrl) {
    throw new Error(MISSING_BACKEND_URL);
  }
  const response = await fetch(`${backendUrl}${path}`, {
    credentials: "include",
    ...fetchOptions,
  });

  if (response.status === 401 && !skipAuthRedirect) {
    window.location.href = "/";
    const err = buildError("Unauthorized", 401);
    err._redirected = true;
    throw err;
  }

  return response;
};

const standaloneApiFetchJson = async (path, options = {}) => {
  const { skipAuthRedirect, ...fetchOptions } = options;
  const response = await standaloneApiFetch(path, {
    skipAuthRedirect,
    ...fetchOptions,
  });

  if (response.ok) {
    const contentType = response.headers.get("content-type");
    const hasBody = contentType && contentType.includes("application/json");
    const data = hasBody ? await response.json().catch(() => ({})) : {};
    return { ok: true, data, status: response.status };
  }

  const data = await response.json().catch(() => ({}));
  return { ok: false, data, status: response.status };
};

export { standaloneApiFetch, standaloneApiFetchJson, buildError };

export function useApi() {
  const router = useRouter();
  const toast = useToast();

  const showErrorToast = (message, status) => {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: `${message} (Code: ${status ?? "N/A"})`,
      life: 5000,
    });
  };

  const showWarnToast = (detail, summary = "Warning") => {
    toast.add({
      severity: "warn",
      summary,
      detail,
      life: 5000,
    });
  };

  const showSuccessToast = (detail, summary = "Success") => {
    toast.add({
      severity: "success",
      summary,
      detail,
      life: 3000,
    });
  };

  return {
    showErrorToast,
    showSuccessToast,
    showWarnToast,
    buildError,
    apiFetch: standaloneApiFetch,
    apiFetchJson: standaloneApiFetchJson,
  };
}

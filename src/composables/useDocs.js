import { computed, onMounted, ref } from "vue";
import { gameMeta, gameLabels } from "../configs/gameMeta";
import { useApi } from "./useApi";
import { isPublicDocument } from "../utils/publicContent";

export const gameColors = Object.fromEntries(
  Object.entries(gameMeta).map(([key, meta]) => [
    key,
    { bg: meta.bgColor, border: meta.borderColor, text: meta.color },
  ]),
);

export const normalizeGame = (value) => {
  const raw = String(value ?? "").trim();
  return (
    Object.keys(gameLabels).find((key) => {
      const meta = gameMeta[key];
      return (
        key.toLowerCase() === raw.toLowerCase() ||
        meta.id?.toLowerCase() === raw.toLowerCase() ||
        meta.routeKey?.toLowerCase() === raw.toLowerCase()
      );
    }) || raw
  );
};

export const normalizeDocument = (document) => ({
  ...document,
  id: document.id ?? document.Id,
  name: String(document.name ?? document.Name ?? "")
    .trim()
    .replace(/^\/+/, ""),
  description: String(document.description ?? document.Description ?? "").trim(),
  game: normalizeGame(document.game ?? document.Game),
});

export const documentList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.documents)) return data.documents;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.$values)) return data.$values;
  return [];
};
const SUPPORTED_GAMES = Object.keys(gameLabels);

export function useDocs() {
  const { apiFetch, apiFetchJson, handleApiError } = useApi();

  const documents = ref([]);
  const loading = ref(false);
  const errorMsg = ref("");
  const searchQuery = ref("");
  const selectedGames = ref([...SUPPORTED_GAMES]);

  const fetchDocuments = async () => {
    loading.value = true;
    errorMsg.value = "";
    try {
      const { ok, data } = await apiFetchJson("/docs/list", {
        skipAuthRedirect: true,
      });
      if (ok) {
        documents.value = documentList(data)
          .map(normalizeDocument)
          .filter((document) => isPublicDocument(document, SUPPORTED_GAMES));
      } else {
        errorMsg.value = data.error || "Failed to fetch documentation";
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      loading.value = false;
    }
  };

  const fetchDocumentDetail = async (id) => {
    const response = await apiFetch(`/docs/${id}`, {
      skipAuthRedirect: true,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to fetch documentation details");
    }
    return await response.json();
  };

  const filteredDocuments = computed(() => {
    let result = documents.value;

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim();
      result = result.filter((doc) => doc.name.toLowerCase().includes(query));
    }

    if (selectedGames.value.length > 0) {
      result = result.filter((doc) => selectedGames.value.includes(doc.game));
    }

    return result;
  });

  const groupedDocuments = computed(() => {
    /** @type {Record<string, Array<{ id: string, name: string, description: string, game: string }>>} */
    const groups = {};
    for (const game of SUPPORTED_GAMES) {
      const docs = filteredDocuments.value.filter((doc) => doc.game === game);
      if (docs.length > 0) {
        groups[game] = docs;
      }
    }
    return groups;
  });

  const toggleGame = (game) => {
    const index = selectedGames.value.indexOf(game);
    if (index !== -1) {
      if (selectedGames.value.length > 1) {
        selectedGames.value.splice(index, 1);
      }
    } else {
      selectedGames.value.push(game);
    }
  };

  const selectAllGames = () => {
    selectedGames.value = [...SUPPORTED_GAMES];
  };

  onMounted(() => {
    fetchDocuments();
  });

  return {
    documents,
    loading,
    error: errorMsg,
    searchQuery,
    selectedGames,
    filteredDocuments,
    groupedDocuments,
    fetchDocuments,
    fetchDocumentDetail,
    toggleGame,
    selectAllGames,
    gameColors,
    gameLabels,
  };
}

import { gameConfigs } from "../configs/gameConfigs";
import { ref } from "vue";
import { useApi } from "./useApi";

export function useAlias() {
  const { apiFetchJson } = useApi();

  const aliases = ref({});
  const loading = ref(false);
  const errorMsg = ref(null);
  const searchQuery = ref("");

  const fetchAllAliases = async () => {
    loading.value = true;
    errorMsg.value = null;
    const games = Object.values(gameConfigs).map((c) => c.id);

    try {
      const promises = games.map(async (game) => {
        const { ok, data } = await apiFetchJson(`/alias/list?game=${game}`, {
          skipAuthRedirect: true,
        });
        if (ok) {
          return { game, data };
        }
        return { game, data: {} };
      });

      const results = await Promise.all(promises);
      const newAliases = {};
      results.forEach(({ game, data }) => {
        newAliases[game] = Object.entries(data).map(([name, aliasList]) => {
          aliasList.sort();
          return {
            name,
            aliases: aliasList,
          };
        });
      });
      aliases.value = newAliases;
    } catch (error) {
      if (error._redirected) return;
      errorMsg.value = error.message || "Failed to fetch aliases";
    } finally {
      loading.value = false;
    }
  };

  return { aliases, loading, error: errorMsg, searchQuery, fetchAllAliases };
}

import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import DocsView from "../views/DocsView.vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import DashboardHomeView from "../views/DashboardHomeView.vue";
import UserManagementView from "../views/UserManagementView.vue";
import DocsManagementView from "../views/DocsManagementView.vue";
import GameView from "../views/GameView.vue";
import SeaweedFilerView from "../views/SeaweedFilerView.vue";
import ReleaseNotesManagementView from "../views/ReleaseNotesManagementView.vue";
import PrivacyPolicyView from "../views/PrivacyPolicyView.vue";
import TermsOfServiceView from "../views/TermsOfServiceView.vue";
import { gameMeta } from "../configs/gameMeta";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    }
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/docs",
      name: "docs",
      component: DocsView,
    },
    {
      path: "/privacy",
      name: "privacy",
      component: PrivacyPolicyView,
    },
    {
      path: "/terms",
      name: "terms",
      component: TermsOfServiceView,
    },
    {
      path: "/dashboard",
      component: DashboardLayout,
      children: [
        {
          path: "",
          name: "dashboard-home",
          component: DashboardHomeView,
        },
        {
          path: "users",
          name: "user-management",
          component: UserManagementView,
          meta: { requireSuperAdmin: true },
        },
        {
          path: "docs",
          name: "docs-management",
          component: DocsManagementView,
          meta: { requireAnyPermission: true },
        },
        {
          path: "release-notes",
          name: "release-notes-management",
          component: ReleaseNotesManagementView,
          meta: { requireSuperAdmin: true },
        },
        {
          path: ":game",
          name: "game",
          component: GameView,
          beforeEnter: (to) => {
            const validGames = Object.values(gameMeta)
              .map((m) => m.routeKey)
              .filter(Boolean);
            if (!validGames.includes(to.params.game)) {
              return { name: "dashboard-home" };
            }
          },
          meta: { requireGamePermission: true },
        },
        {
          path: "seaweed-filer",
          name: "seaweed-filer",
          component: SeaweedFilerView,
          meta: { requireSuperAdmin: true },
        },
      ],
    },
  ],
});

let cachedUser = null;

const setUserCache = (u) => {
  cachedUser = u;
};

const getUser = () => cachedUser;

router.beforeEach(async (to) => {
  if (!to.path.startsWith("/dashboard")) return;

  const meta = to.meta;
  if (!meta.requireSuperAdmin && !meta.requireGamePermission && !meta.requireAnyPermission) {
    return;
  }

  if (!cachedUser) {
    try {
      const { default: { apiFetchJson } } = await import("../composables/useApi");
      const { ok, data } = await apiFetchJson("/auth/me", { skipAuthRedirect: true });
      if (!ok) {
        window.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
        return false;
      }
      cachedUser = data;
    } catch {
      window.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
      return false;
    }
  }

  const user = cachedUser;

  if (meta.requireSuperAdmin && !user.isSuperAdmin) {
    return { name: "dashboard-home" };
  }

  if (meta.requireGamePermission) {
    const game = to.params.game;
    if (!user.isSuperAdmin && !user.gameWritePermissions?.includes(game)) {
      return { name: "dashboard-home" };
    }
  }

  if (meta.requireAnyPermission && !user.isSuperAdmin && !user.gameWritePermissions?.length) {
    return { name: "dashboard-home" };
  }
});

export { getUser, setUserCache };
export default router;

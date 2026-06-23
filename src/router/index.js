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
import { getUser, setUserCache } from "../composables/authStore";

const validGameKeys = Object.values(gameMeta)
  .map((m) => m.routeKey)
  .filter(Boolean);

function validateGameParam(game) {
  if (!validGameKeys.includes(game)) {
    return { name: "dashboard-home" };
  }
}

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
          meta: { requireAuth: true },
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
          beforeEnter: (to) => validateGameParam(to.params.game),
          meta: { requireAuth: true },
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

router.beforeEach(async (to) => {
  if (!to.path.startsWith("/dashboard")) return;

  const meta = to.meta;
  if (
    !meta.requireAuth &&
    !meta.requireSuperAdmin &&
    !meta.requireGamePermission &&
    !meta.requireAnyPermission
  ) {
    return;
  }

  if (!getUser()) {
    try {
      const { standaloneApiFetchJson } = await import("../composables/useApi");
      const { normalizeUser, setAuthState } = await import("../composables/useAuth");
      const { ok, data, status } = await standaloneApiFetchJson("/users/me", {
        skipAuthRedirect: true,
      });
      if (!ok) {
        if (status === 401) {
          window.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
          return false;
        }
        return { name: "home" };
      }
      const normalized = normalizeUser(data);
      setUserCache(normalized);
      setAuthState(normalized);
    } catch (err) {
      if (err.status === 401) {
        window.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
      }
      return false;
    }
  }

  const user = getUser();

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

export { validateGameParam };
export default router;

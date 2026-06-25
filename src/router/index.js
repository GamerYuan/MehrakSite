import { createRouter, createWebHistory } from "vue-router";
import { getUser, setUserCache } from "../composables/authStore";
import { gameMeta } from "../configs/gameMeta";

const validGameKeys = new Set(Object.values(gameMeta)
  .map((m) => m.routeKey)
  .filter(Boolean));

function validateGameParam(game) {
  if (!validGameKeys.has(game)) {
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
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/docs",
      name: "docs",
      component: () => import("../views/DocsView.vue"),
    },
    {
      path: "/privacy",
      name: "privacy",
      component: () => import("../views/PrivacyPolicyView.vue"),
    },
    {
      path: "/terms",
      name: "terms",
      component: () => import("../views/TermsOfServiceView.vue"),
    },
    {
      path: "/dashboard",
      component: () => import("../layouts/DashboardLayout.vue"),
      children: [
        {
          path: "",
          name: "dashboard-home",
          component: () => import("../views/DashboardHomeView.vue"),
          meta: { requireAuth: true },
        },
        {
          path: "users",
          name: "user-management",
          component: () => import("../views/UserManagementView.vue"),
          meta: { requireSuperAdmin: true },
        },
        {
          path: "docs",
          name: "docs-management",
          component: () => import("../views/DocsManagementView.vue"),
          meta: { requireAnyPermission: true },
        },
        {
          path: "release-notes",
          name: "release-notes-management",
          component: () => import("../views/ReleaseNotesManagementView.vue"),
          meta: { requireSuperAdmin: true },
        },
        {
          path: ":game",
          name: "game",
          component: () => import("../views/GameView.vue"),
          beforeEnter: (to) => validateGameParam(to.params.game),
          meta: { requireAuth: true },
        },

      ],
    },
  ],
});

router.beforeEach(async (to) => {
  if (!to.path.startsWith("/dashboard")) return;

  const {meta} = to;
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
          globalThis.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
          return false;
        }
        return { name: "home" };
      }
      const normalized = normalizeUser(data);
      setUserCache(normalized);
      setAuthState(normalized);
    } catch (error) {
      if (error.status === 401) {
        globalThis.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
      }
      return false;
    }
  }

  const user = getUser();

  if (meta.requireSuperAdmin && !user.isSuperAdmin) {
    return { name: "dashboard-home" };
  }

  if (meta.requireGamePermission) {
    const {game} = to.params;
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

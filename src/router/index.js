import { createRouter, createWebHistory } from "vue-router";
import {
  canManageGame,
  canManageGameCapability,
  getGameCapabilities,
  hasAnyGamePermission,
  isSuperAdminUser,
} from "../configs/gameMeta";
import { fetchUser, getAuthStatus, getUser } from "../composables/useAuth";
import { gameConfigs } from "../configs/gameConfigs";

const defaultMetadata = {
  title: "MehrakBot — Discord command cards for HoYoverse games",
  description:
    "Create build cards, roster summaries, and endgame records from documented MehrakBot Discord commands.",
};

const publicMetadata = {
  home: defaultMetadata,
  docs: {
    title: "MehrakBot Documentation — Installation, commands, and credentials",
    description:
      "Install MehrakBot, choose a Discord workflow, browse commands, and review HoYoLAB credential guidance.",
  },
  privacy: {
    title: "Privacy Policy — MehrakBot",
    description: "Read how MehrakBot collects, uses, stores, protects, and deletes account data.",
  },
  terms: {
    title: "Terms of Service — MehrakBot",
    description: "Read the terms governing access to and use of MehrakBot services.",
  },
};

function applyRouteMetadata(meta = {}) {
  const metadata = meta.title && meta.description ? meta : defaultMetadata;
  document.title = metadata.title;

  const values = {
    'meta[name="description"]': metadata.description,
    'meta[property="og:title"]': metadata.title,
    'meta[property="og:description"]': metadata.description,
    'meta[name="twitter:title"]': metadata.title,
    'meta[name="twitter:description"]': metadata.description,
  };

  for (const [selector, content] of Object.entries(values)) {
    const element = document.head.querySelector(selector);
    if (element) element.setAttribute("content", content);
  }
}

const validGameKeys = new Set(Object.keys(gameConfigs));

function validateGameParam(game) {
  if (!validGameKeys.has(game)) {
    return { name: "dashboard-home" };
  }
}

const isProtectedRoute = (meta = {}) =>
  Boolean(
    meta.requireAuth ||
    meta.requireSuperAdmin ||
    meta.requireGamePermission ||
    meta.requireGameCapability ||
    meta.requireGameFeature ||
    meta.requireAnyPermission,
  );

const canAccessRoute = (to, user) => {
  const meta = to.meta || {};
  const game = to.params?.game;
  if (meta.requireAuth && !user) return false;
  if (meta.requireSuperAdmin && !isSuperAdminUser(user)) return false;
  if (meta.requireGamePermission && !canManageGame(user, game)) return false;
  if (meta.requireGameFeature && !getGameCapabilities(game).management?.[meta.requireGameFeature]) {
    return false;
  }
  if (
    meta.requireGameCapability &&
    !canManageGameCapability(user, game, meta.requireGameCapability)
  ) {
    return false;
  }
  if (meta.requireAnyPermission && !hasAnyGamePermission(user)) return false;
  return true;
};

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
      component: () => import("../layouts/PublicLayout.vue"),
      children: [
        {
          path: "",
          name: "home",
          component: () => import("../views/HomeView.vue"),
          meta: publicMetadata.home,
        },
        {
          path: "docs",
          name: "docs",
          component: () => import("../views/DocsView.vue"),
          meta: publicMetadata.docs,
        },
        {
          path: "privacy",
          name: "privacy",
          component: () => import("../views/PrivacyPolicyView.vue"),
          meta: publicMetadata.privacy,
        },
        {
          path: "terms",
          name: "terms",
          component: () => import("../views/TermsOfServiceView.vue"),
          meta: publicMetadata.terms,
        },
      ],
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
          path: ":game/portraits",
          name: "game-user-portraits",
          component: () => import("../views/GameView.vue"),
          beforeEnter: (to) => validateGameParam(to.params.game),
          meta: {
            requireAuth: true,
            requireGameFeature: "userPortraits",
            gameWorkspaceTab: "portraits",
          },
        },
        {
          path: ":game/manage",
          name: "game-management",
          component: () => import("../views/GameView.vue"),
          beforeEnter: (to) => validateGameParam(to.params.game),
          meta: {
            requireAuth: true,
            requireGamePermission: true,
            requireGameCapability: "characters",
            gameManagementTab: "manage",
          },
        },
        {
          path: ":game/manage/aliases",
          name: "game-alias-management",
          component: () => import("../views/GameView.vue"),
          beforeEnter: (to) => validateGameParam(to.params.game),
          meta: {
            requireAuth: true,
            requireGamePermission: true,
            requireGameCapability: "aliases",
            gameManagementTab: "aliases",
          },
        },
        {
          path: ":game/manage/codes",
          name: "game-code-management",
          component: () => import("../views/GameView.vue"),
          beforeEnter: (to) => validateGameParam(to.params.game),
          meta: {
            requireAuth: true,
            requireGamePermission: true,
            requireGameCapability: "codes",
            gameManagementTab: "codes",
          },
        },
        {
          path: ":game/manage/weapon-icons",
          name: "game-weapon-icon-management",
          component: () => import("../views/GameView.vue"),
          beforeEnter: (to) => validateGameParam(to.params.game),
          meta: {
            requireAuth: true,
            requireGamePermission: true,
            requireGameCapability: "weaponIcons",
            gameManagementTab: "weaponicons",
          },
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

  if (!isProtectedRoute(to.meta)) return;

  let user = getUser();
  if (!user) {
    user = await fetchUser();
    if (!user) {
      const status = getAuthStatus();
      if (status === 401) {
        globalThis.location.href = `${import.meta.env.VITE_APP_BACKEND_URL}/auth/discord`;
        return false;
      }
      return status == null ? false : { name: "home" };
    }
  }

  if (!canAccessRoute(to, user)) return { name: "dashboard-home" };
});

router.afterEach((to) => {
  applyRouteMetadata(to.meta);
});

export {
  applyRouteMetadata,
  canAccessRoute,
  defaultMetadata,
  isProtectedRoute,
  publicMetadata,
  validateGameParam,
};
export default router;

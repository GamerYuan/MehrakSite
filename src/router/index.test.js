import router, {
  applyRouteMetadata,
  canAccessRoute,
  defaultMetadata,
  publicMetadata,
  validateGameParam,
} from "./index";

describe("router beforeEnter game validator", () => {
  it("accepts valid route keys", () => {
    expect(validateGameParam("genshin")).toBeUndefined();
    expect(validateGameParam("hsr")).toBeUndefined();
    expect(validateGameParam("zzz")).toBeUndefined();
    expect(validateGameParam("hi3")).toBeUndefined();
  });

  it("rejects invalid game keys", () => {
    expect(validateGameParam("tot")).toEqual({ name: "dashboard-home" });
    expect(validateGameParam("invalid")).toEqual({ name: "dashboard-home" });
    expect(validateGameParam("")).toEqual({ name: "dashboard-home" });
  });

  it("rejects TearsOfThemis which has routeKey null", () => {
    expect(validateGameParam(null)).toEqual({ name: "dashboard-home" });
  });

  it("keeps command routes available to authenticated users without write permission", () => {
    expect(
      canAccessRoute(
        { meta: { requireAuth: true }, params: { game: "genshin" } },
        { isSuperAdmin: false, gameWritePermissions: [] },
      ),
    ).toBe(true);
  });

  it("protects direct game-management routes with the matching permission", () => {
    const managementRoute = {
      meta: {
        requireGamePermission: true,
        requireGameCapability: "aliases",
      },
      params: { game: "genshin" },
    };

    expect(canAccessRoute(managementRoute, { gameWritePermissions: [] })).toBe(false);
    expect(canAccessRoute(managementRoute, { gameWritePermissions: ["HonkaiStarRail"] })).toBe(
      false,
    );
    expect(canAccessRoute(managementRoute, { gameWritePermissions: ["Genshin"] })).toBe(true);
    expect(canAccessRoute(managementRoute, { isSuperAdmin: true })).toBe(true);
  });

  it("allows authenticated users into their personal portrait workspace", () => {
    const portraitRoute = router.resolve("/dashboard/genshin/portraits");

    expect(portraitRoute.name).toBe("game-user-portraits");
    expect(portraitRoute.meta).toMatchObject({
      requireAuth: true,
      requireGameFeature: "userPortraits",
      gameWorkspaceTab: "portraits",
    });
    expect(canAccessRoute(portraitRoute, { gameWritePermissions: [] })).toBe(true);
    expect(canAccessRoute(portraitRoute, null)).toBe(false);
    expect(
      canAccessRoute(
        {
          meta: { requireAuth: true, requireGameFeature: "missing" },
          params: { game: "genshin" },
        },
        { gameWritePermissions: [] },
      ),
    ).toBe(false);
  });

  it("registers stable nested management URLs", () => {
    expect(router.resolve("/dashboard/genshin/manage").name).toBe("game-management");
    expect(router.resolve("/dashboard/genshin/manage/aliases").name).toBe("game-alias-management");
    expect(router.resolve("/dashboard/genshin/manage/codes").name).toBe("game-code-management");
    expect(router.resolve("/dashboard/genshin/manage/weapon-icons").name).toBe(
      "game-weapon-icon-management",
    );
  });

  it("requireSuperAdmin blocks non-admins from user and release-note management", () => {
    const route = { meta: { requireSuperAdmin: true } };

    expect(canAccessRoute(route, null)).toBe(false);
    expect(canAccessRoute(route, { isSuperAdmin: false, gameWritePermissions: ["Genshin"] })).toBe(
      false,
    );
    expect(canAccessRoute(route, { isSuperAdmin: true })).toBe(true);
  });

  it("requireAnyPermission requires any write permission or super admin", () => {
    const route = { meta: { requireAnyPermission: true } };

    expect(canAccessRoute(route, null)).toBe(false);
    expect(canAccessRoute(route, { gameWritePermissions: [] })).toBe(false);
    expect(canAccessRoute(route, { gameWritePermissions: ["Genshin"] })).toBe(true);
    expect(canAccessRoute(route, { isSuperAdmin: true })).toBe(true);
  });
});

describe("public route metadata", () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <meta name="description">
      <meta property="og:title">
      <meta property="og:description">
      <meta name="twitter:title">
      <meta name="twitter:description">
    `;
  });

  it.each(["home", "docs", "privacy", "terms"])("applies unique %s metadata", (routeName) => {
    applyRouteMetadata(publicMetadata[routeName]);

    expect(document.title).toBe(publicMetadata[routeName].title);
    expect(document.head.querySelector('meta[name="description"]').content).toBe(
      publicMetadata[routeName].description,
    );
    expect(document.head.querySelector('meta[property="og:title"]').content).toBe(
      publicMetadata[routeName].title,
    );
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });

  it("resets unrelated routes to neutral fallback metadata", () => {
    applyRouteMetadata({ requireAuth: true });

    expect(document.title).toBe(defaultMetadata.title);
    expect(document.head.querySelector('meta[name="twitter:description"]').content).toBe(
      defaultMetadata.description,
    );
  });
});

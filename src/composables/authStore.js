let cachedUser = null;

export const setUserCache = (u) => {
  cachedUser = u;
};

export const getUser = () => cachedUser;

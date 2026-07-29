const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ROLE_KEY = "role";

// ======================================================
// GET TOKENS
// ======================================================
export const getAccessToken = () =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const getRole = () =>
  localStorage.getItem(ROLE_KEY);

// ======================================================
// SET TOKENS
// ======================================================
export const setTokens = ({
  access_token,
  refresh_token,
  role,
}) => {
  if (access_token)
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);

  if (refresh_token)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

  if (role) localStorage.setItem(ROLE_KEY, role);
};

// ======================================================
// CLEAR TOKENS
// ======================================================
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
};

// ======================================================
// AUTH CHECK
// ======================================================
export const isAuthenticated = () => {
  return !!getAccessToken();
};
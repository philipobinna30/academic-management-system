import axios from "axios";

// ======================================================
// BASE URL
// ======================================================
export const BASE_URL = "http://localhost:8000";

// ======================================================
// GLOBAL LOGOUT HANDLER
// ======================================================
let globalLogoutHandler = null;

export const setGlobalLogoutHandler = (fn) => {
  globalLogoutHandler = fn;
};

// ======================================================
// AXIOS INSTANCES
// ======================================================
const API = axios.create({
  baseURL: `${BASE_URL}/crud/students`,
});

const AUTH_API = axios.create({
  baseURL: `${BASE_URL}/auth`,
});

// ======================================================
// TOKEN HELPERS
// ======================================================
const getAccessToken = () =>
  localStorage.getItem("access_token");

const getRefreshToken = () =>
  localStorage.getItem("refresh_token");

// ======================================================
// LOGOUT
// ======================================================
const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};

// ======================================================
// ATTACH INITIAL TOKEN
// ======================================================
const token = getAccessToken();

if (token) {
  API.defaults.headers.common.Authorization =
    `Bearer ${token}`;
}

// ======================================================
// REFRESH CONTROL
// ======================================================
let isRefreshing = false;
let refreshQueue = [];

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================
API.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================
API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest?._retry) {
      if (globalLogoutHandler) {
        globalLogoutHandler();
      } else {
        logout();
      }

      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve,
          reject,
        });
      }).then(() => API(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken =
        getRefreshToken();

      if (!refreshToken) {
        if (globalLogoutHandler) {
          globalLogoutHandler();
        } else {
          logout();
        }

        return Promise.reject(error);
      }

      const refreshResponse =
        await AUTH_API.post(
          "/refresh",
          null,
          {
            params: {
              token: refreshToken,
            },
          }
        );

      const newToken =
        refreshResponse?.data?.access_token;

      if (!newToken) {
        if (globalLogoutHandler) {
          globalLogoutHandler();
        } else {
          logout();
        }

        return Promise.reject(error);
      }

      localStorage.setItem(
        "access_token",
        newToken
      );

      API.defaults.headers.common.Authorization =
        `Bearer ${newToken}`;

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newToken}`;

      refreshQueue.forEach((p) =>
        p.resolve()
      );

      refreshQueue = [];

      return API(originalRequest);
    } catch (refreshError) {
      refreshQueue.forEach((p) =>
        p.reject(refreshError)
      );

      refreshQueue = [];

      if (globalLogoutHandler) {
        globalLogoutHandler();
      } else {
        logout();
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ======================================================
// EXPORTS
// ======================================================
export default API;
export { AUTH_API };
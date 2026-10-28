import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

/*
 * Attach JWT to every request.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/*
 * Handle authentication errors.
 * 401: logout for non-authentication requests.
 * 403: preserve the token.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const requestUrl = error.config?.url || "";

      const isAuthRequest =
        requestUrl.includes("/api/auth/login") ||
        requestUrl.includes("/api/auth/register") ||
        requestUrl.includes("/api/auth/forgot-password") ||
        requestUrl.includes("/api/auth/reset-password");

      if (!isAuthRequest) {
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;

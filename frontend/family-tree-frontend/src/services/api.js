import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

/*
 * ============================================================
 * ATTACH JWT TO EVERY REQUEST
 * ============================================================
 */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/*
 * ============================================================
 * HANDLE AUTHENTICATION ERRORS
 * ============================================================
 *
 * IMPORTANT:
 *
 * 401 = Authentication problem
 *      → JWT missing / expired / invalid
 *      → redirect to login
 *
 * 403 = Authorization problem
 *      → user is authenticated
 *      → user may not have permission or family association
 *      → DO NOT DELETE JWT
 *      → DO NOT REDIRECT TO LOGIN
 *
 * This is important for users such as Manjula who can
 * successfully authenticate but have not joined a family yet.
 * ============================================================
 */

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;

    /*
     * Only 401 should cause logout.
     */
    if (status === 401) {
      const requestUrl = error.config?.url || "";

      /*
       * Do not interfere with authentication endpoints.
       */
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

    /*
     * 403 is intentionally NOT handled here.
     *
     * The calling page/component should decide what to
     * display to the authenticated user.
     */

    return Promise.reject(error);
  },
);

export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

/*
 * Automatically attach JWT to every request.
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
 * Handle expired/invalid JWT.
 */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      /*
       * Don't redirect the login/register
       * requests themselves.
       */

      const requestUrl = error.config?.url || "";

      if (
        !requestUrl.includes("/api/auth/login") &&
        !requestUrl.includes("/api/auth/register")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;

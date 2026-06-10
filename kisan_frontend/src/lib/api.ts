import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000",
  withCredentials: false,
});

// ------------------------------------------
// 1. Attach access token to every request
// ------------------------------------------
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------------------------------
// 2. Auto-refresh token if expired
// ------------------------------------------
let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(newToken: string) {
  subscribers.forEach((callback) => callback(newToken));
  subscribers = [];
}

function addSubscriber(callback: (token: string) => void) {
  subscribers.push(callback);
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired → refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((token: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token } = res.data;
        saveTokens(access_token, refreshToken); // refresh token unchanged

        onTokenRefreshed(access_token);
        isRefreshing = false;

        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        return api(originalRequest);

      } catch (err) {
        isRefreshing = false;
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

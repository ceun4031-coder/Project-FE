// src/api/httpClient.js
import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearTokens,
  getRefreshToken,
  setRefreshToken,
} from "../utils/storage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ---------------------------
// Refresh 관련 상태
// ---------------------------
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

function setAuthHeader(config, token) {
  if (!token) return config;
  if (!config.headers) config.headers = {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
}

function redirectToLogin() {
  clearTokens();
  // 목업 모드에서는 로그인 페이지로 강제 이동하지 않음
  if (!USE_MOCK) {
    window.location.href = "/auth/login";
  }
}

/* 요청 인터셉터 */
httpClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers?.Authorization) {
      setAuthHeader(config, token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* 응답 인터셉터 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ✅ 목업 모드에서는 refresh/redirect 로직 사용하지 않고 그대로 에러만 넘김
    if (USE_MOCK) {
      return Promise.reject(error);
    }

    const { config, response } = error;

    if (!response) {
      // 네트워크 에러 등
      return Promise.reject(error);
    }

    // 401 이 아니면 토큰 문제 아님
    if (response.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = config;

    // 로그인 요청에서의 401은 refresh 시도하지 않음
    if (originalRequest.url?.includes("/api/auth/login")) {
      return Promise.reject(error);
    }

    // refresh 요청 자체에서 401, 또는 이미 재시도한 요청이면 바로 로그아웃
    if (
      originalRequest._retry ||
      originalRequest.url?.includes("/api/auth/refresh")
    ) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    try {
      // 이미 다른 요청이 refresh 중이면 대기
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            resolve(httpClient(setAuthHeader(originalRequest, newToken)));
          });
        });
      }

      isRefreshing = true;

      const refreshResponse = await refreshClient.post(
        "/api/auth/refresh",
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ 백엔드 응답이 {accessToken, refreshToken} 이든 {access, refresh} 이든 모두 처리
      const data = refreshResponse.data || {};
      const newAccessToken = data.accessToken ?? data.access;
      const newRefreshToken = data.refreshToken ?? data.refresh;

      if (!newAccessToken) {
        isRefreshing = false;
        redirectToLogin();
        return Promise.reject(error);
      }

      setAccessToken(newAccessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      isRefreshing = false;
      onRefreshed(newAccessToken);

      // 실패했던 원래 요청 재시도
      return httpClient(setAuthHeader(originalRequest, newAccessToken));
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = []; // 대기 중인 요청 정리
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);

export default httpClient;

// src/api/httpClient.js
import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  clearTokens,
  getRefreshToken,
} from "../utils/storage";

// 백엔드 API 베이스 URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ---------------------------
// 기본 axios 인스턴스
// ---------------------------
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Refresh 전용 인스턴스
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ---------------------------
// 공통 유틸
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
  window.location.href = "/auth/login"; // 프론트 라우터 경로
}

/* --------------------------- */
/* 요청 인터셉터               */
/* --------------------------- */
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

/* --------------------------- */
/* 응답 인터셉터               */
/* --------------------------- */
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // 네트워크 에러 등 response 자체가 없는 경우
    if (!response) {
      return Promise.reject(error);
    }

    // 401 이 아닌 경우는 그대로 반환
    if (response.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = config;

    // refresh 호출 자체에서 401 뜬 경우 or 이미 리트라이한 요청이면 바로 로그아웃 처리
    if (
      originalRequest._retry ||
      originalRequest.url?.includes("/api/auth/refresh")
    ) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // refreshToken 없으면 바로 로그아웃
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    try {
      // 이미 다른 요청이 refresh 중이면, 그 토큰 발급을 기다렸다가 재요청
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
        refreshToken,
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );

      const newAccessToken = refreshResponse.data.accessToken;

      setAccessToken(newAccessToken);
      isRefreshing = false;
      onRefreshed(newAccessToken);

      return httpClient(setAuthHeader(originalRequest, newAccessToken));
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = []; // 대기 중인 요청들 정리
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);

export default httpClient;

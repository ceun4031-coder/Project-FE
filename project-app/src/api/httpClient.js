// src/api/httpClient.js
import axios from "axios";
import { getAccessToken, setAccessToken, clearTokens } from "../utils/storage";

// 백엔드 API 베이스 URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// 기본 axios 인스턴스 (실제 비즈니스 API용)
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // RefreshToken이 HttpOnly Cookie일 때 필수
});

// Refresh 전용 인스턴스 (인터셉터 영향 안 받게 별도 사용)
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 동시 401 처리용 플래그/큐
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

/* --------------------------- */
/* 요청 인터셉터               */
/* --------------------------- */
httpClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* --------------------------- */
/* 응답 인터셉터 (401 처리)    */
/* --------------------------- */
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // 응답이 없거나(네트워크 에러) 상태코드가 없으면 그대로 리턴
    if (!response) {
      return Promise.reject(error);
    }

    // 401이 아니면 그대로 에러 전달
    if (response.status !== 401) {
      return Promise.reject(error);
    }

    // refresh 재시도용 플래그
    const originalRequest = config;
    if (originalRequest._retry) {
      // 이미 한 번 재시도한 요청이면 그대로 실패 처리
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      // 이미 다른 요청에서 refresh 중이면, 끝날 때까지 기다렸다가 재요청
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(httpClient(originalRequest));
          });
        });
      }

      // 여기서부터는 refresh API 직접 호출
      isRefreshing = true;

      const refreshResponse = await refreshClient.post("/auth/refresh");
      // 백엔드 응답 형식에 맞게 수정 (예: { accessToken: "..." })
      const newAccessToken = refreshResponse.data.accessToken;

      // 새 토큰 저장
      setAccessToken(newAccessToken);
      isRefreshing = false;
      onRefreshed(newAccessToken);

      // 원래 요청 헤더 갱신 후 재시도
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return httpClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      // 새 토큰 발급도 실패 → 로그인 필요
      clearTokens();

      // 전역 로그아웃 처리 (필요하면 커스텀 로직으로 교체)
      window.location.href = "/auth/login";

      return Promise.reject(refreshError);
    }
  }
);

export default httpClient;

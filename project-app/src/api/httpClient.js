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
  import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * NOTE:
 * - VITE_USE_MOCK: API 모듈에서 네트워크 자체를 안 타는 "즉시 반환" 방식
 * - VITE_ENABLE_MSW / VITE_MSW_PROOF: 네트워크는 타지만 MSW가 가로채는 방식(증명 캡처용)
 *
 * PROOF 모드에서는 "페이지 이동"만 막고, 세션 정리(clearTokens)는 수행해야
 *  - 성공 proof: 흐름이 끊기지 않고
 *  - 실패 proof: 토큰 삭제 증거를 캡처할 수 있습니다.
 */
const MSW_PROOF = String(import.meta?.env?.VITE_MSW_PROOF ?? "") === "true";
const MSW_ALLOW_REDIRECT = String(import.meta?.env?.VITE_MSW_REDIRECT ?? "") === "true";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

function safePathname() {
  if (typeof window === "undefined") return "";
  return String(window.location?.pathname ?? "");
}

function isOnLoginPage() {
  const p = safePathname();
  return p.startsWith("/auth/login");
}

function subscribeTokenRefresh(onSuccess, onError) {
  refreshSubscribers.push({ onSuccess, onError });
}

function notifyRefreshed(newToken) {
  const subs = Array.isArray(refreshSubscribers) ? refreshSubscribers : [];
  refreshSubscribers = [];
  subs.forEach((s) => {
    try {
      s?.onSuccess?.(newToken);
    } catch {
      // ignore
    }
  });
}

function notifyRefreshFailed(err) {
  const subs = Array.isArray(refreshSubscribers) ? refreshSubscribers : [];
  refreshSubscribers = [];
  subs.forEach((s) => {
    try {
      s?.onError?.(err);
    } catch {
      // ignore
    }
  });
}

function setAuthHeader(config, token) {
  if (!config || !token) return config;
  if (!config.headers) config.headers = {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
}

function clearSessionStorage() {
  try {
    clearTokens?.();
  } catch {
    // ignore
  }

  try {
    localStorage.removeItem("userInfo");
  } catch {
    // ignore
  }
}

function redirectToLogin(reason = "") {
  // ✅ 증명 모드에서도 "토큰/유저정보 삭제"는 수행해야 캡처 가능
  clearSessionStorage();

  // proof 모드에서는 기본적으로 이동을 막아서 “증명 흐름”이 끊기지 않게 함
  // 다만, 실패 캡처에서 "로그인 페이지 이동"이 꼭 필요하면 VITE_MSW_REDIRECT=true로 허용
  const shouldBlockNav = MSW_PROOF && !MSW_ALLOW_REDIRECT;
  if (shouldBlockNav) {
    // eslint-disable-next-line no-console
    console.warn("[auth] session cleared (proof mode, no redirect).", reason);
    return;
  }

  // 이미 로그인 페이지면 href로 리로드 루프를 만들지 않음
  if (isOnLoginPage()) return;

  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
}

/* 요청 인터셉터 */
httpClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken?.();
    const hasAuth = !!config?.headers?.Authorization;

    if (token && !hasAuth) {
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
    const response = error?.response;
    const originalRequest = error?.config;

    if (!response || !originalRequest) {
      return Promise.reject(error);
    }

    // 401이 아니면 refresh 대상 아님
    if (response.status !== 401) {
      return Promise.reject(error);
    }

    const url = String(originalRequest?.url ?? "");

    // 로그인 요청에서의 401은 refresh 시도하지 않음
    if (url.includes("/api/auth/login")) {
      return Promise.reject(error);
    }

    // refresh 요청 자체이거나, 이미 재시도한 요청이면 종료
    if (originalRequest?._retry || url.includes("/api/auth/refresh")) {
      redirectToLogin("retry_or_refresh_unauthorized");
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = getRefreshToken?.();
    if (!refreshToken) {
      redirectToLogin("missing_refresh_token");
      return Promise.reject(error);
    }

    // 이미 refresh 중이면 대기열로 합류 (single-flight)
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (newToken) => {
            try {
              resolve(httpClient(setAuthHeader(originalRequest, newToken)));
            } catch (e) {
              reject(e);
            }
          },
          (err) => reject(err)
        );
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await refreshClient.post(
        "/api/auth/refresh",
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = refreshResponse?.data ?? {};
      const newAccessToken = data?.accessToken ?? data?.access ?? "";
      const newRefreshToken = data?.refreshToken ?? data?.refresh ?? "";

      if (!newAccessToken || typeof newAccessToken !== "string") {
        throw new Error("No accessToken in refresh response");
      }

      try {
        setAccessToken?.(newAccessToken);
        if (newRefreshToken) setRefreshToken?.(newRefreshToken);
      } catch {
        // ignore
      }

      // 이후 요청들도 최신 토큰을 쓰도록 기본 헤더 갱신
      httpClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      refreshClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      isRefreshing = false;
      notifyRefreshed(newAccessToken);

      return httpClient(setAuthHeader(originalRequest, newAccessToken));
    } catch (refreshError) {
      isRefreshing = false;

      // 대기 중이던 요청들 pending 방지(전부 reject로 종료)
      notifyRefreshFailed(refreshError);

      // refresh 실패 시 세션 정리(+ 필요 시 로그인 이동)
      redirectToLogin("refresh_failed");
      return Promise.reject(refreshError);
    }
  }
);

export default httpClient;

/*
요약(3줄)
1) MSW proof 모드에서도 refresh 실패 시 clearTokens/localStorage 정리를 수행해 “토큰 삭제 캡처”가 가능해집니다.
2) proof 모드에서는 기본적으로 페이지 이동만 막고(흐름 유지), 필요하면 VITE_MSW_REDIRECT=true로 이동도 허용합니다.
3) 401→refresh single-flight(+queue), 실패 시 대기요청 pending 없이 reject 처리됩니다.
*/

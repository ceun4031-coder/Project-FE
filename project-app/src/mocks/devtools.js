// src/mocks/devtools.js
import httpClient from "../api/httpClient";
import { setAccessToken, setRefreshToken, clearTokens } from "../utils/storage";

function clearAxiosAuthDefaults() {
  try {
    delete httpClient?.defaults?.headers?.common?.Authorization;
    delete httpClient?.defaults?.headers?.common?.authorization;
  } catch {
    // ignore
  }
}

function safeLog(...args) {
  console.log(...args);
}

export function installRefreshProofHelpers() {
  if (typeof window === "undefined") return;
  const w = window;

  if (w.__refreshProofInstalled) return;
  w.__refreshProofInstalled = true;

  // ✅ 401 유도용 토큰(만료 access + 더미 refresh)
  w.__seedRefreshProofTokens = () => {
    clearAxiosAuthDefaults();
    setAccessToken?.("expired_access_token");
    setRefreshToken?.("dummy_refresh_token");
    safeLog("[proof] seeded tokens: access=expired_access_token, refresh=dummy_refresh_token");
  };

  w.__clearRefreshProofTokens = () => {
    clearAxiosAuthDefaults();
    clearTokens?.();
    safeLog("[proof] cleared tokens");
  };

  // ✅ 동시에 3요청 → 401 → refresh 1회 → 200 재시도 (Network 캡처용)
  w.__runRefreshProof = async () => {
    if (typeof w.__seedRefreshProofTokens === "function") w.__seedRefreshProofTokens();

    const endpoints = ["/api/user/me", "/api/dashboard/summary", "/api/words/today"];
    safeLog("[proof] firing concurrent requests:", endpoints);

    const results = await Promise.allSettled(endpoints.map((url) => httpClient.get(url)));

    const rows = results.map((r, i) => {
      const url = endpoints[i];
      if (r.status === "fulfilled") {
        return { url, result: "fulfilled", httpStatus: r.value?.status ?? "(unknown)" };
      }
      const httpStatus = r.reason?.response?.status ?? "(no response)";
      return { url, result: "rejected", httpStatus };
    });

    console.table(rows);

    safeLog('[proof] Open DevTools → Network, filter "api" and capture: 401 xN → /api/auth/refresh x1 → 200 xN');
    return rows;
  };

  safeLog('[proof] ready. In console run: __runRefreshProof() then capture Network tab.');
}

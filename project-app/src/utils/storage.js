// src/utils/storage.js

/* -----------------------------
   ACCESS TOKEN
------------------------------ */
const ACCESS_TOKEN_KEY = "accessToken";

export function setAccessToken(token) {
  const t = typeof token === "string" ? token : "";
  try {
    if (!t) localStorage.removeItem(ACCESS_TOKEN_KEY);
    else localStorage.setItem(ACCESS_TOKEN_KEY, t);
  } catch {
    // ignore (storage unavailable)
  }
}

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

/* -----------------------------
   REFRESH TOKEN
------------------------------ */
const REFRESH_TOKEN_KEY = "refreshToken";

export function setRefreshToken(token) {
  const t = typeof token === "string" ? token : "";
  try {
    if (!t) localStorage.removeItem(REFRESH_TOKEN_KEY);
    else localStorage.setItem(REFRESH_TOKEN_KEY, t);
  } catch {
    // ignore (storage unavailable)
  }
}

export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

/* -----------------------------
   CLEAR TOKENS
------------------------------ */
export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore (storage unavailable)
  }
}

/*
요약(3줄)
1) localStorage 접근 실패(사파리 프라이빗/권한 등)에서도 앱이 죽지 않도록 try/catch로 감쌌습니다.
2) token이 문자열이 아니거나 빈 값이면 저장 대신 제거하여 상태 꼬임을 방지합니다.
3) get*은 항상 string|null로 반환해 호출부에서 안전하게 처리할 수 있습니다.
*/

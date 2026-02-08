// src/devtools/refreshProofHelpers.js
import httpClient from "../api/httpClient";
import { clearTokens, setAccessToken, setRefreshToken, getAccessToken, getRefreshToken } from "../utils/storage";

const PROOF = {
  // 의도적으로 401 유도용
  expiredAccess: "expired.access.token.v0",
  // ✅ MSW handlers.js의 VALID_REFRESH와 반드시 동일해야 함
  validRefresh: "valid.refresh.token.v1",
  // ✅ 실패 케이스용(handlers에서 401/403으로 실패 처리되게)
  invalidRefresh: "invalid.refresh.token.v0",
  // 요청 엔드포인트(handlers와 일치해야 함)
  endpoints: {
    me: "/api/user/me",
    summary: "/api/dashboard/summary",
    today: "/api/words/today",
  },
};

function safeLog(...args) {
  try {
    // eslint-disable-next-line no-console
    console.log(...args);
  } catch {
    // ignore
  }
}

function safeClear() {
  try {
    clearTokens?.();
  } catch {
    // ignore
  }
}

function safeSetTokens(accessToken, refreshToken) {
  try {
    if (typeof accessToken === "string") setAccessToken?.(accessToken);
  } catch {
    // ignore
  }
  try {
    if (typeof refreshToken === "string") setRefreshToken?.(refreshToken);
  } catch {
    // ignore
  }
}

function safeReadTokens() {
  try {
    return {
      accessToken: getAccessToken?.() ?? null,
      refreshToken: getRefreshToken?.() ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function compactResult(results) {
  return (results ?? []).map((r) => {
    if (r?.status === "fulfilled") {
      return {
        ok: true,
        status: r.value?.status ?? null,
        url: r.value?.config?.url ?? "",
      };
    }
    const status = r?.reason?.response?.status ?? null;
    const url = r?.reason?.config?.url ?? "";
    const msg = r?.reason?.message ?? "unknown";
    return { ok: false, status, url, msg };
  });
}

async function fire3Concurrent() {
  const { me, summary, today } = PROOF.endpoints;

  const reqs = [httpClient.get(me), httpClient.get(summary), httpClient.get(today)];
  const results = await Promise.allSettled(reqs);
  return compactResult(results);
}

export function installRefreshProofHelpers() {
  if (typeof window === "undefined") return;

  // ---- 공통 유틸 ----
  window.__proofTokens = () => {
    const t = safeReadTokens();
    safeLog("[proof] current tokens:", t);
    return t;
  };

  window.__clearProofTokens = () => {
    safeClear();
    const t = safeReadTokens();
    safeLog("[proof] cleared. now:", t);
    return t;
  };

  window.__setProofTokens = (accessToken, refreshToken) => {
    // 수동 값 테스트용 (seed가 싫을 때 이걸로 직접 넣고 호출)
    safeSetTokens(accessToken, refreshToken);
    const t = safeReadTokens();
    safeLog("[proof] set tokens:", t);
    return t;
  };

  // ---- 성공 케이스(#1): 401 → refresh(200, 1회) → retry(200) ----
  window.__seedRefreshProofTokens = (opts = {}) => {
    const expiredAccess = typeof opts?.expiredAccess === "string" ? opts.expiredAccess : PROOF.expiredAccess;
    const refreshToken = typeof opts?.refreshToken === "string" ? opts.refreshToken : PROOF.validRefresh;

    safeClear();
    safeSetTokens(expiredAccess, refreshToken);

    const seeded = safeReadTokens();
    safeLog("[proof] seeded (SUCCESS case):", {
      ...seeded,
      hint: "Now run __runRefreshProof(); then capture Network: 401,401,401 → refresh(200 once) → 200,200,200",
    });
    return seeded;
  };

  window.__runRefreshProof = async () => {
    safeLog("[proof] firing 3 concurrent requests (expect 401 → refresh(200, once) → retry(200))");
    const out = await fire3Concurrent();
    safeLog("[proof] results:", out);
    return out;
  };

  // ---- 실패 케이스(#2): 401 → refresh(401/403) → 세션 정리(토큰 삭제) + pending 방지 ----
  window.__seedRefreshFailProofTokens = (opts = {}) => {
    const expiredAccess = typeof opts?.expiredAccess === "string" ? opts.expiredAccess : PROOF.expiredAccess;
    const refreshToken = typeof opts?.refreshToken === "string" ? opts.refreshToken : PROOF.invalidRefresh;

    safeClear();
    safeSetTokens(expiredAccess, refreshToken);

    const seeded = safeReadTokens();
    safeLog("[proof] seeded (FAIL case):", {
      ...seeded,
      hint: "Now run __runRefreshFailProof(); then capture Network: 401,401,401 → refresh(401/403) and no infinite retry",
      note: "MSW handlers에서 invalid refresh를 401/403으로 내려야 ‘세션 정리’ 캡처가 깔끔합니다.",
    });
    return seeded;
  };

  window.__runRefreshFailProof = async () => {
    safeLog("[proof] firing 3 concurrent requests (expect 401 → refresh fail(401/403) → no infinite retry)");
    const out = await fire3Concurrent();
    safeLog("[proof] results:", out);
    safeLog("[proof] tokens after fail run (should be cleared if your httpClient clears on refresh fail):", safeReadTokens());
    return out;
  };

  safeLog(
    "[proof] helpers installed.\n" +
      "- SUCCESS: __seedRefreshProofTokens(); __runRefreshProof();\n" +
      "- FAIL:    __seedRefreshFailProofTokens(); __runRefreshFailProof();\n" +
      "- Utils:   __proofTokens(); __clearProofTokens(); __setProofTokens(a,r);"
  );
}

// import만 해도 devtools helper 설치되게
installRefreshProofHelpers();

/*
요약(3줄)
1) 성공 케이스: __seedRefreshProofTokens → __runRefreshProof (401×3 → refresh 200 1회 → 200×3)
2) 실패 케이스: __seedRefreshFailProofTokens → __runRefreshFailProof (refresh 401/403 + 무한 재시도 없음)
3) 수동 테스트는 __setProofTokens / __proofTokens / __clearProofTokens 로 가능
*/

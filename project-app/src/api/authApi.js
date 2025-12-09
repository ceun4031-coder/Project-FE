// src/api/authApi.js
import httpClient from "./httpClient";
import {
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "../utils/storage";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * 이메일 찾기
 * Backend: POST /api/auth/find-email
 * Request: { userName, userBirth }
 * Response: { email: string }
 */
export async function findEmail({ userName, userBirth }) {
  if (USE_MOCK) {
    console.log("[MOCK][authApi] findEmail", { userName, userBirth });
    return {
      email: `${userName || "user"}@mock.local`,
    };
  }

  const res = await httpClient.post("/api/auth/find-email", {
    userName,
    userBirth,
  });
  return res.data; // { email }
}

/**
 * 비밀번호 재설정
 * Backend: POST /api/auth/reset-password
 * Request: { userName, email }
 * Response: { message: string }
 */
export async function resetPassword({ userName, email }) {
  if (USE_MOCK) {
    console.log("[MOCK][authApi] resetPassword", { userName, email });
    return {
      message: "임시 비밀번호가 이메일로 발송되었습니다. (mock)",
    };
  }

  const res = await httpClient.post("/api/auth/reset-password", {
    userName,
    email,
  });
  return res.data; // { message }
}

/**
 * 로그인
 * Backend: POST /api/auth/login
 * Request: { email, password }
 * Response: TokenResponse { accessToken, refreshToken }
 *
 * 1) /api/auth/login 으로 JWT 발급
 * 2) 토큰을 저장
 * 3) /api/user/me 로 사용자 정보 조회
 * 4) { user, accessToken, refreshToken } 반환
 */
export async function login({ email, password }) {
  if (USE_MOCK) {
    const mockUser = {
      userId: 1,
      email,
      nickname: "Mock User",
      userName: "목업 유저",
      userBirth: "2000-01-01",
      preference: null,
      goal: null,
      dailyWordGoal: 10,
    };

    const accessToken = "mock_access_token";
    const refreshToken = "mock_refresh_token";

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    return { user: mockUser, accessToken, refreshToken };
  }

  // 1) 로그인 요청 → 토큰 응답
  const res = await httpClient.post("/api/auth/login", {
    email,
    password,
  });

  // TokenResponse 필드명에 대비해서 두 가지 케이스 다 처리
  const {
    accessToken,
    refreshToken,
    access,
    refresh,
  } = res.data || {};

  const finalAccessToken = accessToken || access;
  const finalRefreshToken = refreshToken || refresh;

  if (!finalAccessToken) {
    throw new Error("로그인 응답에 accessToken(또는 access)이 없습니다.");
  }

  // 2) 토큰 저장
  setAccessToken(finalAccessToken);
  if (finalRefreshToken) {
    setRefreshToken(finalRefreshToken);
  }

  // 3) 토큰 기반으로 현재 유저 정보 조회
  let user = { email };
  try {
    const meRes = await httpClient.get("/api/user/me");
    user = meRes.data;
  } catch (e) {
    console.error("Failed to fetch /api/user/me", e);
  }

  // 4) AuthContext에서 user/토큰을 받아 상태/스토리지 반영
  return {
    user,
    accessToken: finalAccessToken,
    refreshToken: finalRefreshToken,
  };
}
/**
 * 이메일 중복 체크
 * Backend: POST /api/auth/check-email
 * Request: { email: string }
 * Response: { exists: boolean, message: string }
 */
export async function checkEmailDuplicate(email) {
  if (USE_MOCK) {
    const exists = email === "test@test.com";
    return {
      exists,
      message: exists
        ? "이미 사용 중인 이메일입니다."
        : "사용 가능한 이메일입니다.",
    };
  }

  const res = await httpClient.post("/api/auth/check-email", { email });
  return res.data; // { exists, message }
}


/**
 * 회원가입
 * Backend: POST /api/auth/signup
 * Request: SignupRequest
 * Response: "회원가입 완료" (String)
 */
export async function signup({
  email,
  password,
  nickname,
  userName,
  userBirth,
  preference,
  goal,
  dailyWordGoal,
}) {
  if (USE_MOCK) {
    console.log("[MOCK][authApi] signup payload:", {
      email,
      password,
      nickname,
      userName,
      userBirth,
      preference,
      goal,
      dailyWordGoal,
    });
    return {
      success: true,
      message: "회원가입 완료 (mock)",
    };
  }

  const payload = {
    email,
    password,
    nickname,
    userName,
    userBirth,
    preference: preference ?? null,
    goal: goal ?? null,
    dailyWordGoal:
      typeof dailyWordGoal === "number"
        ? dailyWordGoal
        : dailyWordGoal
        ? Number(dailyWordGoal)
        : null,
  };

  const res = await httpClient.post("/api/auth/signup", payload);

  // 백엔드는 String("회원가입 완료")을 반환하므로, 프론트에서 통일된 형식으로 재가공
  const raw = res.data;
  return {
    success: true,
    message:
      typeof raw === "string"
        ? raw
        : raw?.message || "회원가입이 완료되었습니다.",
  };
}

/**
 * 로그아웃
 * Backend: POST /api/auth/logout/{email}
 */
export async function logout(email) {
  clearTokens();
  window.dispatchEvent(new Event("auth:logout"));

  if (USE_MOCK) {
    console.log("[MOCK][authApi] logout", { email });
    return;
  }

  try {
    await httpClient.post(`/api/auth/logout/${email}`);
  } catch (e) {
    console.warn("logout request failed (ignored)", e);
  }
}

/**
 * 현재 로그인한 사용자 정보 조회
 * Backend: GET /api/user/me
 */
export async function getMe() {
  if (USE_MOCK) {
    const stored = localStorage.getItem("userInfo");
    if (!stored) {
      throw new Error("No userInfo in mock mode");
    }
    try {
      return JSON.parse(stored);
    } catch {
      throw new Error("Invalid userInfo JSON in mock mode");
    }
  }

  const res = await httpClient.get("/api/user/me");
  return res.data;
}

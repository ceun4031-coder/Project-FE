// src/api/authApi.js
import httpClient from "./httpClient";
import { 
  setAccessToken, 
  setRefreshToken,
  clearTokens 
} from "../utils/storage";

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// 임시 유저 데이터
const MOCK_USERS = [
  {
    email: "t1@ex.com",
    password: "1111",
    nickname: "테스트유저",
  },
];

/* ------------------------------
 * 로그인
 * ------------------------------ */
export async function login({ email, password }) {
  if (USE_MOCK_AUTH) {
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      const error = new Error("INVALID_CREDENTIALS");
      error.response = {
        status: 401,
        data: { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      };
      throw error;
    }

    const fakeAccessToken = `mock-access-token-${user.email}`;
    setAccessToken(fakeAccessToken);

    return { user };
  }

  // 실제 서버 호출
  const res = await httpClient.post("/api/auth/login", {
    email,
    password,
  });

  const { accessToken, refreshToken, user } = res.data;

  setAccessToken(accessToken);
  setRefreshToken(refreshToken);

  return { user };
}

/* ------------------------------
 * 회원가입
 * ------------------------------ */
export async function signup({
  email,
  password,
  nickname,
  userName,
  userBirth,
  preference,
  goal,
  dailyWordGoal
}) {
  const res = await httpClient.post("/api/auth/signup", {
    email,
    password,
    nickname,
    userName,
    userBirth,
    preference,
    goal,
    dailyWordGoal
  });

  return res.data;
}

/* ------------------------------
 * 로그아웃
 * ------------------------------ */
export async function logout(email) {
  // 1) 토큰 제거
  clearTokens();

  // 2) 전역 이벤트 발생 (전역 상태 변경 감지)
  window.dispatchEvent(new Event("auth:logout"));

  // 3) 서버 로그아웃 요청 (실패해도 무시)
  try {
    await httpClient.post("/api/auth/logout", { email });
  } catch {
    // 서버 응답 실패해도 클라이언트는 로그아웃 처리 완료 상태
  }
}

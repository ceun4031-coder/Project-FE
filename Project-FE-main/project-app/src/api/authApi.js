// src/api/authApi.js
import httpClient from "./httpClient";
import { setAccessToken, clearTokens } from "../utils/storage";

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === "true";

// 임시 유저 데이터
const MOCK_USERS = [
  {
    id: "user",
    email: "test@example.com",
    password: "1111",
    nickname: "테스트유저",
  },
];

export async function login({ id, password }) {
  if (USE_MOCK_AUTH) {
    const user = MOCK_USERS.find(
      (u) => u.id === id && u.password === password
    );

    if (!user) {
      const error = new Error("INVALID_CREDENTIALS");
      error.response = {
        status: 401,
        data: { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      };
      throw error;
    }

    const fakeAccessToken = `mock-access-token-${user.id}`;
    setAccessToken(fakeAccessToken);

    return { user };
  }

  // 실제 서버 모드
  const res = await httpClient.post("/auth/login", { id, password });
  const { accessToken, user } = res.data;
  setAccessToken(accessToken);
  return { user };
}

export async function register({ id, email, password, nickname }) {
  if (USE_MOCK_AUTH) {
    // 간단히 중복 체크만 하는 목업
    const exists = MOCK_USERS.some(
      (u) => u.id === id || u.email === email
    );

    if (exists) {
      const error = new Error("DUPLICATE");
      error.response = {
        status: 400,
        data: { message: "이미 사용 중인 아이디 또는 이메일입니다." },
      };
      throw error;
    }
    MOCK_USERS.push({ id, email, password, nickname });
    return { id, email, nickname };
  }

  // 실제 서버 모드
  const res = await httpClient.post("/auth/register", {
    email,
    password,      // → USER_PW
    nickname,      // → NICKNAME
    userName,      // → USER_NAME
    userBirth,     // → USER_BIRTH
    preference,    // → PREFERENCE
    goal,          // → GOAL
    dailyWordGoal, // → DAILY_WORD_GOAL
  });
  return res.data;
}

// 로그아웃
export async function logout() {
  // 1) 클라이언트 상태는 먼저 정리
  clearTokens();
  window.dispatchEvent(new Event("auth:logout"));

  // 2) 서버 로그아웃은 백그라운드로 시도 
  try {
    await httpClient.post("/auth/logout");
  } catch (e) {
    // 실패해도 사용자 UX에는 영향 없으므로 무시
  }
}
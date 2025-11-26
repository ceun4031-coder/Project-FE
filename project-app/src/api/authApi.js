// src/api/authApi.js
import httpClient from "./httpClient";
import {
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "../utils/storage";

/**
 * 이메일 찾기
 * Request:  { userName, userBirth: "YYYY-MM-DD" }
 * Response: { email }
 */
export async function findEmail(userName, userBirth) {
  const res = await httpClient.post("/api/auth/find-email", {
    userName,
    userBirth,
  });
  return res.data; // { email }
}

/**
 * 비밀번호 재설정 (임시 비밀번호 발송)
 * Request:  { userName, email }
 * Response: { message }
 */
export async function resetPassword(userName, email) {
  const res = await httpClient.post("/api/auth/reset-password", {
    userName,
    email,
  });
  return res.data; // { message }
}

/**
 * 로그인
 * Response 예시: { accessToken, refreshToken, user? }
 */
export async function login({ email, password }) {
  const res = await httpClient.post("/api/auth/login", {
    email,
    password,
  });

  const { accessToken, refreshToken, user } = res.data;

  if (accessToken && refreshToken) {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  }

  // user를 안 내려주면 최소 email 정보만 채워서 반환
  const safeUser = user || { email };

  return { user: safeUser };
}

/**
 * 회원가입
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
  const res = await httpClient.post("/api/auth/signup", {
    email,
    password,
    nickname,
    userName,
    userBirth,
    preference,
    goal,
    dailyWordGoal,
  });

  return res.data; // "회원가입 완료" 등 응답 메시지
}

/**
 * 로그아웃
 */
export async function logout(email) {
  // 클라이언트 토큰 제거
  clearTokens();

  // 전역 로그아웃 이벤트 (상태 관리용)
  window.dispatchEvent(new Event("auth:logout"));

  // 서버 로그아웃 (실패해도 무시)
  try {
    await httpClient.post(`/api/auth/logout/${email}`);
  } catch {
    // 서버 응답 실패해도 클라이언트는 이미 로그아웃 처리된 상태
  }
}

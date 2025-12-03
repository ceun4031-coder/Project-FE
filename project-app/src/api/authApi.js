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
 *
 * POST /api/auth/login
 * Request:  { email, password }
 * Response: { accessToken, refreshToken }
 *
 * + 로그인 후 /api/user/me 를 호출해서 유저 정보까지 가져와서 반환
 */
export async function login({ email, password }) {
  // 1) 토큰 발급
  const res = await httpClient.post("/api/auth/login", {
    email,
    password,
  });

  const { accessToken, refreshToken } = res.data;

  if (accessToken && refreshToken) {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  }

  // 2) 토큰 설정 후 내 정보 조회
  let user = { email }; // 최소 fallback
  try {
    const meRes = await httpClient.get("/api/user/me");
    // 명세: { userId, email, nickname, userName, userBirth, preference, goal, dailyWordGoal }
    user = meRes.data;
  } catch (e) {
    // /api/user/me 실패해도 로그인은 된 상태이므로 email만 유지
    console.error("Failed to fetch /api/user/me", e);
  }

  return { user };
}

/**
 * 회원가입
 *
 * POST /api/auth/signup
 * Request:
 * {
 *   "email": "test@test.com",
 *   "password": "1234",
 *   "nickname": "hyuk",
 *   "userName": "최종혁",
 *   "userBirth": "2000-01-01"
 * }
 *
 * Response:
 * { "success": true, "message": "회원가입 완료" }
 */
export async function signup({
  email,
  password,
  nickname,
  userName,
  userBirth,
}) {
  const res = await httpClient.post("/api/auth/signup", {
    email,
    password,
    nickname,
    userName,
    userBirth,
  });

  // => { success, message }
  return res.data;
}

/**
 * 로그아웃
 *
 * POST /api/auth/logout/{email}
 * Response: { message: "로그아웃 완료" }
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

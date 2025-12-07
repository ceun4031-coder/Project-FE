// src/api/userApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// 공통 목업 지연 유틸
const mockDelay = (data, delay = 300) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

// 프로필 목업 데이터
let mockUser = {
  email: "test@example.com",
  userName: "테스트",
  nickname: "열공러",
  userBirth: "1999-01-01",
  preference: "Narrative",
  goal: "영어 마스터하기",
  dailyWordGoal: 30,
};

/**
 * 내 정보 조회
 * GET /api/user/me
 */
export const getMyInfo = async () => {
  if (USE_MOCK) {
    console.log("[MOCK][userApi] getMyInfo");
    return mockDelay(mockUser);
  }

  const response = await httpClient.get("/api/user/me");
  return response.data;
};

/**
 * 회원 정보 수정
 * PATCH /api/user
 */
export const updateUserInfo = async (data) => {
  if (USE_MOCK) {
    console.log("[MOCK][userApi] updateUserInfo", data);
    mockUser = { ...mockUser, ...data };
    return mockDelay(mockUser);
  }

  const response = await httpClient.patch("/api/user", data);
  return response.data;
};

/**
 * 비밀번호 변경
 * PATCH /api/user/password
 */
export const changePassword = async (data) => {
  if (USE_MOCK) {
    console.log("[MOCK][userApi] changePassword", data);
    // 실제 서버에서는 검증/예외 처리, 목업은 단순 성공 응답
    return mockDelay({ success: true });
  }

  const response = await httpClient.patch("/api/user/password", data);
  return response.data;
};

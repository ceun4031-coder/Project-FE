// src/api/userApi.js
import httpClient from "./httpClient";

/* 내 정보 조회 GET /api/user/me */
export const getMyInfo = async () => {
  const response = await httpClient.get("/api/user/me");
  return response.data;
};

/* 회원 정보 수정 PATCH /api/user */
export const updateUserInfo = async (data) => {
  const response = await httpClient.patch("/api/user", data);
  return response.data;
};

/* 비밀번호 변경 PATCH /api/user/password */
export const changePassword = async (data) => {
  const response = await httpClient.patch("/api/user/password", data);
  return response.data;
};
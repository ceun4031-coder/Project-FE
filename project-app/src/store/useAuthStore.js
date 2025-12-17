// src/store/useAuthStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null, // { id, email, nickname, ... } 형태 가정
  isLoggedIn: false,

  // 사용자 전체 교체
  setUser: (user) =>
    set({
      user,
      isLoggedIn: !!user,
    }),

  // 로그아웃/초기화
  clearUser: () =>
    set({
      user: null,
      isLoggedIn: false,
    }),
}));

export default useAuthStore;

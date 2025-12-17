// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import {
  login as loginApi,
  logout as logoutApi,
  getMe as getMeApi,
} from "../api/authApi";
import { getAccessToken, clearTokens } from "../utils/storage";
import useAuthStore from "../store/useAuthStore";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: async () => {},
  updateProfileState: () => {},
  loading: false,
});

export function AuthProvider({ children }) {
  const { user, setUser, clearUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // 앱 최초 로드시 세션 복원
  // -----------------------------
  useEffect(() => {
    let alive = true;

    // 목업 모드: 서버 호출 없이 localStorage만 사용
    if (USE_MOCK) {
      const stored = localStorage.getItem("userInfo");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } catch {
          clearUser();
          localStorage.removeItem("userInfo");
          clearTokens();
        }
      }
      if (alive) setLoading(false);
      return () => {
        alive = false;
      };
    }

    // 실서버 모드: accessToken 있으면 /api/user/me로 검증
    const initAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        if (alive) setLoading(false);
        return;
      }

      try {
        const me = await getMeApi();
        if (!alive) return;

        setUser(me);
        localStorage.setItem("userInfo", JSON.stringify(me));
      } catch {
        clearTokens();
        localStorage.removeItem("userInfo");
        clearUser();
      } finally {
        if (alive) setLoading(false);
      }
    };

    initAuth();

    return () => {
      alive = false;
    };
  }, [setUser, clearUser]);

  // -----------------------------
  // 로그인
  // -----------------------------
  const login = async (email, password) => {
    // authApi.login:
    // 1) /api/auth/login → 토큰 발급
    // 2) 토큰 저장
    // 3) /api/user/me 호출 후 user 반환 (실패 시 throw)
    const { user: userData } = await loginApi({ email, password });

    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
    return userData;
  };

  // -----------------------------
  // 프로필 수정 시 상태/스토리지 동기화
  // -----------------------------
  const updateProfileState = (patch) => {
    if (!user) return;

    const nextUser = { ...user, ...patch };
    setUser(nextUser);
    localStorage.setItem("userInfo", JSON.stringify(nextUser));
  };

  // -----------------------------
  // 로그아웃
  // -----------------------------
  const logout = async () => {
    const storedUser = localStorage.getItem("userInfo");
    let email;

    try {
      email = user?.email || (storedUser ? JSON.parse(storedUser).email : undefined);
    } catch {
      email = undefined;
    }

    // 상태/스토리지 초기화 (클라이언트 로그아웃은 무조건 성공해야 함)
    clearUser();
    localStorage.removeItem("userInfo");
    clearTokens();

    // 서버 로그아웃 호출 (실패해도 화면 쪽은 그대로 진행)
    try {
      await logoutApi(email);
    } catch {
      // 무시
    }

    // 강제 이동
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfileState, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

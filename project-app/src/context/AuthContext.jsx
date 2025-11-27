import React, { createContext, useState, useEffect, useContext } from "react";

// 1. Context 생성 (데이터를 담을 공간)
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 로그인 상태 (초기값은 null)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 깜빡임 방지용 로딩

  // 2. 앱이 켜질 때(새로고침 시) 딱 한 번 실행
  useEffect(() => {
    const checkLogin = async () => {
      // 금고(localStorage)에서 토큰과 내 정보를 꺼내봄
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("userInfo");

      if (storedToken && storedUser) {
        // 토큰이 있으면 -> 로그인 상태 복구!
        setUser(JSON.parse(storedUser));
        
        // (심화: 여기서 백엔드에 토큰이 유효한지 검사하는 API를 찌르기도 함)
      }
      setLoading(false); // 검사 끝났으니 화면 보여줌
    };

    checkLogin();
  }, []);

  // 3. 로그인 함수 (LoginPage에서 호출)
  const login = (token, userData) => {
    // 상태 업데이트
    setUser(userData);
    
    // 금고에 저장 (영구 보관)
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  // 4. 로그아웃 함수 (Dashboard나 Navbar에서 호출)
  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    // 필요하다면 메인으로 이동
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {/* 로딩 중일 땐 하얀 화면 유지 (로그인 풀린 것처럼 보이는 것 방지) */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 5. 편하게 쓰기 위한 커스텀 훅
export function useAuth() {
  return useContext(AuthContext);
}
// src/components/layout/Header.jsx
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import Button from "../common/Button";
import StoryLexLogo from "../../assets/images/StoryLex-logo.svg";

import { getAccessToken } from "../../utils/storage";
import { logout } from "../../api/authApi";
import "./Header.css";

// 로그인된 사용자용 네비 항목
const AUTH_NAV_ITEMS = [
  { to: "/dashboard", label: "대시보드" }, 
  { to: "/learn", label: "학습하기" },
  { to: "/word", label: "단어장" },
  { to: "/story", label: "스토리" },
  { to: "/relation", label: "단어 관계망" },
];

// 비로그인 사용자용 네비 항목
const GUEST_NAV_ITEMS = [
  { to: "/home", label: "홈" },
  { to: "/dictionary", label: "단어사전" }, 
  { to: "/relation", label: "단어 관계망" },
  { to: "/quiz", label: "퀴즈 체험" },      
];

const getNavClass = ({ isActive }) =>
  "header-nav-link" + (isActive ? " header-nav-link--active" : "");

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getAccessToken());
  }, [location.pathname]);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogoutClick = () => {
    logout();
    setIsAuthenticated(false);
    navigate("/auth/login");
  };

  // 로그인/회원가입 페이지 여부
  const isAuthPage =
    location.pathname.startsWith("/auth") ||
    location.pathname.startsWith("/api/auth");

  // ① 로그인/회원가입 페이지 → 로고만 있는 최소 헤더
  if (isAuthPage) {
    return (
      <header className="header">
        <div className="page-container">
          <div className="header-inner">
            <div className="header-logo" onClick={handleLogoClick}>
              <img
                src={StoryLexLogo}
                alt="StoryLex 로고"
                className="header-logo-img"
              />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ② 나머지 페이지 → 풀 헤더 (네비 + 우측 버튼)
  const navItems = isAuthenticated ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;

  return (
    <header className="header">
      <div className="page-container">
        <div className="header-inner">
          {/* 로고 */}
          <div className="header-logo" onClick={handleLogoClick}>
            <img
              src={StoryLexLogo}
              alt="StoryLex 로고"
              className="header-logo-img"
            />
          </div>

          {/* 내비게이션 */}
          <nav className="header-nav">
            <div className="header-nav-group">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={getNavClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* 우측 액션 버튼 */}
          <div className="header-actions">
            {isAuthenticated ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogoutClick}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/api/auth/login")}
                >
                  로그인
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/api/auth/signup")}
                >
                  회원가입
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

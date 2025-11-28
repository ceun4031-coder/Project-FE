// src/components/layout/Header.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import userIcon from "../../assets/images/common/user-icon.svg";

import Button from "../common/Button";
import StoryLexLogo from "../../assets/images/StoryLex-logo.svg";

import "./Header.css";
import { useAuth } from "../../context/AuthContext";

// 로그인 사용자 네비
const AUTH_NAV_ITEMS = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/words", label: "단어장" },
  { to: "/story/list", label: "AI 스토리" },
  { to: "/relation", label: "단어 관계망" },
  { to: "/learning", label: "학습하기" },
];

// 비로그인 사용자 네비
const GUEST_NAV_ITEMS = [
  { to: "/", label: "홈" },
  { to: "/story/list", label: "AI 스토리" },
];

const AUTH_HOME_PATH = "/dashboard";
const GUEST_HOME_PATH = "/";

const getNavClass = ({ isActive }) =>
  "header-nav-link" + (isActive ? " header-nav-link--active" : "");

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // AuthContext 사용

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountRef = useRef(null);

  const isAuthenticated = !!user;

  // 라우트 변경 시 계정 메뉴 닫기
  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  // 바깥 클릭 시 계정 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    if (isAccountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  const handleLogoClick = () => {
    if (isAuthenticated) navigate(AUTH_HOME_PATH);
    else navigate(GUEST_HOME_PATH);
  };

  const handleLogoutClick = async () => {
    setIsAccountMenuOpen(false);
    try {
      await logout(); // AuthContext.logout 안에서 토큰 제거 + 서버 로그아웃 + /auth/login 이동
    } catch {
      // 추가 처리 필요 없으면 비워두면 됨
    }
  };

  const handleProfileClick = () => {
    setIsAccountMenuOpen((prev) => !prev);
  };

  // Auth 페이지에서는 최소 헤더
  const isAuthPage = location.pathname.startsWith("/auth");

  if (isAuthPage) {
    return (
      <header className="header">
        <div className="page-container">
          <div className="header-inner">
            <button
              type="button"
              className="header-logo"
              onClick={handleLogoClick}
            >
              <img
                src={StoryLexLogo}
                alt="StoryLex 로고"
                className="header-logo-img"
              />
            </button>
          </div>
        </div>
      </header>
    );
  }

  const navItems = isAuthenticated ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;

  return (
    <header className="header">
      <div className="page-container">
        <div className="header-inner">
          {/* 로고 */}
          <button
            type="button"
            className="header-logo"
            onClick={handleLogoClick}
          >
            <img
              src={StoryLexLogo}
              alt="StoryLex 로고"
              className="header-logo-img"
            />
          </button>

          {/* 네비게이션 */}
          <nav className="header-nav" aria-label="주요 메뉴">
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

          {/* 우측 액션 */}
          <div className="header-actions">
            {isAuthenticated ? (
              <div className="header-account" ref={accountRef}>
                <button
                  type="button"
                  className="header-profile"
                  onClick={handleProfileClick}
                  aria-haspopup="true"
                  aria-expanded={isAccountMenuOpen}
                  aria-label="계정 메뉴 열기"
                >
                  {/* 오른쪽 사용자 계정 아이콘 svg */}
                  <img
                    src={userIcon}
                    alt="user icon"
                    className="header-profile-icon"
                  />

                </button>

                {isAccountMenuOpen && (
                  <div className="header-account-menu">
                    <button
                      type="button"
                      className="header-account-menu-item"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        navigate("/account/profile");
                      }}
                    >
                      내 정보 / 계정 설정
                    </button>
                    <button
                      type="button"
                      className="header-account-menu-item header-account-menu-item--danger"
                      onClick={handleLogoutClick}
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/auth/login")}
                >
                  로그인
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/auth/signup")}
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

// src/components/layout/Header.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { CircleUser } from "lucide-react";

import Button from "../common/Button";
import StoryLexLogo from "../../assets/images/StoryLex-logo.svg";

import { getAccessToken } from "../../utils/storage";
import { logout } from "../../api/authApi";
import "./Header.css";

// 로그인 사용자 네비
const AUTH_NAV_ITEMS = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/words", label: "단어장" },        // 단어 상세/검색 페이지
  { to: "/story/ai", label: "AI 스토리" },  // AI 스토리 생성
  { to: "/relation", label: "단어 관계망" },
];

// 비로그인 사용자 네비
const GUEST_NAV_ITEMS = [
  { to: "/", label: "홈" },
  { to: "/story/ai", label: "AI 스토리" },
];

const AUTH_HOME_PATH = "/dashboard";
const GUEST_HOME_PATH = "/";

const getNavClass = ({ isActive }) =>
  "header-nav-link" + (isActive ? " header-nav-link--active" : "");

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountRef = useRef(null);

  // 라우트 변경 시 인증 여부 갱신
  useEffect(() => {
    setIsAuthenticated(!!getAccessToken());
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

 // src/components/layout/Header.jsx

const handleLogoutClick = () => {
  setIsAuthenticated(false);
  setIsAccountMenuOpen(false);
  navigate("/auth/login");
  logout().catch(() => {
  });
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
                  <CircleUser
                    className="header-profile-icon"
                    strokeWidth={2.4}
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

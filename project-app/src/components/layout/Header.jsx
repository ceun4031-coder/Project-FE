// src/components/layout/Header.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import userIcon from "../../assets/images/common/user-icon.svg";

import Button from "../common/Button";
import StoryLexLogo from "../../assets/images/StoryLex-logo.svg";

import "./Header.css";
import { useAuth } from "../../context/AuthContext";

// 로그인 후에만 보이는 메뉴
const AUTH_NAV_ITEMS = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/words", label: "단어장" },
  { to: "/stories", label: "AI 스토리" },
  { to: "/learning", label: "학습하기" },
];

// 비회원 메뉴: 홈은 자유 접근, 나머지는 클릭 시 로그인 유도
const GUEST_NAV_ITEMS = [
  { to: "/", label: "홈", requiresAuth: false },
  { to: "/words", label: "단어장", requiresAuth: true },
  { to: "/stories", label: "AI 스토리", requiresAuth: true },
  { to: "/learning", label: "학습하기", requiresAuth: true },
];

const AUTH_HOME_PATH = "/dashboard";
const GUEST_HOME_PATH = "/";

const getNavClass = ({ isActive }) =>
  "header-nav-link" + (isActive ? " header-nav-link--active" : "");

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountRef = useRef(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

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
      await logout();
    } catch {
      // 무시
    }
  };

  const handleProfileClick = () => {
    setIsAccountMenuOpen((prev) => !prev);
  };

  // 비회원 + 회원 전용 메뉴일 때 클릭을 가로채서 로그인 페이지로 보냄
  const handleNavClick = (e, item) => {
    if (!isAuthenticated && item.requiresAuth) {
      e.preventDefault();
      navigate("/auth/login", {
        state: { from: item.to }, // 로그인 후 다시 보내줄 경로
      });
    }
  };

  const isAuthPage = location.pathname.startsWith("/auth");

  if (isAuthPage) {
    return (
      <header className="header">
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
      </header>
    );
  }

  const navItems = isAuthenticated ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;

  return (
    <header className="header">
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

        <nav className="header-nav" aria-label="주요 메뉴">
          <div className="header-nav-group">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={getNavClass}
                onClick={(e) => handleNavClick(e, item)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

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
    </header>
  );
}

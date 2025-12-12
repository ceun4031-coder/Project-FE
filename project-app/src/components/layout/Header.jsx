// src/components/layout/Header.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import Button from "@/components/common/Button";
import StoryLexLogo from "@/assets/images/StoryLex-logo.svg";
import userIcon from "@/assets/images/common/user-icon.svg";

import "./Header.css";

// ─────────────────────────────────────────────────────────────
// 상수 데이터
// ─────────────────────────────────────────────────────────────
const AUTH_NAV_ITEMS = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/words", label: "단어장" },
  { to: "/stories", label: "AI 스토리" },
  { to: "/learning", label: "학습하기" },
];

const AUTH_HOME_PATH = "/dashboard";
const GUEST_HOME_PATH = "/";

const getNavClass = ({ isActive }) =>
  "header-nav-link" + (isActive ? " header-nav-link--active" : "");

// ─────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const accountRef = useRef(null);

  const isAuthenticated = !!user;
  const isAuthPage = location.pathname.startsWith("/auth");
  const isLandingGuest = !isAuthenticated && location.pathname === "/";

  // 스크롤 감지 (랜딩 게스트일 때만 캡슐 전환)
  useEffect(() => {
    if (!isLandingGuest) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      // 10px만 내려도 반응하도록
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기 로드 시 상태 확인

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLandingGuest]);

  // 페이지 이동 시 계정 드롭다운 닫기
  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  // 헤더 밖 클릭 시 계정 드롭다운 닫기
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

  // 로고 클릭
  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate(AUTH_HOME_PATH);
      return;
    }

    if (location.pathname === GUEST_HOME_PATH) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(GUEST_HOME_PATH);
    }
  };

  // 로그아웃
  const handleLogoutClick = async () => {
    setIsAccountMenuOpen(false);
    try {
      await logout();
    } catch (e) {
      // 실패해도 일단 홈으로
    } finally {
      navigate(GUEST_HOME_PATH);
    }
  };

  // 랜딩 섹션 스크롤
  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(id), 100);
      return;
    }

    const element = document.getElementById(id);
    if (!element) return;

    const headerOffset = 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition =
      elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  // ─────────────────────────────────────────────────────────────
  // 클래스명 결정 (랜딩/회원 모드 + 스크롤 상태)
  // ─────────────────────────────────────────────────────────────
  let headerClassName = "header";

  // 1. 페이지 타입에 따른 모드 설정
  if (isLandingGuest) {
    headerClassName += " header--landing-mode"; // 투명 시작
  } else {
    headerClassName += " header--member-mode"; // 흰색 시작
  }

  // 2. 스크롤 상태 추가 (랜딩 게스트만 캡슐)
  if (isLandingGuest && isScrolled) {
    headerClassName += " header--scrolled";
  }

  // ─────────────────────────────────────────────────────────────
  // 인증 페이지용: 심플 헤더 (로고만 중앙)
  // ─────────────────────────────────────────────────────────────
  if (isAuthPage) {
    return (
      <header className="header header--member-mode">
        <div className="header-inner header-inner--center">
          <button
            type="button"
            className="header-logo"
            onClick={handleLogoClick}
          >
            <img
              src={StoryLexLogo}
              alt="StoryLex"
              className="header-logo-img"
            />
          </button>
        </div>
      </header>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 일반 헤더 (회원/비회원 공통)
  // ─────────────────────────────────────────────────────────────
  return (
    <header className={headerClassName}>
      <div className="header-inner">
        {/* Left: Logo */}
        <div className="header-left">
          <button
            type="button"
            className="header-logo"
            onClick={handleLogoClick}
          >
            <img
              src={StoryLexLogo}
              alt="StoryLex"
              className="header-logo-img"
            />
          </button>
        </div>

        {/* Center: Navigation */}
          <div className="header-center">
            {isAuthenticated ? (
              // 회원: 캡슐형 탭 네비
              <nav className="header-tabs" aria-label="메인 메뉴">
                {AUTH_NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      "header-tab" + (isActive ? " header-tab--active" : "")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            ) : isLandingGuest ? (
              // 비회원 랜딩: 기존 섹션 스크롤 네비 유지
              <nav className="header-nav-landing" aria-label="랜딩 메뉴">
                <button
                  type="button"
                  onClick={() => scrollToSection("how-it-works")}
                >
                  학습 과정
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("features")}
                >
                  주요 기능
                </button>
              </nav>
            ) : null}
          </div>
        {/* Right: Actions */}
        <div className="header-right">
          <div className="header-actions">
            {isAuthenticated ? (
              // 프로필 / 계정 메뉴
              <div className="header-account" ref={accountRef}>
                <button
                  type="button"
                  className="header-profile-btn"
                  onClick={() =>
                    setIsAccountMenuOpen((prev) => !prev)
                  }
                  aria-haspopup="menu"
                  aria-expanded={isAccountMenuOpen}
                >
                  <img
                    src={userIcon}
                    alt="프로필"
                    className="header-profile-img"
                  />
                </button>
                {isAccountMenuOpen && (
                  <div className="header-dropdown" role="menu">
                    <button
                      type="button"
                      className="header-dropdown-item"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        navigate("/account/profile");
                      }}
                    >
                      계정 설정
                    </button>
                    <button
                      type="button"
                      className="header-dropdown-item header-dropdown-item--danger"
                      onClick={handleLogoutClick}
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // 비회원: 로그인 / 회원가입 버튼
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/auth/login")}
                >
                  로그인
                </Button>
                <Button
                  variant="primary"
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
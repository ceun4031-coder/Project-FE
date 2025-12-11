import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "./Footer.css";
import StoryLexLogo from "@/assets/images/StoryLex-logo.svg";

const AUTH_FOOTER_ITEMS = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/words", label: "단어장" },
  { to: "/stories", label: "AI 스토리" },
  { to: "/learning", label: "학습하기" },
];

const Footer = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <footer className="lp-footer">
      <div className="page-container">
        <div className="lp-footer-inner">
          {/* 1. 로고 및 설명 섹션 */}
          <div className="lp-footer-col lp-footer-logo">
            <img src={StoryLexLogo} alt="StoryLex Logo" />
            <p className="lp-footer-description">
              AI 기술을 활용하여 언어 학습의 <br />
              새로운 패러다임을 제시합니다.
            </p>
          </div>

          {/* 2. 메뉴 / 서비스 섹션 */}
          <div className="lp-footer-col lp-footer-menu">
            <h4>{isAuthenticated ? "메뉴" : "서비스"}</h4>

            <nav className="lp-footer-links">
              {isAuthenticated ? (
                <>
                  {AUTH_FOOTER_ITEMS.map((item) => (
                    <Link key={item.to} to={item.to}>
                      {item.label}
                    </Link>
                  ))}
                  <Link to="/account/profile">계정 설정</Link>
                </>
              ) : (
                <>
                  <a href="/#features">주요 기능</a>
                  <a href="/#how-it-works">학습 과정</a>
                  <a href="/#home">메인으로</a>
                </>
              )}
            </nav>
          </div>

          {/* 3. 추가 정보 섹션 있으면 여기 사용 */}
        </div>

        <div className="lp-footer-copy">
          &copy; {new Date().getFullYear()} StoryLex Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
